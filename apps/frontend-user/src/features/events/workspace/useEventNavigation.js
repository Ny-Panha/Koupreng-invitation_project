import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const defaults = { mode: "auto", groups: { invitation: true, attendance: false, operations: true, other: false } };
function readPreferences(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return {
      mode: ["expanded", "collapsed"].includes(value?.mode) ? value.mode : "auto",
      groups: Object.fromEntries(Object.entries(defaults.groups).map(([name, fallback]) => [name,
        typeof value?.groups?.[name] === "boolean" ? value.groups[name] : fallback])),
    };
  } catch { return defaults; }
}

export function useMediaMatch(query) {
  const subscribe = useCallback(listener => {
    const media = window.matchMedia?.(query);
    media?.addEventListener("change", listener);
    return () => media?.removeEventListener("change", listener);
  }, [query]);
  const snapshot = useCallback(() => Boolean(window.matchMedia?.(query)?.matches), [query]);
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

export function useEventNavigation(userId) {
  const key = `koupreng.eventNavigation.${userId}`;
  const [preferences, setPreferences] = useState(() => readPreferences(key));
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(preferences)); } catch { /* Navigation works without persistent storage. */ }
  }, [key, preferences]);
  const desktop = useMediaMatch("(min-width: 1024px)");
  const wide = useMediaMatch("(min-width: 1440px)");
  const collapsed = preferences.mode === "auto" ? !wide : preferences.mode === "collapsed";
  return { desktop, collapsed, groups: preferences.groups,
    toggleCollapsed: () => setPreferences(value => ({ ...value, mode: collapsed ? "expanded" : "collapsed" })),
    expand: () => setPreferences(value => ({ ...value, mode: "expanded" })),
    toggleGroup: name => setPreferences(value => ({ ...value, groups: { ...value.groups, [name]: !value.groups[name] } })),
  };
}
