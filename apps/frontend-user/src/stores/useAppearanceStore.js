import { create } from 'zustand';

export const COLOR_MODE_KEY = 'koupreng.colorMode';
export function storedColorMode() {
  try { return localStorage.getItem(COLOR_MODE_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}
export const useAppearanceStore = create(set => ({
  mode: storedColorMode(),
  setMode: mode => {
    if (!['light','dark'].includes(mode)) return;
    try { localStorage.setItem(COLOR_MODE_KEY,mode); } catch { /* Works for this session if storage is unavailable. */ }
    set({mode});
  },
}));
