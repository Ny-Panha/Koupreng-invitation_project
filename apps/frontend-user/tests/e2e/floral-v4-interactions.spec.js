import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { phase8Fixtures } from './support/phase8Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';

test('fullscreen swipes, keyboard, thumbnails and focus return preserve the photo collection', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  await page.locator('.kfg-open').click();
  const slide = page.locator('.kfg-slide');
  await slide.click();
  const viewer = page.getByRole('dialog', { name: 'Wedding photo viewer' });
  await expect(viewer).toBeVisible();
  const image = viewer.locator('.kfg-lightbox-stage > img');
  const bounds = await image.boundingBox();
  const y = bounds.y + bounds.height * .5;
  if (info.project.name === 'mobile-chromium') {
    const touch = await page.context().newCDPSession(page);
    try {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: bounds.x + bounds.width * .75, y }] });
      for (let step = 1; step <= 8; step++) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: bounds.x + bounds.width * (.75 - step / 16), y }] });
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } finally { await touch.detach(); }
  } else {
    await page.mouse.move(bounds.x + bounds.width * .75, y);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * .25, y, { steps: 8 });
    await page.mouse.up();
  }
  await expect(viewer.locator('header')).toContainText('2 / 12');
  await page.keyboard.press('ArrowRight');
  await expect(viewer.locator('header')).toContainText('3 / 12');
  await viewer.getByRole('button', { name: 'Show photograph 5', exact: true }).click();
  await expect(viewer.locator('header')).toContainText('5 / 12');
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await expect(slide).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Invitation sections' })).toBeVisible();
});

test('data-saving guests get immediate details with static decoration and usable forms', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 896 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true,
    value: { saveData: true, addEventListener() {}, removeEventListener() {} } }));
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-content')).toBeVisible();
  await expect(page.locator('.kfg-welcome-scene')).toHaveCount(0);
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-low-power', 'true');
  await expect(page.locator('.kfg-petals')).toBeHidden();
  const dock = page.locator('.guest-section-navigation');
  const outside = await dock.evaluate(node => {
    const bounds = node.getBoundingClientRect();
    return [...node.querySelectorAll('button')].some(button => { const rect = button.getBoundingClientRect(); return rect.left < bounds.left || rect.right > bounds.right; });
  });
  expect(outside).toBe(false);
  const results = await new AxeBuilder({ page }).include('.kfg-content').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('a keyboard-selected Studio song survives save and reopen', async ({ page }) => {
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page, 'mediaOpening', 'Music');
  const change = page.getByRole('button', { name: 'Change track', exact: true });
  await change.focus(); await change.press('Enter');
  const track = page.getByRole('button', { name: /Instrumental Wedding \(VioSounds\)/ });
  await track.focus(); await track.press('Enter');
  await expect(change).toBeFocused();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(JSON.parse(state.events.get(101).contentJson).musicUrl).toContain('Instrumental');
  await page.reload(); await chooseStudioSection(page, 'mediaOpening', 'Music');
  await expect(page.locator('.spotify-selected-banner')).toContainText('Instrumental Wedding (VioSounds)');
});
