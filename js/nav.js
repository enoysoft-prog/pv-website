// js/nav.js — Shared navbar + footer + mobile drawer
import { searchPrompts, cdnUrl, getAppConfig } from "./db.js";
import { esc } from "./ui.js";

const PAGE = window.location.pathname.split("/").pop() || "index.html";

const NAV_LINKS = [
  { href: "index.html",    label: "Home" },
  { href: "prompts.html",  label: "Prompts" },
  { href: "categories.html", label: "Categories" },
];

export function injectNav(cfg = {}) {
  const storeUrl = cfg.playStoreUrl || "#";

  const navHtml = `
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="./index.html" class="nav-logo" aria-label="PromptVault Home">
        <div class="nav-logo-icon">✨</div>
        <span>PromptVault</span>
      </a>
      <div class="nav-links" role="menubar">
        ${NAV_LINKS.map(l =>
          `<a href="./${l.href}" role="menuitem" ${PAGE===l.href?'class="active"':''} >${l.label}</a>`
        ).join("")}
      </div>
      <div class="nav-spacer"></div>
      <div class="nav-search" id="nav-search-wrap" style="position:relative;">
        <svg class="nav-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input id="nav-search-input" type="search" placeholder="Search prompts…" aria-label="Search prompts"/>
        <div id="nav-search-results" class="search-results-wrap" role="listbox"></div>
      </div>
      <a href="${storeUrl}" target="_blank" rel="noopener" class="nav-download" aria-label="Download app">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px">
          <path d="M3.18 23.76c.37.21.8.22 1.18.04l12.18-6.83-2.61-2.62-10.75 9.41zM.32 1.36C.12 1.7 0 2.12 0 2.62v18.76c0 .5.12.92.32 1.26l.07.06 10.51-10.51v-.25L.39 1.3l-.07.06zM20.46 9.7l-2.93-1.65-2.93 2.93 2.93 2.93 2.94-1.65c.84-.47.84-1.09 0-1.56zM4.36.24L16.54 7.07l-2.61 2.62L3.18.28C3.56.1 3.99.1 4.36.28z"/>
        </svg>
        Get App
      </a>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>
  </nav>

  <!-- Mobile Drawer -->
  <div class="mobile-nav-drawer" id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
    <div class="mobile-nav-backdrop" id="drawer-backdrop"></div>
    <div class="mobile-nav-panel">
      <button class="mobile-nav-close" id="drawer-close" aria-label="Close menu">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <div style="margin-bottom:20px;">
        <a href="./index.html" style="display:flex;align-items:center;gap:10px;font-size:18px;font-weight:800;">
          <div class="nav-logo-icon">✨</div>
          <span style="background:linear-gradient(135deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">PromptVault</span>
        </a>
      </div>
      <div style="padding:10px 0;border-bottom:1px solid var(--border);margin-bottom:10px;">
        <input id="drawer-search" type="search" placeholder="Search prompts…"
          style="width:100%;background:var(--surface2);border:1.5px solid var(--border2);border-radius:10px;
                 padding:10px 14px;font-size:14px;color:var(--text);outline:none;"
          aria-label="Search prompts"/>
      </div>
      ${NAV_LINKS.map(l =>
        `<a href="./${l.href}" ${PAGE===l.href?'class="active"':''} >${l.label}</a>`
      ).join("")}
      <div style="margin-top:auto;padding-top:20px;">
        <a href="${storeUrl}" target="_blank" rel="noopener"
          style="display:flex;align-items:center;justify-content:center;gap:8px;
                 padding:12px;background:linear-gradient(135deg,#4f46e5,#7c3aed);
                 color:#fff;border-radius:10px;font-size:14px;font-weight:700;">
          📱 Download App — Free
        </a>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML("afterbegin", navHtml);

  // Mobile drawer
  const hamburger = document.getElementById("nav-hamburger");
  const drawer    = document.getElementById("mobile-drawer");
  const backdrop  = document.getElementById("drawer-backdrop");
  const closeBtn  = document.getElementById("drawer-close");

  function openDrawer() {
    drawer.classList.add("open");
    hamburger.setAttribute("aria-expanded","true");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    hamburger.setAttribute("aria-expanded","false");
    document.body.style.overflow = "";
  }
  hamburger?.addEventListener("click", openDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  closeBtn?.addEventListener("click", closeDrawer);

  // Drawer search redirects to prompts page
  document.getElementById("drawer-search")?.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.value.trim()) {
      window.location.href = `./prompts.html?q=${encodeURIComponent(e.target.value.trim())}`;
    }
  });

  // Desktop search with live dropdown
  initNavSearch();
}

function initNavSearch() {
  const input   = document.getElementById("nav-search-input");
  const results = document.getElementById("nav-search-results");
  if (!input || !results) return;

  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) { results.classList.remove("open"); return; }
    timer = setTimeout(async () => {
      try {
        const items = await searchPrompts(q);
        if (!items.length) {
          results.innerHTML = `<div class="search-result-item" style="color:var(--text3);font-size:13px;">No results found</div>`;
        } else {
          results.innerHTML = items.slice(0,6).map(p => `
            <div class="search-result-item" onclick="window.location.href='./prompt.html?id=${p.id}'">
              <img class="search-result-img"
                src="${cdnUrl(p.imageUrl,80) || 'https://placehold.co/40x40/1a1a2e/fff?text=?'}"
                alt="${esc(p.title)}" loading="lazy"
                onerror="this.src='https://placehold.co/40x40/1a1a2e/fff?text=?'"/>
              <div class="search-result-info">
                <p class="search-result-title">${esc(p.title)}</p>
                <p class="search-result-cat">${esc(p.categoryName||p.category||"")}${p.tool?" · "+esc(p.tool):""}</p>
              </div>
              ${p.isPremium
                ? `<span class="badge badge-premium search-result-badge">Premium</span>`
                : `<span class="badge badge-free search-result-badge">Free</span>`}
            </div>`).join("");
        }
        results.classList.add("open");
      } catch (e) {}
    }, 350);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && input.value.trim()) {
      results.classList.remove("open");
      window.location.href = `./prompts.html?q=${encodeURIComponent(input.value.trim())}`;
    }
    if (e.key === "Escape") { results.classList.remove("open"); input.blur(); }
  });

  document.addEventListener("click", e => {
    if (!document.getElementById("nav-search-wrap")?.contains(e.target)) {
      results.classList.remove("open");
    }
  });
}

export function injectFooter(cfg = {}) {
  const storeUrl = cfg.playStoreUrl || "#";
  const year = new Date().getFullYear();

  document.body.insertAdjacentHTML("beforeend", `
  <!-- Scroll-to-top -->
  <button class="scroll-top-btn" id="scroll-top" aria-label="Scroll to top">
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
    </svg>
  </button>

  <footer class="footer" role="contentinfo">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <div class="footer-logo-icon">✨</div>
          <span style="background:linear-gradient(135deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">PromptVault</span>
        </div>
        <p class="footer-desc">Discover, save and use the best AI prompts for Midjourney, DALL·E 3, Claude, ChatGPT, Sora and more.</p>
        <a href="${storeUrl}" target="_blank" rel="noopener" class="footer-app-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px">
            <path d="M3.18 23.76c.37.21.8.22 1.18.04l12.18-6.83-2.61-2.62-10.75 9.41zM.32 1.36C.12 1.7 0 2.12 0 2.62v18.76c0 .5.12.92.32 1.26l.07.06 10.51-10.51v-.25L.39 1.3l-.07.06zM20.46 9.7l-2.93-1.65-2.93 2.93 2.93 2.93 2.94-1.65c.84-.47.84-1.09 0-1.56zM4.36.24L16.54 7.07l-2.61 2.62L3.18.28C3.56.1 3.99.1 4.36.28z"/>
          </svg>
          Download on Google Play
        </a>
      </div>
      <div>
        <p class="footer-col-title">Browse</p>
        <div class="footer-links">
          <a href="./prompts.html">All Prompts</a>
          <a href="./categories.html">Categories</a>
          <a href="./prompts.html?type=free">Free Prompts</a>
          <a href="./prompts.html?type=hot">🔥 Trending</a>
        </div>
      </div>
      <div>
        <p class="footer-col-title">Categories</p>
        <div class="footer-links" id="footer-cats">
          <a href="./prompts.html?category=image">🎨 Image</a>
          <a href="./prompts.html?category=video">🎬 Video</a>
          <a href="./prompts.html?category=writing">✍️ Writing</a>
          <a href="./prompts.html?category=code">💻 Code</a>
        </div>
      </div>
      <div>
        <p class="footer-col-title">Company</p>
        <div class="footer-links">
          <a href="${cfg.privacyPolicyUrl || '#'}">Privacy Policy</a>
          <a href="${cfg.termsUrl || '#'}">Terms of Service</a>
          <a href="mailto:${cfg.contactEmail || 'enoysoft@gmail.com'}">Contact Us</a>
          <a href="${storeUrl}" target="_blank" rel="noopener">Download App</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-copy">© ${year} PromptVault by ENOY SOFT. All rights reserved.</p>
      <div class="footer-socials">
        <a href="${storeUrl}" target="_blank" rel="noopener" class="footer-social" aria-label="Play Store">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M3.18 23.76c.37.21.8.22 1.18.04l12.18-6.83-2.61-2.62-10.75 9.41zM.32 1.36C.12 1.7 0 2.12 0 2.62v18.76c0 .5.12.92.32 1.26l.07.06 10.51-10.51v-.25L.39 1.3l-.07.06zM20.46 9.7l-2.93-1.65-2.93 2.93 2.93 2.93 2.94-1.65c.84-.47.84-1.09 0-1.56zM4.36.24L16.54 7.07l-2.61 2.62L3.18.28C3.56.1 3.99.1 4.36.28z"/>
          </svg>
        </a>
      </div>
    </div>
  </footer>`);

  // Scroll to top
  const scrollBtn = document.getElementById("scroll-top");
  if (scrollBtn) {
    window.addEventListener("scroll", () => scrollBtn.classList.toggle("visible", window.scrollY > 400));
    scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}
