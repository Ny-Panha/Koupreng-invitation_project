import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routeContracts, installRouteContractFixtures, assertRouteContract } from './support/batch12RouteContracts.js';
import { phase8Fixtures } from './support/phase8Fixtures.js';

const admin = 'http://127.0.0.1:4174';
const pageErrors = new WeakMap();
test.beforeEach(({ page }) => {
  pageErrors.set(page, []);
  page.on('pageerror', error => pageErrors.get(page).push(error.message));
});
test.afterEach(({ page }) => expect(pageErrors.get(page), 'No browser JavaScript errors').toEqual([]));
async function open(page, group, { lang = 'en', application } = {}) {
  const contract = routeContracts.find(row => row.group === group && (!application || row.application === application));
  const state = await installRouteContractFixtures(page, contract, { lang });
  if (group.startsWith('admin-template-')) {
    const template = { id: 30, code: 'event-essential', name: 'Batch 11 fixture template', status: 'ACTIVE', category: 'MINIMALIST', premium: false,
      description: JSON.stringify({ invitationTitle: 'Preview celebration', extension: { retained: true } }) };
    for (const pattern of ['**/api/v1/templates/slug/event-essential', '**/api/v1/templates/event-essential', '**/api/v1/templates/30', '**/api/v1/admin/templates/30']) {
      await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
    }
  }
  await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
    ? route.fallback() : route.request().resourceType() === 'stylesheet'
      ? route.fulfill({ body: '', contentType: 'text/css' }) : route.abort());
  await page.goto((contract.application === 'frontend-admin' ? admin : '') + contract.concreteUrl);
  return state;
}
async function contrast(page, selectors) {
  let builder = new AxeBuilder({ page }).withRules(['color-contrast']);
  for (const selector of selectors) builder = builder.include(selector);
  expect((await builder.analyze()).violations).toEqual([]);
  const samples = await page.locator('.guest-note summary, .page-subtitle, .admin-current-account-badge, .admin-auth-footer').evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => {
    const foreground = getComputedStyle(node).color;
    let surface = node, background;
    while (surface) {
      background = getComputedStyle(surface).backgroundColor;
      if (background !== 'transparent' && background !== 'rgba(0, 0, 0, 0)') break;
      surface = surface.parentElement;
    }
    return { selector: node.className || node.tagName, text: node.textContent.trim(), foreground, background };
  }));
  await test.info().attach('contrast-computed-styles', { body: JSON.stringify(samples, null, 2), contentType: 'application/json' });
}

test('AU-001 mobile Studio exposes the entire preview and reachable editing sections', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'admin-template-edit');
  await expect(page.getByRole('heading', { name: /Edit: Batch 11/ })).toBeVisible();
  const switcher = page.getByRole('button', { name: 'Preview', exact: true });
  if (await switcher.isVisible()) await switcher.click();
  const bounds = await page.locator('main').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(391);
  await expect(page.locator('iframe[title="Live User Template Preview"]')).toBeInViewport({ ratio: 0.95 });
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Preview celebration', exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath('studio-mobile-preview.png') });
});

test('AU-002 icon-only mobile preview link retains its accessible name', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'admin-template-edit');
  await expect(page.getByRole('link', { name: 'Open template preview in a new tab', exact: true })).toBeVisible();
  const scan = await new AxeBuilder({ page }).withRules(['link-name']).analyze();
  expect(scan.violations).toEqual([]);
});

test('AU-003 desktop resize works by keyboard and simple pointer controls', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page, 'admin-template-edit');
  const separator = page.getByRole('separator', { name: 'Resize editing panel', exact: true });
  await expect(separator).toBeVisible();
  const initial = Number(await separator.getAttribute('aria-valuenow'));
  const pressAdjustment = async name => {
    const button = page.getByRole('button', { name, exact: true });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    if (info.project.use.hasTouch) {
      // Exercise a real touch action without a synthetic mouse stability wait.
      await expect.poll(() => button.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('button') === element;
      })).toBe(true);
      const box = await button.boundingBox();
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    } else await button.click();
  };
  await separator.focus();
  await expect(separator).toHaveCSS('outline-width', '3px');
  await page.keyboard.press('ArrowRight');
  await expect(separator).toHaveAttribute('aria-valuenow', String(initial + 2));
  await pressAdjustment('Widen editing panel');
  await expect(separator).toHaveAttribute('aria-valuenow', String(initial + 7));
  await pressAdjustment('Reset panel widths');
  await expect(separator).toHaveAttribute('aria-valuenow', '48');
  await separator.focus(); await page.keyboard.press('End');
  await expect(separator).toHaveAttribute('aria-valuenow', await separator.getAttribute('aria-valuemax'));
  await pressAdjustment('Reset panel widths');
  const box = await separator.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  expect(Number(await separator.getAttribute('aria-valuenow'))).toBeGreaterThan(48);
  await page.setViewportSize({ width: 1024, height: 844 });
  expect(Number(await separator.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(Number(await separator.getAttribute('aria-valuemax')));
  await expect(page.locator('iframe')).toBeInViewport({ ratio: .95 });
});

