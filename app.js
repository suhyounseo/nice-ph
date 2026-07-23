(() => {
  "use strict";

  const STORAGE_KEY = "nicePH.v13";
  const LEGACY_KEYS = ["nicePH.v12", "nicePHState", "nice-ph-data"];
  const CATEGORIES = ["소식", "신상품", "이벤트", "공지사항", "후기"];
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
    phone:["전화","TEL"], sms:["문자","SMS"], email:["이메일","@"], kakao:["카카오톡","K"], kakaochannel:["카카오채널","K+"],
    navermap:["네이버지도","N"], naverbooking:["네이버예약","N✓"], smartstore:["스마트스토어","N"], instagram:["인스타그램","IG"],
    threads:["Threads","TH"], facebook:["Facebook","f"], x:["X","X"], youtube:["YouTube","▶"], blog:["블로그","B"],
    showroom:["쇼룸","SR"], ownmall:["자사몰","SHOP"], coupang:["쿠팡","C"], link:["기타 링크","↗"]
  };
  const CHANNELS = {
    instagram:{name:"Instagram",url:"https://www.instagram.com/"},
    threads:{name:"Threads",url:"https://www.threads.net/"},
    facebook:{name:"Facebook",url:"https://www.facebook.com/"},
    x:{name:"X",url:"https://x.com/compose/post"},
    blog:{name:"네이버 블로그",url:"https://blog.naver.com/"},
    website:{name:"홈페이지 게시판",url:""}
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
      return {src:value.src || "",fit:value.fit || fit,width:value.width || 0,height:value.height || 0,originalBytes:value.originalBytes || 0,optimizedBytes:value.optimizedBytes || 0};
    };
    const product = (v = {}) => ({id:v.id || id("product"),name:v.name || "",description:v.description || "",price:v.price || "",image:image(v.image,"cover")});
    const action = (v = {}) => {
      const legacyType = v.type || v.channel || v.icon || "link";
      const type = ACTION_TYPES[legacyType] ? legacyType : "link";
      return {id:v.id || id("action"),type,label:v.label || ACTION_TYPES[type][0],url:v.url || v.href || "",newWindow:v.newWindow !== false};
    };
    const post = (v = {}) => ({id:v.id || id("post"),category:CATEGORIES.includes(v.category) ? v.category : "소식",title:v.title || "",body:v.body || "",heroImage:image(v.heroImage || v.image,"contain"),extraImages:(v.extraImages || []).map(x=>image(x,"contain")).filter(Boolean),date:v.date || today(),buttonLabel:v.buttonLabel || "",buttonUrl:v.buttonUrl || "",isPublic:v.isPublic !== false,createdAt:v.createdAt || new Date().toISOString(),updatedAt:v.updatedAt || new Date().toISOString()});
    const draft = (v = {}) => ({id:v.id || id("draft"),title:v.title || "",date:v.date || new Date().toISOString(),purpose:v.purpose || "기타",channels:v.channels || {},inputs:v.inputs || {},status:v.status || "작성",websitePostId:v.websitePostId || ""});
    const comment = (v = {}) => ({id:v.id || id("comment"),channel:v.channel || "Instagram",author:v.author || "고객",content:v.content || "",date:v.date || new Date().toISOString(),answered:Boolean(v.answered),aiDraft:v.aiDraft || "관심 가져주셔서 감사합니다. 자세한 내용은 편하게 문의해 주세요!"});
    const blank = () => ({
      schemaVersion:4,
      businessProfile:{industry:"",businessName:"",tagline:"",description:"",heroImage:null,subImages:[],address:"",phone:"",openTime:"",closeTime:"",closesNextDay:false,hoursNote:""},
      products:[],strengths:[],actionLinks:[],websitePosts:[],promotionDrafts:[],comments:[],
      settings:{visiblePostCategories:[...CATEGORIES]}
    });
    const migrate = (raw) => {
      const base = blank();
      if (!raw || typeof raw !== "object") return base;
      const profile = raw.businessProfile || {
        industry:raw.industry,businessName:raw.businessName,tagline:raw.tagline,description:raw.description,heroImage:raw.heroImage,
        subImages:raw.subImages,address:raw.address,phone:raw.phone,openTime:raw.openTime,closeTime:raw.closeTime,
        closesNextDay:raw.closesNextDay,hoursNote:raw.hoursNote
      };
      base.businessProfile = {...base.businessProfile,...profile,heroImage:image(profile.heroImage,"cover"),subImages:(profile.subImages || []).map(x=>image(x,"contain")).filter(Boolean)};
      base.products = (raw.products || []).map(product);
      base.strengths = (raw.strengths || []).map(x=>typeof x === "string" ? x : x?.text || "").filter(Boolean);
      base.actionLinks = (raw.actionLinks || raw.actions || []).map(action);
      base.websitePosts = (raw.websitePosts || []).map(post);
      base.promotionDrafts = (raw.promotionDrafts || []).map(draft);
      base.comments = (raw.comments || []).map(comment);
      base.settings = {...base.settings,...(raw.settings || {})};
      return base;
    };
    const serialize = (value) => ({schemaVersion:4,businessProfile:value.businessProfile,products:value.products,strengths:value.strengths,actionLinks:value.actionLinks,websitePosts:value.websitePosts,promotionDrafts:value.promotionDrafts,comments:value.comments,settings:value.settings});
    const load = () => {
      try {
        const params = new URLSearchParams(location.search);
        if (params.has("share")) return migrate(JSON.parse(decodeURIComponent(escape(atob(params.get("share"))))));
      } catch (error) { console.warn("공유 데이터 복원 실패", error); }
      for (const key of [STORAGE_KEY,...LEGACY_KEYS]) {
        try { const raw = localStorage.getItem(key); if (raw) return migrate(JSON.parse(raw)); } catch (error) { console.warn("저장 데이터 복원 실패", error); }
      }
      return blank();
    };
    const save = (value) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(value))); return true; }
      catch (error) { toast("저장 공간이 부족합니다. JSON 백업 후 일부 이미지를 줄여주세요."); return false; }
    };
    return {blank,migrate,serialize,load,save,product,action,post,draft,comment};
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
      return {src:await dataUrl(blob),fit,width,height,originalBytes:file.size,optimizedBytes:blob.size};
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
      if(["heroImage","subImages"].includes(key)) return;
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
    const options=Object.entries(ACTION_TYPES).map(([key,[label]])=>`<option value="${key}">${label}</option>`).join("");
    $("#actionFields").innerHTML=state.actionLinks.map((a,i)=>`
      <article class="repeat-card" data-action="${i}">
        <header><strong><span class="brand-icon">${ACTION_TYPES[a.type]?.[1]||"↗"}</span> 버튼 ${String(i+1).padStart(2,"0")}</strong><button type="button" class="icon-button danger" data-action-delete>×</button></header>
        <div class="action-type-row"><label class="field"><span>버튼 종류</span><select data-action-field="type">${options.replace(`value="${a.type}"`,`value="${a.type}" selected`)}</select></label><label class="field"><span>버튼명</span><input data-action-field="label" value="${escapeHtml(a.label)}"></label></div>
        <label class="field"><span>URL 또는 전화번호</span><input data-action-field="url" value="${escapeHtml(a.url)}" placeholder="https:// 또는 전화번호"></label>
        <label class="check new-window"><input type="checkbox" data-action-field="newWindow" ${a.newWindow?"checked":""}><span>새 창에서 열기</span></label>
      </article>`).join("");
  }
  function renderBusinessImages() {
    const p=state.businessProfile, hero=imageSrc(p.heroImage);
    $("#heroImageControl").hidden=!hero; $("#heroThumb").src=hero || "";
    $("#heroImageFit").value=imageFit(p.heroImage,"cover");
    $("#subImageList").innerHTML=p.subImages.map((img,i)=>`<div class="image-item" data-sub-image="${i}"><img src="${imageSrc(img)}" alt="서브 이미지 ${i+1}"><select data-sub-fit><option value="contain" ${imageFit(img)==="contain"?"selected":""}>전체 이미지 보기</option><option value="original" ${imageFit(img)==="original"?"selected":""}>원본 비율</option><option value="cover" ${imageFit(img)==="cover"?"selected":""}>화면 채우기</option></select><button type="button" data-sub-delete>삭제</button></div>`).join("");
  }
  function actionButton(a) {
    const url=safeUrl(a.url,a.type); if(!url) return "";
    const target=a.newWindow && !/^(tel:|sms:|mailto:)/.test(url)?' target="_blank" rel="noopener"':"";
    return `<a class="action-button" href="${escapeHtml(url)}"${target}><span class="brand-icon">${ACTION_TYPES[a.type]?.[1]||"↗"}</span>${escapeHtml(a.label)}</a>`;
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
    $("#previewFooterName").textContent=p.businessName || "NICE PH";
    const validProducts=state.products.filter(x=>x.name||x.description||x.price||imageSrc(x.image));
    $("#previewProductsSection").hidden=!validProducts.length;
    $("#previewProductCards").innerHTML=validProducts.map(x=>`<article class="product-card">${imageSrc(x.image)?`<div class="product-image fit-${imageFit(x.image)}"><img src="${imageSrc(x.image)}" alt="${escapeHtml(x.name)}"></div>`:""}<div class="product-body"><h4>${escapeHtml(x.name||"상품·서비스")}</h4><p>${escapeHtml(x.description)}</p>${x.price?`<strong>${escapeHtml(x.price)}</strong>`:""}</div></article>`).join("");
    $("#previewStrengthsSection").hidden=!state.strengths.length;
    $("#previewStrengths").innerHTML=state.strengths.filter(Boolean).map((x,i)=>`<div class="strength-item"><span>${String(i+1).padStart(2,"0")}</span><p>${escapeHtml(x)}</p></div>`).join("");
    $("#previewGallery").hidden=!p.subImages.length;
    $("#previewGallery").innerHTML=p.subImages.map(x=>`<figure class="fit-${imageFit(x,"contain")}"><img src="${imageSrc(x)}" alt="사업 공간 이미지"></figure>`).join("");
    const info=[["주소",p.address],["영업시간",formatHours()],["전화",p.phone]].filter(x=>x[1]);
    $("#previewInfoSection").hidden=!info.length; $("#previewInfo").innerHTML=info.map(([k,v])=>`<div class="info-row"><strong>${k}</strong><span>${escapeHtml(v)}</span></div>`).join("");
    const actions=state.actionLinks.filter(x=>x.label&&x.url);
    $("#previewCtaSection").hidden=!actions.length; $("#previewCtas").innerHTML=actions.map(actionButton).join("");
    $("#heroActions").innerHTML=actions.slice(0,2).map(actionButton).join("");
    $("#mobileContact").hidden=!actions.length; $("#mobileContact").innerHTML=actions[0]?actionButton(actions[0]):"";
    const posts=publicPosts(); $("#previewNewsSection").hidden=!posts.length; $("#previewPostCards").innerHTML=posts.slice(0,3).map(postCard).join("");
    renderProgress();
  }
  function renderProgress() {
    const p=state.businessProfile, checks=[p.industry,p.businessName,p.tagline,p.description,imageSrc(p.heroImage),state.products.length,state.strengths.length,p.address||p.phone,state.actionLinks.length];
    const value=Math.round(checks.filter(Boolean).length/checks.length*100);
    $("#progressPercent").textContent=`${value}% 완료`; $("#progressBar").style.width=`${value}%`;
    $("#progressHint").textContent=value===100?"고객에게 보여줄 준비가 끝났습니다.":value>=55?"상품과 연결 버튼을 더하면 완성도가 높아집니다.":"업종과 상호명부터 천천히 입력해 보세요.";
  }
  function renderAll() { populateForm(); renderProducts(); renderStrengths(); renderActions(); renderBusinessImages(); renderPreview(); renderPosts(); renderArchive(); renderComments(); refreshPhotoOptions(); }

  $("#businessForm").addEventListener("input",(event)=>{
    const t=event.target;
    if(t.name && Object.hasOwn(state.businessProfile,t.name)) {
      const oldIndustry=state.businessProfile.industry;
      state.businessProfile[t.name]=t.type==="checkbox"?t.checked:t.value;
      if(t.name==="industry" && (!state.businessProfile.tagline || state.businessProfile.tagline===INDUSTRIES[oldIndustry])) {
        state.businessProfile.tagline=INDUSTRIES[t.value]; $("#businessForm").elements.tagline.value=state.businessProfile.tagline;
      }
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
    if(t.closest("[data-sub-delete]")){state.businessProfile.subImages.splice(+t.closest("[data-sub-image]").dataset.subImage,1);renderBusinessImages();scheduleSave();renderPreview();}
    if(t.closest('[data-remove-image="hero"]')){state.businessProfile.heroImage=null;renderBusinessImages();scheduleSave();renderPreview();}
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
  $("#heroImageFile").addEventListener("change",e=>handleImages([...e.target.files],"cover",r=>{state.businessProfile.heroImage=r[0];renderBusinessImages();renderPreview();scheduleSave();e.target.value="";}));
  $("#subImageFiles").addEventListener("change",e=>handleImages([...e.target.files],"contain",r=>{state.businessProfile.subImages.push(...r);renderBusinessImages();renderPreview();scheduleSave();e.target.value="";}));
  $("#productFields").addEventListener("change",e=>{if(e.target.matches("[data-product-file]")){const card=e.target.closest("[data-product]"),input=e.target;handleImages([...input.files],"cover",r=>{state.products[+card.dataset.product].image=r[0];renderProducts();renderPreview();scheduleSave();});}});
  $("#addProduct").onclick=()=>{state.products.push(Data.product());renderProducts();scheduleSave();};
  $("#addStrength").onclick=()=>{state.strengths.push("");renderStrengths();scheduleSave();};
  $("#addAction").onclick=()=>{state.actionLinks.push(Data.action({type:"link"}));renderActions();scheduleSave();};

  function sampleData() {
    const next=Data.blank(); Object.assign(next.businessProfile,{industry:"여성의류",businessName:"NICE",tagline:"당신의 품격과 가치 상승의 동반자",description:"동대문에서 20년 이상 여성의류를 판매해온 NICE입니다.\n파티드레스, 무대의상, 홀복부터 미디와 롱드레스까지 고객의 체형과 목적에 맞는 스타일을 함께 찾아드립니다.",address:"서울시 중구 동대문패션타운",phone:"02-1234-5678",openTime:"10:30",closeTime:"01:00",closesNextDay:true,hoursNote:"일요일 휴무"});
    next.products=[Data.product({name:"파티드레스",description:"특별한 날을 더욱 돋보이게 만드는 드레스",price:"79,000원부터"}),Data.product({name:"무대의상",description:"공연과 방송에서 시선을 사로잡는 스타일",price:"문의"}),Data.product({name:"맞춤 추천",description:"체형과 용도, 분위기에 맞춘 상품 추천",price:"무료 상담"})];
    next.strengths=["20년 이상의 여성의류 판매 경험","고객 체형과 목적에 맞는 맞춤 추천","매장 방문 피팅 및 택배 상담 가능"];
    next.actionLinks=[Data.action({type:"phone",url:"02-1234-5678",newWindow:false}),Data.action({type:"instagram",url:"https://instagram.com/",newWindow:true})]; return next;
  }
  $("#loadSample").onclick=()=>{if(confirm("현재 사업 정보를 NICE 예시로 바꿀까요? 게시물과 홍보글 보관함은 유지됩니다.")){const sample=sampleData();sample.websitePosts=state.websitePosts;sample.promotionDrafts=state.promotionDrafts;sample.comments=state.comments;state=sample;renderAll();scheduleSave();toast("NICE 예시를 불러왔습니다.");}};
  $("#resetAll").onclick=()=>{if(confirm("모든 사업정보, 게시물, 홍보글을 초기화할까요? 복구할 수 없습니다.")){state=Data.blank();promoOutputs={};renderAll();scheduleSave();toast("전체 데이터를 초기화했습니다.");}};

  function createShareUrl() {
    const snapshot=Data.serialize(state);
    const encode=x=>btoa(unescape(encodeURIComponent(JSON.stringify(x))));
    let encoded=encode(snapshot), excluded=false;
    if(encoded.length>480000){
      const slim=clone(snapshot); slim.businessProfile.heroImage=null;slim.businessProfile.subImages=[];slim.products.forEach(x=>x.image=null);slim.websitePosts.forEach(x=>{x.heroImage=null;x.extraImages=[];});encoded=encode(slim);excluded=true;
    }
    if(encoded.length>480000) throw new Error("작성 데이터가 링크에 포함할 수 있는 크기를 넘었습니다.");
    const url=new URL(location.href);url.search="";url.searchParams.set("share",encoded);url.hash="preview";return {url:url.toString(),excluded};
  }
  $("#viewCompletedPage").onclick=()=>{location.hash="preview";};
  $("#backToEditor").onclick=()=>{location.hash="business";};
  $("#copyPageLink").onclick=async()=>{try{const result=createShareUrl(),ok=await copyText(result.url);if(!ok)throw new Error("클립보드 권한이 허용되지 않았습니다.");toast(result.excluded?"이미지를 제외한 작성 데이터 링크를 복사했습니다.":"작성 데이터를 포함한 페이지 링크를 복사했습니다.");}catch(error){toast(`${error.message} 현재 브라우저의 완성 페이지는 계속 볼 수 있습니다.`);}};
  $("#exportData").onclick=()=>{
    const blob=new Blob([JSON.stringify(Data.serialize(state),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`nice-ph-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("JSON 백업 파일을 만들었습니다.");
  };
  $("#importData").onclick=()=>$("#importDataFile").click();
  $("#importDataFile").addEventListener("change",async e=>{try{const parsed=JSON.parse(await e.target.files[0].text());if(!confirm("현재 데이터를 불러온 백업으로 교체할까요?"))return;state=Data.migrate(parsed);renderAll();scheduleSave();toast("백업 데이터를 불러왔습니다.");}catch{toast("올바른 NICE PH JSON 백업 파일이 아닙니다.");}finally{e.target.value="";}});

  function renderPosts() {
    $("#categoryVisibility").innerHTML=CATEGORIES.map(x=>`<label><input type="checkbox" value="${x}" ${state.settings.visiblePostCategories.includes(x)?"checked":""}> ${x}</label>`).join("");
    const posts=[...state.websitePosts].sort((a,b)=>`${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
    $("#postCount").textContent=`${posts.length}개`;
    $("#postManagerList").innerHTML=posts.length?posts.map(p=>`<article class="manager-item"><div><strong>${escapeHtml(p.title)}</strong><p>${p.category} · ${p.date} · ${p.isPublic?"공개":"비공개"}</p></div><div class="item-actions"><button data-post-edit="${p.id}">수정</button><button data-post-open="${p.id}">보기</button><button data-post-delete="${p.id}">삭제</button></div></article>`).join(""):`<p class="notice">저장된 게시물이 없습니다.</p>`;
    renderBoard();
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
    $("#postDetail").innerHTML=`<p class="post-meta">${p.category} · ${p.date}</p><h2>${escapeHtml(p.title)}</h2>${imageSrc(p.heroImage)?`<img class="post-detail-image" src="${imageSrc(p.heroImage)}" alt="">`:""}<p class="preline">${escapeHtml(p.body)}</p>${p.extraImages.length?`<div class="post-detail-gallery">${p.extraImages.map(x=>`<img src="${imageSrc(x)}" alt="">`).join("")}</div>`:""}${p.buttonLabel&&p.buttonUrl?`<p><a class="button" href="${safeUrl(p.buttonUrl)}" target="_blank" rel="noopener">${escapeHtml(p.buttonLabel)}</a></p>`:""}`;
    $("#postDetailModal").hidden=false;
  }
  $("#openBoard").onclick=()=>{$("#boardModal").hidden=false;renderBoard();};
  $("#boardTabs").onclick=e=>{const b=e.target.closest("[data-board-filter]");if(b){boardFilter=b.dataset.boardFilter;renderBoard();}};
  document.addEventListener("click",e=>{const post=e.target.closest("[data-open-post]");if(post)openPost(post.dataset.openPost);const close=e.target.closest("[data-close-modal]");if(close)$(`#${close.dataset.closeModal}`).hidden=true;});

  function promoInputs() {
    return {purpose:$("#promoPurpose").value,audience:$("#promoAudience").value.trim(),core:$("#promoCore").value.trim(),product:$("#promoProduct").value.trim(),benefit:$("#promoBenefit").value.trim(),cta:$("#promoCta").value.trim(),photo:$("#promoPhoto").value,tone:$('input[name="promoTone"]:checked').value};
  }
  function makePromo(channel,inputs,variant=0) {
    const b=state.businessProfile,name=b.businessName||"우리 매장",subject=inputs.product||inputs.purpose,core=inputs.core||`${name}의 ${subject} 소식을 전합니다.`,benefit=inputs.benefit||state.strengths[0]||"정성을 담은 서비스",cta=inputs.cta||"궁금한 점은 편하게 문의해 주세요.",audience=inputs.audience?`${inputs.audience}께 `:"";
    const hooks=[`${subject}, 기다리셨나요?`,`오늘 ${name}에서 전하는 새로운 소식`,`당신의 일상에 특별함을 더할 ${subject}`],hook=hooks[variant%hooks.length];
    if(channel==="instagram")return `${hook}\n\n${audience}${core}\n\n✓ ${benefit}\n${cta}\n\n#${name.replace(/\s/g,"")} #${inputs.purpose.replace(/\s/g,"")} #소상공인 #동네가게`;
    if(channel==="threads")return `${hook}\n${core}\n${benefit}이 가장 큰 장점이에요.\n여러분은 어떤 점이 가장 궁금하신가요?`;
    if(channel==="facebook")return `${name} ${inputs.purpose} 안내\n\n${core}\n\n${benefit}을 바탕으로 정성껏 준비했습니다.\n${formatHours()?`이용 안내: ${formatHours()}\n`:""}${b.address?`위치: ${b.address}\n`:""}${cta}`;
    if(channel==="x")return variant%2?`1/2 ${hook} ${core}\n\n2/2 ${benefit}. ${cta}`:`${hook} ${core} ${cta} #${inputs.purpose.replace(/\s/g,"")}`;
    if(channel==="blog")return `제목 후보\n1. ${name} ${subject}, 지금 만나보세요\n2. ${benefit}이 특별한 ${name}\n3. ${inputs.purpose} 소식｜${name}\n\n[새로운 소식]\n${core}\n\n[이런 점이 특별합니다]\n${benefit}\n\n[이용 안내]\n${formatHours()||"자세한 이용 시간은 문의해 주세요."}${b.address?`\n${b.address}`:""}\n\n${cta}\n\n검색 태그: ${name}, ${subject}, ${inputs.purpose}`;
    return `${name} ${inputs.purpose} 안내\n\n요약\n${core}\n\n본문\n${audience}${subject}을 소개합니다. ${benefit}을 바탕으로 준비했습니다.\n\n${cta}`;
  }
  function renderPromoResults() {
    $("#promoResults").innerHTML=Object.entries(CHANNELS).map(([key,ch])=>`<article class="promo-card" data-promo="${key}"><header><div><span class="post-meta">${ch.name}</span><h3>${key==="website"?"홈페이지 게시글":"채널용 문구"}</h3></div></header><div class="promo-content" data-promo-content>${escapeHtml(promoOutputs[key]||"홍보글을 생성하면 여기에 표시됩니다.")}</div><div class="promo-actions"><button data-promo-regenerate>다시 생성</button><button data-promo-edit>직접 수정</button><button data-promo-copy>복사</button><button data-promo-publish>홈페이지 게시판에 등록</button>${ch.url?`<button data-promo-open>채널 열기</button>`:""}</div></article>`).join("");
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
    if(e.target.closest("[data-promo-publish]")){promoOutputs[key]=content.innerText.trim();openPublishModal(key);}
    if(e.target.closest("[data-promo-open]")){promoOutputs[key]=content.innerText.trim();const ok=await copyText(promoOutputs[key]);window.open(CHANNELS[key].url,"_blank","noopener");toast(ok?"홍보글을 복사했습니다. 열린 채널의 작성 화면에 붙여넣어 주세요.":"채널을 열었습니다. 복사 권한은 브라우저 설정에서 확인해 주세요.");}
  });
  function refreshPhotoOptions() {
    const photos=[];if(imageSrc(state.businessProfile.heroImage))photos.push(["hero","대표 이미지"]);
    state.businessProfile.subImages.forEach((x,i)=>photos.push([`sub:${i}`,`서브 이미지 ${i+1}`]));
    state.products.forEach((x,i)=>{if(imageSrc(x.image))photos.push([`product:${i}`,`상품 이미지 ${i+1}`]);});
    const html=`<option value="">사진 없음</option>${photos.map(([v,n])=>`<option value="${v}">${n}</option>`).join("")}`;
    $("#promoPhoto").innerHTML=html;$("#publishPhoto").innerHTML=html;
  }
  function selectedPhoto(value) {
    if(value==="hero")return clone(state.businessProfile.heroImage);
    if(value.startsWith("sub:"))return clone(state.businessProfile.subImages[+value.split(":")[1]]);
    if(value.startsWith("product:"))return clone(state.products[+value.split(":")[1]]?.image);
    return null;
  }
  function openPublishModal(channel) {
    pendingPublishChannel=channel;const input=promoInputs(),text=promoOutputs[channel]||"";
    $("#publishTitle").value=channel==="website"?text.split("\n")[0]:`${state.businessProfile.businessName||"우리 매장"} ${input.purpose} 안내`;
    $("#publishCategory").value=input.purpose==="신상품"?"신상품":input.purpose==="이벤트"?"이벤트":input.purpose==="후기"?"후기":input.purpose==="긴급 공지"?"공지사항":"소식";
    $("#publishPhoto").value=input.photo||"";$("#publishDate").value=today();$("#publishPublic").checked=true;$("#publishModal").hidden=false;
  }
  $("#confirmPublish").onclick=()=>{
    const body=promoOutputs[pendingPublishChannel]||"";if(!body){toast("먼저 홍보글을 생성해 주세요.");return;}
    const post=Data.post({category:$("#publishCategory").value,title:$("#publishTitle").value.trim()||"새 소식",body,heroImage:selectedPhoto($("#publishPhoto").value),date:$("#publishDate").value,isPublic:$("#publishPublic").checked,buttonLabel:$("#publishButtonLabel").value.trim(),buttonUrl:$("#publishButtonUrl").value.trim()});
    state.websitePosts.push(post);lastPromotionWebsitePostId=post.id;
    if(activeDraftId){const active=state.promotionDrafts.find(x=>x.id===activeDraftId);if(active)active.websitePostId=post.id;}
    $("#publishModal").hidden=true;renderPosts();renderPreview();renderArchive();scheduleSave();toast("홈페이지 게시판에 등록하고 랜딩페이지에 반영했습니다.");
  };
  $("#savePromotion").onclick=()=>{
    if(!Object.keys(promoOutputs).length){toast("먼저 홍보글을 생성해 주세요.");return;}
    const inputs=promoInputs(),draft=Data.draft({title:`${state.businessProfile.businessName||"우리 매장"} ${inputs.purpose}`,purpose:inputs.purpose,inputs,channels:clone(promoOutputs),websitePostId:lastPromotionWebsitePostId});
    state.promotionDrafts.unshift(draft);activeDraftId=draft.id;scheduleSave();renderArchive();toast("홍보글 보관함에 저장했습니다.");
  };
  function renderArchive() {
    $("#promotionArchive").innerHTML=state.promotionDrafts.length?state.promotionDrafts.map(d=>`<article class="archive-item"><div><strong>${escapeHtml(d.title)}</strong><p>${new Date(d.date).toLocaleDateString("ko-KR")} · ${d.purpose} · ${Object.keys(d.channels).length}개 채널 · ${d.websitePostId?"홈페이지 등록":"미등록"}</p></div><div class="item-actions"><button data-draft-open="${d.id}">다시 열기</button><button data-draft-copy="${d.id}">채널 복사</button><button data-draft-duplicate="${d.id}">복제</button><button data-draft-delete="${d.id}">삭제</button></div></article>`).join(""):`<p class="notice">보관한 홍보글이 없습니다.</p>`;
  }
  $("#promotionArchive").addEventListener("click",async e=>{
    const key=["open","copy","duplicate","delete"].find(x=>e.target.matches(`[data-draft-${x}]`));if(!key)return;const draft=state.promotionDrafts.find(d=>d.id===e.target.dataset[`draft${key[0].toUpperCase()+key.slice(1)}`]);if(!draft)return;
    if(key==="open"){const v=draft.inputs;activeDraftId=draft.id;lastPromotionWebsitePostId=draft.websitePostId||"";$("#promoPurpose").value=v.purpose;$("#promoAudience").value=v.audience||"";$("#promoCore").value=v.core||"";$("#promoProduct").value=v.product||"";$("#promoBenefit").value=v.benefit||"";$("#promoCta").value=v.cta||"";promoOutputs=clone(draft.channels);renderPromoResults();scrollTo({top:$("#promoResults").getBoundingClientRect().top+scrollY-100,behavior:"smooth"});}
    if(key==="copy"){const text=Object.entries(draft.channels).map(([c,t])=>`[${CHANNELS[c]?.name||c}]\n${t}`).join("\n\n");toast(await copyText(text)?"채널별 문구를 모두 복사했습니다.":"복사에 실패했습니다.");}
    if(key==="duplicate"){state.promotionDrafts.unshift(Data.draft({...clone(draft),id:"",title:`${draft.title} 복사본`,date:new Date().toISOString()}));scheduleSave();renderArchive();}
    if(key==="delete"&&confirm("이 홍보글을 보관함에서 삭제할까요?")){state.promotionDrafts=state.promotionDrafts.filter(x=>x.id!==draft.id);scheduleSave();renderArchive();}
  });

  function renderComments() {
    $("#commentList").innerHTML=state.comments.length?state.comments.map(c=>`<article class="comment-item"><div><strong>${escapeHtml(c.channel)} · ${escapeHtml(c.author)}</strong><p>${new Date(c.date).toLocaleString("ko-KR")} · ${c.answered?"답변 완료":"미답변"}</p><p>${escapeHtml(c.content)}</p><p><b>AI 답변 초안:</b> ${escapeHtml(c.aiDraft)}</p></div><div class="item-actions"><button data-comment-copy="${c.id}">답변 복사</button><button data-comment-status="${c.id}">${c.answered?"미답변으로":"답변 완료"}</button></div></article>`).join(""):`<p class="notice">데모 댓글을 불러오면 추후 댓글 대응 흐름을 시험할 수 있습니다.</p>`;
  }
  $("#loadDemoComments").onclick=()=>{state.comments=[Data.comment({channel:"Instagram",author:"민지",content:"피팅 예약은 어떻게 하나요?",aiDraft:"안녕하세요, 관심 가져주셔서 감사합니다! 전화 또는 상담 버튼으로 원하시는 날짜를 알려주시면 피팅 가능 시간을 안내해 드릴게요."}),Data.comment({channel:"Threads",author:"dresslover",content:"택배 상담도 가능한가요?",aiDraft:"네, 택배 상담도 가능합니다. 원하시는 스타일과 사이즈를 알려주시면 자세히 도와드리겠습니다."})];scheduleSave();renderComments();toast("데모 댓글을 불러왔습니다.");};
  $("#commentList").addEventListener("click",async e=>{const copy=e.target.closest("[data-comment-copy]"),status=e.target.closest("[data-comment-status]");if(copy){const c=state.comments.find(x=>x.id===copy.dataset.commentCopy);toast(await copyText(c.aiDraft)?"추천 답변을 복사했습니다.":"복사에 실패했습니다.");}if(status){const c=state.comments.find(x=>x.id===status.dataset.commentStatus);c.answered=!c.answered;scheduleSave();renderComments();}});

  function applyRoute() {
    const requested=(location.hash||"#business").slice(1),route=requested==="builder"?"business":requested,preview=route==="preview";
    document.body.classList.toggle("preview-mode",preview);$("#completionBar").hidden=!preview;
    $("#businessView").hidden=!["business","preview"].includes(route);$("#promotionView").hidden=route!=="promotion";$("#postsView").hidden=route!=="posts";
    $$("[data-route]").forEach(x=>x.classList.toggle("active",x.dataset.route===route));
    if(!["business","promotion","posts","preview"].includes(route)){location.hash="business";return;}
    if(requested==="builder")setTimeout(()=>$("#builder").scrollIntoView({behavior:"smooth"}),0);
    else if(route==="business")setTimeout(()=>{if(location.hash==="#business")window.scrollTo(0,0)},0);
  }
  window.addEventListener("hashchange",applyRoute);
  initializeStaticOptions();renderPromoResults();renderAll();applyRoute();
})();
