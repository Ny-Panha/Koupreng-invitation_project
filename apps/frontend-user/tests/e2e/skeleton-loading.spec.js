import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import process from 'node:process';
import { phase9Fixtures } from './support/phase9Fixtures';
import { installUxFixtures, uxPlans } from './support/uxFixtures';
import { installGuestDashboardFixtures } from './support/guestDashboardFixtures';
import { fixtureToken } from './support/fixtureToken';

const baseline = process.env.SKELETON_BASELINE === 'true';
const output = `../../output/skeleton-loading/${baseline ? 'before' : 'after'}`;
const widths = [320, 375, 390, 430, 768, 1024, 1366, 1440];
async function capture(page, name, info) {
  await fs.mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/${name}-${info.project.name}.png`, animations: 'disabled' });
}

test('responsive initial Studio loading and loaded evidence in both languages', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-chromium', 'Responsive matrix captured once');
  test.setTimeout(180000);
  await fs.mkdir(output, { recursive: true });
  for (const lang of ['en', 'kh']) {
    await phase9Fixtures(page, { lang });
    let release;
    let released = false;
    await page.route('**/api/v1/invitations/101', async route => {
      if (!released) await new Promise(resolve => { release = resolve; });
      await route.fallback();
    });
    await page.goto('/app/events/101/invitation', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => Boolean(release)).toBe(true);
    const loading = baseline ? page.locator('.event-workspace-loading') : page.locator('[data-loading-layout="studio"]');
    await expect(loading).toBeVisible();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: `${output}/studio-loading-${lang}-${width}.png`, animations: 'disabled' });
      if (!baseline && [390, 1440].includes(width)) await expect(loading).toHaveScreenshot(`studio-${lang}-${width}.png`, { animations: 'disabled' });
    }
    if (!baseline) {
      expect((await new AxeBuilder({ page }).include('[data-loading-layout="studio"]').analyze()).violations).toEqual([]);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      expect(await page.locator('.k-skeleton').first().evaluate(el => getComputedStyle(el, '::after').animationName)).toBe('none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    released = true; release();
    await expect(page.locator('.invitation-studio')).toBeVisible();
    await expect(page.frameLocator('iframe').locator('.kc-root')).toBeAttached();
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.screenshot({ path: `${output}/studio-loaded-${lang}-${width}.png`, animations: 'disabled' });
    }
    await page.unroute('**/api/v1/invitations/101');
  }
});

async function hold(page, pattern) {
  const releases = [];
  let released = false;
  await page.route(pattern, async route => {
    if (!released) await new Promise(resolve => releases.push(resolve));
    await route.fallback();
  });
  return () => { released = true; releases.forEach(resolve => resolve()); };
}

for (const empty of [false, true]) test(`events slow load resolves to ${empty ? 'empty action' : 'real cards'}`, async ({ page }, info) => {
  await phase9Fixtures(page);
  if (empty) await page.route('**/api/v1/invitations/my', route => route.fulfill({ json: { data: [] } }));
  const release = await hold(page, '**/api/v1/invitations/my');
  await page.goto('/app/events');
  await expect(page.locator('[data-loading-layout="event"]')).toBeVisible();
  expect((await new AxeBuilder({ page }).include('[data-loading-layout="event"]').analyze()).violations).toEqual([]);
  release();
  await expect(page.locator('[data-loading-layout="event"]')).toHaveCount(0);
  await expect(page.locator(empty ? '.events-empty-action' : '.event-card').first()).toBeVisible();
  await capture(page, empty ? 'events-empty' : 'events-loaded', info);
});

test('dashboard data resolves from shaped metrics without invented totals', async ({ page }) => {
  await phase9Fixtures(page);
  await page.route('**/api/v1/invitations/101/dashboard', route => route.fulfill({ json: { data: { totalGuests: 24, attending: 12, pending: 12 } } }));
  const release = await hold(page, '**/api/v1/invitations/101/dashboard');
  await page.goto('/app/events/101');
  await expect(page.locator('[data-loading-layout="dashboard"]')).toBeVisible();
  await expect(page.locator('.overview-metrics')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).include('[data-loading-layout="dashboard"]').analyze()).violations).toEqual([]);
  release();
  await expect(page.locator('.overview-metrics')).toContainText('24');
});

test('catalog delayed cards resolve and error retry has a finite result', async ({ page }, info) => {
  await phase9Fixtures(page);
  let fail = true;
  await page.route('**/api/v1/templates', route => fail ? route.fulfill({ status: 503, json: { message: 'Catalog unavailable' } }) : route.fallback());
  const release = await hold(page, '**/api/v1/templates');
  await page.goto('/templates/browse');
  await expect(page.locator('[data-loading-layout="template"]')).toBeVisible();
  release();
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
  await capture(page, 'catalog-error', info);
  fail = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator('.tb-card').first()).toBeVisible();
});

test('guests retain visible records and disable mutations while search is pending', async ({ page }, info) => {
  await phase9Fixtures(page);
  await installGuestDashboardFixtures(page, { guests: [{ id: 501, guestName: 'Verified guest', seatCount: 2 }] });
  await page.goto('/app/events/101/guests');
  await expect(page.locator('.guest-record-row')).toHaveCount(1);
  const release = await hold(page, '**/api/v1/invitations/101/guests/page?**');
  await page.locator('input[type="search"]').fill('Verified');
  await expect(page.locator('.guest-list-panel')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('.guest-record-row')).toContainText('Verified guest');
  await expect(page.locator('.k-skeleton-table')).toHaveCount(0);
  await capture(page, 'guests-refresh', info);
  release();
  await expect(page.locator('.guest-list-panel')).toHaveAttribute('aria-busy', 'false');
});

test('pricing waits for actual plans and entitlement failures block purchasing', async ({ page }, info) => {
  await installUxFixtures(page);
  await page.route('**/api/v1/me/entitlements', route => route.fulfill({ status: 503, json: { message: 'Entitlements unavailable' } }));
  const release = await hold(page, '**/api/v1/packages');
  await page.goto('/app/packages');
  await expect(page.locator('[data-loading-layout="pricing"]')).toBeVisible();
  await expect(page.locator('.pkg-card')).toHaveCount(0);
  release();
  await expect(page.locator('.pkg-card')).toHaveCount(uxPlans.length);
  await expect(page.getByRole('alert')).toContainText('Could not verify your plan');
  await expect(page.locator('.pkg-card button').first()).toBeDisabled();
  await capture(page, 'plan-verification-error', info);
});

for (const status of [403, 404]) test(`public invitation ${status} ends its ceremonial loading state`, async ({ page }) => {
  await phase9Fixtures(page);
  await page.route('**/api/v1/public/invitations/missing**', route => route.fulfill({ status, json: { message: 'Invitation unavailable' } }));
  const release = await hold(page, '**/api/v1/public/invitations/missing**');
  await page.goto('/w/missing');
  await expect(page.locator('[data-loading-layout="public"]').first()).toBeVisible();
  release();
  await expect(page.locator('[data-loading-layout="public"]')).toHaveCount(0);
  if (status === 404) await expect(page.getByRole('heading', { name: /Invitation unavailable/ })).toBeVisible();
  else await expect(page.locator('.public-state')).toBeVisible();
});

test('media image error retries locally and keeps the workspace', async ({ page }) => {
  await phase9Fixtures(page);
  await page.route('**/api/v1/invitations/101/media', route => route.fulfill({ json: { data: { galleryImages: [{ id: 9, fileUrl: '/missing-gallery.png', originalFilename: 'Review image' }] } } }));
  await page.route('**/missing-gallery.png', route => route.fulfill({ status: 404 }));
  await page.goto('/app/events/101/media');
  await page.getByRole('button', { name: 'Gallery', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry image' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry image' }).click();
  await expect(page.locator('.media-library h1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry image' })).toBeVisible();
});

test('Studio loading transition records CLS, CPU and completion latency', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-chromium', 'Chromium CDP measurement');
  await phase9Fixtures(page);
  const release = await hold(page, '**/api/v1/invitations/101');
  await page.goto('/app/events/101/invitation');
  await expect(page.locator('[data-loading-layout="studio"]')).toBeVisible();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const start = await cdp.send('Performance.getMetrics');
  await page.waitForTimeout(1000);
  const end = await cdp.send('Performance.getMetrics');
  await page.evaluate(() => {
    window.loadingCLS = 0;
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.loadingCLS += entry.value; }).observe({ type: 'layout-shift' });
  });
  const began = Date.now(); release();
  await expect(page.locator('.invitation-studio')).toBeVisible();
  const transitionMs = Date.now() - began;
  await page.waitForTimeout(300);
  const cls = await page.evaluate(() => window.loadingCLS);
  const metric = (data, name) => data.metrics.find(item => item.name === name)?.value || 0;
  const evidence = { cls, transitionMs, placeholderTaskMsPerSecond: 1000 * (metric(end, 'TaskDuration') - metric(start, 'TaskDuration')), domNodes: await page.locator('*').count() };
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(`${output}/performance.json`, JSON.stringify(evidence, null, 2));
  expect(cls).toBeLessThan(0.1);
  expect(transitionMs).toBeLessThan(5000);
});

test('admin dark dashboard releases summary before delayed receipts and supports reduced motion', async ({ page }, info) => {
  await page.addInitScript(token => {
    localStorage.setItem('koupreng.admin.auth', JSON.stringify({ accessToken: token, user: { id: 1, fullName: 'Review admin', role: 'SUPER_ADMIN' } }));
    localStorage.setItem('koupreng.admin.lang', 'en'); localStorage.setItem('theme', 'dark');
  }, fixtureToken);
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith('/summary') ? { totalUsers: 42, totalInvitations: 17, recentUsers: [], recentInvitations: [] }
      : path.endsWith('/revenue') ? { summary: { paidRevenueByCurrency: { USD: 79 } } } : { summary: {} };
    return route.fulfill({ json: { data } });
  });
  const release = await hold(page, '**/api/v1/admin/analytics/revenue');
  const releaseSummary = await hold(page, '**/api/v1/admin/dashboard/summary');
  await page.goto('http://127.0.0.1:4174/dashboard');
  await expect(page.locator('[data-loading-layout="dashboard"]')).toBeVisible();
  releaseSummary();
  await expect(page.getByText('42', { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-loading-layout="chart"]')).toBeVisible();
  expect((await new AxeBuilder({ page }).include('[data-loading-layout="chart"]').analyze()).violations).toEqual([]);
  await fs.mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/admin-dark-partial-${info.project.name}.png`, animations: 'disabled', fullPage: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.admin-skeleton-shape').first().evaluate(el => getComputedStyle(el, '::after').animationName)).toBe('none');
  release();
  await expect(page.locator('[data-loading-layout="chart"]')).toHaveCount(0);
  await expect(page.getByRole('table').first()).toContainText('USD');
});

