import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routeContracts, installRouteContractFixtures } from './support/batch12RouteContracts.js';

async function openFixture(page, group, app = 'frontend-user', pathname) {
  const contract = routeContracts.find(row => row.group === group && row.application === app);
  if (!contract) throw new Error(`Missing route contract: ${app}/${group}`);
  const state = await installRouteContractFixtures(page, contract, { lang: 'en' });
  if (group === 'admin-template-edit') {
    const template = { id: 30, code: 'event-essential', name: 'Motion fixture', status: 'ACTIVE', category: 'MINIMALIST', premium: false,
      description: JSON.stringify({ invitationTitle: 'Preview celebration', extension: { retained: true } }) };
    for (const pattern of ['**/api/v1/templates/slug/event-essential', '**/api/v1/templates/event-essential', '**/api/v1/templates/30', '**/api/v1/admin/templates/30']) {
      await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
    }
  }
  if (pathname === '/templates/koupreng-demo-wedding') {
    await page.route('**/api/v1/templates/slug/koupreng-demo-wedding', route =>
      route.fulfill({ json: { data: { id: 903, code: 'koupreng-demo-wedding', slug: 'koupreng-demo-wedding', name: 'Motion fixture', status: 'ACTIVE', category: 'OTHER', premium: false, price: 0 } } }));
  }
  await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
    ? route.fallback() : route.request().resourceType() === 'stylesheet'
      ? route.fulfill({ body: '', contentType: 'text/css' }) : route.abort());
  await page.goto(`${app === 'frontend-admin' ? 'http://127.0.0.1:4174' : ''}${pathname || contract.concreteUrl}`);
  return state;
}

test('auth task is visible without a blocking route curtain', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = await openFixture(page, 'auth-login');
  await expect(page.locator('.kp-site-preloader')).toHaveCount(0);
  await expect(page.locator('.auth-card')).toBeVisible();
  const axe = await new AxeBuilder({ page }).include('.auth-card').analyze();
  expect(axe.violations).toEqual([]);
  expect(state.writes).toEqual([]);
});

test('venue marketing keeps its own content without a route curtain', async ({ page }) => {
  const state = await openFixture(page, 'venues');
  await expect(page.locator('.venues-content .main-title')).toBeVisible();
  await expect(page.locator('.venue-card')).toHaveCount(4);
  await expect(page.locator('.kp-site-preloader, .kp-route-pulse')).toHaveCount(0);
  expect(state.writes).toEqual([]);
});

test('closed owner drawer is inert and dismissal restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await openFixture(page, 'dashboard');
  const menu = page.locator('#host-mobile-navigation');
  const trigger = page.getByRole('button', { name: 'Main menu' });
  await expect(menu).toHaveAttribute('inert', '');
  await expect(menu).toHaveAttribute('aria-hidden', 'true');
  await trigger.click();
  await expect(menu).not.toHaveAttribute('inert', '');
  await expect(menu).toHaveAttribute('aria-hidden', 'false');
  await expect(menu).toBeVisible();
  await expect(menu.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('inert', '');
  await expect(trigger).toBeFocused();
  expect(state.writes).toEqual([]);
});

test('admin dashboard uses stable operational metrics', async ({ page }) => {
  const state = await openFixture(page, 'admin-dashboard', 'frontend-admin');
  await expect(page.locator('main').first()).toBeVisible();
  await expect(page.locator('.animate-cascade').filter({ has: page.locator('strong') })).toHaveCount(0);
  // Legacy dashboard entrances last up to 0.8s with 0.22s stagger. Measure
  // the settled state separately from their transient partial-opacity risk.
  await page.waitForTimeout(1200);
  const axe = await new AxeBuilder({ page }).include('main').analyze();
  expect(axe.violations).toEqual([]);
  expect(state.writes).toEqual([]);
});

test('Studio panel handoff survives rapid switches in short landscape', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const state = await openFixture(page, 'admin-template-edit', 'frontend-admin');
  const switches = page.locator('.studio-panel-switch button');
  await expect(switches).toHaveCount(2);
  await switches.nth(1).click();
  await switches.first().click();
  await switches.nth(1).click();
  await expect(page.locator('.studio-preview-panel')).toBeVisible();
  await switches.first().focus();
  await switches.first().press('Enter');
  await expect(page.locator('.studio-controls-scroll')).toBeVisible();
  expect(state.writes).toEqual([]);
});

test('shared invitation Skip opens content without a media gesture', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const state = await openFixture(page, 'template-demo', 'frontend-user', '/templates/koupreng-demo-wedding');
  const skip = page.locator('.tx-gate__skip');
  await expect(skip).toBeVisible();
  await expect(skip).toHaveCSS('min-height', '44px');
  await skip.click();
  await expect(page.locator('.tx-experience')).toBeVisible();
  await expect(page.locator('.tx-experience')).toBeFocused();
  expect(state.writes).toEqual([]);
});

test('payment status has no ambient route animation', async ({ page }) => {
  const state = await openFixture(page, 'payment-status');
  await expect(page.locator('.kp-site-preloader')).toHaveCount(0);
  await expect(page.locator('main').first()).toBeVisible();
  expect(state.writes).toEqual([]);
});
