import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { phase9Fixtures } from './support/phase9Fixtures';

const output = path.resolve('../../output/phase13-codex-revalidation', process.env.PHASE13_RUN || 'final');
async function start(page, { lang = 'en', dark = false, viewport = { width: 1440, height: 900 } } = {}) {
  const state = await phase9Fixtures(page, { lang, content: { title: 'Authored fixture', messageText: 'Authored message', photos: [], storyChapters: [], schedule: [], party: [], faq: [], future: { preserve: [null, false, 'ខ្មែរ'] } } });
  await page.addInitScript(({ dark }) => localStorage.setItem('koupreng.colorMode', dark ? 'dark' : 'light'), { dark });
  await page.setViewportSize(viewport);
  await page.goto('/app/events/101/invitation');
  await expect(page.locator('.studio-toolbar')).toBeVisible();
  await expect(page.locator('[name="title"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return state;
}
async function capture(page, name, info) {
  await fs.mkdir(output, { recursive: true });
  const prefix = `${name}-${info.project.name}`;
  await page.screenshot({ path: path.join(output, prefix + '.png') });
  const geometry = await page.evaluate(() => {
    const box = selector => { const e = document.querySelector(selector); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
      lang: document.documentElement.lang, colorMode: document.documentElement.dataset.colorMode,
      toolbar: box('.studio-toolbar'), workflow: box('.studio-workflow-bar'), sections: box('.studio-sections'), field: box('[name="title"]'),
      editor: box('.pe-editor-scroll-body'), preview: box('.pe-preview-column') };
  });
  await fs.writeFile(path.join(output, prefix + '.json'), JSON.stringify(geometry, null, 2));
  return geometry;
}

for (const [width, height] of [[1920,1080],[1440,900],[1280,900],[1024,768],[844,390],[768,1024],[393,851],[375,812],[320,568]]) {
  test(`N13-15/16 responsive ${width}x${height}`, async ({ page }, info) => {
    await start(page, { viewport: { width, height } });
    const geometry = await capture(page, `layout-${width}x${height}`, info);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(width + 1);
    const title = page.locator('[name="title"]');
    await title.scrollIntoViewIfNeeded(); await title.fill(`Edited at ${width}`);
    await expect(title).toBeInViewport();
    await expect(page.locator('.pe-save-main-btn')).toBeInViewport();
    await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}

for (const lang of ['en', 'km']) for (const dark of [false, true]) {
  test(`loaded contrast ${lang} ${dark ? 'dark' : 'light'}`, async ({ page }, info) => {
    await start(page, { lang, dark });
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', dark ? 'dark' : 'light');
    await capture(page, `locale-${lang}-${dark ? 'dark' : 'light'}`, info);
    const result = await new AxeBuilder({ page }).include('.invitation-studio').include('#invitation-studio-toolbar')
      .withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    await fs.writeFile(path.join(output, `axe-${lang}-${dark}-${info.project.name}.json`), JSON.stringify({ violations: result.violations, incomplete: result.incomplete, passes: result.passes.map(r => r.id) }, null, 2));
    expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  });
}

test('N13-08/32 edit preview save reload uses fixture server acknowledgement and preserves future JSON', async ({ page }, info) => {
  const state = await start(page);
  const title = page.locator('[name="title"]');
  await title.fill('Saved authoring journey');
  await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('.pe-save-main-btn').click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(state.writes.length).toBeGreaterThan(0);
  expect(JSON.parse(state.events.get(101).contentJson).future).toEqual({ preserve: [null, false, 'ខ្មែរ'] });
  await page.reload();
  await expect(page.locator('[name="title"]')).toHaveValue('Saved authoring journey');
  await capture(page, 'save-reload', info);
});

test('N13-04/12 failure preserves text, explicit retry acknowledges the fixture server', async ({ page }, info) => {
  await start(page);
  let fail = true;
  await page.route('**/api/v1/invitations/101', route => route.request().method() === 'PUT' && fail
    ? route.fulfill({ status: 503, json: { message: 'Fixture service unavailable' } }) : route.fallback());
  await page.locator('[name="title"]').fill('Keep my unsaved text');
  await page.locator('.pe-save-main-btn').click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'failed');
  await expect(page.locator('[name="title"]')).toHaveValue('Keep my unsaved text');
  await capture(page, 'save-failed', info);
  fail = false;
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
});

test('N13-13 native text undo and section keyboard ownership', async ({ page }) => {
  await start(page);
  const title = page.locator('[name="title"]');
  await title.focus(); await page.keyboard.press('End'); await page.keyboard.type(' typed');
  await page.keyboard.press('Control+z');
  await expect(title).not.toHaveValue(/ typed$/);
  const first = page.locator('[data-studio-tab]').first();
  await first.focus(); await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-studio-tab="scheduleVenue"]')).toBeFocused();
  await expect(page.locator('[data-studio-tab="scheduleVenue"]')).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Home'); await expect(first).toBeFocused();
});

test('N13-17 chooser and preview dialogs open and return focus', async ({ page }, info) => {
  await start(page);
  const template = page.locator('.studio-template-button');
  await template.click(); await expect(page.getByRole('dialog', { name: 'Change template' })).toBeVisible();
  await capture(page, 'chooser', info);
  await page.keyboard.press('Escape'); await expect(template).toBeFocused();
  const preview = page.getByRole('button', { name: 'Preview invitation', exact: true });
  await preview.click(); await expect(page.getByRole('dialog')).toBeVisible();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Desktop', exact: true }).click();
  await expect.poll(() => dialog.locator('iframe').evaluate(frame => frame.contentWindow.innerWidth)).toBe(1200);
  await dialog.getByRole('button', { name: 'Phone preview', exact: true }).click();
  await dialog.getByLabel('Preview zoom', { exact: true }).selectOption('75');
  await expect.poll(() => dialog.locator('iframe').evaluate(frame => frame.contentWindow.innerWidth)).toBe(440);
  await page.keyboard.press('Escape'); await expect(preview).toBeFocused();
});

test('N13-14 actual pointer cancellation restores split ARIA and stored preference', async ({ page }) => {
  await start(page);
  const split = page.getByRole('separator');
  const original = await split.getAttribute('aria-valuenow');
  const box = await split.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.down(); await page.mouse.move(box.x + 80, box.y + 40);
  await split.dispatchEvent('pointercancel'); await page.mouse.up();
  await expect(split).toHaveAttribute('aria-valuenow', original);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('koupreng.studio.split.v1')))).toBe(Number(original));
});

