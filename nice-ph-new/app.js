(() => {
  "use strict";

  const STORAGE_KEY = "promoLink.v13";
  const LEGACY_KEYS = ["nicePH.v13", "nicePH.v12", "nicePHState", "nice-ph-data"];
  const CATEGORIES = ["소식", "신상품", "이벤트", "공지사항", "후기", "프로모션", "이용 안내", "성공 사례", "작성 팁"];
  const INDUSTRIES = {
    "여성의류": "당신에게 어울리는 스타일을 찾아드립니다.",
    "카페": "잠시 머물고 싶은 편안한 공간입니다.",
    "음식점": "정성껏 준비한 맛있는 한 끼를 만나보세요.",
    "미용실": "당신에게 어울리는 아름다움을 디자인합니다.",
    "네일숍": "작은 디테일로 완성하는 특별한 스타일.",
    "헬스·필라테스": "건강한 변화를 함께 만들어갑니다.",
    "꽃집": "소중한 마음을 꽃으로 전해드립니다.",
    "기타": "우리 사업만의 특별한 가치를 전합니다."
  };
  const ACTION_TYPES = {
    phone:["전화"], sms:["문자"], email:["이메일"], kakao:["카카오톡"], kakaochannel:["카카오채널"],
    navermap:["네이버"], map:["지도"], naverbooking:["네이버예약"], smartstore:["스마트스토어"], instagram:["인스타그램"],
    threads:["Threads"], facebook:["Facebook"], x:["X"], youtube:["YouTube"], blog:["블로그"],
    showroom:["쇼룸"], ownmall:["홈페이지"], inquiry:["문의폼"], coupang:["쿠팡"], link:["기타 링크"]
  };
  const ACTION_RECOMMENDATIONS = {
    "음식점":["phone","naverbooking","map","instagram"],
    "카페":["phone","map","instagram","navermap"],
    "미용실":["naverbooking","kakao","phone","instagram"],
    "네일숍":["naverbooking","kakao","phone","instagram"],
    "여성의류":["kakao","phone","instagram","map"],
    "헬스·필라테스":["inquiry","phone","kakao","navermap"],
    "꽃집":["phone","kakao","navermap","map"],
    "기타":["phone","kakao","ownmall","map"]
  };
  const ICONS = {
    phone:'<path d="M7 3h3l1.3 4-2 1.6a15 15 0 0 0 6.1 6.1l1.6-2 4 1.3v3c0 1.1-.9 2-2 2A16 16 0 0 1 5 5c0-1.1.9-2 2-2Z"/>',
    sms:'<path d="M4 5.5h16v11H9l-5 4v-15Z"/><path d="M8 10h8M8 13h5"/>',
    email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    kakao:'<path d="M12 4c5 0 9 3.1 9 7s-4 7-9 7c-1 0-2-.1-2.9-.4L5 20l1.2-3.6C4.2 15.1 3 13.2 3 11c0-3.9 4-7 9-7Z"/>',
    kakaochannel:'<path d="M12 4c5 0 9 3.1 9 7s-4 7-9 7c-1 0-2-.1-2.9-.4L5 20l1.2-3.6C4.2 15.1 3 13.2 3 11c0-3.9 4-7 9-7Z"/><path d="M12 8v6M9 11h6"/>',
    navermap:'<path d="M5 20V4l5 8V4l9 16V4"/><path d="M4 20h16"/>',
    map:'<path d="M12 22s7-6.2 7-13a7 7 0 1 0-14 0c0 6.8 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/>',
    naverbooking:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 9h16M8 14l2 2 5-5"/>',
    smartstore:'<path d="M5 9h14l-1 11H6L5 9Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2M9 16V12l6 4v-4"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
    threads:'<path d="M17.5 8.2C16.7 5.7 14.8 4 12 4c-4 0-7 3-7 8s2.8 8 7 8c3.2 0 5.7-1.7 5.7-4.4 0-2.4-2-3.8-5-3.8-2.5 0-4.2 1.1-4.2 2.8 0 1.4 1.2 2.4 2.8 2.4 3.4 0 5.6-2.7 5.6-6.1 0-2.7-1.5-4.2-4.1-4.2-1.5 0-2.8.5-3.8 1.3"/>',
    facebook:'<path d="M14 21v-8h3l.5-4H14V7c0-1.2.5-2 2-2h2V2.2c-.7-.1-1.6-.2-2.8-.2-3 0-5.2 1.8-5.2 5.3V9H7v4h3v8"/>',
    x:'<path d="M4 3l16 18M20 3 4 21"/>',
    youtube:'<rect x="2.5" y="6" width="19" height="12" rx="4"/><path d="m10 9 5 3-5 3V9Z"/>',
    blog:'<path d="M5 4h11l3 3v13H5V4Z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    showroom:'<path d="M4 10 12 3l8 7v10H4V10Z"/><path d="M9 20v-7h6v7M8 9h8"/>',
    ownmall:'<path d="M3 8h18l-2-5H5L3 8Z"/><path d="M5 8v12h14V8M9 20v-6h6v6"/>',
    inquiry:'<path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/><circle cx="17" cy="17" r="3"/><path d="M17 15.5v3M15.5 17h3"/>',
    coupang:'<path d="M18 8a7 7 0 1 0 0 8"/><path d="M18 8h3v3M18 16h3v-3"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1"/>'
  };
  const iconSvg = (type) => `<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[type] || ICONS.link}</svg>`;
  const BRAND_MARKS = {
    kakao:"TALK",kakaochannel:"CH",navermap:"N",naverbooking:"N",smartstore:"N",blog:"B",
    instagram:"IG",threads:"@",facebook:"f",x:"X",youtube:"▶",coupang:"C",showroom:"S",ownmall:"W"
  };
  const ACTION_HINTS = {
    phone:"전화로 바로 문의",sms:"문자로 문의",email:"이메일 보내기",kakao:"카카오톡 상담",kakaochannel:"채널에서 상담",
    navermap:"네이버에서 확인",naverbooking:"예약 화면 열기",smartstore:"상품 보러가기",instagram:"새 소식 보기",threads:"이야기 보기",
    facebook:"페이지 방문",x:"계정 방문",youtube:"영상 보기",blog:"블로그 방문",showroom:"온라인 쇼룸 보기",ownmall:"홈페이지 방문",
    inquiry:"문의서 작성",map:"위치와 길찾기",coupang:"상품 보러가기",link:"자세히 보기"
  };
  const brandIcon = (type) => {
    const mark=BRAND_MARKS[type];
    return mark?`<span aria-hidden="true">${mark}</span>`:iconSvg(type);
  };
  const CHANNELS = {
    instagram:{name:"Instagram",url:"https://www.instagram.com/"},
    threads:{name:"Threads",url:"https://www.threads.net/"},
    facebook:{name:"Facebook",url:"https://www.facebook.com/"},
    x:{name:"X",url:"https://x.com/compose/post"},
    blog:{name:"네이버 블로그",url:"https://blog.naver.com/"},
    website:{name:"홈페이지 게시판",url:""}
  };
  const CHANNEL_IMAGE_DEFAULTS = {
    instagram:{fit:"cover",ratio:"4:5 권장"},threads:{fit:"original",ratio:"원본 비율 권장"},facebook:{fit:"cover",ratio:"1.91:1 또는 4:5"},x:{fit:"original",ratio:"원본 비율 권장"},blog:{fit:"original",ratio:"가로 1200px 권장"},website:{fit:"cover",ratio:"16:9 권장"}
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const id = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const today = () => new Date().toISOString().slice(0, 10);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const imageSrc = (image) => typeof image === "string" ? image : image?.src || "";
  const imageFit = (image, fallback = "cover") => typeof image === "object" && image?.fit ? image.fit : fallback;

  const Data = (() => {
    const image = (value, fit = "cover") => {
      if (!value) return null;
      if (typeof value === "string") return {src:value,fit};
      return {src:value.src || "",fit:value.fit || value.fitMode || fit,width:value.width || value.originalWidth || 0,height:value.height || value.originalHeight || 0,originalBytes:value.originalBytes || value.fileSize || 0,optimizedBytes:value.optimizedBytes || 0,altText:value.altText || "",caption:value.caption || "",source:value.source || ""};
    };
    const product = (v = {}) => ({id:v.id || id("product"),name:v.name || "",description:v.description || "",price:v.price || "",image:image(v.image,"cover")});
    const action = (v = {}) => {
      const legacyType = v.type || v.channel || v.icon || "link";
      const type = ACTION_TYPES[legacyType] ? legacyType : "link";
      return {id:v.id || id("action"),type,label:v.label || ACTION_TYPES[type][0],url:v.url || v.href || "",newWindow:v.newWindow !== false,isPrimary:Boolean(v.isPrimary)};
    };
    const post = (v = {}) => ({id:v.id || id("post"),category:CATEGORIES.includes(v.category) ? v.category : "소식",title:v.title || "",body:v.body || "",heroImage:image(v.heroImage || v.image,"contain"),extraImages:(v.extraImages || []).map(x=>image(x,"contain")).filter(Boolean),date:v.date || today(),buttonLabel:v.buttonLabel || "",buttonUrl:v.buttonUrl || "",isPublic:v.isPublic !== false,createdAt:v.createdAt || new Date().toISOString(),updatedAt:v.updatedAt || new Date().toISOString()});
    const promotionImage = (v = {}) => ({id:v.id || id("promo-image"),source:v.source || "upload",src:v.src || "",thumbnail:v.thumbnail || v.src || "",altText:v.altText || "",caption:v.caption || "",order:Number.isFinite(v.order)?v.order:0,isPrimary:Boolean(v.isPrimary),fitMode:["original","cover","contain"].includes(v.fitMode)?v.fitMode:"cover",originalWidth:v.originalWidth || v.width || 0,originalHeight:v.originalHeight || v.height || 0,fileSize:v.fileSize || v.originalBytes || 0,optimizedBytes:v.optimizedBytes || 0});
    const draft = (v = {}) => ({id:v.id || id("draft"),title:v.title || "",date:v.date || new Date().toISOString(),purpose:v.purpose || "기타",channels:v.channels || {},inputs:v.inputs || {},images:(v.images || v.promotionImages || []).map(promotionImage),status:v.status || "작성",websitePostId:v.websitePostId || ""});
    const comment = (v = {}) => ({id:v.id || id("comment"),channel:v.channel || "Instagram",author:v.author || "고객",content:v.content || "",date:v.date || new Date().toISOString(),answered:Boolean(v.answered),aiDraft:v.aiDraft || "관심 가져주셔서 감사합니다. 자세한 내용은 편하게 문의해 주세요!"});
    const blank = () => ({
      schemaVersion:6,
      businessProfile:{industry:"",businessName:"",tagline:"",description:"",heroImage:null,logoImage:null,subImages:[],address:"",serviceArea:"",phone:"",representativeName:"",businessNumber:"",openTime:"",closeTime:"",closesNextDay:false,hoursNote:""},
      products:[],strengths:[],actionLinks:[],websitePosts:[],promotionImages:[],promotionDrafts:[],comments:[],
      settings:{visiblePostCategories:[...CATEGORIES],publishMeta:{title:"",description:"",keywords:"",visibility:"public",slug:"",publishedAt:"",image:"hero"}}
    });
    const migrate = (raw) => {
      const base = blank();
      if (!raw || typeof raw !== "object") return base;
      const profile = raw.businessProfile || {
        industry:raw.industry,businessName:raw.businessName,tagline:raw.tagline,description:raw.description,heroImage:raw.heroImage,
        subImages:raw.subImages,address:raw.address,phone:raw.phone,openTime:raw.openTime,closeTime:raw.closeTime,
        closesNextDay:raw.closesNextDay,hoursNote:raw.hoursNote
      };
      base.businessProfile = {...base.businessProfile,...profile,heroImage:image(profile.heroImage,"cover"),logoImage:image(profile.logoImage,"contain"),subImages:(profile.subImages || []).map(x=>image(x,"contain")).filter(Boolean)};
      base.products = (raw.products || []).map(product);
      base.strengths = (raw.strengths || []).map(x=>typeof x === "string" ? x : x?.text || "").filter(Boolean);
      base.actionLinks = (raw.actionLinks || raw.actions || []).map(action);
      if(base.actionLinks.length&&!base.actionLinks.some(x=>x.isPrimary))base.actionLinks[0].isPrimary=true;
      if(base.actionLinks.filter(x=>x.isPrimary).length>1){let found=false;base.actionLinks.forEach(x=>{if(x.isPrimary&&!found)found=true;else x.isPrimary=false;});}
      base.websitePosts = (raw.websitePosts || []).map(post);
      base.promotionImages = (raw.promotionImages || []).map(promotionImage).sort((a,b)=>a.order-b.order);
      if(base.promotionImages.length&&!base.promotionImages.some(x=>x.isPrimary))base.promotionImages[0].isPrimary=true;
      base.promotionDrafts = (raw.promotionDrafts || []).map(draft);
      base.comments = (raw.comments || []).map(comment);
      base.settings = {...base.settings,...(raw.settings || {})};
      return base;
    };
    const serialize = (value) => ({schemaVersion:6,businessProfile:value.businessProfile,products:value.products,strengths:value.strengths,actionLinks:value.actionLinks,websitePosts:value.websitePosts,promotionImages:value.promotionImages,promotionDrafts:value.promotionDrafts,comments:value.comments,settings:value.settings});
    const load = () => {
      try {
        const params = new URLSearchParams(location.search);
        if (params.has("share")) return migrate(JSON.parse(decodeURIComponent(escape(atob(params.get("share"))))));
      } catch (error) { console.warn("공유 데이터 복원 실패", error); }
      for (const key of [STORAGE_KEY,...LEGACY_KEYS]) {
        try { const raw = localStorage.getItem(key); if (raw) { const migrated=migrate(JSON.parse(raw));if(key!==STORAGE_KEY)try{localStorage.setItem(STORAGE_KEY,JSON.stringify(serialize(migrated)));}catch(error){console.warn("프로모링크 데이터 이전 저장 실패",error);}return migrated; } } catch (error) { console.warn("저장 데이터 복원 실패", error); }
      }
      return blank();
    };
    const save = (value) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(value))); return true; }
      catch (error) { toast("저장 공간이 부족합니다. JSON 백업 후 일부 이미지를 줄여주세요."); return false; }
    };
    return {blank,migrate,serialize,load,save,product,action,post,promotionImage,draft,comment};
  })();

  let state = Data.load();
  let promoOutputs = {};
  let promoVariants = {};
  let editingPostImages = {hero:null,extra:[]};
  let boardFilter = "전체";
  let pendingPublishChannel = "website";
  let activeDraftId = "";
  let lastPromotionWebsitePostId = "";
  let saveTimer;
  let editorStep = 1;

  const toastElement = $("#toast");
  function toast(message) {
    toastElement.textContent = message;
    toastElement.classList.add("show");
    clearTimeout(toastElement._timer);
    toastElement._timer = setTimeout(() => toastElement.classList.remove("show"), 2800);
  }
  function scheduleSave() {
    $("#saveStatus").textContent = "저장 중…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (Data.save(state)) $("#saveStatus").textContent = "자동 저장됨";
    }, 250);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const area = document.createElement("textarea"); area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
        document.body.append(area); area.select(); const ok = document.execCommand("copy"); area.remove(); return ok;
      } catch { return false; }
    }
  }
  function safeUrl(value, type = "link") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (type === "phone" && !raw.startsWith("tel:")) return `tel:${raw.replace(/\s/g,"")}`;
    if (type === "sms" && !raw.startsWith("sms:")) return `sms:${raw.replace(/\s/g,"")}`;
    if (type === "email" && !raw.startsWith("mailto:")) return `mailto:${raw}`;
    if (/^(https?:|tel:|sms:|mailto:)/i.test(raw)) return raw;
    return `https://${raw}`;
  }
  function formatBytes(bytes) { return bytes > 1048576 ? `${(bytes/1048576).toFixed(2)}MB` : `${Math.max(1,Math.round(bytes/1024))}KB`; }
  function estimateBytes() { return new Blob([JSON.stringify(Data.serialize(state))]).size; }

  const Images = (() => {
    const dataUrl = (blob) => new Promise((resolve,reject) => { const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(blob); });
    const bitmap = (file) => new Promise((resolve,reject) => { const img=new Image(); img.onload=()=>{URL.revokeObjectURL(img.src);resolve(img)}; img.onerror=reject; img.src=URL.createObjectURL(file); });
    async function optimize(file, fit = "cover") {
      if (!file?.type?.startsWith("image/")) throw new Error("이미지 파일만 업로드할 수 있습니다.");
      const img = await bitmap(file);
      const scale = Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
      const width = Math.max(1,Math.round(img.naturalWidth*scale)), height = Math.max(1,Math.round(img.naturalHeight*scale));
      const canvas=document.createElement("canvas"); canvas.width=width; canvas.height=height;
      const ctx=canvas.getContext("2d",{alpha:true}); ctx.drawImage(img,0,0,width,height);
      let hasAlpha = file.type === "image/png";
      if (hasAlpha) {
        const sample=ctx.getImageData(0,0,Math.min(width,300),Math.min(height,300)).data; hasAlpha=false;
        for(let i=3;i<sample.length;i+=4){if(sample[i]<250){hasAlpha=true;break;}}
      }
      const type = hasAlpha ? "image/png" : "image/webp";
      let blob = await new Promise(resolve=>canvas.toBlob(resolve,type,hasAlpha?undefined:.82));
      if (!blob) blob = await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.82));
      if(scale===1&&blob.size>=file.size)blob=file;
      const thumbScale=Math.min(1,360/Math.max(width,height)),thumb=document.createElement("canvas");thumb.width=Math.max(1,Math.round(width*thumbScale));thumb.height=Math.max(1,Math.round(height*thumbScale));
      thumb.getContext("2d").drawImage(canvas,0,0,thumb.width,thumb.height);
      let thumbBlob=await new Promise(resolve=>thumb.toBlob(resolve,hasAlpha?"image/png":"image/webp",hasAlpha?undefined:.72));
      if(!thumbBlob)thumbBlob=blob;
      return {src:await dataUrl(blob),thumbnail:await dataUrl(thumbBlob),fit,width,height,originalBytes:file.size,optimizedBytes:blob.size};
    }
    return {optimize};
  })();

  function initializeStaticOptions() {
    $("#industryOptions").innerHTML = Object.keys(INDUSTRIES).map(name=>`<label><input type="radio" name="industry" value="${name}"><span>${name}</span></label>`).join("");
    const categoryOptions = CATEGORIES.map(x=>`<option value="${x}">${x}</option>`).join("");
    $("#postCategory").innerHTML = categoryOptions; $("#publishCategory").innerHTML = categoryOptions;
    $("#postDate").value = today(); $("#publishDate").value = today();
  }
  function populateForm() {
    const p=state.businessProfile, form=$("#businessForm");
    Object.entries(p).forEach(([key,value])=>{
      if(["heroImage","logoImage","subImages"].includes(key)) return;
      const input=form.elements[key]; if(!input) return;
      if(input.type==="checkbox") input.checked=Boolean(value); else input.value=value || "";
    });
    $$('input[name="industry"]').forEach(x=>x.checked=x.value===p.industry);
    $("#heroImageFit").value=imageFit(p.heroImage,"cover");
  }

  function renderProducts() {
    $("#productFields").innerHTML = state.products.map((p,i)=>`
      <article class="repeat-card" data-product="${i}">
        <header><strong>상품 ${String(i+1).padStart(2,"0")}</strong><div class="card-tools"><button type="button" class="icon-button" data-product-move="up" title="위로">↑</button><button type="button" class="icon-button" data-product-move="down" title="아래로">↓</button><button type="button" class="icon-button danger" data-product-delete title="삭제">×</button></div></header>
        <div class="field-grid two"><label class="field"><span>상품·서비스명</span><input data-product-field="name" value="${escapeHtml(p.name)}"></label><label class="field"><span>가격 또는 안내</span><input data-product-field="price" value="${escapeHtml(p.price)}"></label></div>
        <label class="field"><span>짧은 설명</span><input data-product-field="description" value="${escapeHtml(p.description)}"></label>
        <label class="upload-field"><span>이미지</span><span class="upload-box">＋ <strong>사진 선택</strong></span><input type="file" accept="image/*" data-product-file></label>
        ${imageSrc(p.image)?`<div class="image-control"><img src="${imageSrc(p.image)}" alt=""><select data-product-fit><option value="cover" ${imageFit(p.image)==="cover"?"selected":""}>화면 채우기</option><option value="contain" ${imageFit(p.image)==="contain"?"selected":""}>전체 이미지 보기</option><option value="original" ${imageFit(p.image)==="original"?"selected":""}>원본 비율</option></select><button type="button" data-product-image-remove>이미지 삭제</button></div>`:""}
      </article>`).join("");
  }
  function renderStrengths() {
    $("#strengthFields").innerHTML=state.strengths.map((text,i)=>`<div class="strength-row" data-strength="${i}"><span>${String(i+1).padStart(2,"0")}</span><input value="${escapeHtml(text)}" placeholder="사업의 강점"><button type="button" class="icon-button danger" data-strength-delete>×</button></div>`).join("");
  }
  function renderActions() {
    if(state.actionLinks.length&&!state.actionLinks.some(a=>a.isPrimary))state.actionLinks[0].isPrimary=true;
    const options=Object.entries(ACTION_TYPES).map(([key,[label]])=>`<option value="${key}">${label}</option>`).join("");
    $("#actionFields").innerHTML=state.actionLinks.map((a,i)=>`
      <article class="repeat-card action-editor-card ${a.isPrimary?"is-primary":""}" data-action="${i}">
        <header><strong><span class="brand-icon brand-${escapeHtml(a.type)}">${brandIcon(a.type)}</span> ${a.isPrimary?"대표 버튼":"보조 버튼"} ${String(i+1).padStart(2,"0")}</strong><div class="card-tools"><button type="button" class="icon-button" data-action-move="up" title="위로">↑</button><button type="button" class="icon-button" data-action-move="down" title="아래로">↓</button><button type="button" class="icon-button danger" data-action-delete title="삭제">×</button></div></header>
        <div class="action-type-row"><label class="field"><span>버튼 종류</span><select data-action-field="type">${options.replace(`value="${a.type}"`,`value="${a.type}" selected`)}</select></label><label class="field"><span>버튼명</span><input data-action-field="label" value="${escapeHtml(a.label)}"></label></div>
        <label class="field"><span>URL 또는 전화번호</span><input data-action-field="url" value="${escapeHtml(a.url)}" placeholder="https:// 또는 전화번호"></label>
        <div class="action-card-options"><label class="check"><input type="radio" name="primaryAction" data-action-primary ${a.isPrimary?"checked":""}><span>대표 버튼으로 설정</span></label><label class="check new-window"><input type="checkbox" data-action-field="newWindow" ${a.newWindow?"checked":""}><span>새 창에서 열기</span></label></div>
      </article>`).join("");
    $("#addAction").disabled=state.actionLinks.length>=5;
    $("#addAction").querySelector("small").textContent=`${state.actionLinks.length}/5`;
    renderActionRecommendation();
  }
  function recommendedActionTypes(){
    return ACTION_RECOMMENDATIONS[state.businessProfile.industry] || ACTION_RECOMMENDATIONS["기타"];
  }
  function renderActionRecommendation(){
    const types=recommendedActionTypes(), industry=state.businessProfile.industry;
    $("#actionRecommendationText").textContent=industry?`${industry} 추천: ${types.map(type=>ACTION_TYPES[type][0]).join(" · ")}`:"업종을 선택하면 고객에게 필요한 버튼을 추천합니다.";
  }
  function renderBusinessImages() {
    const p=state.businessProfile, hero=imageSrc(p.heroImage), logo=imageSrc(p.logoImage);
    $("#heroImageControl").hidden=!hero; $("#heroThumb").src=hero || "";
    $("#logoImageControl").hidden=!logo; $("#logoThumb").src=logo || "";
    $("#heroImageFit").value=imageFit(p.heroImage,"cover");
    $("#subImageList").innerHTML=p.subImages.map((img,i)=>`<div class="image-item" data-sub-image="${i}"><img src="${imageSrc(img)}" alt="서브 이미지 ${i+1}"><select data-sub-fit><option value="contain" ${imageFit(img)==="contain"?"selected":""}>전체 이미지 보기</option><option value="original" ${imageFit(img)==="original"?"selected":""}>원본 비율</option><option value="cover" ${imageFit(img)==="cover"?"selected":""}>화면 채우기</option></select><button type="button" data-sub-delete>삭제</button></div>`).join("");
  }
  function actionButton(a, primary = false) {
    const url=safeUrl(a.url,a.type); if(!url) return "";
    const target=a.newWindow && !/^(tel:|sms:|mailto:)/.test(url)?' target="_blank" rel="noopener"':"";
    const hint=ACTION_HINTS[a.type] || "바로 연결";
    return `<a class="action-button channel-${escapeHtml(a.type)}${primary?" is-primary":""}" data-action-type="${escapeHtml(a.type)}" href="${escapeHtml(url)}"${target}><span class="brand-icon brand-${escapeHtml(a.type)}">${brandIcon(a.type)}</span><span class="action-copy"><strong>${escapeHtml(a.label)}</strong><small>${escapeHtml(hint)}</small></span><span class="action-arrow" aria-hidden="true">↗</span></a>`;
  }
  function formatHours() {
    const p=state.businessProfile; if(!p.openTime && !p.closeTime && !p.hoursNote) return "";
    let line=[p.openTime,p.closeTime].filter(Boolean).join(" ~ ");
    if(p.closeTime && p.closesNextDay) line=line.replace(p.closeTime,`다음날 ${p.closeTime}`);
    return [line,p.hoursNote].filter(Boolean).join(" · ");
  }
  function publicPosts() {
    return state.websitePosts.filter(p=>p.isPublic && state.settings.visiblePostCategories.includes(p.category)).sort((a,b)=>`${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
  }
  function postCard(post) {
    const image=imageSrc(post.heroImage);
    return `<article class="post-card" data-open-post="${post.id}">${image?`<img src="${image}" alt="">`:""}<div class="post-body"><span class="post-meta">${escapeHtml(post.category)} · ${escapeHtml(post.date)}</span><h4>${escapeHtml(post.title)}</h4><p>${escapeHtml(post.body.slice(0,80))}${post.body.length>80?"…":""}</p></div></article>`;
  }
  function renderPreview() {
    const p=state.businessProfile, hero=imageSrc(p.heroImage), heroEl=$("#previewHeroImage");
    heroEl.classList.toggle("placeholder",!hero); heroEl.style.backgroundImage=hero?`url("${hero}")`:""; heroEl.style.backgroundSize=imageFit(p.heroImage)==="original"?"auto":imageFit(p.heroImage);
    $("#previewIndustry").textContent=p.industry || "업종을 선택해 주세요";
    $("#previewName").textContent=p.businessName || "상호명을 입력해 주세요";
    $("#previewTagline").textContent=p.tagline || INDUSTRIES[p.industry] || "사업의 매력을 한 문장으로 소개해 보세요.";
    $("#previewDescription").textContent=p.description || "사업 소개를 입력하면 고객에게 전할 이야기가 여기에 표시됩니다.";
    $("#previewFooterName").textContent=p.businessName || "프로모링크";
    $("#previewFooterTagline").textContent=p.tagline || INDUSTRIES[p.industry] || "당신의 사업을 더 잘 알리는 공간";
    const initial=(p.businessName || "N").trim().charAt(0).toUpperCase();
    const logo=imageSrc(p.logoImage);
    $("#previewFooterLogo").innerHTML=`<span class="footer-logo-mark">${logo?`<img src="${logo}" alt="${escapeHtml(p.businessName||"업체")} 로고">`:escapeHtml(initial)}</span>`;
    $("#publicLogoMark").innerHTML=logo?`<img src="${logo}" alt="">`:escapeHtml(initial);
    $("#publicBrandName").textContent=p.businessName || "프로모링크";
    const validProducts=state.products.filter(x=>x.name||x.description||x.price||imageSrc(x.image));
    $("#previewProductsSection").hidden=!validProducts.length;
    $("#previewProductCards").innerHTML=validProducts.map(x=>`<article class="product-card">${imageSrc(x.image)?`<div class="product-image fit-${imageFit(x.image)}"><img src="${imageSrc(x.image)}" alt="${escapeHtml(x.name)}"></div>`:""}<div class="product-body"><h4>${escapeHtml(x.name||"상품·서비스")}</h4><p>${escapeHtml(x.description)}</p>${x.price?`<strong>${escapeHtml(x.price)}</strong>`:""}</div></article>`).join("");
    $("#previewStrengthsSection").hidden=!state.strengths.length;
    $("#previewStrengths").innerHTML=state.strengths.filter(Boolean).map((x,i)=>`<div class="strength-item"><span>${String(i+1).padStart(2,"0")}</span><p>${escapeHtml(x)}</p></div>`).join("");
    $("#previewGallery").hidden=!p.subImages.length;
    $("#previewGallery").innerHTML=p.subImages.map(x=>`<figure class="fit-${imageFit(x,"contain")}"><img src="${imageSrc(x)}" alt="사업 공간 이미지"></figure>`).join("");
    const info=[["주소",p.address],["영업시간",formatHours()],["전화",p.phone]].filter(x=>x[1]);
    $("#previewInfoSection").hidden=!info.length; $("#previewInfo").innerHTML=info.map(([k,v])=>`<div class="info-row"><strong>${k}</strong><span>${escapeHtml(v)}</span></div>`).join("");
    const actions=state.actionLinks.filter(x=>x.label&&x.url).slice(0,5);
    const primary=actions.find(x=>x.isPrimary)||actions[0];
    const ordered=primary?[primary,...actions.filter(x=>x!==primary)]:actions;
    $("#previewCtaSection").hidden=!ordered.length;
    $("#previewCtas").innerHTML=ordered.map((item,index)=>actionButton(item,index===0)).join("");
    $("#actionCountBadge").textContent=`${ordered.length}개의 연결`;
    $("#previewFooterActions").innerHTML="";
    $("#mobileContact").hidden=true; $("#mobileContact").innerHTML="";
    const posts=publicPosts(); $("#previewNewsSection").hidden=!posts.length; $("#previewPostCards").innerHTML=posts.slice(0,3).map(postCard).join("");
    const footerDetails=[["ADDRESS",p.address||p.serviceArea],["PHONE",p.phone],["OPENING HOURS",formatHours()]].filter(x=>x[1]);
    $("#previewFooterDetails").innerHTML=footerDetails.map(([label,value])=>`<div class="footer-detail"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
    $("#previewBusinessInfo").textContent=[p.representativeName&&`대표 ${p.representativeName}`,p.businessNumber&&`사업자등록번호 ${p.businessNumber}`].filter(Boolean).join(" · ");
    $("#previewCopyright").textContent=`© ${new Date().getFullYear()} ${p.businessName||"프로모링크"}. All rights reserved.`;
    $("#finalBusinessName").textContent=p.businessName?`${p.businessName} 고객 페이지`:"내 사업 페이지";
    renderProgress();
  }
  function renderProgress() {
    const p=state.businessProfile, checks=[p.industry,p.businessName,p.tagline,p.description,imageSrc(p.heroImage),state.products.length,state.strengths.length,p.address||p.phone,state.actionLinks.length];
    const value=Math.round(checks.filter(Boolean).length/checks.length*100);
    $("#progressPercent").textContent=`${value}% 완료`; $("#progressBar").style.width=`${value}%`;
    $("#progressHint").textContent=value===100?"고객에게 보여줄 준비가 끝났습니다.":value>=55?"상품과 연결 버튼을 더하면 완성도가 높아집니다.":"업종과 상호명부터 천천히 입력해 보세요.";
  }
  function renderAll() { populateForm(); renderProducts(); renderStrengths(); renderActions(); renderBusinessImages(); renderPreview(); renderPosts(); renderArchive(); renderComments(); refreshPhotoOptions(); refreshPromotionSources(); renderPromotionImages(); renderPromoResults(); }

  $("#businessForm").addEventListener("input",(event)=>{
    const t=event.target;
    if(t.name && Object.hasOwn(state.businessProfile,t.name)) {
      const oldIndustry=state.businessProfile.industry;
      state.businessProfile[t.name]=t.type==="checkbox"?t.checked:t.value;
      if(t.name==="industry" && (!state.businessProfile.tagline || state.businessProfile.tagline===INDUSTRIES[oldIndustry])) {
        state.businessProfile.tagline=INDUSTRIES[t.value]; $("#businessForm").elements.tagline.value=state.businessProfile.tagline;
      }
      if(t.name==="industry")renderActionRecommendation();
      scheduleSave(); renderPreview();
    }
    const product=t.closest("[data-product]"); if(product && t.dataset.productField){state.products[+product.dataset.product][t.dataset.productField]=t.value;scheduleSave();renderPreview();}
    const strength=t.closest("[data-strength]"); if(strength && t.matches("input")){state.strengths[+strength.dataset.strength]=t.value;scheduleSave();renderPreview();}
    const action=t.closest("[data-action]"); if(action && t.dataset.actionField){
      const item=state.actionLinks[+action.dataset.action],field=t.dataset.actionField,oldType=item.type;
      item[field]=t.type==="checkbox"?t.checked:t.value;
      if(field==="type"){if(!item.label||item.label===ACTION_TYPES[oldType]?.[0])item.label=ACTION_TYPES[item.type][0];renderActions();}
      scheduleSave();renderPreview();
    }
  });
  $("#businessForm").addEventListener("change",(event)=>{
    const t=event.target;
    const product=t.closest("[data-product]"); if(product&&t.matches("[data-product-fit]")){state.products[+product.dataset.product].image.fit=t.value;scheduleSave();renderPreview();}
    const sub=t.closest("[data-sub-image]"); if(sub&&t.matches("[data-sub-fit]")){state.businessProfile.subImages[+sub.dataset.subImage].fit=t.value;scheduleSave();renderPreview();}
  });
  $("#businessForm").addEventListener("click",(event)=>{
    const t=event.target, product=t.closest("[data-product]"), strength=t.closest("[data-strength]"), action=t.closest("[data-action]");
    if(t.closest("[data-product-delete]")){state.products.splice(+product.dataset.product,1);renderProducts();scheduleSave();renderPreview();}
    if(t.closest("[data-product-move]")){const i=+product.dataset.product,d=t.closest("[data-product-move]").dataset.productMove==="up"?-1:1,j=i+d;if(j>=0&&j<state.products.length){[state.products[i],state.products[j]]=[state.products[j],state.products[i]];renderProducts();scheduleSave();renderPreview();}}
    if(t.closest("[data-product-image-remove]")){state.products[+product.dataset.product].image=null;renderProducts();scheduleSave();renderPreview();}
    if(t.closest("[data-strength-delete]")){state.strengths.splice(+strength.dataset.strength,1);renderStrengths();scheduleSave();renderPreview();}
    if(t.closest("[data-action-delete]")){state.actionLinks.splice(+action.dataset.action,1);renderActions();scheduleSave();renderPreview();}
    if(t.closest("[data-action-primary]")){state.actionLinks.forEach((item,index)=>item.isPrimary=index===+action.dataset.action);renderActions();scheduleSave();renderPreview();}
    if(t.closest("[data-action-move]")){const i=+action.dataset.action,d=t.closest("[data-action-move]").dataset.actionMove==="up"?-1:1,j=i+d;if(j>=0&&j<state.actionLinks.length){[state.actionLinks[i],state.actionLinks[j]]=[state.actionLinks[j],state.actionLinks[i]];renderActions();scheduleSave();renderPreview();}}
    if(t.closest("[data-sub-delete]")){state.businessProfile.subImages.splice(+t.closest("[data-sub-image]").dataset.subImage,1);renderBusinessImages();scheduleSave();renderPreview();}
    if(t.closest('[data-remove-image="hero"]')){state.businessProfile.heroImage=null;renderBusinessImages();scheduleSave();renderPreview();}
    if(t.closest('[data-remove-image="logo"]')){state.businessProfile.logoImage=null;renderBusinessImages();scheduleSave();renderPreview();}
  });
  $("#heroImageFit").addEventListener("change",e=>{if(state.businessProfile.heroImage)state.businessProfile.heroImage.fit=e.target.value;scheduleSave();renderPreview();});
  async function handleImages(files, fit, callback) {
    const status=$("#imageOptimizationStatus"), results=[];
    for(const file of files){
      try{status.textContent=`${file.name} 최적화 중…`;const result=await Images.optimize(file,fit);results.push(result);status.textContent=`${file.name}: ${formatBytes(file.size)} → ${formatBytes(result.optimizedBytes)}로 최적화했습니다.`;}
      catch(error){toast(error.message||"이미지를 처리하지 못했습니다.");}
    }
    if(results.length) callback(results);
    if(estimateBytes()>4.3*1024*1024) toast("브라우저 저장 한도에 가까워졌습니다. JSON 백업을 권장합니다.");
  }
  $("#heroImageFile").addEventListener("change",e=>handleImages([...e.target.files],"cover",r=>{state.businessProfile.heroImage=r[0];renderBusinessImages();renderPreview();refreshPromotionSources();scheduleSave();e.target.value="";}));
  $("#logoImageFile").addEventListener("change",e=>handleImages([...e.target.files],"contain",r=>{state.businessProfile.logoImage=r[0];renderBusinessImages();renderPreview();scheduleSave();e.target.value="";}));
  $("#subImageFiles").addEventListener("change",e=>handleImages([...e.target.files],"contain",r=>{state.businessProfile.subImages.push(...r);renderBusinessImages();renderPreview();refreshPromotionSources();scheduleSave();e.target.value="";}));
  $("#productFields").addEventListener("change",e=>{if(e.target.matches("[data-product-file]")){const card=e.target.closest("[data-product]"),input=e.target;handleImages([...input.files],"cover",r=>{state.products[+card.dataset.product].image=r[0];renderProducts();renderPreview();refreshPromotionSources();scheduleSave();});}});
  $("#addProduct").onclick=()=>{state.products.push(Data.product());renderProducts();scheduleSave();};
  $("#addStrength").onclick=()=>{state.strengths.push("");renderStrengths();scheduleSave();};
  $("#addAction").onclick=()=>{if(state.actionLinks.length>=5){toast("연결 버튼은 대표 1개와 보조 4개까지 추가할 수 있습니다.");return;}state.actionLinks.push(Data.action({type:"link",isPrimary:state.actionLinks.length===0}));renderActions();scheduleSave();};
  $("#applyActionRecommendation").onclick=()=>{
    if(state.actionLinks.length&&!confirm("현재 연결 버튼을 업종 추천 조합으로 바꿀까요?"))return;
    state.actionLinks=recommendedActionTypes().map((type,index)=>Data.action({type,isPrimary:index===0,newWindow:!["phone","sms","email"].includes(type)}));
    renderActions();renderPreview();scheduleSave();toast("업종에 맞는 연결 버튼 조합을 적용했습니다. 연락처와 URL을 입력해 주세요.");
  };
  $("#strengthSuggestions").onclick=event=>{
    const button=event.target.closest("[data-strength-suggestion]");if(!button)return;
    if(!state.strengths.includes(button.dataset.strengthSuggestion)){state.strengths.push(button.dataset.strengthSuggestion);renderStrengths();renderPreview();scheduleSave();}
  };

  function sampleData() {
    const next=Data.blank(); Object.assign(next.businessProfile,{industry:"여성의류",businessName:"NICE",tagline:"당신의 품격과 가치 상승의 동반자",description:"동대문에서 20년 이상 여성의류를 판매해온 NICE입니다.\n파티드레스, 무대의상, 홀복부터 미디와 롱드레스까지 고객의 체형과 목적에 맞는 스타일을 함께 찾아드립니다.",address:"서울시 중구 동대문패션타운",phone:"02-1234-5678",openTime:"10:30",closeTime:"01:00",closesNextDay:true,hoursNote:"일요일 휴무"});
    next.products=[Data.product({name:"파티드레스",description:"특별한 날을 더욱 돋보이게 만드는 드레스",price:"79,000원부터"}),Data.product({name:"무대의상",description:"공연과 방송에서 시선을 사로잡는 스타일",price:"문의"}),Data.product({name:"맞춤 추천",description:"체형과 용도, 분위기에 맞춘 상품 추천",price:"무료 상담"})];
    next.strengths=["20년 이상의 여성의류 판매 경험","고객 체형과 목적에 맞는 맞춤 추천","매장 방문 피팅 및 택배 상담 가능"];
    next.actionLinks=[Data.action({type:"phone",url:"02-1234-5678",newWindow:false}),Data.action({type:"instagram",url:"https://instagram.com/",newWindow:true})]; return next;
  }
  $("#loadSample").onclick=()=>{if(confirm("현재 사업 정보를 여성의류 매장 NICE 업체 예시로 바꿀까요? 게시물과 홍보글 보관함은 유지됩니다.")){const sample=sampleData();sample.websitePosts=state.websitePosts;sample.promotionImages=state.promotionImages;sample.promotionDrafts=state.promotionDrafts;sample.comments=state.comments;state=sample;renderAll();scheduleSave();toast("NICE 업체 예시를 불러왔습니다.");}};
  $("#resetAll").onclick=()=>{if(confirm("모든 사업정보, 게시물, 홍보글을 초기화할까요? 복구할 수 없습니다.")){state=Data.blank();promoOutputs={};renderAll();scheduleSave();toast("전체 데이터를 초기화했습니다.");}};

  function createDataUrl(mode = "preview") {
    const snapshot=Data.serialize(state);
    const encode=x=>btoa(unescape(encodeURIComponent(JSON.stringify(x))));
    let encoded=encode(snapshot), excluded=false;
    if(encoded.length>480000){
      const slim=clone(snapshot); slim.businessProfile.heroImage=null;slim.businessProfile.logoImage=null;slim.businessProfile.subImages=[];slim.products.forEach(x=>x.image=null);slim.websitePosts.forEach(x=>{x.heroImage=null;x.extraImages=[];});slim.promotionImages=[];slim.promotionDrafts.forEach(draft=>draft.images=[]);encoded=encode(slim);excluded=true;
    }
    if(encoded.length>480000) throw new Error("작성 데이터가 링크에 포함할 수 있는 크기를 넘었습니다.");
    const url=new URL(location.href);url.search="";
    if(mode==="published")url.searchParams.set("page",state.settings.publishMeta.slug);
    url.searchParams.set("share",encoded);url.hash=mode==="published"?"published":"preview";return {url:url.toString(),excluded};
  }
  $("#viewCompletedPage").onclick=()=>{location.hash="preview";};
  $("#backToEditor").onclick=()=>{location.hash="business";};
  $("#saveDraft").onclick=()=>{Data.save(state);toast("현재 작업을 브라우저에 임시저장했습니다.");};

  const INTERVIEW_QUESTIONS = [
    "어떤 사업을 운영하나요?",
    "주요 고객은 누구인가요?",
    "가장 중요한 상품 또는 서비스는 무엇인가요?",
    "고객이 선택해야 하는 이유는 무엇인가요?",
    "고객에게 원하는 행동은 무엇인가요?"
  ];
  let interviewIndex=0,interviewAnswers=["","","","",""];
  function renderInterview(){
    $("#interviewStep").innerHTML=`<label for="interviewAnswer">${interviewIndex+1}. ${INTERVIEW_QUESTIONS[interviewIndex]}</label><textarea id="interviewAnswer" placeholder="편하게 이야기하듯 적어주세요.">${escapeHtml(interviewAnswers[interviewIndex])}</textarea>`;
    $("#interviewCounter").textContent=`${interviewIndex+1} / ${INTERVIEW_QUESTIONS.length}`;
    $("#interviewPrev").disabled=interviewIndex===0;$("#interviewNext").textContent=interviewIndex===INTERVIEW_QUESTIONS.length-1?"입력란에 반영":"다음";
  }
  $("#aiInterview").onclick=()=>{interviewIndex=0;interviewAnswers=["","","","",""];renderInterview();$("#interviewModal").hidden=false;};
  $("#interviewPrev").onclick=()=>{interviewAnswers[interviewIndex]=$("#interviewAnswer").value.trim();interviewIndex--;renderInterview();};
  $("#interviewNext").onclick=()=>{
    interviewAnswers[interviewIndex]=$("#interviewAnswer").value.trim();
    if(!interviewAnswers[interviewIndex]){toast("답변을 입력해 주세요.");return;}
    if(interviewIndex<INTERVIEW_QUESTIONS.length-1){interviewIndex++;renderInterview();return;}
    const p=state.businessProfile,industry=Object.keys(INDUSTRIES).find(x=>interviewAnswers[0].includes(x));
    if(industry)p.industry=industry;
    if(!p.businessName)p.businessName=interviewAnswers[0].replace(industry||"","").trim().slice(0,40)||interviewAnswers[0].slice(0,40);
    p.description=`${interviewAnswers[0]}\n주요 고객은 ${interviewAnswers[1]}입니다.\n${interviewAnswers[3]}`;
    if(!p.tagline)p.tagline=interviewAnswers[3].slice(0,90);
    if(state.products.length)state.products[0].name=interviewAnswers[2];else state.products.push(Data.product({name:interviewAnswers[2]}));
    if(state.strengths.length)state.strengths[0]=interviewAnswers[3];else state.strengths.push(interviewAnswers[3]);
    state.actionLinks.push(Data.action({type:"link",label:interviewAnswers[4].slice(0,30),url:""}));
    $("#interviewModal").hidden=true;renderAll();scheduleSave();toast("인터뷰 답변을 사업정보 입력란에 반영했습니다.");
  };

  function generateQrDataUrl(text){
    const version=5,size=37,dataCodewords=108,eccCount=26,bytes=[...new TextEncoder().encode(text)];
    if(bytes.length>106)throw new Error("QR 코드에 담을 주소가 너무 깁니다.");
    const bits=[];const push=(value,length)=>{for(let i=length-1;i>=0;i--)bits.push((value>>>i)&1);};
    push(4,4);push(bytes.length,8);bytes.forEach(byte=>push(byte,8));
    for(let i=0;i<4&&bits.length<dataCodewords*8;i++)bits.push(0);
    while(bits.length%8)bits.push(0);
    const data=[];for(let i=0;i<bits.length;i+=8)data.push(bits.slice(i,i+8).reduce((a,b)=>(a<<1)|b,0));
    for(let pad=0;data.length<dataCodewords;pad++)data.push(pad%2?0x11:0xec);
    const exp=new Array(512),log=new Array(256);let x=1;
    for(let i=0;i<255;i++){exp[i]=x;log[x]=i;x<<=1;if(x&0x100)x^=0x11d;}for(let i=255;i<512;i++)exp[i]=exp[i-255];
    const mul=(a,b)=>a&&b?exp[log[a]+log[b]]:0;
    let generator=[1];
    for(let i=0;i<eccCount;i++){const next=new Array(generator.length+1).fill(0);generator.forEach((coefficient,j)=>{next[j]^=coefficient;next[j+1]^=mul(coefficient,exp[i]);});generator=next;}
    const message=[...data,...new Array(eccCount).fill(0)];
    for(let i=0;i<data.length;i++){const factor=message[i];if(factor)generator.forEach((coefficient,j)=>message[i+j]^=mul(coefficient,factor));}
    const codewords=[...data,...message.slice(data.length)],stream=[];codewords.forEach(byte=>{for(let i=7;i>=0;i--)stream.push((byte>>>i)&1);});
    const modules=Array.from({length:size},()=>Array(size).fill(null)),reserved=Array.from({length:size},()=>Array(size).fill(false));
    const set=(row,col,value,isReserved=true)=>{if(row>=0&&row<size&&col>=0&&col<size){modules[row][col]=Boolean(value);if(isReserved)reserved[row][col]=true;}};
    const finder=(row,col)=>{for(let r=-1;r<=7;r++)for(let c=-1;c<=7;c++){const inside=r>=0&&r<=6&&c>=0&&c<=6;const dark=inside&&(r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4));set(row+r,col+c,dark);}};
    finder(0,0);finder(0,size-7);finder(size-7,0);
    for(let i=8;i<size-8;i++){set(6,i,i%2===0);set(i,6,i%2===0);}
    for(let r=-2;r<=2;r++)for(let c=-2;c<=2;c++)set(30+r,30+c,Math.max(Math.abs(r),Math.abs(c))!==1);
    for(let i=0;i<9;i++){if(i!==6){set(8,i,false);set(i,8,false);}}for(let i=size-8;i<size;i++){set(8,i,false);set(i,8,false);}set(4*version+9,8,true);
    let bitIndex=0,upward=true;
    for(let col=size-1;col>0;col-=2){if(col===6)col--;for(let offset=0;offset<size;offset++){const row=upward?size-1-offset:offset;for(let c=0;c<2;c++){const currentCol=col-c;if(!reserved[row][currentCol]){const bit=stream[bitIndex++]||0;modules[row][currentCol]=Boolean(bit^(((row+currentCol)&1)===0));}}}upward=!upward;}
    let format=(1<<3)|0,remainder=format;
    for(let i=0;i<10;i++)remainder=(remainder<<1)^(((remainder>>>9)&1)?0x537:0);
    const formatBits=((format<<10)|remainder)^0x5412;
    for(let i=0;i<15;i++){const bit=((formatBits>>>i)&1)!==0;
      if(i<6)set(i,8,bit);else if(i<8)set(i+1,8,bit);else set(size-15+i,8,bit);
      if(i<8)set(8,size-i-1,bit);else if(i<9)set(8,15-i,bit);else set(8,15-i-1,bit);
    }
    set(size-8,8,true);
    const scale=5,quiet=4,canvas=document.createElement("canvas");canvas.width=canvas.height=(size+quiet*2)*scale;
    const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#111";
    modules.forEach((row,r)=>row.forEach((dark,c)=>{if(dark)ctx.fillRect((c+quiet)*scale,(r+quiet)*scale,scale,scale);}));
    return canvas.toDataURL("image/png");
  }
  const slugify=(value)=>{
    const source=String(value||"nice-business").trim(),ascii=source.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,24);
    let hash=2166136261;for(const character of source){hash^=character.charCodeAt(0);hash=Math.imul(hash,16777619);}
    return `${ascii||"nice"}-${(hash>>>0).toString(36)}`;
  };
  function publicPageUrl(slug){
    const url=new URL(location.href);url.search="";url.searchParams.set("page",slug);url.hash="published";return url.toString();
  }
  function publishChecks(){
    const p=state.businessProfile,meta={title:$("#pageTitle").value.trim(),description:$("#pageDescription").value.trim()};
    return [
      ["업체명 입력",Boolean(p.businessName)],["대표 이미지",Boolean(imageSrc(p.heroImage))],["소개 문구",Boolean(p.tagline||p.description)],
      ["연락 수단",Boolean(p.phone||state.actionLinks.some(x=>x.url))],["행동 버튼",Boolean(state.actionLinks.some(x=>x.url))],
      ["주소 또는 서비스 지역",Boolean(p.address||p.serviceArea)],["게시물 1개 이상",state.websitePosts.some(x=>x.isPublic)],
      ["검색 제목과 설명",Boolean(meta.title&&meta.description)]
    ];
  }
  function renderPublishChecklist(){
    const checks=publishChecks(),missing=checks.filter(x=>!x[1]);
    $("#publishChecklist").innerHTML=checks.map(([label,ok])=>`<div class="checklist-item ${ok?"complete":"missing"}"><i>${ok?"✓":"!"}</i><span>${label}</span></div>`).join("");
    $("#publishWarning").textContent=missing.length?`${missing.length}개 항목이 비어 있습니다. 보완을 권장하지만 확인 후 발행할 수 있습니다.`:"모든 필수 권장 항목을 확인했습니다.";
    $("#publishDespiteMissing").closest("label").hidden=!missing.length;
    $("#confirmPagePublish").textContent=missing.length?"누락 확인 후 발행":"발행하기";
  }
  function updatePublicUrlPreview(){
    const slug=slugify($("#pageTitle").value||state.businessProfile.businessName);$("#pageUrlPreview").value=publicPageUrl(slug);
  }
  $("#openPublish").onclick=()=>{
    const p=state.businessProfile,meta=state.settings.publishMeta;
    $("#pageTitle").value=meta.title||`${p.businessName||"내 사업"} | ${p.tagline||"공식 페이지"}`;
    $("#pageDescription").value=meta.description||p.description.slice(0,160);$("#pageKeywords").value=meta.keywords||[p.industry,p.businessName].filter(Boolean).join(", ");
    $("#pageVisibility").value=meta.visibility||"public";$("#pagePublishImage").value=meta.image||"hero";$("#publishDespiteMissing").checked=false;
    updatePublicUrlPreview();renderPublishChecklist();$("#pagePublishModal").hidden=false;
  };
  ["pageTitle","pageDescription"].forEach(name=>$(`#${name}`).addEventListener("input",()=>{updatePublicUrlPreview();renderPublishChecklist();}));
  $("#confirmPagePublish").onclick=()=>{
    const missing=publishChecks().filter(x=>!x[1]);if(missing.length&&!$("#publishDespiteMissing").checked){toast("누락 항목을 확인하거나 체크 후 발행해 주세요.");return;}
    state.settings.publishMeta={title:$("#pageTitle").value.trim(),description:$("#pageDescription").value.trim(),keywords:$("#pageKeywords").value.trim(),visibility:$("#pageVisibility").value,slug:slugify($("#pageTitle").value||state.businessProfile.businessName),publishedAt:new Date().toISOString(),image:$("#pagePublishImage").value};
    Data.save(state);const publishedUrl=publicPageUrl(state.settings.publishMeta.slug);
    try{
      const qr=generateQrDataUrl(publishedUrl);
      $("#pagePublishModal").hidden=true;$("#publishedUrlText").textContent=publishedUrl;$("#openPublishedPage").href=publishedUrl;$("#publishedQr").src=qr;$("#publishCompleteModal").hidden=false;
    }catch(error){toast(error.message||"QR 코드를 만들지 못했습니다.");}
  };
  $("#copyPublishedLink").onclick=async()=>toast(await copyText($("#publishedUrlText").textContent)?"공개 페이지 링크를 복사했습니다.":"링크 복사에 실패했습니다.");
  $("#continueEditing").onclick=()=>{$("#publishCompleteModal").hidden=true;location.hash="business";};
  $("#exportData").onclick=()=>{
    const blob=new Blob([JSON.stringify(Data.serialize(state),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`promolink-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("프로모링크 JSON 백업 파일을 만들었습니다.");
  };
  $("#importData").onclick=()=>$("#importDataFile").click();
  $("#importDataFile").addEventListener("change",async e=>{try{const parsed=JSON.parse(await e.target.files[0].text());if(!confirm("현재 데이터를 불러온 백업으로 교체할까요?"))return;state=Data.migrate(parsed);renderAll();scheduleSave();toast("백업 데이터를 불러왔습니다.");}catch{toast("올바른 프로모링크 JSON 백업 파일이 아닙니다.");}finally{e.target.value="";}});

  function renderPosts() {
    $("#categoryVisibility").innerHTML=CATEGORIES.map(x=>`<label><input type="checkbox" value="${x}" ${state.settings.visiblePostCategories.includes(x)?"checked":""}> ${x}</label>`).join("");
    const posts=[...state.websitePosts].sort((a,b)=>`${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
    $("#postCount").textContent=`${posts.length}개`;
    $("#postManagerList").innerHTML=posts.length?posts.map(p=>`<article class="manager-item"><div><strong>${escapeHtml(p.title)}</strong><p>${p.category} · ${p.date} · ${p.isPublic?"공개":"비공개"}</p></div><div class="item-actions"><button data-post-edit="${p.id}">수정</button><button data-post-open="${p.id}">보기</button><button data-post-delete="${p.id}">삭제</button></div></article>`).join(""):`<p class="notice">저장된 게시물이 없습니다.</p>`;
    renderBoard();refreshPromotionSources();
  }
  function renderBoard() {
    $("#boardTabs").innerHTML=["전체",...state.settings.visiblePostCategories].map(x=>`<button type="button" class="${boardFilter===x?"active":""}" data-board-filter="${x}">${x}</button>`).join("");
    const posts=publicPosts().filter(x=>boardFilter==="전체"||x.category===boardFilter);
    $("#boardList").innerHTML=posts.length?posts.map(postCard).join(""):`<p class="notice">표시할 소식이 없습니다.</p>`;
  }
  $("#categoryVisibility").addEventListener("change",e=>{state.settings.visiblePostCategories=$$("#categoryVisibility input:checked").map(x=>x.value);scheduleSave();renderPreview();renderPosts();});
  function resetPostForm() {
    $("#postForm").reset();$("#postId").value="";$("#postDate").value=today();$("#postPublic").checked=true;editingPostImages={hero:null,extra:[]};$("#postFormTitle").textContent="새 게시물 작성";renderPostImages();
  }
  function renderPostImages() {
    const images=[...(editingPostImages.hero?[{...editingPostImages.hero,label:"대표"}]:[]),...editingPostImages.extra.map(x=>({...x,label:"추가"}))];
    $("#postImagePreview").innerHTML=images.map((x,i)=>`<div class="image-item"><img src="${imageSrc(x)}" alt=""><span>${x.label} 이미지</span><button type="button" data-edit-image-remove="${i}">삭제</button></div>`).join("");
  }
  $("#postHeroFile").addEventListener("change",e=>handleImages([...e.target.files],"contain",r=>{editingPostImages.hero=r[0];renderPostImages();e.target.value="";}));
  $("#postExtraFiles").addEventListener("change",e=>handleImages([...e.target.files],"contain",r=>{editingPostImages.extra.push(...r);renderPostImages();e.target.value="";}));
  $("#postImagePreview").onclick=e=>{const b=e.target.closest("[data-edit-image-remove]");if(!b)return;const i=+b.dataset.editImageRemove;if(editingPostImages.hero){if(i===0)editingPostImages.hero=null;else editingPostImages.extra.splice(i-1,1);}else editingPostImages.extra.splice(i,1);renderPostImages();};
  $("#postForm").addEventListener("submit",e=>{
    e.preventDefault();const existing=state.websitePosts.find(x=>x.id===$("#postId").value);
    const values={id:existing?.id,category:$("#postCategory").value,title:$("#postTitle").value.trim(),body:$("#postBody").value.trim(),heroImage:editingPostImages.hero,extraImages:editingPostImages.extra,date:$("#postDate").value||today(),buttonLabel:$("#postButtonLabel").value.trim(),buttonUrl:$("#postButtonUrl").value.trim(),isPublic:$("#postPublic").checked,createdAt:existing?.createdAt};
    if(!values.title){toast("게시물 제목을 입력해 주세요.");return;}
    const post=Data.post(values);if(existing)state.websitePosts[state.websitePosts.indexOf(existing)]=post;else state.websitePosts.push(post);
    scheduleSave();resetPostForm();renderPosts();renderPreview();toast(existing?"게시물을 수정했습니다.":"게시물을 저장하고 홈페이지에 반영했습니다.");
  });
  $("#cancelPostEdit").onclick=resetPostForm;
  $("#postManagerList").onclick=e=>{
    const edit=e.target.closest("[data-post-edit]"),del=e.target.closest("[data-post-delete]"),open=e.target.closest("[data-post-open]");
    if(edit){const p=state.websitePosts.find(x=>x.id===edit.dataset.postEdit);$("#postId").value=p.id;$("#postCategory").value=p.category;$("#postDate").value=p.date;$("#postTitle").value=p.title;$("#postBody").value=p.body;$("#postButtonLabel").value=p.buttonLabel;$("#postButtonUrl").value=p.buttonUrl;$("#postPublic").checked=p.isPublic;editingPostImages={hero:clone(p.heroImage),extra:clone(p.extraImages)};$("#postFormTitle").textContent="게시물 수정";renderPostImages();scrollTo({top:$("#postForm").getBoundingClientRect().top+scrollY-100,behavior:"smooth"});}
    if(del&&confirm("이 게시물을 삭제할까요?")){state.websitePosts=state.websitePosts.filter(x=>x.id!==del.dataset.postDelete);scheduleSave();renderPosts();renderPreview();toast("게시물을 삭제했습니다.");}
    if(open)openPost(open.dataset.postOpen);
  };
  $("#loadSamplePosts").onclick=()=>{
    const samples=[["신상품","여름 신상 드레스가 입고되었습니다","가볍고 우아한 실루엣의 여름 드레스를 매장에서 만나보세요."],["이벤트","이번 주 방문 피팅 상담 안내","방문 전 전화로 시간을 알려주시면 더 편안하게 상담해 드립니다."],["공지사항","영업시간 안내","매장 방문 전 영업시간을 확인해 주세요."]];
    state.websitePosts.push(...samples.map(x=>Data.post({category:x[0],title:x[1],body:x[2],date:today(),isPublic:true})));scheduleSave();renderPosts();renderPreview();toast("예시 게시물 3개를 불러왔습니다.");
  };
  function openPost(postId) {
    const p=state.websitePosts.find(x=>x.id===postId);if(!p)return;
    $("#postDetail").innerHTML=`<p class="post-meta">${p.category} · ${p.date}</p><h2>${escapeHtml(p.title)}</h2>${imageSrc(p.heroImage)?`<figure><img class="post-detail-image" src="${imageSrc(p.heroImage)}" alt="${escapeHtml(p.heroImage.altText||"")}">${p.heroImage.caption?`<figcaption>${escapeHtml(p.heroImage.caption)}</figcaption>`:""}</figure>`:""}<p class="preline">${escapeHtml(p.body)}</p>${p.extraImages.length?`<div class="post-detail-gallery">${p.extraImages.map(x=>`<figure><img src="${imageSrc(x)}" alt="${escapeHtml(x.altText||"")}">${x.caption?`<figcaption>${escapeHtml(x.caption)}</figcaption>`:""}</figure>`).join("")}</div>`:""}${p.buttonLabel&&p.buttonUrl?`<p><a class="button" href="${safeUrl(p.buttonUrl)}" target="_blank" rel="noopener">${escapeHtml(p.buttonLabel)}</a></p>`:""}`;
    $("#postDetailModal").hidden=false;
  }
  $("#openBoard").onclick=()=>{$("#boardModal").hidden=false;renderBoard();};
  $("#boardTabs").onclick=e=>{const b=e.target.closest("[data-board-filter]");if(b){boardFilter=b.dataset.boardFilter;renderBoard();}};
  document.addEventListener("click",e=>{const post=e.target.closest("[data-open-post]");if(post)openPost(post.dataset.openPost);const close=e.target.closest("[data-close-modal]");if(close)$(`#${close.dataset.closeModal}`).hidden=true;});

  function normalizePromotionImages(){
    state.promotionImages.sort((a,b)=>a.order-b.order).forEach((image,index)=>image.order=index);
    if(state.promotionImages.length&&!state.promotionImages.some(image=>image.isPrimary))state.promotionImages[0].isPrimary=true;
    if(state.promotionImages.filter(image=>image.isPrimary).length>1){
      let found=false;state.promotionImages.forEach(image=>{if(image.isPrimary&&!found)found=true;else image.isPrimary=false;});
    }
  }
  function renderPromotionImages(){
    normalizePromotionImages();
    const bytes=state.promotionImages.reduce((sum,image)=>sum+(image.optimizedBytes||Math.round((image.src?.length||0)*.75))+(image.thumbnail?Math.round(image.thumbnail.length*.75):0),0);
    $("#promotionImageCapacity").textContent=`${state.promotionImages.length}장 · 약 ${bytes?formatBytes(bytes):"0KB"} 사용`;
    $("#promotionImageList").innerHTML=state.promotionImages.length?state.promotionImages.map((image,index)=>`
      <article class="promotion-image-item" data-promotion-image="${image.id}">
        <div class="promotion-image-thumb"><img src="${image.thumbnail||image.src}" alt="${escapeHtml(image.altText||`홍보사진 ${index+1}`)}"><span>${index+1}</span>${image.isPrimary?'<strong>대표</strong>':""}</div>
        <div class="promotion-image-fields">
          <div class="field-grid two"><label class="field"><span>대체 설명</span><input data-promotion-field="altText" value="${escapeHtml(image.altText)}" placeholder="사진에 보이는 내용을 설명"></label><label class="field"><span>사진 문구</span><input data-promotion-field="caption" value="${escapeHtml(image.caption)}" placeholder="게시물에 함께 전할 설명"></label></div>
          <label class="field"><span>표시 방식</span><select data-promotion-field="fitMode"><option value="original" ${image.fitMode==="original"?"selected":""}>원본 비율</option><option value="cover" ${image.fitMode==="cover"?"selected":""}>화면 채우기 cover</option><option value="contain" ${image.fitMode==="contain"?"selected":""}>전체 보기 contain</option></select></label>
          <small>${escapeHtml(image.source)} · ${image.originalWidth}×${image.originalHeight} · ${formatBytes(image.fileSize)} → ${formatBytes(image.optimizedBytes||image.fileSize)}</small>
        </div>
        <div class="promotion-image-actions"><button type="button" data-promotion-primary>대표 지정</button><button type="button" data-promotion-move="up">↑</button><button type="button" data-promotion-move="down">↓</button><button type="button" data-promotion-delete>삭제</button></div>
      </article>`).join(""):`<p class="notice">선택한 홍보사진이 없습니다.</p>`;
    refreshPhotoOptions();
  }
  function promotionSourceEntries(){
    const entries=[];
    if(imageSrc(state.businessProfile.heroImage))entries.push(["business:hero","사업 페이지 · 대표 이미지",state.businessProfile.heroImage]);
    state.businessProfile.subImages.forEach((image,index)=>entries.push([`business:sub:${index}`,`사업 페이지 · 추가 이미지 ${index+1}`,image]));
    state.products.forEach((product,index)=>{if(imageSrc(product.image))entries.push([`product:${index}`,`상품 · ${product.name||index+1}`,product.image]);});
    state.websitePosts.forEach(post=>{if(imageSrc(post.heroImage))entries.push([`post:${post.id}:hero`,`게시물 · ${post.title} 대표`,post.heroImage]);post.extraImages.forEach((image,index)=>entries.push([`post:${post.id}:extra:${index}`,`게시물 · ${post.title} 추가 ${index+1}`,image]));});
    return entries;
  }
  function refreshPromotionSources(){
    const entries=promotionSourceEntries();
    $("#promotionImageSource").innerHTML=`<option value="">이미지를 선택하세요</option>${entries.map(([value,label])=>`<option value="${value}">${escapeHtml(label)}</option>`).join("")}`;
  }
  function addPromotionImageFromSource(value){
    const entry=promotionSourceEntries().find(item=>item[0]===value);if(!entry)return false;
    const sourceImage=entry[2],item=Data.promotionImage({source:entry[1],src:imageSrc(sourceImage),thumbnail:sourceImage.thumbnail||imageSrc(sourceImage),fitMode:imageFit(sourceImage,"cover"),originalWidth:sourceImage.width||0,originalHeight:sourceImage.height||0,fileSize:sourceImage.originalBytes||sourceImage.optimizedBytes||0,optimizedBytes:sourceImage.optimizedBytes||0,order:state.promotionImages.length,isPrimary:state.promotionImages.length===0});
    state.promotionImages.push(item);renderPromotionImages();renderPromoResults();scheduleSave();return true;
  }
  $("#addPromotionSource").onclick=()=>{const value=$("#promotionImageSource").value;if(!value){toast("가져올 기존 이미지를 선택해 주세요.");return;}if(addPromotionImageFromSource(value))toast("홍보사진에 추가했습니다.");};
  $("#promotionImageFiles").addEventListener("change",async event=>{
    const files=[...event.target.files],status=$("#promotionImageStatus");
    for(const file of files){
      try{
        status.textContent=`${file.name} 압축 중…`;const optimized=await Images.optimize(file,"cover");
        const projected=estimateBytes()+optimized.src.length+optimized.thumbnail.length;
        if(projected>4.7*1024*1024){toast("저장 가능 용량을 초과할 수 있어 이 이미지는 추가하지 않았습니다.");continue;}
        state.promotionImages.push(Data.promotionImage({source:"새 이미지 업로드",src:optimized.src,thumbnail:optimized.thumbnail,fitMode:"cover",originalWidth:optimized.width,originalHeight:optimized.height,fileSize:optimized.originalBytes,optimizedBytes:optimized.optimizedBytes,order:state.promotionImages.length,isPrimary:state.promotionImages.length===0}));
        status.textContent=`${file.name}: ${formatBytes(file.size)} → ${formatBytes(optimized.optimizedBytes)}로 압축했습니다.`;
      }catch(error){status.textContent=`${file.name} 업로드 실패: ${error.message||"이미지를 처리하지 못했습니다."}`;}
    }
    event.target.value="";renderPromotionImages();renderPromoResults();scheduleSave();
    if(estimateBytes()>4.3*1024*1024)toast("브라우저 저장 용량에 가까워졌습니다. JSON 백업을 권장합니다.");
  });
  $("#promotionImageList").addEventListener("input",event=>{
    const card=event.target.closest("[data-promotion-image]"),image=state.promotionImages.find(item=>item.id===card?.dataset.promotionImage),field=event.target.dataset.promotionField;
    if(!image||!field)return;image[field]=event.target.value;scheduleSave();renderPromoResults();
  });
  $("#promotionImageList").addEventListener("click",event=>{
    const card=event.target.closest("[data-promotion-image]"),index=state.promotionImages.findIndex(item=>item.id===card?.dataset.promotionImage);if(index<0)return;
    if(event.target.closest("[data-promotion-primary]"))state.promotionImages.forEach((image,i)=>image.isPrimary=i===index);
    if(event.target.closest("[data-promotion-delete]"))state.promotionImages.splice(index,1);
    const move=event.target.closest("[data-promotion-move]");if(move){const next=move.dataset.promotionMove==="up"?index-1:index+1;if(next>=0&&next<state.promotionImages.length){[state.promotionImages[index],state.promotionImages[next]]=[state.promotionImages[next],state.promotionImages[index]];state.promotionImages.forEach((image,i)=>image.order=i);}}
    normalizePromotionImages();renderPromotionImages();renderPromoResults();scheduleSave();
  });

  function promoInputs() {
    return {purpose:$("#promoPurpose").value,hook:$("#promoHook").value,audience:$("#promoAudience").value.trim(),core:$("#promoCore").value.trim(),product:$("#promoProduct").value.trim(),benefit:$("#promoBenefit").value.trim(),cta:$("#promoCta").value.trim(),photo:$("#promoPhoto").value,tone:$('input[name="promoTone"]:checked').value};
  }
  function makePromo(channel,inputs,variant=0) {
    const b=state.businessProfile,name=b.businessName||"우리 매장",subject=inputs.product||inputs.purpose,core=inputs.core||`${name}의 ${subject} 소식을 전합니다.`,benefit=inputs.benefit||state.strengths[0]||"정성을 담은 서비스",cta=inputs.cta||"궁금한 점은 편하게 문의해 주세요.",audience=inputs.audience?`${inputs.audience}께 `:"";
    const hookSets={
      "질문형":[`${subject}, 기다리셨나요?`,`${subject}을 고를 때 무엇이 가장 중요하세요?`],
      "공감형":[`마음에 드는 선택을 찾는 일이 생각보다 어렵죠.`,`고객님의 고민을 잘 알기에 ${subject} 소식을 준비했습니다.`],
      "혜택형":[`${benefit}, 지금 확인해 보세요.`,`더 좋은 선택을 위한 ${subject} 소식입니다.`],
      "비교형":[`비슷해 보여도 경험은 다릅니다.`,`고르기 전에 꼭 비교해 보세요.`],
      "후기형":[`고객들이 가장 많이 이야기한 이유가 있습니다.`,`직접 경험한 고객의 선택에는 이유가 있습니다.`],
      "한정형":[`지금만 만날 수 있는 ${subject} 소식`,`놓치기 전에 확인해 주세요.`],
      "이야기형":[`오늘 ${name}에서 전하는 작은 이야기`,`이 ${subject}을 준비하기까지의 이야기입니다.`]
    };
    const hooks=hookSets[inputs.hook]||hookSets["질문형"],hook=hooks[variant%hooks.length];
    if(channel==="instagram")return `${hook}\n\n${audience}${core}\n\n✓ ${benefit}\n${cta}\n\n#${name.replace(/\s/g,"")} #${inputs.purpose.replace(/\s/g,"")} #소상공인 #동네가게`;
    if(channel==="threads")return `${hook}\n${core}\n${benefit}이 가장 큰 장점이에요.\n여러분은 어떤 점이 가장 궁금하신가요?`;
    if(channel==="facebook")return `${name} ${inputs.purpose} 안내\n\n${core}\n\n${benefit}을 바탕으로 정성껏 준비했습니다.\n${formatHours()?`이용 안내: ${formatHours()}\n`:""}${b.address?`위치: ${b.address}\n`:""}${cta}`;
    if(channel==="x")return variant%2?`1/2 ${hook} ${core}\n\n2/2 ${benefit}. ${cta}`:`${hook} ${core} ${cta} #${inputs.purpose.replace(/\s/g,"")}`;
    if(channel==="blog")return `제목 후보\n1. ${name} ${subject}, 지금 만나보세요\n2. ${benefit}이 특별한 ${name}\n3. ${inputs.purpose} 소식｜${name}\n\n[새로운 소식]\n${core}\n\n[이런 점이 특별합니다]\n${benefit}\n\n[이용 안내]\n${formatHours()||"자세한 이용 시간은 문의해 주세요."}${b.address?`\n${b.address}`:""}\n\n${cta}\n\n검색 태그: ${name}, ${subject}, ${inputs.purpose}`;
    return `${name} ${inputs.purpose} 안내\n\n요약\n${core}\n\n본문\n${audience}${subject}을 소개합니다. ${benefit}을 바탕으로 준비했습니다.\n\n${cta}`;
  }
  function renderPromoResults() {
    $("#promoResults").innerHTML=Object.entries(CHANNELS).map(([key,ch])=>{
      const recommendation=CHANNEL_IMAGE_DEFAULTS[key],images=state.promotionImages.slice().sort((a,b)=>a.order-b.order);
      const media=images.length?`<div class="channel-image-preview fit-${recommendation.fit}">${images.slice(0,4).map((image,index)=>`<figure><img src="${image.thumbnail||image.src}" alt="${escapeHtml(image.altText||`홍보사진 ${index+1}`)}"><span>${index+1}</span>${recommendation.fit==="cover"?'<i aria-hidden="true"></i>':""}</figure>`).join("")}</div>`:`<div class="channel-image-empty">홍보사진을 추가하면 채널별 미리보기가 표시됩니다.</div>`;
      return `<article class="promo-card" data-promo="${key}"><header><div><span class="post-meta">${ch.name}</span><h3>${key==="website"?"홈페이지 게시글":"채널용 문구"}</h3></div><small>${recommendation.ratio} · ${recommendation.fit}</small></header>${media}<p class="channel-preview-caption">${images.length?`${images.length}장 사용 · ${recommendation.fit==="cover"?"점선 안쪽이 안전 영역입니다.":"원본 전체를 중심으로 표시합니다."}`:"사진 없음"}</p><div class="promo-content" data-promo-content>${escapeHtml(promoOutputs[key]||"홍보글을 생성하면 여기에 표시됩니다.")}</div><div class="promo-actions"><button data-promo-package>사진 포함 복사 안내</button><button data-promo-copy>글 복사</button><button data-promo-download>이미지 저장</button><button data-promo-regenerate>다시 생성</button><button data-promo-edit>직접 수정</button>${ch.url?`<button data-promo-open>채널 열기</button>`:""}<button data-promo-publish>홈페이지 게시판 등록</button></div></article>`;
    }).join("");
  }
  $("#generatePromo").onclick=()=>{
    const inputs=promoInputs();if(!inputs.core&&!inputs.product){toast("핵심 내용이나 상품·서비스를 입력해 주세요.");return;}
    activeDraftId="";lastPromotionWebsitePostId="";
    Object.keys(CHANNELS).forEach(k=>{promoVariants[k]=0;promoOutputs[k]=makePromo(k,inputs,0);});renderPromoResults();$("#generationStatus").textContent="6개 채널 문구를 만들었습니다.";toast("채널별 홍보글을 만들었습니다.");
  };
  $("#promoResults").addEventListener("click",async e=>{
    const card=e.target.closest("[data-promo]");if(!card)return;const key=card.dataset.promo,content=$("[data-promo-content]",card);
    if(e.target.closest("[data-promo-regenerate]")){promoVariants[key]=(promoVariants[key]||0)+1;promoOutputs[key]=makePromo(key,promoInputs(),promoVariants[key]);renderPromoResults();}
    if(e.target.closest("[data-promo-edit]")){const editing=content.contentEditable==="true";if(editing){promoOutputs[key]=content.innerText.trim();content.contentEditable="false";e.target.textContent="직접 수정";toast("수정 내용을 반영했습니다.");}else{content.contentEditable="true";content.focus();e.target.textContent="수정 완료";}}
    if(e.target.closest("[data-promo-copy]")){promoOutputs[key]=content.innerText.trim();toast(await copyText(promoOutputs[key])?"홍보글을 복사했습니다.":"복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");}
    if(e.target.closest("[data-promo-package]")){promoOutputs[key]=content.innerText.trim();const ok=await copyText(promoOutputs[key]);toast(ok?(state.promotionImages.length?"문구를 복사했습니다. 이미지를 저장해 사진을 첨부한 뒤 복사된 문구를 붙여넣어 주세요.":"문구를 복사했습니다. 홍보사진을 추가하면 사진도 함께 준비할 수 있습니다."):"문구 복사에 실패했습니다.");}
    if(e.target.closest("[data-promo-download]")){
      if(!state.promotionImages.length){toast("저장할 홍보사진이 없습니다.");return;}
      state.promotionImages.slice().sort((a,b)=>a.order-b.order).forEach((image,index)=>{const link=document.createElement("a");link.href=image.src;link.download=`promolink-${key}-${String(index+1).padStart(2,"0")}.${image.src.startsWith("data:image/png")?"png":"webp"}`;document.body.append(link);link.click();link.remove();});
      toast(`${state.promotionImages.length}개 이미지를 저장했습니다. 브라우저가 여러 다운로드를 묻는 경우 허용해 주세요.`);
    }
    if(e.target.closest("[data-promo-publish]")){promoOutputs[key]=content.innerText.trim();openPublishModal(key);}
    if(e.target.closest("[data-promo-open]")){promoOutputs[key]=content.innerText.trim();const ok=await copyText(promoOutputs[key]);window.open(CHANNELS[key].url,"_blank","noopener");toast(ok?"홍보글을 복사했습니다. 열린 채널의 작성 화면에 붙여넣어 주세요.":"채널을 열었습니다. 복사 권한은 브라우저 설정에서 확인해 주세요.");}
  });
  function refreshPhotoOptions() {
    const photos=state.promotionImages.map((image,index)=>[`promotion:${image.id}`,`홍보사진 ${index+1}${image.isPrimary?" · 대표":""}`]);if(imageSrc(state.businessProfile.heroImage))photos.push(["hero","대표 이미지"]);
    state.businessProfile.subImages.forEach((x,i)=>photos.push([`sub:${i}`,`서브 이미지 ${i+1}`]));
    state.products.forEach((x,i)=>{if(imageSrc(x.image))photos.push([`product:${i}`,`상품 이미지 ${i+1}`]);});
    const html=`<option value="">사진 없음</option>${photos.map(([v,n])=>`<option value="${v}">${n}</option>`).join("")}`;
    $("#promoPhoto").innerHTML=html;$("#publishPhoto").innerHTML=html;
    const primary=state.promotionImages.find(image=>image.isPrimary);if(primary)$("#promoPhoto").value=`promotion:${primary.id}`;
  }
  function selectedPhoto(value) {
    if(value.startsWith("promotion:"))return clone(state.promotionImages.find(image=>image.id===value.split(":")[1])||null);
    if(value==="hero")return clone(state.businessProfile.heroImage);
    if(value.startsWith("sub:"))return clone(state.businessProfile.subImages[+value.split(":")[1]]);
    if(value.startsWith("product:"))return clone(state.products[+value.split(":")[1]]?.image);
    return null;
  }
  function openPublishModal(channel) {
    pendingPublishChannel=channel;const input=promoInputs(),text=promoOutputs[channel]||"";
    $("#publishTitle").value=channel==="website"?text.split("\n")[0]:`${state.businessProfile.businessName||"우리 매장"} ${input.purpose} 안내`;
    $("#publishCategory").value=input.purpose.includes("신상품")?"신상품":input.purpose==="이벤트"?"이벤트":input.purpose==="브랜드 소개"?"소식":input.purpose==="예약"||input.purpose==="매장 방문"?"이용 안내":"프로모션";
    const primary=state.promotionImages.find(image=>image.isPrimary);$("#publishPhoto").value=primary?`promotion:${primary.id}`:input.photo||"";$("#publishDate").value=today();$("#publishPublic").checked=true;$("#publishModal").hidden=false;
  }
  $("#confirmPublish").onclick=()=>{
    const body=promoOutputs[pendingPublishChannel]||"";if(!body){toast("먼저 홍보글을 생성해 주세요.");return;}
    const ordered=state.promotionImages.slice().sort((a,b)=>a.order-b.order),primary=ordered.find(image=>image.isPrimary)||ordered[0],extra=ordered.filter(image=>image!==primary);
    const post=Data.post({category:$("#publishCategory").value,title:$("#publishTitle").value.trim()||"새 소식",body,heroImage:primary||selectedPhoto($("#publishPhoto").value),extraImages:extra,date:$("#publishDate").value,isPublic:$("#publishPublic").checked,buttonLabel:$("#publishButtonLabel").value.trim(),buttonUrl:$("#publishButtonUrl").value.trim()});
    state.websitePosts.push(post);lastPromotionWebsitePostId=post.id;
    if(activeDraftId){const active=state.promotionDrafts.find(x=>x.id===activeDraftId);if(active)active.websitePostId=post.id;}
    $("#publishModal").hidden=true;renderPosts();renderPreview();renderArchive();scheduleSave();toast("홈페이지 게시판에 등록하고 랜딩페이지에 반영했습니다.");
  };
  $("#savePromotion").onclick=()=>{
    if(!Object.keys(promoOutputs).length){toast("먼저 홍보글을 생성해 주세요.");return;}
    const inputs=promoInputs(),draft=Data.draft({title:`${state.businessProfile.businessName||"우리 매장"} ${inputs.purpose}`,purpose:inputs.purpose,inputs,channels:clone(promoOutputs),images:clone(state.promotionImages),websitePostId:lastPromotionWebsitePostId});
    state.promotionDrafts.unshift(draft);activeDraftId=draft.id;scheduleSave();renderArchive();toast("홍보글 보관함에 저장했습니다.");
  };
  function renderArchive() {
    $("#promotionArchive").innerHTML=state.promotionDrafts.length?state.promotionDrafts.map(d=>`<article class="archive-item"><div><strong>${escapeHtml(d.title)}</strong><p>${new Date(d.date).toLocaleDateString("ko-KR")} · ${d.purpose} · ${Object.keys(d.channels).length}개 채널 · 사진 ${d.images?.length||0}장 · ${d.websitePostId?"홈페이지 등록":"미등록"}</p></div><div class="item-actions"><button data-draft-open="${d.id}">다시 열기</button><button data-draft-copy="${d.id}">채널 복사</button><button data-draft-duplicate="${d.id}">복제</button><button data-draft-delete="${d.id}">삭제</button></div></article>`).join(""):`<p class="notice">보관한 홍보글이 없습니다.</p>`;
  }
  $("#promotionArchive").addEventListener("click",async e=>{
    const key=["open","copy","duplicate","delete"].find(x=>e.target.matches(`[data-draft-${x}]`));if(!key)return;const draft=state.promotionDrafts.find(d=>d.id===e.target.dataset[`draft${key[0].toUpperCase()+key.slice(1)}`]);if(!draft)return;
    if(key==="open"){const v=draft.inputs;activeDraftId=draft.id;lastPromotionWebsitePostId=draft.websitePostId||"";$("#promoPurpose").value=v.purpose;$("#promoHook").value=v.hook||"질문형";$("#promoAudience").value=v.audience||"";$("#promoCore").value=v.core||"";$("#promoProduct").value=v.product||"";$("#promoBenefit").value=v.benefit||"";$("#promoCta").value=v.cta||"";state.promotionImages=clone(draft.images||[]);promoOutputs=clone(draft.channels);renderPromotionImages();renderPromoResults();scheduleSave();scrollTo({top:$("#promoResults").getBoundingClientRect().top+scrollY-100,behavior:"smooth"});}
    if(key==="copy"){const text=Object.entries(draft.channels).map(([c,t])=>`[${CHANNELS[c]?.name||c}]\n${t}`).join("\n\n");toast(await copyText(text)?"채널별 문구를 모두 복사했습니다.":"복사에 실패했습니다.");}
    if(key==="duplicate"){state.promotionDrafts.unshift(Data.draft({...clone(draft),id:"",title:`${draft.title} 복사본`,date:new Date().toISOString()}));scheduleSave();renderArchive();}
    if(key==="delete"&&confirm("이 홍보글을 보관함에서 삭제할까요?")){state.promotionDrafts=state.promotionDrafts.filter(x=>x.id!==draft.id);scheduleSave();renderArchive();}
  });

  function renderComments() {
    $("#commentList").innerHTML=state.comments.length?state.comments.map(c=>`<article class="comment-item"><div><strong>${escapeHtml(c.channel)} · ${escapeHtml(c.author)}</strong><p>${new Date(c.date).toLocaleString("ko-KR")} · ${c.answered?"답변 완료":"미답변"}</p><p>${escapeHtml(c.content)}</p><p><b>AI 답변 초안:</b> ${escapeHtml(c.aiDraft)}</p></div><div class="item-actions"><button data-comment-copy="${c.id}">답변 복사</button><button data-comment-status="${c.id}">${c.answered?"미답변으로":"답변 완료"}</button></div></article>`).join(""):`<p class="notice">데모 댓글을 불러오면 추후 댓글 대응 흐름을 시험할 수 있습니다.</p>`;
  }
  $("#loadDemoComments").onclick=()=>{state.comments=[Data.comment({channel:"Instagram",author:"민지",content:"피팅 예약은 어떻게 하나요?",aiDraft:"안녕하세요, 관심 가져주셔서 감사합니다! 전화 또는 상담 버튼으로 원하시는 날짜를 알려주시면 피팅 가능 시간을 안내해 드릴게요."}),Data.comment({channel:"Threads",author:"dresslover",content:"택배 상담도 가능한가요?",aiDraft:"네, 택배 상담도 가능합니다. 원하시는 스타일과 사이즈를 알려주시면 자세히 도와드리겠습니다."})];scheduleSave();renderComments();toast("데모 댓글을 불러왔습니다.");};
  $("#commentList").addEventListener("click",async e=>{const copy=e.target.closest("[data-comment-copy]"),status=e.target.closest("[data-comment-status]");if(copy){const c=state.comments.find(x=>x.id===copy.dataset.commentCopy);toast(await copyText(c.aiDraft)?"추천 답변을 복사했습니다.":"복사에 실패했습니다.");}if(status){const c=state.comments.find(x=>x.id===status.dataset.commentStatus);c.answered=!c.answered;scheduleSave();renderComments();}});

  function showEditorStep(step,scroll=true){
    editorStep=Math.max(1,Math.min(5,step));
    $$("[data-editor-step]").forEach(section=>section.hidden=Number(section.dataset.editorStep)!==editorStep);
    $$("[data-step-target]").forEach(button=>{const active=Number(button.dataset.stepTarget)===editorStep;button.classList.toggle("active",active);button.setAttribute("aria-current",active?"step":"false");});
    $("#previousEditorStep").disabled=editorStep===1;
    $("#nextEditorStep").textContent=editorStep===5?"미리보기 보기":"다음 단계";
    $("#editorStepStatus").textContent=`${editorStep} / 5`;
    document.body.classList.toggle("editor-preview-step",editorStep===5);
    if(scroll&&innerWidth<701)$("#builder").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $("#editorStepper").onclick=event=>{const button=event.target.closest("[data-step-target]");if(button)showEditorStep(Number(button.dataset.stepTarget));};
  $("#previousEditorStep").onclick=()=>showEditorStep(editorStep-1);
  $("#nextEditorStep").onclick=()=>editorStep===5?location.hash="preview":showEditorStep(editorStep+1);
  $("#mobilePreviewButton").onclick=()=>location.hash="preview";
  const settingsModal=$("#settingsModal");
  function openSettings(){settingsModal.hidden=false;}
  $("#openSettings").onclick=openSettings;
  $$("[data-open-settings]").forEach(button=>button.onclick=openSettings);

  function applyRoute() {
    const requested=(location.hash||"#business").slice(1),route=requested==="builder"?"business":requested,preview=route==="preview",published=route==="published";
    document.body.classList.toggle("preview-mode",preview);$("#completionBar").hidden=!preview;
    document.body.classList.toggle("published-mode",published);$("#publicHeader").hidden=!published;
    $("#businessView").hidden=!["business","preview","published"].includes(route);$("#promotionView").hidden=route!=="promotion";$("#postsView").hidden=route!=="posts";
    $$("[data-route]").forEach(x=>x.classList.toggle("active",x.dataset.route===route));
    if(!["business","promotion","posts","preview","published"].includes(route)){location.hash="business";return;}
    const meta=state.settings.publishMeta||{};
    document.title=published&&meta.title?meta.title:"프로모링크 | 사업과 고객을 연결하는 통합 홍보 플랫폼";
    $('meta[name="description"]').content=published&&meta.description?meta.description:"사업 페이지 제작부터 홍보 콘텐츠 작성, 채널별 배포 준비와 고객 연결까지 관리하는 소상공인 통합 홍보 플랫폼입니다.";
    if(requested==="builder")setTimeout(()=>$("#builder").scrollIntoView({behavior:"smooth"}),0);
    else if(route==="business")setTimeout(()=>{if(location.hash==="#business")window.scrollTo(0,0)},0);
  }
  window.addEventListener("hashchange",applyRoute);
  initializeStaticOptions();renderPromoResults();renderAll();showEditorStep(1,false);applyRoute();
})();
