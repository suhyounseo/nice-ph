/*
 * NICE PH 데이터 계층
 * V1.2는 LocalStorageAdapter를 사용합니다. V2에서는 같은 load/save/clear 규약의
 * ServerAdapter를 추가하고 setAdapter()만 호출하면 UI 코드를 바꾸지 않아도 됩니다.
 */
(function initializeDataService(global) {
  "use strict";

  const STORAGE_KEY = "nice-ph-v1-business";
  const MANUAL_STORAGE_KEY = "nice-ph-v1-manual-draft";
  const SCHEMA_VERSION = 3;

  const makeId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const createProduct = (values = {}) => ({ id: values.id || makeId("product"), name: values.name || "", description: values.description || "", price: values.price || "", image: values.image || "" });
  const createStrength = (text = "", id = "") => ({ id: id || makeId("strength"), text });
  const createAction = (values = {}) => ({ id: values.id || makeId("action"), label: values.label || "", url: values.url || "", icon: values.icon || "", channel: values.channel || "" });

  function createBlankState() {
    return {
      version: SCHEMA_VERSION,
      industry: "", businessName: "", tagline: "", description: "",
      heroImage: "", subImages: [],
      products: [],
      strengths: [createStrength(), createStrength(), createStrength()],
      address: "", openTime: "", closeTime: "", closesNextDay: false, hoursNote: "", phone: "", actions: []
    };
  }

  function migrate(raw = {}) {
    const blank = createBlankState();
    const products = (Array.isArray(raw.products)
      ? raw.products.map(createProduct)
      : [1, 2, 3].map((number) => createProduct({
          name: raw[`product${number}Name`], description: raw[`product${number}Description`],
          price: raw[`product${number}Price`], image: raw[`product${number}Image`]
        }))).filter((item) => item.name || item.description || item.price || item.image);

    const strengths = Array.isArray(raw.strengths)
      ? raw.strengths.map((item) => typeof item === "string" ? createStrength(item) : createStrength(item.text, item.id))
      : [1, 2, 3].map((number) => createStrength(raw[`strength${number}`] || ""));

    const legacyActions = [
      ["상담하기", raw.consultUrl, "chat"], ["예약하기", raw.bookingUrl, "calendar"],
      ["상품 보러 가기", raw.shopUrl, "shop"], ["인스타그램", raw.instagramUrl, "instagram"]
    ].filter(([, url]) => url).map(([label, url, icon]) => createAction({ label, url, icon }));

    const actions = Array.isArray(raw.actions) ? raw.actions.map(createAction) : legacyActions;
    return {
      ...blank,
      industry: raw.industry || "", businessName: raw.businessName || "", tagline: raw.tagline || "",
      description: raw.description || "", heroImage: raw.heroImage || "",
      subImages: Array.isArray(raw.subImages) ? raw.subImages.filter(Boolean) : [],
      products,
      strengths: strengths.length ? strengths : [createStrength()],
      address: raw.address || "", openTime: raw.openTime || "", closeTime: raw.closeTime || "",
      closesNextDay: Boolean(raw.closesNextDay), hoursNote: raw.hoursNote || raw.hours || "", phone: raw.phone || "",
      actions, version: SCHEMA_VERSION
    };
  }

  const LocalStorageAdapter = {
    load() {
      try { return migrate(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}); }
      catch { return createBlankState(); }
    },
    save(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: SCHEMA_VERSION })); },
    saveSnapshot(state) { localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify({ ...state, version: SCHEMA_VERSION })); },
    loadSnapshot() {
      try { const saved = localStorage.getItem(MANUAL_STORAGE_KEY); return saved ? migrate(JSON.parse(saved)) : null; }
      catch { return null; }
    },
    clear() { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(MANUAL_STORAGE_KEY); }
  };

  let activeAdapter = LocalStorageAdapter;
  const Repository = {
    load: () => activeAdapter.load(),
    save: (state) => activeAdapter.save(state),
    saveSnapshot: (state) => activeAdapter.saveSnapshot ? activeAdapter.saveSnapshot(state) : activeAdapter.save(state),
    loadSnapshot: () => activeAdapter.loadSnapshot ? activeAdapter.loadSnapshot() : null,
    clear: () => activeAdapter.clear(),
    setAdapter(adapter) {
      if (!adapter?.load || !adapter?.save || !adapter?.clear) throw new Error("데이터 어댑터 규약이 올바르지 않습니다.");
      activeAdapter = adapter;
    }
  };

  global.NicePHData = { Repository, createBlankState, createProduct, createStrength, createAction, migrate, SCHEMA_VERSION };
})(window);


