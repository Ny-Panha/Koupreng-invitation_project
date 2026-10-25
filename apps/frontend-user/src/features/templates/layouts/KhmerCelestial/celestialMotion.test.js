import { expect, it } from 'vitest';
import { gardenBudget } from './celestialMotion';
it.each(['minimal', 'elegant', 'cinematic'])('honors motion and data constraints before opening effects in %s', motion => {
  for (const variant of ['normal', 'opening', 'transition', 'closing']) {
    expect(gardenBudget({ motion, variant, reduced: true })).toEqual({ butterflies: 0, flowers: 4, petals: 0 });
    expect(gardenBudget({ motion, variant, saveData: true }).petals).toBe(0);
  }
});
it('bounds continuous effects on small screens and keeps the default restrained', () => {
  expect(gardenBudget({ tier: 'mobile' })).toEqual({ butterflies: 2, flowers: 4, petals: 1 });
  expect(gardenBudget({ motion: 'cinematic' }).butterflies).toBeLessThanOrEqual(9);
  expect(gardenBudget({ motion: 'minimal' }).butterflies).toBe(0);
});
