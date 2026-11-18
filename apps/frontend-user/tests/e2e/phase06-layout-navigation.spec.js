import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPhase06Fixture as open, centerHit } from './support/phase06Fixtures.js';

test('public mobile menu is modal, current and returns focus; route gets main focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const state = await open(page, 'home');
  const trigger = page.getByRole('button', { name: 'Open navigation menu' });
  await trigger.click();
  const menu = page.locator('#public-mobile-navigation');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
  await menu.getByRole('button', { name: 'Close navigation menu' }).focus();
  await page.keyboard.press('Shift+Tab');
  await expect(menu.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await menu.getByRole('link', { name: 'Templates', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(menu).not.toBeVisible();
  await expect(page.locator('#marketing-content')).toBeFocused();
  expect(state.writes).toEqual([]);
});

test('owner drawer excludes background focus, wraps, closes on history and desktop resize', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const state = await open(page, 'events');
  const menu = page.locator('#host-mobile-navigation');
  const trigger = page.getByRole('button', { name: 'Main menu' });
  await expect(menu).toHaveAttribute('inert', '');
  await trigger.click();
  await expect(menu.locator(':focus')).toHaveCount(1);
  // Focus cannot escape modality, even when a background element is focused by code.
  await page.locator('#host-main-content').evaluate(el => { el.tabIndex = -1; el.focus(); });
  await expect(menu.locator(':focus')).toHaveCount(1);
  const first = menu.getByRole('link').first();
  await first.focus(); await page.keyboard.press('Shift+Tab');
  await expect(menu.getByRole('button', { name: /Sign Out|ចាកចេញ/i })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(first).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(4, 200);
  await expect(menu).toHaveAttribute('inert', '');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(menu).toHaveAttribute('inert', '');
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  await menu.getByRole('link', { name: 'Packages', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/packages$/);
  await expect(menu).toHaveAttribute('inert', '');
  await expect(page.locator('#host-main-content')).toBeFocused();
  await trigger.click(); await page.goBack();
  await expect(menu).toHaveAttribute('inert', '');
  expect(state.writes).toEqual([]);
});

test('owner event navigation preserves event context and exact active task', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await open(page, 'guests');
  await page.getByRole('button', { name: 'Toggle modules menu' }).click();
  const dialog = page.getByRole('dialog', { name: 'Event navigation' });
  await expect(dialog.getByRole('link', { name: 'Guests', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(dialog.getByRole('combobox', { name: 'Switch event' })).toHaveValue('101');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Toggle modules menu' })).toBeFocused();
  expect(state.writes).toEqual([]);
});

test('auth locale and appearance keep typed state and safe return intent', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const state = await open(page, 'auth-login', { path: '/login?next=%2Fapp%2Fevents%2F101%2Fguests' });
  const username = page.locator('input').first();
  await username.fill('fictional@example.com');
  await page.getByRole('button', { name: 'ភាសាខ្មែរ', exact: true }).click();
  await expect(username).toHaveValue('fictional@example.com');
  await expect(page).toHaveURL(/next=/);
  const theme = page.locator('.auth-top-bar .app-theme-toggle');
  await theme.focus(); await theme.press('Enter'); await expect(theme).toBeFocused();
  await expect(username).toHaveValue('fictional@example.com');
  await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');
  const axe = await new AxeBuilder({ page }).include('.auth-shell').analyze();
  expect(axe.violations).toEqual([]);
  expect(state.writes).toEqual([]);
});

test('anonymous owner deep link preserves a safe local login destination', async ({ page }) => {
  await open(page, 'guests', { anonymous: true });
  await expect(page).toHaveURL(/\/login\?/);
  const url = new URL(page.url());
  expect(url.searchParams.get('next')).toBe('/app/events/101/guests');
  await expect(page.locator('.event-workspace')).toHaveCount(0);
});

test('owner search query updates keep input focus and typed filters', async ({ page }) => {
  await open(page, 'events');
  const search = page.locator('.events-page input').first();
  await search.fill('Dara');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('Dara');
  await expect(page).toHaveURL(/Dara/);
  await expect(search).toBeFocused();
});

test('admin drawer search, current location and navigation focus work at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const state = await open(page, 'admin-dashboard', { app: 'frontend-admin' });
  const trigger = page.getByRole('button', { name: 'Open navigation' });
  await trigger.click();
  const menu = page.getByRole('dialog', { name: 'Admin navigation' });
  await expect(menu.getByRole('link', { name: 'Overview dashboard' })).toHaveAttribute('aria-current', 'page');
  await menu.getByRole('searchbox').fill('xyz-unmatched');
  await expect(menu.getByRole('status')).toBeVisible();
  await menu.getByRole('searchbox').fill('users');
  await menu.getByRole('link', { name: 'Users', exact: true }).click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.locator('#admin-main')).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Users');
  await trigger.click(); await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  expect(state.writes).toEqual([]);
});

for (const viewport of [{ width: 844, height: 390 }, { width: 820, height: 430 }, { width: 768, height: 390 }]) {
  test(`Studio sections, dirty state, frame and outer scroll remain reachable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const state = await open(page, 'admin-template-edit', { app: 'frontend-admin' });
    const tabs = page.locator('.studio-section-tabs button');
    await expect(tabs).toHaveCount(5);
    for (const tab of await tabs.all()) {
      await expect.poll(() => centerHit(tab)).toBe(true);
      await tab.click(); await expect(tab).toHaveAttribute('aria-pressed', 'true');
    }
    await page.getByRole('button', { name: 'កំណត់ Catalog & តម្លៃ', exact: true }).click();
    const field = page.getByLabel(/Template Name/);
    await field.fill('Phase 06 retained draft');
    const switches = page.locator('.studio-panel-switch button');
    await switches.last().focus(); await page.keyboard.press('Enter');
    await expect(switches.last()).toHaveAttribute('aria-pressed', 'true');
    for (const button of await page.locator('.studio-preview-toolbar button').all()) {
      if (await button.isVisible()) { await expect.poll(() => centerHit(button)).toBe(true); await button.click(); }
    }
    const frame = page.frameLocator('iframe[title="Live User Template Preview"]');
    await expect(frame.getByRole('heading', { name: 'Preview celebration', exact: true })).toBeVisible();
    const geometry = await page.locator('.template-studio').evaluate(el => {
      el.scrollTop = el.scrollHeight;
      return { scrollTop: el.scrollTop, max: el.scrollHeight - el.clientHeight };
    });
    expect(geometry.scrollTop).toBe(geometry.max);
    await page.locator('iframe').scrollIntoViewIfNeeded();
    await frame.locator('body').evaluate(el => el.ownerDocument.scrollingElement.scrollTop = el.ownerDocument.scrollingElement.scrollHeight);
    await switches.first().focus(); await page.keyboard.press('Enter');
    await expect(field).toHaveValue('Phase 06 retained draft');
    await expect.poll(() => centerHit(switches.first())).toBe(true);
    expect(state.writes).toEqual([]);
  });
}

test('Studio keyboard resizer, preview destination and five sections survive desktop reflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const state = await open(page, 'admin-template-edit', { app: 'frontend-admin', lang: 'km' });
  const separator = page.getByRole('separator');
  await separator.focus(); await page.keyboard.press('End');
  await expect(separator).toHaveAttribute('aria-valuenow', await separator.getAttribute('aria-valuemax'));
  await page.keyboard.press('Home');
  await expect(separator).toHaveAttribute('aria-valuenow', await separator.getAttribute('aria-valuemin'));
  const external = page.getByRole('link', { name: 'បើកគំរូសំបុត្រអញ្ជើញក្នុងផ្ទាំងថ្មី', exact: true });
  await external.focus();
  const popupPromise = page.waitForEvent('popup'); await page.keyboard.press('Enter');
  const popup = await popupPromise; await popup.waitForURL('http://127.0.0.1:4173/templates/event-essential'); await popup.close();
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(page.locator('.studio-section-tabs button')).toHaveCount(5);
  expect(state.writes).toEqual([]);
});

test('public Back restores an unscrolled entry at zero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  const state = await open(page, 'home');
  await page.locator('.kp-landing h1').waitFor();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.locator('.kp-header').getByRole('link', { name: 'Templates', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await page.locator('.tp-title').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.evaluate(() => scrollTo(0, 300));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
  expect(await page.evaluate(() => scrollY)).toBe(300);
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  expect(state.writes).toEqual([]);
});

test('public Back restores catalog scroll and locale never resets it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, 'home');
  await page.locator('.kp-landing h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeGreaterThan(500);
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);
  await page.locator('.kp-desktop-actions .kp-language button').first().click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);
  await page.locator('.kp-desktop-nav a[href="/templates"]').click();
  await expect(page).toHaveURL(/\/templates$/);
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);
});

for (const [key, selector, viewport] of [
    ['silk-heritage', '.sh-cover .sh-button', { width: 1440, height: 900 }],
    ['emerald-canva-luxe-wedding', '.el-open-btn', { width: 320, height: 640 }],
  ]) for (const reducedMotion of ['reduce', 'no-preference']) {
  test(`${key} essential cover paints and opens with ${reducedMotion}`, async ({ page }) => {
    await page.setViewportSize(viewport); await page.emulateMedia({ reducedMotion });
    await open(page, 'template-demo', { path: `/templates/${key}` });
    const action = page.locator(selector).first();
    await expect(action).toBeVisible(); await expect(action).not.toHaveText('');
    await expect.poll(() => centerHit(action)).toBe(true);
    await expect(action).toHaveCSS('opacity', '1');
    await page.screenshot({ path: test.info().outputPath(`${key}-${reducedMotion}.png`) });
    await action.focus(); await page.keyboard.press('Enter');
    await expect(action).not.toBeVisible();
    await expect(page.locator('.host-header-wrapper,.kp-header,.admin-header')).toHaveCount(0);
  });
}

for (const app of ['frontend-user','frontend-admin']) for (const mode of ['light','dark']) {
  test(`${app} ${mode} system page offers readable safe recovery`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    const state = await open(page, app === 'frontend-user' ? 'home' : 'admin-dashboard', { app, mode, path: '/phase06-missing-page' });
    const main = page.getByRole('main');
    await expect(main.getByRole('heading')).toBeVisible();
    const link = main.getByRole('link', { name: app === 'frontend-user' ? 'Back to home' : 'Return to Dashboard', exact: true });
    await expect.poll(() => centerHit(link)).toBe(true);
    expect((await new AxeBuilder({ page }).include('main').analyze()).violations).toEqual([]);
    await link.focus(); await page.keyboard.press('Enter');
    await expect(page).toHaveURL(app === 'frontend-user' ? /4173\/$/ : /\/dashboard$/);
    expect(state.writes).toEqual([]);
  });
}

test('event denied and unavailable states expose recovery without event data', async ({ page }) => {
  const state = await open(page, 'guests');
  for (const kind of ['denied','offline']) {
    await page.route('**/api/v1/invitations/101', route => kind === 'denied'
      ? route.fulfill({ status: 403, json: { message: 'Access denied' } }) : route.abort('failed'));
    await page.reload();
    await expect(page.getByRole('alert')).toContainText(kind === 'denied' ? 'Access denied' : 'could not be opened');
    await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
    await expect(page.locator('.guest-record-row')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'My Events', exact: true }).last()).toBeVisible();
  }
  expect(state.writes).toEqual([]);
});
