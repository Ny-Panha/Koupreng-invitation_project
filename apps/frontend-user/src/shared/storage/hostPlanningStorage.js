const STORAGE_KEYS = {
  guests: "koupreng:guests",
  expenses: "koupreng:budget",
  gifts: "koupreng:gifts",
  checkIns: "koupreng:checkIns",
  activeEvent: "koupreng.host.activeEventId",
};

const LEGACY_STORAGE_KEYS = {
  guests: "koupreng.host.manualGuests",
  expenses: "koupreng.host.expenses",
  gifts: "koupreng.host.gifts",
  checkIns: "koupreng.host.checkIns",
};

function scopedKey(baseKey, parentId) {
  return parentId ? `${baseKey}:${parentId}` : baseKey;
}

function legacyScopedKey(baseKey, parentId) {
  return parentId ? `${baseKey}.${parentId}` : baseKey;
}

function parseList(raw, fallback = []) {
  if (raw === null) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn("Error reading from local storage:", error);
    return fallback;
  }
}

function readList(key, fallback = []) {
  if (typeof localStorage === "undefined") return fallback;
  return parseList(localStorage.getItem(key), fallback);
}

function readScopedList(keyName, parentId, fallback = []) {
  if (typeof localStorage === "undefined") return fallback;

  const nextKey = scopedKey(STORAGE_KEYS[keyName], parentId);
  const nextRaw = localStorage.getItem(nextKey);
  if (nextRaw !== null) {
    return parseList(nextRaw, fallback);
  }

  return readList(legacyScopedKey(LEGACY_STORAGE_KEYS[keyName], parentId), fallback);
}

function writeList(key, list) {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(Array.isArray(list) ? list : []));
  } catch (error) {
    console.warn("Error writing to local storage:", error);
  }
}

function writeScopedList(keyName, parentId, list) {
  writeList(scopedKey(STORAGE_KEYS[keyName], parentId), list);
}

export function createHostRecordId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getActiveEventId() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.activeEvent) || null;
}

export function setActiveEventId(eventId) {
  if (typeof localStorage === "undefined") return;
  if (eventId) {
    localStorage.setItem(STORAGE_KEYS.activeEvent, eventId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.activeEvent);
  }
}

export function listManualGuests(eventId) {
  const id = eventId || getActiveEventId();
  return readScopedList("guests", id);
}

export function saveManualGuests(guests, eventId) {
  const id = eventId || getActiveEventId();
  writeScopedList("guests", id, guests);
}

export function listBudgetExpenses(defaultItems = [], eventId) {
  const id = eventId || getActiveEventId();
  return readScopedList("expenses", id, defaultItems);
}

export function saveBudgetExpenses(expenses, eventId) {
  const id = eventId || getActiveEventId();
  writeScopedList("expenses", id, expenses);
}

export function listWeddingGifts(defaultItems = [], eventId) {
  const id = eventId || getActiveEventId();
  return readScopedList("gifts", id, defaultItems);
}

export function saveWeddingGifts(gifts, eventId) {
  const id = eventId || getActiveEventId();
  writeScopedList("gifts", id, gifts);
}

export function listManualCheckIns(eventId) {
  const id = eventId || getActiveEventId();
  return readScopedList("checkIns", id);
}

export function saveManualCheckIns(checkIns, eventId) {
  const id = eventId || getActiveEventId();
  writeScopedList("checkIns", id, checkIns);
}

export function removeHostPlanningData(eventId) {
  if (typeof localStorage === "undefined" || !eventId) return;

  [
    scopedKey(STORAGE_KEYS.guests, eventId),
    scopedKey(STORAGE_KEYS.expenses, eventId),
    scopedKey(STORAGE_KEYS.gifts, eventId),
    legacyScopedKey(LEGACY_STORAGE_KEYS.guests, eventId),
    legacyScopedKey("koupreng.host.guestGroups", eventId),
    legacyScopedKey("koupreng.host.guestCategories", eventId),
    legacyScopedKey(LEGACY_STORAGE_KEYS.expenses, eventId),
    legacyScopedKey(LEGACY_STORAGE_KEYS.gifts, eventId),
  ].forEach((key) => localStorage.removeItem(key));
}
