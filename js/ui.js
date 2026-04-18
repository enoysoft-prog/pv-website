// js/ui.js — Shared UI helpers for the public website
import { cdnUrl, formatNum, timeSince } from "./db.js";

// ── Category gradient ──────────────────────────────────────
export function catGradient(c) {
  return `linear-gradient(135deg,${c.gradientStart||"#3730A3"},${c.gradientEnd||"#7C3AED"})`;
}

// ── Prompt card HTML ───────────────────────────────────────
export function renderPromptCard(p, size = "md") {
  const img    = cdnUrl(p.imageUrl, size === "lg" ? 800 : 400) || `https://picsum.photos/seed/${p.id}/600/400`;
  const locked = p.isPremium;
  const badge  = locked
    ? `<span class="badge badge-premium">Premium</span>`
    : `<span class="badge badge-free">Free</span>`;
  const hotBadge = p.isHot ? `<span class="badge badge-hot">🔥 Hot</span>` : "";
  const toolBadge = p.tool
    ? `<span class="tool-badge">${esc(p.tool)}</span>` : "";
  const catLabel = p.subcategoryName
    ? `${esc(p.categoryName || "")} › ${esc(p.subcategoryName)}`
    : esc(p.categoryName || p.category || "");
  const desc = (p.description || "").slice(0, 110) + ((p.description||"").length > 110 ? "…" : "");

  return `
  <article class="prompt-card" data-id="${p.id}">
    <a href="./prompt.html?id=${p.id}" class="card-img-wrap">
      <img src="${img}" alt="${esc(p.title)}" loading="lazy"
           onerror="this.src='https://picsum.photos/seed/${p.id||'err'}/600/400'"/>
      <div class="card-img-overlay"></div>
      ${locked ? `<div class="lock-overlay"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>` : ""}
      <div class="card-badges-tl">${hotBadge}</div>
      <div class="card-badges-tr">${badge}</div>
      ${toolBadge ? `<div class="card-tool-badge">${toolBadge}</div>` : ""}
    </a>
    <div class="card-body">
      ${catLabel ? `<p class="card-cat">${catLabel}</p>` : ""}
      <h3 class="card-title"><a href="./prompt.html?id=${p.id}">${esc(p.title || "Untitled")}</a></h3>
      ${desc ? `<p class="card-desc">${esc(desc)}</p>` : ""}
      <div class="card-footer">
        <div class="card-stats">
          ${p.likes ? `<span>❤ ${formatNum(p.likes)}</span>` : ""}
          ${p.views ? `<span>👁 ${formatNum(p.views)}</span>` : ""}
        </div>
        <a href="./prompt.html?id=${p.id}" class="card-btn ${locked ? "card-btn-premium" : ""}">
          ${locked ? "🔒 Premium" : "View →"}
        </a>
      </div>
    </div>
  </article>`;
}

// ── Category card HTML ─────────────────────────────────────
export function renderCategoryCard(c, promptCount = 0) {
  const g = catGradient(c);
  return `
  <a href="./prompts.html?cat=${c.id}" class="cat-card" style="background:${g}">
    <span class="cat-emoji">${c.emoji || "📁"}</span>
    <h3 class="cat-name">${esc(c.name)}</h3>
    <p class="cat-meta">${promptCount} prompt${promptCount !== 1 ? "s" : ""}</p>
  </a>`;
}

// ── Skeleton cards ─────────────────────────────────────────
export function skeletonCards(n = 6) {
  return Array(n).fill(0).map(() => `
    <div class="prompt-card skeleton-card">
      <div class="sk-img"></div>
      <div class="card-body">
        <div class="sk-line sk-line-sm"></div>
        <div class="sk-line sk-line-lg"></div>
        <div class="sk-line sk-line-md"></div>
      </div>
    </div>`).join("");
}

// ── Adsense ad unit ────────────────────────────────────────
// Replace data-ad-client with your publisher ID: ca-pub-XXXXXXXXXXXXXXXX
export function renderAd(slot, format = "auto") {
  return `
  <div class="ad-wrap">
    <p class="ad-label">Advertisement</p>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="${slot}"
         data-ad-format="${format}"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});<\/script>
  </div>`;
}

// ── App download banner ────────────────────────────────────
export function renderAppBanner(cfg = {}) {
  const storeUrl = cfg.playStoreUrl || "https://play.google.com/store/apps/details?id=com.enoysoft.promptvault";
  return `
  <div id="app-banner" class="app-banner">
    <div class="app-banner-inner">
      <div class="app-banner-icon">✨</div>
      <div class="app-banner-text">
        <p class="app-banner-title">Get PromptVault on Android</p>
        <p class="app-banner-sub">Browse 1000+ AI prompts • Free download</p>
      </div>
      <a href="${storeUrl}" target="_blank" rel="noopener" class="app-banner-btn">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px">
          <path d="M3.18 23.76c.37.21.8.22 1.18.04l12.18-6.83-2.61-2.62-10.75 9.41zM.32 1.36C.12 1.7 0 2.12 0 2.62v18.76c0 .5.12.92.32 1.26l.07.06 10.51-10.51v-.25L.39 1.3l-.07.06zM20.46 9.7l-2.93-1.65-2.93 2.93 2.93 2.93 2.94-1.65c.84-.47.84-1.09 0-1.56zM4.36.24L16.54 7.07l-2.61 2.62L3.18.28C3.56.1 3.99.1 4.36.28z"/>
        </svg>
        Download Free
      </a>
      <button id="close-banner" class="app-banner-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>`;
}

// ── Mobile app alert strip (top of page) ──────────────────
export function initAppBanner(cfg = {}) {
  const dismissed = sessionStorage.getItem("banner_dismissed");
  if (dismissed) return;
  document.body.insertAdjacentHTML("afterbegin", renderAppBanner(cfg));
  document.getElementById("close-banner")?.addEventListener("click", () => {
    document.getElementById("app-banner")?.remove();
    sessionStorage.setItem("banner_dismissed", "1");
    document.documentElement.style.setProperty("--banner-h", "0px");
  });
  // Adjust main padding for banner height
  const banner = document.getElementById("app-banner");
  if (banner) {
    const h = banner.offsetHeight;
    document.documentElement.style.setProperty("--banner-h", h + "px");
  }
}

// ── Toast ──────────────────────────────────────────────────
export function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `site-toast site-toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3000);
}

// ── Pagination ─────────────────────────────────────────────
export function renderPagination(hasMore, onLoadMore) {
  const btn = document.getElementById("load-more-btn");
  if (!btn) return;
  if (hasMore) {
    btn.classList.remove("hidden");
    btn.onclick = onLoadMore;
  } else {
    btn.classList.add("hidden");
  }
}

// ── Search bar init ────────────────────────────────────────
export function initSearch(inputId, onSearch) {
  const input = document.getElementById(inputId);
  if (!input) return;
  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => onSearch(input.value.trim()), 400);
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") { clearTimeout(timer); onSearch(input.value.trim()); }
  });
}

// ── Scroll to top ──────────────────────────────────────────
export function initScrollTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ── Copy to clipboard ──────────────────────────────────────
export function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast("Copied to clipboard! ✓"));
  } else {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand("copy"); ta.remove();
    toast("Copied! ✓");
  }
}

// ── Escape HTML ────────────────────────────────────────────
export function esc(s) {
  return (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Update SEO meta tags dynamically ──────────────────────
export function updateMeta({ title, description, image, url } = {}) {
  if (title) {
    document.title = title + " | PromptVault";
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title + " | PromptVault");
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title + " | PromptVault");
  }
  if (description) {
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
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
