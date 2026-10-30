import { expect } from '@playwright/test';

// Exercise keyboard activation of the visible, enabled opening control while
// ornamental motion continues. Pointer activation is covered by the scroll suite.
export async function activateOpening(page, button = page.locator('.kc-opening__button')) {
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  // focus() scrolls natively; scrollIntoViewIfNeeded waits for stable geometry,
  // which an intentionally floating opening control never reaches.
  await button.focus();
  await expect(button).toBeFocused();
  await button.press('Enter');
}
