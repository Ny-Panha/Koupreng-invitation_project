import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { phase8Fixtures } from './support/phase8Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';

const pass = process.env.FLORAL_V4_PASS || 'after';
const directory = `../../docs/design/khmer-floral-gold/screenshots/v4/${pass}`;
const widths = [360, 390, 430, 512, 768, 1024, 1440];

test('reference scenes at seven widths', async ({ page }, info) => {
  test.setTimeout(180000);
  test.skip(info.project.name !== 'chromium', 'One deterministic seven-width image set; interaction cases run in every browser.');
  await mkdir(directory, { recursive: true });
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const measurements = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 896 });
    await page.goto('/templates/khmer-floral-gold/demo?lang=en');
    await page.locator('.kfg-monogram').waitFor();
    await expect(page.locator('.kfg-open')).toHaveCSS('box-shadow', 'none');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/cover-${width}.png` });
    await page.locator('.kfg-open').click();
    await expect(page.locator('.kfg-content')).toBeVisible();
    for (const key of ['family', 'couplePhoto', 'countdown', 'schedule', 'map', 'gallery', 'closing', 'rsvp']) {
      const scene = page.locator(`.kfg-content > [data-section-key="${key}"]`);
      await scene.scrollIntoViewIfNeeded();
      await scene.evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.screenshot({ path: `${directory}/${key}-${width}.jpg`, type: 'jpeg', quality: 82 });
    }
    await page.screenshot({ path: `${directory}/details-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 72 });
    measurements.push(await page.evaluate(width => ({ width, canvas: document.querySelector('.kfg-invitation').getBoundingClientRect().width, overflow: document.documentElement.scrollWidth > innerWidth,
      clipped: [...document.querySelectorAll('.kfg-content :is(h2,h3,p)')].filter(n => n.clientWidth > 2 && n.scrollWidth > n.clientWidth + 3).map(n => n.textContent.slice(0, 80)) }), width));
  }
  await writeFile(`../../.cache/floral-v4/geometry-${pass}.json`, JSON.stringify(measurements, null, 2));
  expect(measurements.filter(row => row.overflow || row.clipped.length)).toEqual([]);
});

test('Studio previews render when scrolled into the actual editing viewport', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page, 'designCover', 'Invitation styles');
  const editor = page.locator('.studio-invitation-styles');
  await expect(editor.getByRole('radio', { name: 'Tear-off date', exact: true })).toBeAttached();
  if (info.project.name === 'chromium') {
    await mkdir(directory, { recursive: true });
    await editor.screenshot({ path: `${directory}/studio-element-capture.png` });
  }
  for (const title of ['Monogram frame', 'Guest frame', 'Date / calendar', 'Wedding program']) {
    const picker = editor.locator('fieldset').filter({ has: page.locator('legend', { hasText: title }) });
    await picker.scrollIntoViewIfNeeded();
    await expect(picker.locator('.studio-style-mini').first()).toBeVisible();
    const previews = await picker.locator('.studio-style-mini').evaluateAll(nodes => nodes.map(n => ({ text: n.textContent.trim(), geometry: Boolean(n.querySelector('svg,table,time')) })));
    expect(previews.every(preview => preview.text.length > 0 || preview.geometry)).toBe(true);
    if (info.project.name === 'chromium') await page.screenshot({ path: `${directory}/studio-${title.split(' ')[0].toLowerCase()}.png` });
  }
});

test('welcome at seven widths and measured opening frame intervals', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium', 'Deterministic visual/performance sample; engines are covered by motion regression cases.');
  test.setTimeout(120000);
  await mkdir(directory, { recursive: true });
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of widths) {
    await page.setViewportSize({ width, height: 896 });
    await page.goto('/templates/khmer-floral-gold/demo?lang=km');
    await expect(page.locator('.kfg-open')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${directory}/cover-km-${width}.png` });
    await page.evaluate(() => {
      const sample = { frames: [], longTasksMs: [], active: true };
      window.floralV4Timing = sample;
      let previous = performance.now();
      function frame(now) {
        if (!sample.active) return;
        sample.frames.push(now - previous); previous = now; requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
        sample.observer = new PerformanceObserver(list => sample.longTasksMs.push(...list.getEntries().map(entry => entry.duration)));
        sample.observer.observe({ type: 'longtask' });
      }
    });
    await page.locator('.kfg-open').click();
    const welcome = page.locator('.kfg-welcome-scene');
    await expect(welcome).toBeVisible();
    await expect.poll(() => welcome.evaluate(node => Number(getComputedStyle(node).opacity))).toBeGreaterThan(.98);
    await page.screenshot({ path: `${directory}/welcome-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 512) {
      await expect(page.locator('.kfg-content')).toBeVisible();
      const measurements = await page.evaluate(async () => {
        const sample = window.floralV4Timing; sample.active = false; sample.observer?.disconnect();
        const summarize = values => {
          const sorted = values.slice(1).sort((a, b) => a - b);
          return { samples: sorted.length, medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.floor(sorted.length * .95)], maxMs: sorted.at(-1) };
        };
        const opening = { ...summarize(sample.frames), longTasksMs: sample.longTasksMs };
        const deltas = []; let previous = performance.now();
        await new Promise(resolve => {
          function frame(now) { deltas.push(now - previous); previous = now; if (deltas.length < 120) requestAnimationFrame(frame); else resolve(); }
          requestAnimationFrame(frame);
        });
        return { opening, idle: summarize(deltas), context: 'Headless Chromium 512x896; same interval sampling method as V2. Includes welcome screenshot cost. Not physical-device FPS.' };
      });
      await writeFile('../../docs/design/khmer-floral-gold/FRAME_TIMING_V4.json', JSON.stringify(measurements, null, 2));
    }
  }
});