for (const [status, phase] of [[401,'expired'],[403,'denied'],[409,'conflict'],[503,'failed']]) {
  test(`N13-04 HTTP ${status} retains edits with ${phase} status`, async ({ page }, info) => {
    await start(page);
    await page.route('**/api/v1/invitations/101', route => route.request().method() === 'PUT'
      ? route.fulfill({ status, json: { message: `Fixture HTTP ${status}` } }) : route.fallback());
    await page.locator('[name="title"]').fill(`Unacknowledged ${status}`);
    // Autosave may already have reached a blocking response before a pointer
    // action is scheduled. The shortcut exercises the same save command and
    // remains a safe no-op once that response has suspended further writes.
    await page.keyboard.press('Control+s');
    await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', phase);
    await expect(page.locator('[name="title"]')).toHaveValue(`Unacknowledged ${status}`);
    if (status !== 503) await expect(page.locator('.pe-save-main-btn')).toBeDisabled();
    await capture(page, `http-${status}`, info);
  });
}

test('N13-12 offline save keeps dirty state and recovers on explicit retry', async ({ page, context }) => {
  await start(page);
  await page.locator('[name="title"]').fill('Offline authored text');
  await context.setOffline(true);
  await page.locator('.pe-save-main-btn').click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'offline');
  await expect(page.locator('[name="title"]')).toHaveValue('Offline authored text');
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
});

test('N13-03 revoked grant disables real editing controls without losing text', async ({ page }) => {
  await start(page);
  await page.locator('[name="title"]').fill('Preserved after revocation');
  await page.route('**/api/v1/invitations/101/access', route => route.fulfill({ json: { data: { owner: false, permissions: ['VIEW_EVENT'], ownerFeatures: [] } } }));
  await page.evaluate(() => window.dispatchEvent(new Event('koupreng:access-refresh')));
  await expect(page.locator('.pe-save-main-btn')).toBeDisabled();
  await expect(page.locator('[name="title"]')).toBeDisabled();
  await expect(page.locator('[name="title"]')).toHaveValue('Preserved after revocation');
});

test('N13-23/33/34 composition, forced colors and narrow reflow retain controls', async ({ page }, info) => {
  await start(page, { viewport: { width: 320, height: 568 } });
  await page.emulateMedia({ forcedColors: 'active' });
  const title = page.locator('[name="title"]');
  await title.scrollIntoViewIfNeeded(); await title.focus();
  await title.dispatchEvent('compositionstart', { data: '' });
  await title.fill('សិរីមង្គល អាពាហ៍ពិពាហ៍ ២០២៧ / 2027');
  await title.dispatchEvent('compositionend', { data: 'សិរីមង្គល' });
  await expect(title).toHaveValue('សិរីមង្គល អាពាហ៍ពិពាហ៍ ២០២៧ / 2027');
  await expect(page.locator('.pe-save-main-btn')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Back to Event' })).toBeInViewport();
  await capture(page, 'forced-colors-320', info);
  // Geometry emulation checks the application branch, not a physical keyboard certification.
  await page.evaluate(() => {
    Object.defineProperties(window.visualViewport, { height: { configurable: true, value: innerHeight - 220 }, offsetTop: { configurable: true, value: 0 } });
    window.visualViewport.dispatchEvent(new Event('resize'));
  });
  await expect(page.locator('.studio-toolbar-actions')).toHaveAttribute('data-keyboard-open', 'true');
  await expect(page.locator('.pe-save-main-btn')).toBeVisible();
  expect(await page.locator('.studio-toolbar .studio-action').first().evaluate(e => getComputedStyle(e).transitionDuration)).toBe('0s');
});

test('N13-25 publish failure never announces publication or fabricates a link', async ({ page }, info) => {
  await start(page);
  let publishes = 0;
  await page.route('**/api/v1/invitations/101/publish', route => {
    publishes++; return route.fulfill({ status: 503, json: { message: 'Fixture publish not accepted' } });
  });
  await page.locator('[name="title"]').fill('Dirty before publication');
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Review publication' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirm publication', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Fixture publish not accepted');
  expect(publishes).toBe(1);
  await expect(page.locator('.studio-published-result')).toHaveCount(0);
  await capture(page, 'publish-failed', info);
});
