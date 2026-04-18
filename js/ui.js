// js/ui.js — Fixed: no crop images, category images, Play Store same tab

import { cdnUrl, formatNum, timeSince } from "./db.js";

export function esc(s) {
  return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Category gradient helper ───────────────────────────────
export function catGradient(c) {
  return `linear-gradient(135deg,${c.gradientStart||"#3730A3"},${c.gradientEnd||"#7C3AED"})`;
}

// ── Prompt card — natural image ratio, no crop ─────────────
export function renderPromptCard(p) {
  const imgUrl  = cdnUrl(p.imageUrl, 600) || `https://picsum.photos/seed/${p.id||"x"}/600/400`;
  const locked  = p.isPremium;
  const catLabel= p.subcategoryName
    ? `${esc(p.categoryName||"")} › ${esc(p.subcategoryName)}`
    : esc(p.categoryName || p.category || "");

  return `
  <article class="prompt-card" itemscope itemtype="https://schema.org/Article">
    <a href="./prompt.html?id=${p.id}" class="card-img-wrap" aria-label="View ${esc(p.title)}">
      <img src="${imgUrl}"
           alt="${esc(p.title)}"
           loading="lazy"
           itemprop="image"
           onerror="this.src='https://picsum.photos/seed/${p.id||"x"}/600/400'"/>
      <div class="card-img-overlay" style="pointer-events:none;position:absolute;inset:0;
           background:linear-gradient(to bottom,transparent 60%,rgba(0,0,0,.6));"></div>
      ${locked
        ? `<div class="lock-overlay" aria-label="Premium prompt">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               style="width:28px;height:28px;color:rgba(255,255,255,.9)">
               <path stroke-linecap="round" stroke-linejoin="round"
                 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
             </svg>
           </div>` : ""}
      <div class="card-badges-tl">
        ${p.isHot ? `<span class="badge badge-hot">🔥 Hot</span>` : ""}
      </div>
      <div class="card-badges-tr">
        ${locked ? `<span class="badge badge-premium">👑</span>` : `<span class="badge badge-free">Free</span>`}
      </div>
      ${p.tool ? `<div class="card-tool-badge"><span class="tool-badge">${esc(p.tool)}</span></div>` : ""}
    </a>
    <div class="card-body">
      ${catLabel ? `<p class="card-cat" itemprop="articleSection">${catLabel}</p>` : ""}
      <h3 class="card-title" itemprop="name">
        <a href="./prompt.html?id=${p.id}">${esc(p.title||"Untitled")}</a>
      </h3>
      ${p.description
        ? `<p class="card-desc" itemprop="description">${esc((p.description||"").slice(0,100))}${(p.description||"").length>100?"…":""}</p>`
        : ""}
      <div class="card-footer">
        <div class="card-stats">
          ${p.likes ? `<span aria-label="${formatNum(p.likes)} likes">❤ ${formatNum(p.likes)}</span>` : ""}
          ${p.views ? `<span aria-label="${formatNum(p.views)} views">👁 ${formatNum(p.views)}</span>` : ""}
        </div>
        <a href="./prompt.html?id=${p.id}"
          class="card-btn ${locked?"card-btn-premium":""}"
          aria-label="${locked?"Unlock premium prompt":"View prompt"}">
          ${locked ? "🔒 Unlock" : "View →"}
        </a>
      </div>
    </div>
  </article>`;
}

// ── Category card — shows image OR gradient, with real counts ─
export function renderCategoryCard(c, stats = {}) {
  const g     = catGradient(c);
  const total = stats.total || 0;
  const free  = stats.free  || 0;
  const prem  = stats.premium || 0;
  const hasImg = !!c.imageUrl;

  if (hasImg) {
    // Image category card
    return `
    <a href="./prompts.html?cat=${c.id}" class="cat-card cat-card-img" aria-label="${esc(c.name)} category — ${total} prompts">
      <img src="${cdnUrl(c.imageUrl,400)}" alt="${esc(c.name)} AI prompts" loading="lazy"
           onerror="this.style.display='none'"/>
      <div class="cat-card-img-overlay"></div>
      <div class="cat-card-img-content">
        <span style="font-size:1.6rem;display:block;margin-bottom:4px;">${c.emoji||"📁"}</span>
        <h3 class="cat-name">${esc(c.name)}</h3>
        <p class="cat-meta">${total} prompt${total!==1?"s":""} · ${free} free</p>
      </div>
    </a>`;
  }

  // Gradient category card
  return `
  <a href="./prompts.html?cat=${c.id}" class="cat-card" style="background:${g}"
    aria-label="${esc(c.name)} category — ${total} prompts">
    <span class="cat-emoji">${c.emoji||"📁"}</span>
    <h3 class="cat-name">${esc(c.name)}</h3>
    <p class="cat-meta">${total} prompt${total!==1?"s":""}</p>
    ${total > 0 ? `<p style="font-size:11px;color:rgba(255,255,255,.55);margin-top:2px;">${free} free · ${prem} premium</p>` : ""}
  </a>`;
}

// ── Skeleton cards ─────────────────────────────────────────
export function skeletonCards(n = 6) {
  return Array(n).fill(0).map(() => `
    <div class="prompt-card skeleton-card" aria-hidden="true">
      <div class="sk-img" style="height:200px;"></div>
      <div class="card-body">
        <div class="sk-line sk-line-sm"></div>
        <div class="sk-line sk-line-lg"></div>
        <div class="sk-line sk-line-md"></div>
      </div>
    </div>`).join("");
}

// ── App banner (top strip) — fixed Play Store link ─────────
export function initAppBanner(cfg = {}) {
  const dismissed = sessionStorage.getItem("banner_dismissed");
  if (dismissed) return;

  const storeUrl = cfg.playStoreUrl || "https://play.google.com/store/apps/details?id=com.enoysoft.promptvault";
  const banner = document.createElement("div");
  banner.id = "app-banner";
  banner.className = "app-banner";
  banner.setAttribute("role","banner");
  banner.innerHTML = `
    <div class="app-banner-inner">
      <div class="app-banner-icon" aria-hidden="true">✨</div>
      <div class="app-banner-text">
        <p class="app-banner-title">Get PromptVault on Android</p>
        <p class="app-banner-sub">Browse 1000+ AI prompts • Free download</p>
      </div>
      <a href="${storeUrl}" class="app-banner-btn" aria-label="Download PromptVault on Google Play">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px" aria-hidden="true">
          <path d="M3.18 23.76c.37.21.8.22 1.18.04l12.18-6.83-2.61-2.62-10.75 9.41zM.32 1.36C.12 1.7 0 2.12 0 2.62v18.76c0 .5.12.92.32 1.26l.07.06 10.51-10.51v-.25L.39 1.3l-.07.06zM20.46 9.7l-2.93-1.65-2.93 2.93 2.93 2.93 2.94-1.65c.84-.47.84-1.09 0-1.56zM4.36.24L16.54 7.07l-2.61 2.62L3.18.28C3.56.1 3.99.1 4.36.28z"/>
        </svg>
        Download Free
      </a>
      <button id="close-banner" class="app-banner-close" aria-label="Close app download banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>`;

  document.body.prepend(banner);
  const h = banner.offsetHeight;
  document.documentElement.style.setProperty("--banner-h", h + "px");

  document.getElementById("close-banner")?.addEventListener("click", () => {
    banner.style.transition = "opacity .3s";
    banner.style.opacity = "0";
    setTimeout(() => {
      banner.remove();
      document.documentElement.style.setProperty("--banner-h", "0px");
    }, 300);
    sessionStorage.setItem("banner_dismissed", "1");
  });
}

// ── Copy to clipboard ──────────────────────────────────────
export function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast("Copied to clipboard ✓"));
  } else {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); toast("Copied ✓"); } catch (_) {}
    ta.remove();
  }
}

// ── Toast ──────────────────────────────────────────────────
export function toast(msg, type = "success") {
  document.getElementById("pv-site-toast")?.remove();
  const el = document.createElement("div");
  el.id = "pv-site-toast";
  el.className = `site-toast site-toast-${type}`;
  el.textContent = msg;
  el.setAttribute("role","status");
  el.setAttribute("aria-live","polite");
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3000);
}

// ── Update SEO meta tags ───────────────────────────────────
export function updateMeta({ title, description, image, url } = {}) {
  if (title) {
    document.title = title + " | PromptVault";
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title + " | PromptVault");
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title + " | PromptVault");
  }
  if (description) {
    const d = description.slice(0, 155);
    document.querySelector('meta[name="description"]')?.setAttribute("content", d);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", d);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", d);
  }
  if (image) {
    document.querySelector('meta[property="og:image"]')?.setAttribute("content", image);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", image);
  }
  if (url) {
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  }
}
