/* NICE PH V1.1: 폼 상태, 전체 화면 보기, 이미지 업로드, 브라우저 저장을 한 파일에서 관리합니다. */
const STORAGE_KEY = "nice-ph-v1-business";
const form = document.querySelector("#businessForm");
const productFields = document.querySelector("#productFields");
const toast = document.querySelector("#toast");
const saveStatus = document.querySelector("#saveStatus");
const completionBar = document.querySelector("#completionBar");

const industryCopy = {
  "여성의류": "당신에게 어울리는 스타일을 찾아드립니다.",
  "카페": "잠시 머물고 싶은 편안한 공간입니다.",
  "음식점": "정성껏 준비한 맛있는 한 끼를 만나보세요.",
  "미용실": "당신에게 어울리는 아름다움을 디자인합니다.",
  "네일숍": "작은 디테일로 완성하는 특별한 스타일.",
  "헬스·필라테스": "건강한 변화를 함께 만들어갑니다.",
  "꽃집": "소중한 마음을 꽃으로 전해드립니다.",
  "기타": "우리 사업만의 특별한 가치를 전합니다."
};

const sampleData = {
  industry: "여성의류",
  businessName: "NICE",
  tagline: "당신의 품격과 가치 상승의 동반자",
  description: "동대문에서 20년 이상 여성의류를 판매해온 NICE입니다.\n파티드레스, 무대의상, 홀복, 미니원피스부터 미디와 롱드레스까지\n고객의 체형과 목적에 맞는 스타일을 함께 찾아드립니다.",
  heroImage: "",
  product1Name: "파티드레스", product1Description: "특별한 날을 더욱 돋보이게 만드는 드레스", product1Price: "79,000원부터", product1Image: "",
  product2Name: "무대의상", product2Description: "공연과 방송에서 시선을 사로잡는 스타일", product2Price: "상담 후 안내", product2Image: "",
  product3Name: "맞춤 추천", product3Description: "체형, 용도, 원하는 분위기에 맞춘 상품 추천", product3Price: "무료 상담", product3Image: "",
  strength1: "20년 이상의 여성의류 판매 경험",
  strength2: "고객 체형과 목적에 맞는 맞춤 추천",
  strength3: "매장 방문 피팅 및 택배 상담 가능",
  address: "서울 중구 마장로 1길 21, 광희패션몰",
  hours: "평일 10:00–20:00",
  phone: "02-1234-5678",
  consultUrl: "", bookingUrl: "", shopUrl: "", instagramUrl: ""
};

// 상품 입력 영역은 같은 구조를 세 번 생성해 유지보수를 단순하게 합니다.
function buildProductFields() {
  productFields.innerHTML = Array.from({ length: 3 }, (_, index) => {
    const number = index + 1;
    return `
      <div class="product-editor">
        <h4>상품·서비스 ${String(number).padStart(2, "0")}</h4>
        <div class="product-row">
          <label class="field"><span>이름</span><input name="product${number}Name" type="text" placeholder="예: 파티드레스" maxlength="50"></label>
          <label class="field"><span>가격 또는 가격 안내</span><input name="product${number}Price" type="text" placeholder="예: 79,000원부터" maxlength="40"></label>
          <label class="field description-field"><span>짧은 설명</span><input name="product${number}Description" type="text" placeholder="상품이나 서비스의 특징을 짧게 적어주세요" maxlength="100"></label>
          <label class="compact-upload"><span class="thumb" data-thumb="product${number}Image"></span><span>이미지 선택</span><input class="image-input" type="file" name="product${number}ImageFile" accept="image/*" data-target="product${number}Image"></label>
          <input type="hidden" name="product${number}Image">
        </div>
      </div>`;
  }).join("");
}

function getState() {
  const data = Object.fromEntries(new FormData(form).entries());
  delete data.heroImageFile;
  for (let i = 1; i <= 3; i += 1) delete data[`product${i}ImageFile`];
  return data;
}

function fillForm(data = {}) {
  Object.entries(data).forEach(([name, value]) => {
    const fields = form.elements[name];
    if (!fields) return;
    if (fields instanceof RadioNodeList) {
      [...fields].forEach((field) => { field.checked = field.value === value; });
    } else if (fields.type !== "file") {
      fields.value = value ?? "";
    }
  });
  updateUploadIndicators(data);
}

