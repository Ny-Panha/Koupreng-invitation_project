export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

export function formatMoney(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

const AUTH_KEY = "koupreng.admin.auth";

export function readAuth() {
  try {
    const stored = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
    return JSON.parse(stored || "null");
  } catch { return null; }
}

export function writeAuth(value) {
  const serialized = JSON.stringify(value);
  sessionStorage.setItem(AUTH_KEY, serialized);
  localStorage.setItem(AUTH_KEY, serialized);
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_KEY);
}