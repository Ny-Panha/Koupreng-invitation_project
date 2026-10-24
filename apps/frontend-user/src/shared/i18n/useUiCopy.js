import { useCallback } from "react";
import { useLanguageStore } from "../../stores/useLanguageStore";

// For component-owned copy; invitation content and saved user data keep their own language.
export function useUiCopy() {
  const lang = useLanguageStore(state => state.lang);
  return useCallback((khmer, english) => lang === "en" ? english : khmer, [lang]);
}
