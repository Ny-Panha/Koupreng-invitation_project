const STORAGE_KEY = "koupreng.template_intent";
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

export function normalizeTemplateIntentKey(value) {
  const key = typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
  return /^[a-z0-9][a-z0-9_-]{0,99}$/i.test(key) ? key.toLowerCase() : null;
}

export function templateIntentFromParams(params) {
  for (const name of ["template", "templateCode", "templateId", "tpl"]) {
    if (params.has(name)) return normalizeTemplateIntentKey(params.get(name));
  }
  return null;
}

export function saveTemplateIntent(key) {
  const normalized = normalizeTemplateIntentKey(key);
  if (!normalized || typeof window === "undefined") return false;
  try {
    const payload = {
      key: normalized,
      timestamp: Date.now(),
      version: 1,
    };
    window.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    // Graceful degradation when sessionStorage is unavailable or quota exceeded
    return false;
  }
}

export function getTemplateIntent() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !normalizeTemplateIntentKey(parsed.key) || !Number.isFinite(parsed.timestamp)) {
      clearTemplateIntent();
      return null;
    }
    if (Date.now() - parsed.timestamp > MAX_AGE_MS || parsed.timestamp > Date.now() + 60_000) {
      clearTemplateIntent();
      return null;
    }
    return normalizeTemplateIntentKey(parsed.key);
  } catch {
    clearTemplateIntent();
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

