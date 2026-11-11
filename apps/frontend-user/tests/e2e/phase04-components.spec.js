import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routeContracts, installRouteContractFixtures } from './support/batch12RouteContracts.js';

const adminOrigin = 'http://127.0.0.1:4174';

async function openFixture(page, group, application, mode = 'light') {
  const contract = routeContracts.find(row => row.group === group && row.application === application);
  if (!contract) throw new Error(`Missing fixture route: ${application}/${group}`);
  const state = await installRouteContractFixtures(page, contract, { lang: 'en' });
  await page.addInitScript(({ application, mode }) => {
    localStorage.setItem(application === 'frontend-admin' ? 'theme' : 'koupreng.colorMode', mode);
  }, { application, mode });
  if (group === 'admin-template-edit') {
    const template = { id: 30, code: 'event-essential', name: 'Phase 04 fixture template', status: 'ACTIVE', category: 'MINIMALIST', premium: false,
      description: JSON.stringify({ invitationTitle: 'Preview celebration', extension: { retained: true } }) };
    for (const pattern of ['**/api/v1/templates/slug/event-essential', '**/api/v1/templates/event-essential', '**/api/v1/templates/30', '**/api/v1/admin/templates/30']) {
      await page.route(pattern, route => route.request().method() === 'GET' ? route.fulfill({ json: { data: template } }) : route.fallback());
    }
  }
  await page.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname)
    ? route.fallback() : route.request().resourceType() === 'stylesheet'
      ? route.fulfill({ body: '', contentType: 'text/css' }) : route.abort());
  await page.goto((application === 'frontend-admin' ? adminOrigin : '') + contract.concreteUrl);
  return state;
}

test('organization member table is a named keyboard scroll region', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await openFixture(page, 'organization-detail', 'frontend-user');
  const region = page.getByRole('region', { name: 'Organization members table' });
  await expect(region).toBeVisible();
  await expect(region).toHaveAttribute('tabindex', '0');
  await region.focus();
  await expect(region).toBeFocused();
  const widths = await region.evaluate(element => ({ scroll: element.scrollWidth, view: element.clientWidth }));
  expect(widths.scroll).toBeGreaterThan(widths.view);
  await region.press('ArrowRight');
  await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  await expect(page.getByRole('table', { name: 'Organization members table' })).toBeVisible();
});

test('admin report refresh is an explicit button and does not mutate data', async ({ page }) => {
  const state = await openFixture(page, 'admin-reports', 'frontend-admin');
  const refresh = page.locator('.management-reports').getByRole('button', { name: 'Refresh' }).first();
  await expect(refresh).toBeVisible();
  await expect(refresh).toHaveAttribute('type', 'button');
  await refresh.click();
  expect(state.writes).toEqual([]);
});

test('Studio panel controls remain reachable with pointer and keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const state = await openFixture(page, 'admin-template-edit', 'frontend-admin');
  await expect(page.locator('.template-studio-toolbar')).toBeVisible();
  const switches = page.locator('.studio-panel-switch button');
  await expect(switches).toHaveCount(2);
  await switches.nth(1).click();
  await expect(page.locator('.studio-preview-panel')).toBeVisible();
  await switches.first().focus();
  await switches.first().press('Enter');
  await expect(page.locator('.studio-controls-scroll')).toBeVisible();
  expect(state.writes).toEqual([]);
});

test('RSVP kicker meets text contrast in the owner workspace', async ({ page }) => {
  await openFixture(page, 'rsvp', 'frontend-user');
  await expect(page.locator('.rsvp-kicker')).toBeVisible();
  const result = await new AxeBuilder({ page }).withRules(['color-contrast']).include('.rsvp-kicker').analyze();
  expect(result.violations).toEqual([]);
});

test('organization header and breadcrumb meet dark contrast', async ({ page }) => {
  await openFixture(page, 'organization-detail', 'frontend-user', 'dark');
  await expect(page.locator('.k-org-breadcrumb-active')).toBeVisible();
  const result = await new AxeBuilder({ page }).withRules(['color-contrast']).include('.k-org-breadcrumb-active, .k-org-header-tag').analyze();
  expect(result.violations).toEqual([]);
});