function updateUploadIndicators(state) {
  const heroPreview = document.querySelector('[data-image-preview="heroImage"]');
  heroPreview.hidden = !state.heroImage;
  heroPreview.style.backgroundImage = state.heroImage ? `url("${state.heroImage}")` : "";
  for (let i = 1; i <= 3; i += 1) {
    const thumb = document.querySelector(`[data-thumb="product${i}Image"]`);
    const image = state[`product${i}Image`];
    thumb.style.backgroundImage = image ? `url("${image}")` : "";
  }
}

function setText(selector, value, fallback = "") {
  document.querySelector(selector).textContent = value?.trim() || fallback;
}

function safeWebUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function setLink(element, href) {
  if (!href) { element.hidden = true; element.removeAttribute("href"); return; }
  element.hidden = false;
  element.href = href;
  if (href.startsWith("http")) { element.target = "_blank"; element.rel = "noopener noreferrer"; }
}

function renderPreview(state) {
  const industry = state.industry || "업종을 선택해 주세요";
  setText("#previewIndustry", industry);
  setText("#previewName", state.businessName, "상호명을 입력해 주세요");
  setText("#previewTagline", state.tagline, industryCopy[state.industry] || "사업의 매력을 한 문장으로 소개해 보세요.");
  setText("#previewDescription", state.description, "사업 소개를 입력하면 고객에게 전할 이야기가 이곳에 표시됩니다.");
  setText("#previewFooterName", state.businessName, "NICE PH");

  const heroImage = document.querySelector("#previewHeroImage");
  heroImage.classList.toggle("placeholder", !state.heroImage);
  heroImage.style.backgroundImage = state.heroImage ? `url("${state.heroImage}")` : "";

  const products = Array.from({ length: 3 }, (_, index) => {
    const i = index + 1;
    return { name: state[`product${i}Name`], description: state[`product${i}Description`], price: state[`product${i}Price`], image: state[`product${i}Image`] };
  }).filter((item) => item.name || item.description || item.price || item.image);
  const productsSection = document.querySelector("#previewProducts");
  productsSection.hidden = products.length === 0;
  document.querySelector("#heroProducts").hidden = products.length === 0;
  document.querySelector("#previewProductCards").innerHTML = products.map((item, index) => `
    <article class="product-card">
      <div class="product-image" ${item.image ? `style="background-image:url('${item.image}')"` : ""}>${item.image ? "" : String(index + 1).padStart(2, "0")}</div>
      <div class="product-card-body"><h4>${escapeHtml(item.name || "상품·서비스")}</h4>${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}${item.price ? `<strong>${escapeHtml(item.price)}</strong>` : ""}</div>
    </article>`).join("");

  const strengths = [state.strength1, state.strength2, state.strength3].filter(Boolean);
  document.querySelector("#previewStrengthsSection").hidden = strengths.length === 0;
  document.querySelector("#previewStrengths").innerHTML = strengths.map((item, index) => `<div class="strength-item"><i>${String(index + 1).padStart(2, "0")}</i><p>${escapeHtml(item)}</p></div>`).join("");

  const info = [["주소", state.address], ["영업시간", state.hours], ["전화번호", state.phone]].filter(([, value]) => value);
  document.querySelector("#previewInfoSection").hidden = info.length === 0;
  document.querySelector("#previewInfo").innerHTML = info.map(([label, value]) => `<div class="info-item"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");

  const tel = state.phone ? `tel:${state.phone.replace(/[^0-9+]/g, "")}` : "";
  const consult = safeWebUrl(state.consultUrl);
  const actions = [
    ["전화하기", tel], ["상담하기", consult], ["예약하기", safeWebUrl(state.bookingUrl)],
    ["상품 보러 가기", safeWebUrl(state.shopUrl)], ["인스타그램", safeWebUrl(state.instagramUrl)]
  ].filter(([, href]) => href);
  const ctaSection = document.querySelector("#previewCtaSection");
  ctaSection.hidden = actions.length === 0;
  document.querySelector("#previewCtas").innerHTML = actions.map(([label, href]) => `<a href="${escapeHtml(href)}"${href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`).join("");

  const primaryContact = consult || tel;
  setLink(document.querySelector("#heroContact"), primaryContact);
  const mobile = document.querySelector("#mobileContact");
  mobile.hidden = !primaryContact;
  mobile.innerHTML = primaryContact ? `<a href="${escapeHtml(primaryContact)}"${primaryContact.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>지금 문의하기</a>` : "";
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

let saveTimer;
function saveAndRender() {
  const state = getState();
  renderPreview(state);
  updateUploadIndicators(state);
  saveStatus.textContent = "저장 중…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      saveStatus.textContent = "자동 저장됨";
    } catch {
      saveStatus.textContent = "이미지 용량이 커 저장할 수 없음";
      showToast("이미지 용량이 커서 브라우저에 저장하지 못했어요.");
    }
  }, 250);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// #preview 해시를 화면 상태의 기준으로 사용해 새로고침 후에도 완성 페이지를 유지합니다.
function applyViewMode(options = {}) {
  const isPreview = window.location.hash === "#preview";
  document.body.classList.toggle("preview-mode", isPreview);
  completionBar.hidden = !isPreview;
  document.title = isPreview
    ? `${form.elements.businessName.value.trim() || "NICE PH"} | 완성 페이지`
    : "NICE PH | 내 사업을 이해하는 홍보 공간";
  if (options.moveFocus) {
    if (isPreview) window.scrollTo({ top: 0, behavior: "smooth" });
    else document.querySelector("#builder").scrollIntoView({ behavior: "smooth" });
    (isPreview ? document.querySelector("#backToEditor") : document.querySelector("#viewCompletedPage")).focus({ preventScroll: true });
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("copy failed");
}

async function copyPageLink() {
  const button = document.querySelector("#copyPageLink");
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) await navigator.clipboard.writeText(window.location.href);
    else fallbackCopy(window.location.href);
    button.textContent = "복사 완료";
    showToast("현재 페이지 주소를 복사했어요.");
  } catch {
    button.textContent = "복사 실패";
    showToast("주소를 복사하지 못했어요. 브라우저 주소창에서 직접 복사해 주세요.");
  } finally {
    window.setTimeout(() => { button.textContent = "페이지 링크 복사"; }, 2200);
  }
}

// 업로드 이미지는 서버로 보내지 않고 Data URL로 변환해 즉시 표시합니다.
function handleImageUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("이미지 파일만 선택할 수 있어요."); return; }
  const reader = new FileReader();
  reader.onload = () => {
    form.elements[input.dataset.target].value = reader.result;
    saveAndRender();
    input.value = "";
  };
  reader.onerror = () => showToast("이미지를 불러오지 못했어요.");
  reader.readAsDataURL(file);
}

form.addEventListener("input", (event) => {
  if (event.target.name === "industry") {
    const tagline = form.elements.tagline;
    if (!tagline.value.trim() || Object.values(industryCopy).includes(tagline.value)) tagline.value = industryCopy[event.target.value];
  }
  saveAndRender();
});
form.addEventListener("change", (event) => { if (event.target.matches(".image-input")) handleImageUpload(event.target); });

document.querySelector("#loadSample").addEventListener("click", () => {
  fillForm(sampleData); saveAndRender(); showToast("NICE 예시 데이터를 불러왔어요.");
});
document.querySelector("#resetAll").addEventListener("click", () => {
  if (!window.confirm("입력한 내용을 모두 지울까요? 이 작업은 되돌릴 수 없습니다.")) return;
  form.reset();
  [...form.querySelectorAll('input[type="hidden"]')].forEach((input) => { input.value = ""; });
  localStorage.removeItem(STORAGE_KEY);
  saveAndRender(); showToast("모든 입력 내용을 초기화했어요.");
});
document.querySelector("#viewCompletedPage").addEventListener("click", () => {
  if (window.location.hash === "#preview") applyViewMode({ moveFocus: true });
  else window.location.hash = "preview";
});
document.querySelector("#backToEditor").addEventListener("click", () => { window.location.hash = "builder"; });
document.querySelector("#copyPageLink").addEventListener("click", copyPageLink);
document.querySelector("#heroProducts").addEventListener("click", (event) => {
  if (!document.body.classList.contains("preview-mode")) return;
  event.preventDefault();
  document.querySelector("#previewProducts").scrollIntoView({ behavior: "smooth" });
});
window.addEventListener("hashchange", () => applyViewMode({ moveFocus: true }));

function initialize() {
  buildProductFields();
  let restored = {};
  try { restored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { restored = {}; }
  fillForm(restored);
  renderPreview(getState());
  saveStatus.textContent = Object.keys(restored).length ? "이전 내용 복원됨" : "자동 저장 준비됨";
  applyViewMode();
}

initialize();