test('admin table fails explicitly, retries, and retains verified records during another refresh', async ({ page }) => {
  await page.addInitScript(token => {
    localStorage.setItem('koupreng.admin.auth', JSON.stringify({ accessToken: token, user: { id: 1, role: 'SUPER_ADMIN' } }));
    localStorage.setItem('koupreng.admin.lang', 'en');
  }, fixtureToken);
  let fail = true;
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/users')) return fail ? route.fulfill({ status: 503, json: { message: 'Fixture unavailable' } }) : route.fulfill({ json: { data: [{ id: 7, fullName: 'Verified account', email: 'review@example.test', role: 'USER', active: true }] } });
    return route.fulfill({ json: { data: [] } });
  });
  const release = await hold(page, '**/api/v1/admin/users');
  await page.goto('http://127.0.0.1:4174/users');
  await expect(page.locator('[data-loading-layout="table"]')).toBeVisible();
  release();
  await expect(page.getByRole('alert')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('cell', { name: /Verified account/ })).toBeVisible();
});

test('payment refresh keeps pending verification until a trusted PAID response and creates no order', async ({ page }, info) => {
  await phase9Fixtures(page);
  let status = 'PENDING';
  const writes = [];
  await page.route('**/api/v1/template-payments/**', route => {
    if (route.request().method() !== 'GET') writes.push(route.request().method());
    return route.fulfill({ json: { data: { orderCode: 'LOADING-REVIEW', templateId: 4, templateName: 'Review design', packageName: 'Approved offer', status, amount: 37.50, currency: 'USD', paymentLink: 'https://pay.ababank.com/fixture', expiresAt: new Date(Date.now() + 600000).toISOString() } } });
  });
  const release = await hold(page, '**/api/v1/template-payments/LOADING-REVIEW');
  await page.goto('/payments/LOADING-REVIEW/status');
  await expect(page.locator('[data-loading-layout="form"]')).toBeVisible();
  release();
  await expect(page.locator('.payment-status-badge')).toHaveText('Awaiting verification');
  await capture(page, 'payment-pending', info);
  const releaseRefresh = await hold(page, '**/api/v1/template-payments/LOADING-REVIEW');
  await page.getByRole('button', { name: 'Check Status', exact: true }).click();
  await expect(page.locator('.payment-status-badge')).toHaveText('Awaiting verification');
  await expect(page.locator('[data-loading-layout]')).toHaveCount(0);
  status = 'PAID'; releaseRefresh();
  await expect(page.locator('.payment-status-badge')).toHaveText('Payment verified');
  await capture(page, 'payment-verified-fixture', info);
  expect(writes).toEqual([]);
});

test('QR waits for its real square image and resolves a forbidden response', async ({ page }, info) => {
  await phase9Fixtures(page);
  await page.route('**/api/v1/invitations/101/qr', route => route.fulfill({ status: 403, json: { message: 'Access denied', code: 'ACCESS_DENIED' } }));
  const release = await hold(page, '**/api/v1/invitations/101/qr');
  await page.goto('/app/events/101/qr');
  await expect(page.locator('.qr-skeleton-wrapper')).toBeVisible();
  await expect(page.locator('.qr-image')).toHaveCount(0);
  release();
  await expect(page.locator('.qr-skeleton-wrapper')).toHaveCount(0);
  await expect(page.locator('[data-feature-lock], [role="alert"]').first()).toBeVisible();
  await capture(page, 'qr-access-denied', info);
});