/* NICE PH V1.2 — 5분 안에 사업을 소개할 수 있는 단순한 입력 경험을 지향합니다. */
(function initializeApp() {
  "use strict";

  const Data = window.NicePHData;
  const form = document.querySelector("#businessForm");
  const productFields = document.querySelector("#productFields");
  const strengthFields = document.querySelector("#strengthFields");
  const actionFields = document.querySelector("#actionFields");
  const channelOptions = document.querySelector("#channelOptions");
  const subImageList = document.querySelector("#subImageList");
  const toast = document.querySelector("#toast");
  const saveStatus = document.querySelector("#saveStatus");
  const completionBar = document.querySelector("#completionBar");
  const SHARE_PREFIX = "#share=";
  const SHARE_URL_LIMIT = 1800000;

  function encodeShareState(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = "";
    for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeShareState(hash) {
    if (!hash.startsWith(SHARE_PREFIX)) return null;
    try {
      const encoded = hash.slice(SHARE_PREFIX.length).replace(/-/g, "+").replace(/_/g, "/");
      const binary = atob(encoded + "=".repeat((4 - encoded.length % 4) % 4));
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return Data.migrate(JSON.parse(new TextDecoder().decode(bytes)));
    } catch { return null; }
  }

  const sharedState = decodeShareState(window.location.hash);
  let state = sharedState || Data.Repository.load();
  let saveTimer;
  let toastTimer;

  const industryCopy = {
    "여성의류": "당신에게 어울리는 스타일을 찾아드립니다.", "카페": "잠시 머물고 싶은 편안한 공간입니다.",
    "음식점": "정성껏 준비한 맛있는 한 끼를 만나보세요.", "미용실": "당신에게 어울리는 아름다움을 디자인합니다.",
    "네일숍": "작은 디테일로 완성하는 특별한 스타일.", "헬스·필라테스": "건강한 변화를 함께 만들어갑니다.",
    "꽃집": "소중한 마음을 꽃으로 전해드립니다.", "기타": "우리 사업만의 특별한 가치를 전합니다."
  };

  const iconOptions = [
    ["", "아이콘 없음"], ["link", "링크"], ["phone", "전화"], ["chat", "상담·카카오"],
    ["calendar", "예약"], ["shop", "쇼핑"], ["instagram", "인스타그램"],
    ["blog", "블로그"], ["youtube", "유튜브"], ["location", "위치"]
  ];
  const iconGlyphs = { link: "↗", phone: "☎", chat: "◌", calendar: "□", shop: "◇", instagram: "◎", blog: "B", youtube: "▶", location: "⌖" };
  const channelPresets = {
    instagram: { label: "인스타그램", icon: "instagram" }, smartstore: { label: "스마트스토어", icon: "shop" },
    showroom: { label: "쇼룸", icon: "location" }, naverplace: { label: "네이버플레이스", icon: "location" },
    blog: { label: "블로그", icon: "blog" }, kakao: { label: "카카오채널", icon: "chat" }, youtube: { label: "유튜브", icon: "youtube" }
  };

  function sampleState() {
    return Data.migrate({
      industry: "여성의류", businessName: "NICE", tagline: "당신의 품격과 가치 상승의 동반자",
      description: "동대문에서 20년 이상 여성의류를 판매해온 NICE입니다.\n파티드레스, 무대의상, 홀복, 미니원피스부터 미디와 롱드레스까지\n고객의 체형과 목적에 맞는 스타일을 함께 찾아드립니다.",
      product1Name: "파티드레스", product1Description: "특별한 날을 더욱 돋보이게 만드는 드레스", product1Price: "79,000원부터",
      product2Name: "무대의상", product2Description: "공연과 방송에서 시선을 사로잡는 스타일", product2Price: "상담 후 안내",
      product3Name: "맞춤 추천", product3Description: "체형, 용도, 원하는 분위기에 맞춘 상품 추천", product3Price: "무료 상담",
      strength1: "20년 이상의 여성의류 판매 경험", strength2: "고객 체형과 목적에 맞는 맞춤 추천", strength3: "매장 방문 피팅 및 택배 상담 가능",
      address: "서울 중구 마장로 1길 21, 광희패션몰", openTime: "10:30", closeTime: "01:00", closesNextDay: true, hoursNote: "일요일 휴무", phone: "02-1234-5678"
    });
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function setText(selector, value, fallback = "") { document.querySelector(selector).textContent = value?.trim() || fallback; }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function scheduleSave() {
    saveStatus.textContent = "저장 중…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { Data.Repository.save(state); saveStatus.textContent = "자동 저장됨"; }
      catch { saveStatus.textContent = "이미지 용량이 커 저장할 수 없음"; showToast("이미지 용량이 커서 브라우저에 저장하지 못했어요."); }
    }, 250);
  }

  function syncBaseInputs() {
    ["businessName", "tagline", "description", "heroImage", "address", "openTime", "closeTime", "hoursNote", "phone"].forEach((name) => {
      if (form.elements[name]) form.elements[name].value = state[name] || "";
    });
    form.elements.closesNextDay.checked = Boolean(state.closesNextDay);
    [...form.elements.industry].forEach((input) => { input.checked = input.value === state.industry; });
  }

  function itemControls(collection, index, length, allowRemove = true) {
    return `<div class="item-controls">
      <button type="button" class="item-control" data-command="up" data-collection="${collection}" data-index="${index}" ${index === 0 ? "disabled" : ""} aria-label="위로 이동">↑</button>
      <button type="button" class="item-control" data-command="down" data-collection="${collection}" data-index="${index}" ${index === length - 1 ? "disabled" : ""} aria-label="아래로 이동">↓</button>
      ${allowRemove ? `<button type="button" class="item-control remove" data-command="remove" data-collection="${collection}" data-index="${index}" aria-label="삭제">삭제</button>` : ""}
    </div>`;
  }

  function renderProductEditors() {
    if (!state.products.length) { productFields.innerHTML = '<p class="empty-items">등록된 상품이 없어요. 아래 버튼으로 첫 상품을 추가해 보세요.</p>'; return; }
    productFields.innerHTML = state.products.map((product, index) => `
      <div class="product-editor" data-item-id="${product.id}">
        <div class="item-heading"><h4>상품·서비스 ${String(index + 1).padStart(2, "0")}</h4>${itemControls("products", index, state.products.length)}</div>
        <div class="product-row">
          <label class="field"><span>이름</span><input data-collection="products" data-index="${index}" data-field="name" type="text" value="${escapeHtml(product.name)}" placeholder="예: 파티드레스" maxlength="50"></label>
          <label class="field"><span>가격 또는 가격 안내</span><input data-collection="products" data-index="${index}" data-field="price" type="text" value="${escapeHtml(product.price)}" placeholder="예: 79,000원부터" maxlength="40"></label>
          <label class="field description-field"><span>짧은 설명</span><input data-collection="products" data-index="${index}" data-field="description" type="text" value="${escapeHtml(product.description)}" placeholder="상품이나 서비스의 특징을 짧게 적어주세요" maxlength="100"></label>
          <label class="compact-upload"><span class="thumb" ${product.image ? `style="background-image:url('${product.image}')"` : ""}></span><span>${product.image ? "이미지 변경" : "이미지 선택"}</span><input class="image-input" data-product-image="${index}" type="file" accept="image/*"></label>
        </div>
      </div>`).join("");
  }

  function renderStrengthEditors() {
    if (!state.strengths.length) { strengthFields.innerHTML = '<p class="empty-items">강점을 하나씩 짧게 적어보세요.</p>'; return; }
    strengthFields.innerHTML = state.strengths.map((strength, index) => `
      <label class="field numbered"><i>${String(index + 1).padStart(2, "0")}</i><input data-collection="strengths" data-index="${index}" data-field="text" type="text" value="${escapeHtml(strength.text)}" placeholder="예: 20년 이상의 현장 경험"><button type="button" class="item-control remove" data-command="remove" data-collection="strengths" data-index="${index}" aria-label="강점 삭제">삭제</button></label>`).join("");
  }

  function renderActionEditors() {
    if (!state.actions.length) { actionFields.innerHTML = '<p class="empty-items">아직 연결 버튼이 없어요. 예약, 쇼핑몰, SNS 등을 자유롭게 추가하세요.</p>'; return; }
    actionFields.innerHTML = state.actions.map((action, index) => `
      <div class="action-editor">
        <div class="item-heading"><h4>버튼 ${String(index + 1).padStart(2, "0")}</h4>${itemControls("actions", index, state.actions.length)}</div>
        <div class="action-row">
          <label class="field"><span>버튼명</span><input data-collection="actions" data-index="${index}" data-field="label" type="text" value="${escapeHtml(action.label)}" placeholder="예: 스마트스토어" maxlength="30"></label>
          <label class="field"><span>링크(URL)</span><input data-collection="actions" data-index="${index}" data-field="url" type="text" inputmode="url" value="${escapeHtml(action.url)}" placeholder="https://... 또는 tel:02..."></label>
          <label class="field"><span>아이콘 <small>(선택)</small></span><select data-collection="actions" data-index="${index}" data-field="icon">${iconOptions.map(([value, label]) => `<option value="${value}" ${action.icon === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        </div>
      </div>`).join("");
  }

  function renderSubImages() {
    subImageList.innerHTML = state.subImages.map((image, index) => `<div class="sub-image-item" style="background-image:url('${image}')"><button type="button" data-remove-sub-image="${index}" aria-label="서브 이미지 ${index + 1} 삭제">×</button></div>`).join("");
    const heroPreview = document.querySelector('[data-image-preview="heroImage"]');
    heroPreview.hidden = !state.heroImage;
    heroPreview.style.backgroundImage = state.heroImage ? `url("${state.heroImage}")` : "";
  }

  function renderChannelOptions() {
    channelOptions.querySelectorAll("[data-channel]").forEach((button) => {
      button.setAttribute("aria-pressed", String(state.actions.some((action) => action.channel === button.dataset.channel)));
    });
  }

  function updateProgress() {
    const criteria = [
      [Boolean(state.industry), "업종을 선택해 주세요."], [Boolean(state.businessName.trim()), "상호명을 입력해 주세요."],
      [Boolean(state.tagline.trim()), "한 줄 소개를 적어주세요."], [Boolean(state.description.trim()), "사업 소개를 적어주세요."],
      [Boolean(state.heroImage || state.subImages.length), "대표 이미지를 등록해 주세요."],
      [state.products.some((product) => product.name.trim()), "상품이나 서비스를 하나 추가해 주세요."],
      [state.strengths.some((strength) => strength.text.trim()), "사업의 강점을 하나 적어주세요."],
      [Boolean(state.address.trim()), "주소를 입력해 주세요."],
      [Boolean(state.openTime && state.closeTime), "오픈과 마감 시간을 입력해 주세요."],
      [Boolean(state.phone.trim()), "전화번호를 입력해 주세요."],
      [state.actions.some((action) => action.label.trim() && safeActionUrl(action.url)), "고객 연결 버튼을 하나 완성해 주세요."]
    ];
    const completed = criteria.filter(([done]) => done).length;
    const percent = Math.round((completed / criteria.length) * 100);
    document.querySelector("#progressPercent").textContent = `${percent}% 완료`;
    document.querySelector("#progressBar").style.width = `${percent}%`;
    const progress = document.querySelector("#interviewProgress");
    progress.setAttribute("aria-valuenow", String(percent));
    document.querySelector("#progressHint").textContent = percent === 100 ? "소개 페이지가 완성됐어요!" : criteria.find(([done]) => !done)?.[1] || "조금만 더 입력해 주세요.";
  }

  function renderEditors() { renderProductEditors(); renderStrengthEditors(); renderActionEditors(); renderSubImages(); renderChannelOptions(); }

  function safeActionUrl(value) {
    const trimmed = value?.trim();
    if (!trimmed) return "";
    const candidate = /^www\./i.test(trimmed) ? `https://${trimmed}` : trimmed;
    try {
      const url = new URL(candidate);
      return ["http:", "https:", "tel:", "mailto:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  }

  function actionMarkup(label, href, icon) {
    const external = href.startsWith("http");
    const glyph = iconGlyphs[icon];
    return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${glyph ? `<span class="action-icon" aria-hidden="true">${glyph}</span>` : ""}${escapeHtml(label || "바로가기")}</a>`;
  }

  function formatKoreanTime(value) {
    if (!value) return "";
    const [hourText, minute = "00"] = value.split(":");
    const hour = Number(hourText);
    const period = hour < 6 ? "새벽" : hour < 12 ? "오전" : "오후";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${displayHour}시${minute === "00" ? "" : ` ${Number(minute)}분`}`;
  }

  function formatBusinessHours() {
    const parts = [];
    if (state.openTime && state.closeTime) parts.push(`${formatKoreanTime(state.openTime)} ~ ${state.closesNextDay ? "다음날 " : ""}${formatKoreanTime(state.closeTime)}`);
    else if (state.openTime) parts.push(`${formatKoreanTime(state.openTime)} 오픈`);
    else if (state.closeTime) parts.push(`${state.closesNextDay ? "다음날 " : ""}${formatKoreanTime(state.closeTime)} 마감`);
    if (state.hoursNote?.trim()) parts.push(state.hoursNote.trim());
    return parts.join("\n");
  }

  function renderPreview() {
    updateProgress();
    const industry = state.industry || "업종을 선택해 주세요";
    setText("#previewIndustry", industry);
    setText("#previewName", state.businessName, "상호명을 입력해 주세요");
    setText("#previewTagline", state.tagline, industryCopy[state.industry] || "사업의 매력을 한 문장으로 소개해 보세요.");
    setText("#previewDescription", state.description, "사업 소개를 입력하면 고객에게 전할 이야기가 이곳에 표시됩니다.");
    setText("#previewFooterName", state.businessName, "NICE PH");

    const heroSource = state.heroImage || state.subImages[0] || "";
    const heroImage = document.querySelector("#previewHeroImage");
    heroImage.classList.toggle("placeholder", !heroSource);
    heroImage.style.backgroundImage = heroSource ? `url("${heroSource}")` : "";
    const galleryImages = state.heroImage ? state.subImages : state.subImages.slice(1);
    document.querySelector("#previewGallerySection").hidden = galleryImages.length === 0;
    document.querySelector("#previewGallery").innerHTML = galleryImages.map((image, index) => `<figure style="background-image:url('${image}')" aria-label="사업 서브 이미지 ${index + 1}"></figure>`).join("");

    const products = state.products.filter((item) => item.name || item.description || item.price || item.image);
    document.querySelector("#previewProducts").hidden = products.length === 0;
    document.querySelector("#heroProducts").hidden = products.length === 0;
    document.querySelector("#previewProductCards").innerHTML = products.map((item, index) => `
      <article class="product-card"><div class="product-image" ${item.image ? `style="background-image:url('${item.image}')"` : ""}>${item.image ? "" : String(index + 1).padStart(2, "0")}</div>
      <div class="product-card-body"><h4>${escapeHtml(item.name || "상품·서비스")}</h4>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}${item.price ? `<strong>${escapeHtml(item.price)}</strong>` : ""}</div></article>`).join("");

    const strengths = state.strengths.map((item) => item.text).filter(Boolean);
    document.querySelector("#previewStrengthsSection").hidden = strengths.length === 0;
    document.querySelector("#previewStrengths").innerHTML = strengths.map((item, index) => `<div class="strength-item"><i>${String(index + 1).padStart(2, "0")}</i><p>${escapeHtml(item)}</p></div>`).join("");

    const info = [["주소", state.address], ["영업시간", formatBusinessHours()], ["전화번호", state.phone]].filter(([, value]) => value);
    document.querySelector("#previewInfoSection").hidden = info.length === 0;
    document.querySelector("#previewInfo").innerHTML = info.map(([label, value]) => `<div class="info-item"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");

    const tel = state.phone ? `tel:${state.phone.replace(/[^0-9+]/g, "")}` : "";
    const customActions = state.actions.map((item) => ({ ...item, href: safeActionUrl(item.url) })).filter((item) => item.href);
    const actions = [...(tel ? [{ label: "전화하기", href: tel, icon: "phone" }] : []), ...customActions];
    document.querySelector("#previewCtaSection").hidden = actions.length === 0;
    document.querySelector("#previewCtas").innerHTML = actions.map((item) => actionMarkup(item.label, item.href, item.icon)).join("");

    const primaryContact = customActions[0]?.href || tel;
    const heroContact = document.querySelector("#heroContact");
    heroContact.hidden = !primaryContact;
    if (primaryContact) {
      heroContact.href = primaryContact;
      if (primaryContact.startsWith("http")) { heroContact.target = "_blank"; heroContact.rel = "noopener noreferrer"; }
      else { heroContact.removeAttribute("target"); heroContact.removeAttribute("rel"); }
    }
    const mobile = document.querySelector("#mobileContact");
    mobile.hidden = !primaryContact;
    mobile.innerHTML = primaryContact ? `<a href="${escapeHtml(primaryContact)}"${primaryContact.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>지금 문의하기</a>` : "";
  }

  function refresh({ editors = false } = {}) { if (editors) renderEditors(); renderPreview(); scheduleSave(); }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      if (!file?.type.startsWith("image/")) { reject(new Error("invalid image")); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
    });
  }

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (input.dataset.collection) {
      state[input.dataset.collection][Number(input.dataset.index)][input.dataset.field] = input.value;
    } else if (["businessName", "tagline", "description", "address", "openTime", "closeTime", "hoursNote", "phone"].includes(input.name)) {
      state[input.name] = input.value;
    } else if (input.name === "closesNextDay") {
      state.closesNextDay = input.checked;
    } else if (input.name === "industry") {
      const previousSuggestion = industryCopy[state.industry];
      state.industry = input.value;
      if (!state.tagline.trim() || state.tagline === previousSuggestion) { state.tagline = industryCopy[state.industry]; form.elements.tagline.value = state.tagline; }
    }
    renderPreview(); scheduleSave();
  });

  form.addEventListener("change", async (event) => {
    const input = event.target;
    try {
      if (input.name === "heroImageFile" && input.files[0]) state.heroImage = await readImage(input.files[0]);
      else if (input.name === "subImageFiles" && input.files.length) state.subImages.push(...await Promise.all([...input.files].map(readImage)));
      else if (input.dataset.productImage !== undefined && input.files[0]) state.products[Number(input.dataset.productImage)].image = await readImage(input.files[0]);
      else return;
      input.value = ""; refresh({ editors: true });
    } catch { showToast("이미지 파일을 불러오지 못했어요."); }
  });

  form.addEventListener("click", (event) => {
    const subRemove = event.target.closest("[data-remove-sub-image]");
    if (subRemove) { state.subImages.splice(Number(subRemove.dataset.removeSubImage), 1); refresh({ editors: true }); return; }
    const control = event.target.closest("[data-command]");
    if (!control) return;
    const collection = state[control.dataset.collection];
    const index = Number(control.dataset.index);
    if (control.dataset.command === "remove") collection.splice(index, 1);
    if (control.dataset.command === "up" && index > 0) [collection[index - 1], collection[index]] = [collection[index], collection[index - 1]];
    if (control.dataset.command === "down" && index < collection.length - 1) [collection[index + 1], collection[index]] = [collection[index], collection[index + 1]];
    refresh({ editors: true });
  });

  document.querySelector("#addProduct").addEventListener("click", () => { state.products.push(Data.createProduct()); refresh({ editors: true }); productFields.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" }); });
  document.querySelector("#addStrength").addEventListener("click", () => { state.strengths.push(Data.createStrength()); refresh({ editors: true }); });
  document.querySelector("#addAction").addEventListener("click", () => { state.actions.push(Data.createAction()); refresh({ editors: true }); actionFields.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" }); });
  channelOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-channel]");
    if (!button) return;
    const channel = button.dataset.channel;
    let index = state.actions.findIndex((action) => action.channel === channel);
    if (index < 0) {
      const preset = channelPresets[channel];
      state.actions.push(Data.createAction({ ...preset, channel }));
      index = state.actions.length - 1;
      refresh({ editors: true });
      showToast(`${preset.label} 버튼 입력란을 추가했어요. URL을 입력해 주세요.`);
    } else {
      showToast("이미 추가된 채널이에요. URL을 이어서 입력해 주세요.");
    }
    const urlInput = actionFields.querySelector(`[data-collection="actions"][data-index="${index}"][data-field="url"]`);
    urlInput?.focus(); urlInput?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  document.querySelector("#aiInterview").addEventListener("click", () => showToast("AI 인터뷰는 준비 중이에요. 지금은 직접 입력을 이용해 주세요."));

  document.querySelector("#saveDraft").addEventListener("click", () => {
    try { Data.Repository.save(state); Data.Repository.saveSnapshot(state); saveStatus.textContent = "직접 저장됨"; showToast("현재 입력 내용을 안전하게 저장했어요."); }
    catch { showToast("저장 공간이 부족해 저장하지 못했어요. 이미지 크기를 확인해 주세요."); }
  });
  document.querySelector("#loadDraft").addEventListener("click", () => {
    const saved = Data.Repository.loadSnapshot();
    if (!saved) { showToast("직접 저장한 내용이 아직 없어요."); return; }
    state = saved; syncBaseInputs(); refresh({ editors: true }); showToast("저장한 입력 내용을 불러왔어요.");
  });

  document.querySelector("#loadSample").addEventListener("click", () => { state = sampleState(); syncBaseInputs(); refresh({ editors: true }); showToast("NICE 예시 데이터를 불러왔어요."); });
  document.querySelector("#resetAll").addEventListener("click", () => {
    if (!window.confirm("입력한 내용을 모두 지울까요? 이 작업은 되돌릴 수 없습니다.")) return;
    Data.Repository.clear(); state = Data.createBlankState(); syncBaseInputs(); refresh({ editors: true }); showToast("모든 입력 내용을 초기화했어요.");
  });

  function applyViewMode(options = {}) {
    const isPreview = window.location.hash === "#preview" || window.location.hash.startsWith(SHARE_PREFIX);
    document.body.classList.toggle("preview-mode", isPreview); completionBar.hidden = !isPreview;
    document.title = isPreview ? `${state.businessName.trim() || "NICE PH"} | 완성 페이지` : "NICE PH | 내 사업을 이해하는 홍보 공간";
    if (options.moveFocus) {
      if (isPreview) window.scrollTo({ top: 0, behavior: "smooth" }); else document.querySelector("#builder").scrollIntoView({ behavior: "smooth" });
      (isPreview ? document.querySelector("#backToEditor") : document.querySelector("#viewCompletedPage")).focus({ preventScroll: true });
    }
  }

  function createShareUrl() {
    try { Data.Repository.save(state); saveStatus.textContent = "자동 저장됨"; } catch { /* URL 공유는 브라우저 저장 용량과 별개로 계속 시도합니다. */ }
    const url = new URL(window.location.href);
    url.hash = `share=${encodeShareState(state)}`;
    if (url.href.length > SHARE_URL_LIMIT) throw new Error("share url too large");
    return url.href;
  }

  function openSharePage() {
    try {
      const shareUrl = createShareUrl();
      const opened = window.open(shareUrl, "_blank");
      if (opened) { opened.opener = null; showToast("작성 데이터가 포함된 완성 페이지를 새 탭에서 열었어요."); }
      else window.location.href = shareUrl;
    } catch { showToast("이미지 용량이 커 공유 링크를 만들 수 없어요. 이미지 수나 크기를 줄여 주세요."); }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea"); textarea.value = text; textarea.setAttribute("readonly", ""); textarea.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(textarea); textarea.select(); const copied = document.execCommand("copy"); textarea.remove(); if (!copied) throw new Error("copy failed");
  }
  async function copyPageLink() {
    const button = document.querySelector("#copyPageLink");
    try {
      const shareUrl = createShareUrl();
      if (navigator.clipboard?.writeText && window.isSecureContext) await navigator.clipboard.writeText(shareUrl); else fallbackCopy(shareUrl);
      button.textContent = "복사 완료"; showToast("작성 데이터가 포함된 링크를 복사했어요.");
    } catch { button.textContent = "복사 실패"; showToast("링크를 만들거나 복사하지 못했어요. 이미지 용량을 확인해 주세요."); }
    setTimeout(() => { button.textContent = "페이지 링크 복사"; }, 2200);
  }

  function returnToEditor() {
    const editorUrl = new URL(window.location.href);
    editorUrl.hash = "builder";
    try { window.history.replaceState(null, "", editorUrl.href); applyViewMode({ moveFocus: true }); }
    catch { window.location.hash = "builder"; }
  }

  document.querySelector("#viewCompletedPage").addEventListener("click", () => { window.location.hash === "#preview" ? applyViewMode({ moveFocus: true }) : window.location.hash = "preview"; });
  document.querySelector("#backToEditor").addEventListener("click", returnToEditor);
  document.querySelector("#sharePage").addEventListener("click", openSharePage);
  document.querySelector("#copyPageLink").addEventListener("click", copyPageLink);
  document.querySelector("#heroProducts").addEventListener("click", (event) => { if (!document.body.classList.contains("preview-mode")) return; event.preventDefault(); document.querySelector("#previewProducts").scrollIntoView({ behavior: "smooth" }); });
  window.addEventListener("hashchange", () => applyViewMode({ moveFocus: true }));

  syncBaseInputs(); renderEditors(); renderPreview(); applyViewMode();
  saveStatus.textContent = "자동 저장 준비됨";
})();
