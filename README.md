# PromptVault Website — Setup Guide

**Stack:** Vanilla HTML + CSS + JS · Firebase Firestore · Google AdSense · GitHub Pages  
**By:** ENOY SOFT · enoysoft@gmail.com

---

## 📁 File Structure

```
pv-website/
├── index.html          ← Home page (hero, trending, categories, app promo)
├── prompts.html        ← Browse + filter (category, subcategory, type, tool)
├── categories.html     ← All categories with subcategory chips
├── prompt.html         ← Single prompt detail (copy, share, related)
├── 404.html            ← Custom GitHub Pages error page
├── sitemap.xml         ← SEO sitemap (update YOUR_USERNAME)
├── robots.txt          ← SEO robots file (update YOUR_USERNAME)
├── css/style.css       ← All styles (dark theme, responsive)
└── js/
    ├── firebase.js     ← Firebase credentials (already set)
    ├── db.js           ← All Firestore read helpers
    ├── ui.js           ← Cards, banners, toast, SEO meta
    └── nav.js          ← Shared navbar + footer + mobile drawer
```

---

## 🚀 Deploy to GitHub Pages

### Step 1 — Create a new public repo
```
GitHub → New repository → name: promptvault-web → Public
```

### Step 2 — Upload all files
Upload the contents of this folder (not the folder itself) to the repo root.

### Step 3 — Enable GitHub Pages
```
Repo → Settings → Pages → Deploy from branch: main / root → Save
```

### Step 4 — Your live URL
```
https://YOUR_USERNAME.github.io/promptvault-web/
```

---

## 🔧 What You Must Change

### 1. Replace YOUR_USERNAME everywhere
Find and replace `YOUR_USERNAME` in:
- `sitemap.xml` (2 places)
- `robots.txt` (1 place)
- All 4 HTML files in the `<link rel="canonical">` tags
- All 4 HTML files in `og:url`, `og:image`, `twitter:image`

### 2. Add Google AdSense Publisher ID
In **every HTML file**, replace:
```
ca-pub-XXXXXXXXXXXXXXXX
```
With your real AdSense publisher ID:
```
ca-pub-1234567890123456
```
Also replace each `data-ad-slot="XXXXXXXXXX"` with your real ad unit slot IDs from AdSense.

**Ad slots used per page:**
| Page | Slots |
|------|-------|
| index.html | 3 ad units (top, mid, bottom) |
| prompts.html | 2 ad units (top, bottom) |
| categories.html | 2 ad units (top, bottom) |
| prompt.html | 2 ad units (content, sidebar) |

### 3. Add OG image
Create a 1200×630px banner image, upload to `img/og-image.jpg`, then update:
```html
<meta property="og:image" content="https://YOUR_USERNAME.github.io/promptvault-web/img/og-image.jpg"/>
```

---

## 💡 How It Works

### Data flow
```
User visits → Firebase Firestore read (public, no auth needed)
           → Categories, Prompts, Config all loaded dynamically
           → Same data as admin panel — no duplicate entry needed
```

### Prompt filtering
```
prompts.html?cat=CATEGORY_FIRESTORE_ID
prompts.html?cat=CAT_ID&subcat=SUBCAT_ID
prompts.html?type=free
prompts.html?type=hot
prompts.html?tool=Midjourney
prompts.html?q=search+term
```

### App banner
- Shows on every page automatically (dismissed per session)
- Pulls `playStoreUrl` from Firestore `/config/app`
- Set this in the admin panel → Config → Play Store URL

---

## 🔍 SEO Features

- Semantic HTML5 with proper heading hierarchy (h1 → h2 → h3)
- `<meta name="description">` on all pages
- Open Graph + Twitter Card tags
- JSON-LD structured data on home + detail pages
- `sitemap.xml` + `robots.txt`
- Dynamic meta updates on detail pages (title, description, og:image)
- `<link rel="canonical">` on all pages
- `alt` text on all images
- ARIA labels on interactive elements
- Fast loading: no framework, minimal dependencies

---

## 📱 App Banner
The sticky top banner promoting the Android app:
- Appears on every page
- Pulls the Play Store URL from Firestore config
- User can dismiss it (won't re-appear in the same browser session)
- Set `playStoreUrl` in Admin Panel → Config → App URLs

---

## 💰 AdSense Setup

1. Sign up at https://adsense.google.com
2. Add your site URL and verify ownership (GitHub Pages domain)
3. Get your **publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
4. Create ad units in AdSense → Get each unit's **slot ID**
5. Replace the placeholder values in all HTML files
6. AdSense takes 1–3 days to start showing ads after approval

---

## 🔗 Linking Between Admin Panel & Website

Both use **the same Firebase project** (`prompt-vault-f41e0`), so:
- Add a prompt in the admin panel → it appears on the website immediately
- Add a category in admin → it appears in the website filter bar immediately
- Update app config in admin → website banner links update automatically
- No sync needed — it's all live Firestore data

---

*PromptVault Website · Firebase Firestore + AdSense · ENOY SOFT*
