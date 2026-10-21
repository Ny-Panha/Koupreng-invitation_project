const STORAGE_KEY = "koupreng.template_intent";
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

export function saveTemplateIntent(key) {
  if (!key || typeof window === "undefined") return;
  try {
    const payload = {
      key: String(key).trim(),
      timestamp: Date.now(),
    };
    window.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Graceful degradation when sessionStorage is unavailable or quota exceeded
  }
}

export function getTemplateIntent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.key || typeof parsed.key !== "string") {
      clearTemplateIntent();
      return null;
    }
    if (Date.now() - (parsed.timestamp || 0) > MAX_AGE_MS) {
      clearTemplateIntent();
      return null;
    }
    return parsed.key.trim();
  } catch {
    return null;
  }
}

export function clearTemplateIntent() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage clearing errors
  }
}

export function findMatchingTemplate(templates, key) {
  if (!Array.isArray(templates) || !key) return null;
  const target = String(key).trim().toLowerCase();
  if (!target) return null;

  return templates.find((item) => {
    if (!item) return false;
    const tpl = item.template ? item.template : item;
    const id = String(tpl.id || "").trim().toLowerCase();
    const code = String(tpl.code || "").trim().toLowerCase();
    const slug = String(tpl.slug || "").trim().toLowerCase();
    return id === target || code === target || slug === target;
  }) || null;
}

