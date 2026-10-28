import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import process from 'node:process';
import { installIdentityFixtures, identityCatalog } from './support/templateIdentityFixtures';

const code = 'royal-garden-cinematic';
const royal = { id: 614, code, name: 'Royal Garden Cinematic', status: 'ACTIVE', category: 'TRADITIONAL', premium: true, price: 0, currency: 'USD', checkoutEligible: false, supportedEventTypes: ['WEDDING'], supportedLanguages: ['KH', 'EN', 'BOTH'], thumbnailUrl: '/images/marketing/catalog/royal-garden-cinematic-640.webp', previewUrl: `/templates/${code}` };
const evidence = '../../output/playwright/royal-garden-catalog';
async function chooser(page) {
  await page.goto('/app/events/101/invitation');
  const trigger = page.getByRole('button', { name: /^Change template:/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Change template', exact: true });
  await expect(dialog.getByRole('searchbox')).toBeVisible();
  await expect(dialog.getByText('Loading the invitation collection…')).toBeHidden();
  return { dialog, trigger };
}
async function premiumAccess(page, hasAccess) {
  await page.route('**/api/v1/me/templates/*/access', route => route.fulfill({ json: { data: { hasAccess } } }));
}

test('ACTIVE Royal is searchable in public catalog and Studio, previews the actual design, and preserves authored data on switching', async ({ page }) => {
  const { events } = await installIdentityFixtures(page, { catalog: [...identityCatalog, royal] });
  await premiumAccess(page, true);
  const original = events.get(101);
  events.set(101, { ...original, venueAddress: 'Saved venue address', contentJson: JSON.stringify({ faq: [{ q: 'Saved question', a: 'Saved answer' }], programDays: [{ id: 'd1', date: '2026-12-20' }], schedule: [{ id: 's1', dayId: 'd1', time: '17:00', title: 'Saved ceremony' }] }), designJson: JSON.stringify({ coverImage: '/templates/silk-heritage/portrait.webp', coverBackgroundImage: '/templates/silk-heritage/together.webp' }) });
  await page.goto('/templates');
  await expect(page.locator(`.kp-design-card[data-template="${code}"]`)).toBeVisible();
  const { dialog, trigger } = await chooser(page);
  await dialog.getByRole('searchbox').fill('garden-cinematic');
  await dialog.getByRole('button', { name: 'Khmer tradition', exact: true }).click();
  const card = dialog.locator(`[data-template="${code}"]`);
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Premium · Included with Premium access');
  const popupPromise = page.waitForEvent('popup');
  await card.getByRole('link', { name: /Preview/ }).click();
  const popup = await popupPromise;
  await expect(popup.locator('.tpl-royal-garden .rg-entrance-stage')).toBeVisible(); await popup.close();
  await card.getByRole('button', { name: 'Select', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Use selected design' })).toBeEnabled();
  page.once('dialog', confirmation => confirmation.accept());
  await dialog.getByRole('button', { name: 'Use selected design' }).click();
  await expect(dialog).toBeHidden();
  const mobile = page.viewportSize().width < 1100;
  if (mobile) await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
  await expect(page.frameLocator('iframe').locator('.tpl-royal-garden')).toBeVisible();
  if (mobile) await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  const saved = events.get(101), content = JSON.parse(saved.contentJson), design = JSON.parse(saved.designJson);
  expect(saved.templateId).toBe(614); expect(saved.templateCode).toBe(code);
  expect(saved.groomName).toBe(original.groomName); expect(saved.eventDate).toBe(original.eventDate);
  expect(saved.venueAddress).toBe('Saved venue address'); expect(content.faq[0].q).toBe('Saved question');
  expect(content.schedule[0].title).toBe('Saved ceremony'); expect(design.coverBackgroundImage).toBe('/templates/silk-heritage/together.webp');
  await trigger.click(); await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
});

test('inactive Royal stays out of selection and catalog failures offer retry and preview only', async ({ page }) => {
  await installIdentityFixtures(page, { catalog: [...identityCatalog, { ...royal, status: 'INACTIVE' }] });
  await page.goto('/templates'); await expect(page.locator('.kp-design-card').first()).toBeVisible();
  await expect(page.locator(`.kp-design-card[data-template="${code}"]`)).toHaveCount(0);
  const { dialog } = await chooser(page);
  await expect(dialog.locator(`[data-template="${code}"]`)).toHaveCount(0);
  await page.keyboard.press('Escape');
  let unavailable = true;
  await page.route('**/api/v1/templates', route => route.fulfill({ status: unavailable ? 503 : 200, json: unavailable ? { message: 'Catalog unavailable' } : { data: [...identityCatalog, royal] } }));
  await page.getByRole('button', { name: /^Change template:/ }).click();
  await expect(dialog).toContainText('The catalog is unavailable.');
  const preview = dialog.locator(`[data-template="${code}"]`);
  await expect(preview.getByRole('button', { name: 'Select', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Use selected design' })).toBeDisabled();
  unavailable = false; await dialog.getByRole('button', { name: 'Try again' }).click();
  await expect(preview.getByRole('button', { name: 'Select', exact: true })).toBeEnabled();
});

test('Premium denial and publication changes preserve the current template', async ({ page }) => {
  await installIdentityFixtures(page, { catalog: [...identityCatalog, royal] }); await premiumAccess(page, false);
  const { dialog } = await chooser(page);
  const card = dialog.locator(`[data-template="${code}"]`);
  await card.getByRole('button', { name: 'Select', exact: true }).click();
  await dialog.getByRole('button', { name: 'Use selected design' }).click();
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/Premium access is required\. Review/)).toBeVisible();
  await page.route(`**/api/v1/templates/slug/${code}`, route => route.fulfill({ status: 404, json: { message: 'Template not found' } }));
  await dialog.getByRole('button', { name: 'Use selected design' }).click();
  await expect(page.getByText('This design is unavailable. Refresh the collection and try again.')).toBeVisible();
  await expect(dialog).toBeVisible();
});

test('real local MySQL catalog reaches landing, browsing and responsive Studio without a catalog fixture', async ({ page, request }, testInfo) => {
  test.skip(!process.env.RUN_REAL_CATALOG || testInfo.project.name !== 'desktop-chromium', 'Requires the reviewed local Admin registration and backend on 8080');
  const api = 'http://127.0.0.1:8080';
  const response = await request.get(`${api}/api/v1/templates`);
  expect(response.ok()).toBe(true);
  const body = await response.json(), catalog = body.data || body;
  const record = catalog.find(item => item.code === code);
  expect(record).toMatchObject({ status: 'ACTIVE', premium: true, price: 0, currency: 'USD', checkoutEligible: false });
  expect(record.id).toBeGreaterThan(0);
  // Authentication/event fixtures isolate writes. Every catalog read below goes to the real backend.
  await installIdentityFixtures(page);
  await page.route('**/api/v1/templates**', async route => {
    const url = new URL(route.request().url());
    await route.fulfill({ response: await request.get(api + url.pathname + url.search) });
  });
  let catalogOnly = true;
  const videos = []; page.on('request', req => { if (catalogOnly && /\.(mp4|webm)(\?|$)|cinematic-content/.test(req.url())) videos.push(req.url()); });
  await fs.mkdir(evidence, { recursive: true });
  await page.goto('/');
  const featured = page.locator(`.kp-collection [data-template="${code}"]`);
  await expect(featured).toBeVisible();
  await featured.screenshot({ path: `${evidence}/real-featured-royal.png` });
  await page.goto('/templates'); await expect(page.locator(`[data-template="${code}"]`)).toBeVisible();
  await page.goto('/templates/browse'); await expect(page.getByRole('heading', { name: 'Royal Garden Cinematic', exact: true })).toBeVisible();
  expect(videos).toEqual([]); catalogOnly = false;
  for (const [name, width, height] of [['desktop',1440,900], ['tablet',834,1194], ['mobile',390,844]]) {
    await page.setViewportSize({ width, height });
    const { dialog } = await chooser(page);
    const card = dialog.locator(`[data-template="${code}"]`);
    await expect(card.getByRole('button', { name: 'Select', exact: true })).toBeEnabled();
    if (name === 'desktop') {
      await dialog.getByRole('searchbox').fill('blue and gold');
      await expect(card).toBeVisible();
      await dialog.getByRole('searchbox').clear();
    }
    if (name === 'mobile') await dialog.getByRole('searchbox').fill('Royal Garden');
    await card.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const image = card.locator('img'); expect(await image.evaluate(async node => { await node.decode(); return node.naturalWidth > 0; })).toBe(true);
    await card.getByRole('button', { name: 'Select', exact: true }).click();
    await page.screenshot({ path: `${evidence}/real-chooser-${name}.png`, animations: 'disabled' });
    expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    if (name === 'desktop') {
      const accessibility = await new AxeBuilder({ page }).include('.tc-modal').analyze();
      expect(accessibility.violations).toEqual([]);
    }
    await page.keyboard.press('Escape'); await expect(dialog).toBeHidden();
  }
  expect(videos).toEqual([]);
});
