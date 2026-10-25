import { createContext } from 'react';
export const CelestialMotion = createContext('elegant');
export function gardenBudget({ motion = 'elegant', tier = 'desktop', reduced = false, saveData = false, variant = 'normal' }) {
  if (reduced || saveData || motion === 'minimal') return { butterflies: 0, flowers: 4, petals: 0 };
  const rich = motion === 'cinematic';
  const mobile = tier === 'mobile';
  return { butterflies: rich ? (mobile ? 5 : 9) : (mobile ? 2 : 4), flowers: mobile ? 4 : 6,
    petals: variant === 'transition' ? 4 : rich ? (mobile ? 3 : 6) : (mobile ? 1 : 2) };
}