test('AU-004 guest notes meet normal text contrast', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'guests');
  await expect(page.locator('.guest-note summary').first()).toBeVisible();
  await contrast(page, ['.guest-note']);
});

test('AU-005 admin subtitle and current-account badge meet contrast', async ({ page }) => {
  await open(page, 'admin-users');
  await expect(page.getByText('You', { exact: true })).toBeVisible();
  await contrast(page, ['.page-subtitle', '.ml-1\\.5']);
});

test('AU-006 dark administrative login footer meets contrast', async ({ page }) => {
  await open(page, 'auth-login', { application: 'frontend-admin' });
  await expect(page.locator('.mt-8').last()).toBeVisible();
  await contrast(page, ['.mt-8']);
});

test('responsive Studio retains edits, preview viewport and all sections across widths', async ({ page }, info) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'admin-template-edit');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'កំណត់ Catalog & តម្លៃ', exact: true }).click();
  const name = page.getByLabel(/Template Name/);
  await name.fill('Phone edits remain');
  const widths = [320, 360, 375, 390, 414, 430, 599, 600, 601, 767, 768, 769, 820, 1023, 1024, 1025, 1280, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 844 });
    const preview = page.getByRole('button', { name: 'Preview', exact: true });
    if (await preview.isVisible()) await preview.click();
    await expect(page.locator('iframe')).toHaveCount(1);
    await expect(page.locator('iframe')).toBeInViewport({ ratio: .95 });
    const box = await page.locator('.studio-preview-footprint').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('.template-studio').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    const edit = page.getByRole('button', { name: 'Edit', exact: true });
    if (await edit.isVisible()) await edit.click();
    await expect(name).toHaveValue('Phone edits remain');
    for (const section of ['Theme & Styles', 'Couple Info', 'Schedule & Media', 'Venue & QR', 'Settings']) {
      await expect(page.getByRole('button', { name: section, exact: true })).toBeInViewport();
    }
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await page.locator('iframe').scrollIntoViewIfNeeded();
  await expect(page.locator('iframe')).toBeInViewport({ ratio: .95 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.template-studio').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('studio-landscape.png') });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [label, width] of [['Mobile (380px)', 380], ['Tablet (680px)', 680], ['Desktop', 1024]]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect.poll(() => page.frameLocator('iframe').locator('html').evaluate(() => innerWidth)).toBe(width);
    await expect(page.locator('iframe')).toBeInViewport({ ratio: .95 });
  }
  await page.screenshot({ path: info.outputPath('studio-desktop.png') });
});

test('normal-motion invitation opens with a real pointer action', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await phase8Fixtures(page);
  await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.fallback() : route.abort());
  await page.goto('/i/review-celestial');
  const control = page.locator('.kc-opening__button');
  await expect(control).toBeVisible(); await expect(control).toBeEnabled();
  await expect.poll(() => control.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('button') === element;
  })).toBe(true);
  const box = await control.boundingBox();
  if (info.project.use.hasTouch) await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('.kc-opening')).toBeHidden();
  await expect(page.locator('.kc-shell').first()).toBeVisible();
  await page.reload();
  await control.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.kc-opening')).toBeHidden();
  await expect(page.locator('.kc-shell').first()).toBeVisible();
});

for (const group of ['events', 'create-event', 'invitation', 'checkout', 'admin-template-edit', 'admin-dashboard']) {
  test(`Khmer route contract uses the active controls: ${group}`, async ({ page }) => {
    const contract = routeContracts.find(row => row.group === group);
    const state = await open(page, group, { lang: 'km' });
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await assertRouteContract(page, contract, state);
      expect(state.unexpected).toEqual([]);
      expect(state.writes).toEqual([]);
    }
  });
}

for (const lang of ['en', 'km']) test(`Studio and contrast roles remain usable in ${lang} and dark mode`, async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'admin-template-edit', { lang });
  await expect(page.getByRole('link', { name: lang === 'en' ? 'Open template preview in a new tab' : 'បើកគំរូធៀបក្នុងផ្ទាំងថ្មី', exact: true })).toBeVisible();
  const preview = page.getByRole('button', { name: lang === 'en' ? 'Preview' : 'មើលជាមុន', exact: true });
  if (info.project.use.hasTouch) await preview.tap(); else await preview.click();
  await expect(page.locator('iframe')).toBeInViewport({ ratio: .95 });
  const edit = page.getByRole('button', { name: lang === 'en' ? 'Edit' : 'កែសម្រួល', exact: true });
  await edit.click();
  const sections = page.locator('.studio-section-tabs button');
  await expect(sections).toHaveCount(5);
  for (const section of await sections.all()) await expect(section).toBeInViewport();
  await page.screenshot({ path: info.outputPath(`studio-edit-${lang}.png`) });
  await open(page, 'admin-users', { lang });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('.admin-current-account-badge')).toBeVisible();
  await contrast(page, ['.page-subtitle', '.admin-current-account-badge']);
  await open(page, 'guests', { lang });
  await page.evaluate(() => document.documentElement.dataset.colorMode = 'dark');
  await expect(page.locator('.guest-note summary').first()).toBeVisible();
  await contrast(page, ['.guest-note']);
});
