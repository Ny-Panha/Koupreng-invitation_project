import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { installBatch11Admin } from './support/batch11AdminFixtures.js';
import { phase8Fixtures } from './support/phase8Fixtures.js';

const admin = 'http://127.0.0.1:4174';
const widths = [320, 375, 390, 430, 768, 1024, 1440];
async function axe(page, info, name) {
  await page.evaluate(() => document.fonts.ready);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  await info.attach(name, { body: JSON.stringify(result.violations, null, 2), contentType: 'application/json' });
  expect(result.violations.filter(v => ['critical', 'serious'].includes(v.impact))).toEqual([]);
}

test('template save roundtrip preserves authored fields and immutable catalog identity', async ({ page }, info) => {
  await installBatch11Admin(page);
  const authored = { invitationTitle: 'Batch12 preview heading', galleryImages: ['/fixture-gallery.jpg'], elementFonts: { title: 'serif' }, storyText: 'Fictional authored story', scheduleLayout: 'timeline', backgroundImage: '/fixture-background.jpg', showCoverVideo: true, guestLabel: 'Dear guest', guestName: 'Fictional guest', extension: { retained: true } };
  let template = { id: 30, code: 'event-essential', name: 'Batch12 authored template', category: 'MINIMALIST', status: 'ACTIVE', premium: false, price: 0, description: JSON.stringify(authored) };
  const saves = [];
  await page.route('**/api/v1/templates/**', route => route.fulfill({ json: { data: template } }));
  await page.route('**/api/v1/admin/templates/30', async route => {
    if (route.request().method() === 'PUT') { const body = route.request().postDataJSON(); saves.push(body); template = { ...template, ...body }; }
    await route.fulfill({ json: { data: template } });
  });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${admin}/templates/30`);
  await expect(page.getByRole('heading', { name: /Edit: Batch12 authored template/ })).toBeVisible();
  const preview = page.getByRole('button', { name: 'Preview', exact: true });
  if (await preview.isVisible()) await preview.click();
  await expect(page.frameLocator('iframe[title="Live User Template Preview"]').getByRole('heading', { name: 'Batch12 preview heading', exact: true })).toBeVisible();
  const edit = page.getByRole('button', { name: 'Edit', exact: true });
  if (await edit.isVisible()) await edit.click();
  // An existing catalog code selects public registry/offer policy; layout changes require a new record.
  await expect(page.locator('button[disabled]').filter({ hasText: 'Khmer Celestial' })).toHaveCount(1);
  await page.getByRole('button', { name: /Save.*Publish/ }).click();
  await expect.poll(() => saves.length).toBe(1);
  expect(saves[0].code).toBe('event-essential');
  expect(JSON.parse(saves[0].description)).toMatchObject(authored);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Edit: Batch12 authored template/ })).toBeVisible();
  await page.getByRole('button', { name: /Save.*Publish/ }).click();
  await expect.poll(() => saves.length).toBe(2);
  expect(JSON.parse(saves[1].description)).toMatchObject(authored);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const save = page.getByRole('button', { name: /Save.*Publish/ });
    await expect(save).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.screenshot({ path: info.outputPath('template-roundtrip.png'), fullPage: true });
});

test('template Back warns before discarding authored changes', async ({ page }) => {
  await installBatch11Admin(page);
  await page.goto(`${admin}/templates/30`);
  await expect(page.getByRole('heading', { name: /Edit: Batch 11 fixture template/ })).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button').filter({ hasText: 'Catalog' }).click();
  await page.getByPlaceholder('Royal Khmer Wedding Studio 2026').fill('Unsaved fictional edit');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('link', { name: 'Back to templates' }).click();
  await expect(page).toHaveURL(`${admin}/templates/30`);
  await expect(page.getByPlaceholder('Royal Khmer Wedding Studio 2026')).toHaveValue('Unsaved fictional edit');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('link', { name: 'Back to templates' }).click();
  await expect(page).toHaveURL(`${admin}/templates`);
});

test('failed template load blocks overwrite and retry recovers', async ({ page }) => {
  await installBatch11Admin(page); let failed = true, invalid = false, writes = 0;
  await page.route('**/api/v1/admin/templates/30', async route => {
    if (route.request().method() !== 'GET') writes++;
    await route.fulfill({ status: failed ? 503 : 200, json: failed ? { message: 'Fictional temporary outage' } : { data: { id: 30, code: 'event-essential', name: 'Recovered template', status: 'ACTIVE', description: invalid ? '{invalid-json' : '{}' } } });
  });
  await page.goto(`${admin}/templates/30`);
  await expect(page.getByRole('heading', { name: 'Template could not be loaded' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Save.*Publish/ })).toHaveCount(0);
  expect(writes).toBe(0); failed = false; invalid = true;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText(/Template design data could not be read/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Save.*Publish/ })).toHaveCount(0);
  expect(writes).toBe(0); invalid = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: /Edit: Recovered template/ })).toBeVisible();
});

test('package dialog traps and restores focus, switches work by keyboard, bilingual responsive axe', async ({ page }, info) => {
  await installBatch11Admin(page);
  await page.goto(`${admin}/packages`);
  const opener = page.getByRole('button', { name: /New Package/ });
  await opener.click();
  let dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel(/Package Name/i)).toBeVisible();
  await dialog.getByRole('button').first().focus(); await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await dialog.getByRole('button', { name: /Quotas/ }).click();
  await expect(dialog.locator('input[id^=package-max]')).toHaveCount(4);
  await axe(page, info, 'package-quotas-axe');
  await dialog.getByRole('button', { name: /Features/ }).click();
  const toggle = dialog.getByRole('switch').first(); await toggle.focus();
  const before = await toggle.getAttribute('aria-checked'); await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-checked', before === 'true' ? 'false' : 'true');
  await page.keyboard.press('Enter'); await expect(toggle).toHaveAttribute('aria-checked', before);
  await axe(page, info, 'package-features-axe');
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(opener).toBeFocused();
  for (const [lang, theme] of [['en','light'], ['km','light'], ['en','dark'], ['km','dark']]) {
    await page.evaluate(({lang,theme}) => { localStorage.setItem('koupreng.admin.lang', lang); localStorage.setItem('theme', theme); }, {lang,theme}); await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await page.locator('button').filter({ hasText: /New Package|\+ / }).first().click();
    dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(dialog.getByRole('button').first()).toBeInViewport();
      if (info.project.name === 'batch12-chromium') await page.screenshot({ path: info.outputPath(`package-${lang}-${theme}-${width}.png`), fullPage: true });
    }
    await axe(page, info, `package-basic-${lang}-${theme}-axe`);
    await page.screenshot({ path: info.outputPath(`package-${lang}-${theme}.png`), fullPage: true });
    await page.keyboard.press('Escape');
  }
});

test('public wedding opens in three engines with reduced motion and bilingual responsive content', async ({ page }, info) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const lang of ['en', 'km']) {
    await phase8Fixtures(page, { lang });
    await page.goto('/i/review-celestial');
    const open = page.locator('.kc-opening button').first();
    await expect(open).toBeVisible(); await open.click();
    await expect(page.locator('.kc-shell').first()).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await axe(page, info, `wedding-${lang}-axe`);
    await page.screenshot({ path: info.outputPath(`wedding-${lang}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});
