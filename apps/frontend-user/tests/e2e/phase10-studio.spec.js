import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';

test('touch pointer capture resizes and cancellation restores the saved layout', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native touch injection uses Chromium CDP; other engines cover pointer/keyboard and presets.');
  await phase9Fixtures(page); await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/app/events/101/invitation');
  const handle = page.getByRole('separator', { name: 'Editor and preview size' });
  await expect(handle).toHaveAttribute('aria-valuenow','60');
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  let box = await handle.boundingBox(); const point = { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + 120) };
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...point, x: point.x + 70 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(Number(await handle.getAttribute('aria-valuenow'))).toBeGreaterThan(60);
  const saved = await handle.getAttribute('aria-valuenow'); box = await handle.boundingBox();
  const next = { x: Math.round(box.x + box.width / 2), y: point.y };
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [next] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...next, x: next.x - 60 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(handle).toHaveAttribute('aria-valuenow',saved);
  await expect(page.locator('.pe-workspace-grid')).not.toHaveAttribute('data-resizing');
});

test('split dragging, presets, keyboard, reload and Guided mode retain the same preview', async ({ page }, info) => {
  const { events } = await phase9Fixtures(page);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/app/events/101/invitation');
  const frame = page.frameLocator('iframe'), handle = page.getByRole('separator', { name: 'Editor and preview size' });
  await expect(frame.locator('.kc-root')).toBeVisible();
  await frame.locator('body').evaluate(() => { window.phase10ResizeIdentity = 'retained'; });
  await page.getByRole('tab', { name: 'Full invitation', exact: true }).click();
  await expect(frame.locator('.kc-main')).toHaveAttribute('aria-hidden', 'false');
  await page.getByLabel('Preview zoom', { exact: true }).selectOption('75');
  const title = page.getByRole('textbox', { name: 'Main Title', exact: true });
  await title.fill('Phase 10 authored title');
  const before = await page.locator('.pe-editor-column').boundingBox();
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 100);
  await page.mouse.down(); await page.mouse.move(box.x + 90, box.y + 100, { steps: 8 }); await page.mouse.up();
  expect((await page.locator('.pe-editor-column').boundingBox()).width).toBeGreaterThan(before.width);
  expect(await frame.locator('body').evaluate(() => window.phase10ResizeIdentity)).toBe('retained');
  await expect(frame.locator('.kc-main')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.getByLabel('Preview zoom', { exact: true })).toHaveValue('75');
  await handle.focus(); await handle.press('Home');
  expect(Number(await handle.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(Number(await handle.getAttribute('aria-valuemin')) - 1);
  await handle.press('End'); await handle.press('ArrowLeft');
  for (const [preset, value] of [['70',70], ['50',50], ['40',40], ['60',60]]) {
    await page.getByRole('combobox', { name: 'Workspace layout', exact: true }).selectOption(preset);
    await expect(handle).toHaveAttribute('aria-valuenow', String(value));
    if (info.project.name === 'chromium') { await fs.mkdir('../../docs/phase10/evidence/after', { recursive: true }); await page.screenshot({ path: `../../docs/phase10/evidence/after/studio-preset-${preset}.png` }); }
  }
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(events.get(101).title).toBe('Phase 10 authored title');
  await page.reload(); await expect(handle).toHaveAttribute('aria-valuenow', '60');
  await expect(title).toHaveValue('Phase 10 authored title');
  await page.getByRole('button', { name: 'Guided creation', exact: true }).click();
  await page.getByRole('combobox', { name: 'Workspace layout', exact: true }).selectOption('70');
  await expect(handle).toHaveAttribute('aria-valuenow', '70');
  const results = await new AxeBuilder({ page }).include('.studio-splitter').include('.studio-split-controls').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await info.attach('split-axe', { body: JSON.stringify(results), contentType: 'application/json' });
  expect(results.violations).toEqual([]);
});

test('click-to-edit uses the authenticated frame channel and ignores forged messages', async ({ page }) => {
  await phase9Fixtures(page); await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/app/events/101/invitation');
  const frame = page.frameLocator('iframe'); await expect(frame.locator('.kc-root')).toBeVisible();
  await page.getByRole('button', { name: 'Click to edit', exact: true }).click();
  await page.getByRole('tab', { name: 'Full invitation', exact: true }).click();
  await expect(frame.locator('html')).toHaveAttribute('data-studio-click-edit', '');
  await frame.locator('.kc-family h3').first().click();
  await expect(page.locator('[data-studio-tab="eventInformation"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-studio-section="family"] input').first()).toBeFocused();
  await page.evaluate(() => window.postMessage({ type: 'EDIT_STUDIO_SECTION', sessionId: 'forged-preview-session-1234567890', sectionKey: 'gallery' }, location.origin));
  await expect(page.locator('[data-studio-tab="eventInformation"]')).toHaveAttribute('aria-current', 'page');
});

test('all tabs reflow in both languages through the complete viewport matrix', async ({ page }, info) => {
  test.setTimeout(240000);
  await fs.mkdir('../../docs/phase10/evidence/after', { recursive: true });
  for (const lang of ['en','kh']) {
    await phase9Fixtures(page, { lang });
    for (const width of [320,375,390,430,768,1024,1366,1440,1920]) {
      await page.setViewportSize({ width, height: 960 }); await page.goto('/app/events/101/invitation');
      for (const tab of ['eventInformation','scheduleVenue','mediaOpening','designCover','guestExperience','ticketsQr']) {
        await chooseStudioSection(page, tab);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
        if (width < 1024) await expect(page.getByRole('separator')).toHaveCount(0);
        if (info.project.name === 'chromium' && [390,1440].includes(width)) await page.screenshot({ path: `../../docs/phase10/evidence/after/studio-${tab}-${lang}-${width}.png` });
      }
    }
  }
});

test('motion and font choices survive save/reload and reach the real preview DOM', async ({ page }) => {
  const { events } = await phase9Fixtures(page); await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/app/events/101/invitation?section=appearance');
  await page.getByRole('combobox', { name: 'Khmer heading', exact: true }).selectOption('Battambang');
  await page.getByRole('combobox', { name: 'Garden motion', exact: true }).selectOption('minimal');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase','saved');
  expect(JSON.parse(events.get(101).contentJson)).toMatchObject({ fontKhmer: 'Battambang', studioStyle: { motion: 'minimal' } });
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Khmer heading', exact: true })).toHaveValue('Battambang');
  await expect(page.frameLocator('iframe').locator('.kc-root')).toHaveAttribute('data-motion','minimal');
  await expect(page.frameLocator('iframe').locator('.kc-root')).toHaveCSS('--kc-khmer-display', '"Battambang", "Noto Sans Khmer", serif');
});
