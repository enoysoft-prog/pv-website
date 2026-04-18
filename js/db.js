// js/db.js — Read-only Firestore helpers for the public website
import { db } from "./firebase.js";
import {
  collection, getDocs, getDoc, doc,
  query, where, orderBy, limit, startAfter
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const PAGE_SIZE = 12;

// ── Safe fetch with fallback sort ─────────────────────────
async function safeQuery(col, ...constraints) {
  try {
    return await getDocs(query(collection(db, col), ...constraints));
  } catch (e) {
    if (e.code === "failed-precondition") {
      // Index missing — fetch all, sort client-side
      return getDocs(collection(db, col));
    }
    throw e;
  }
}

// ── App Config ─────────────────────────────────────────────
export async function getAppConfig() {
  try {
    const snap = await getDoc(doc(db, "config", "app"));
    return snap.exists() ? snap.data() : {};
  } catch (e) { return {}; }
}

// ── Categories ─────────────────────────────────────────────
export async function getCategories() {
  const snap = await safeQuery("categories", orderBy("order", "asc"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

// ── Subcategories by categoryId ────────────────────────────
export async function getSubcategories(categoryId) {
  const snap = await safeQuery("subcategories", where("categoryId", "==", categoryId));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

// ── All prompts (paginated) ────────────────────────────────
export async function getPrompts({ cat = "", subcat = "", type = "", tool = "", pageSize = PAGE_SIZE, lastDoc = null } = {}) {
  const constraints = [];
  if (cat)    constraints.push(where("categoryId",    "==", cat));
  if (subcat) constraints.push(where("subcategoryId", "==", subcat));
  if (type === "free")    constraints.push(where("isPremium", "==", false));
  if (type === "premium") constraints.push(where("isPremium", "==", true));
  if (type === "hot")     constraints.push(where("isHot",     "==", true));
  if (tool)   constraints.push(where("tool", "==", tool));
  constraints.push(orderBy("dateAdded", "desc"));
  constraints.push(limit(pageSize));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  try {
    const snap = await getDocs(query(collection(db, "prompts"), ...constraints));
    return {
      items:   snap.docs.map(d => ({ id: d.id, ...d.data() })),
      lastDoc: snap.docs[snap.docs.length - 1] || null,
      hasMore: snap.docs.length === pageSize
    };
  } catch (e) {
    // Fallback: fetch all client-side filter
    const all = await getDocs(collection(db, "prompts"));
    let items = all.docs.map(d => ({ id: d.id, ...d.data() }));
    if (cat)    items = items.filter(p => p.categoryId    === cat);
    if (subcat) items = items.filter(p => p.subcategoryId === subcat);
    if (type === "free")    items = items.filter(p => !p.isPremium);
    if (type === "premium") items = items.filter(p =>  p.isPremium);
    if (type === "hot")     items = items.filter(p =>  p.isHot);
    if (tool)   items = items.filter(p => p.tool === tool);
    items.sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || ""));
    return { items: items.slice(0, pageSize), lastDoc: null, hasMore: items.length > pageSize };
  }
}

// ── Hot/Trending prompts ───────────────────────────────────
export async function getTrendingPrompts(count = 6) {
  try {
    const snap = await getDocs(query(collection(db, "prompts"),
      where("isHot", "==", true), orderBy("dateAdded", "desc"), limit(count)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    const { items } = await getPrompts({ type: "hot", pageSize: count });
    return items;
  }
}

// ── Single prompt by Firestore doc ID ─────────────────────
export async function getPromptById(id) {
  const snap = await getDoc(doc(db, "prompts", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Related prompts ────────────────────────────────────────
export async function getRelatedPrompts(prompt, count = 4) {
  try {
    const snap = await getDocs(query(collection(db, "prompts"),
      where("categoryId", "==", prompt.categoryId || ""),
      orderBy("dateAdded", "desc"), limit(count + 1)));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.id !== prompt.id)
      .slice(0, count);
  } catch (e) { return []; }
}

// ── AI Tools ───────────────────────────────────────────────
export async function getTools() {
  try {
    const snap = await getDocs(query(collection(db, "tools"),
      where("isActive", "==", true), orderBy("name", "asc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    const snap = await getDocs(collection(db, "tools"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(t => t.isActive !== false)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
}

// ── Search prompts ─────────────────────────────────────────
export async function searchPrompts(q) {
  const snap = await getDocs(collection(db, "prompts"));
  const lower = q.toLowerCase();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p =>
      (p.title       || "").toLowerCase().includes(lower) ||
      (p.description || "").toLowerCase().includes(lower) ||
      (p.tool        || "").toLowerCase().includes(lower) ||
      (p.categoryName|| "").toLowerCase().includes(lower) ||
      (p.tags || []).some(t => t.toLowerCase().includes(lower))
    )
    .slice(0, 20);
}

// ── Helpers ────────────────────────────────────────────────
export function formatNum(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/,"") + "M";
  if (n >= 1000)    return (n/1000).toFixed(1).replace(/\.0$/,"") + "k";
  return String(n);
}

export function cdnUrl(url, w = 600) {
  if (!url) return "";
  if (url.includes("cloudinary.com")) return url.replace("/upload/", `/upload/w_${w},q_auto,f_auto/`);
  return url;
}

export function timeSince(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days} days ago`;
  if (days < 365) return `${Math.floor(days/30)} months ago`;
  return `${Math.floor(days/365)} years ago`;
}

export function slugify(s) {
  return (s || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
