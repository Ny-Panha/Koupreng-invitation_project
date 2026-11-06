import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { phase8Fixtures, phase8Content } from './support/phase8Fixtures';

test.use({ viewport: { width: 512, height: 896 }, video: { mode: 'on', size: { width: 512, height: 896 } } });
test('records opening, natural scroll and keyboard gallery interaction with frame timing', async ({ page }, info) => {
  await phase8Fixtures(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const sample = { frames: [], longTasksMs: [], active: true };
    window.__floralOpeningTiming = sample;
    let previous = performance.now();
    function frame(now) {
      if (!sample.active) return;
      sample.frames.push(now - previous); previous = now;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      sample.observer = new PerformanceObserver(list => sample.longTasksMs.push(...list.getEntries().map(entry => entry.duration)));
      sample.observer.observe({ type: 'longtask' });
    }
  });
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-invitation')).toHaveClass(/is-opening/);
  await expect(page.locator('.kfg-welcome-scene')).toBeVisible();
  await expect.poll(() => page.locator('.kfg-welcome-scene').evaluate(node => Number(getComputedStyle(node).opacity))).toBeGreaterThan(.98);
  if (info.project.name === 'desktop-chromium') await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v2/welcome-512.png' });
  await expect(page.locator('.kfg-content')).toBeVisible();
  await expect(page.locator('.kfg-content > section').first()).toHaveAttribute('data-section-key', 'family');
  const openingTiming = await page.evaluate(() => {
    const sample = window.__floralOpeningTiming; sample.active = false; sample.observer?.disconnect();
    const sorted = sample.frames.slice(1).sort((a, b) => a - b);
    return { samples: sorted.length, medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.floor(sorted.length * .95)], maxMs: sorted.at(-1), longTasksMs: sample.longTasksMs, context: 'Headless Chromium, 512x896, cover release and welcome fade. Browser frame intervals under this test workload, not physical-device FPS.' };
  });
  const timing = await page.evaluate(async () => {
    const deltas = [];
    let previous = performance.now();
    await new Promise(resolve => {
      function frame(now) { deltas.push(now - previous); previous = now; if (deltas.length < 120) requestAnimationFrame(frame); else resolve(); }
      requestAnimationFrame(frame);
    });
    const sorted = deltas.slice(1).sort((a, b) => a - b);
    return { samples: sorted.length, medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.floor(sorted.length * .95)], maxMs: sorted.at(-1), context: 'Headless Chromium, 512x896, idle invitation after opening; not a physical-device FPS certification.' };
  });
  if (info.project.name === 'desktop-chromium') await writeFile('../../docs/design/khmer-floral-gold/FRAME_TIMING_V2.json', JSON.stringify({ opening: openingTiming, idle: timing }, null, 2));
  for (const key of ['family', 'countdown', 'schedule', 'map', 'gallery']) {
    await page.locator(`[data-section-key="${key}"]`).evaluate(async node => {
      node.scrollIntoView({ behavior: 'smooth' });
      await new Promise(resolve => {
        let previous = scrollY, stable = 0;
        function settled() {
          stable = Math.abs(scrollY - previous) < .5 ? stable + 1 : 0; previous = scrollY;
          if (stable >= 8) resolve(); else requestAnimationFrame(settled);
        }
        requestAnimationFrame(settled);
      });
    });
    await expect(page.locator(`[data-section-key="${key}"]`)).toBeInViewport();
  }
  await page.getByRole('button', { name: 'Open photograph 1', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Wedding photo viewer' })).toBeVisible();
  // Hold the viewer briefly so the exported recording can be inspected.
  await page.waitForTimeout(700);
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('Escape');
  await expect(page.locator('.kfg-slide')).toBeFocused();
  await page.locator('[data-section-key="rsvp"]').scrollIntoViewIfNeeded();
  await expect(page.getByRole('navigation', { name: 'Invitation sections' })).toBeVisible();
});

test('Premium Floral plays protected bytes muted, skips, replays and recovers on media error', async ({ page }, info) => {
  await page.addInitScript(() => {
    window.floralCodecErrors = [];
    document.addEventListener('error', event => {
      if (event.target instanceof HTMLVideoElement && event.target.error) window.floralCodecErrors.push(event.target.error.code);
    }, true);
  });
  const { phase9Fixtures } = await import('./support/phase9Fixtures');
  const state = await phase9Fixtures(page, { code: 'khmer-floral-gold', content: phase8Content });
  state.events.set(101, { ...state.events.get(101), cinematicOpening: { enabled: true, videoMediaId: 400 }, status: 'PUBLISHED' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/i/review-celestial');
  await page.locator('.kfg-open').click();
  const dialog = page.getByRole('dialog', { name: 'Pre-wedding video', exact: true });
  await expect.poll(() => page.evaluate(() => window.floralCodecErrors.length ? 'codec-error' : document.querySelector('.cinematic-stage-dialog video')?.readyState >= 2 ? 'ready' : 'loading'), { timeout: 15000, intervals: [100, 250] }).not.toBe('loading');
  const codecErrors = await page.evaluate(() => window.floralCodecErrors);
  if (codecErrors.length) {
    expect(info.project.name).toBe('webkit');
    expect(codecErrors.some(code => [3, 4].includes(code))).toBe(true);
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('.kfg-content')).toBeVisible();
    info.annotations.push({ type: 'codec limitation', description: 'Bundled WebKit cannot decode this MP4 fixture; usable invitation recovery verified, MP4 playback not verified.' });
    return;
  }
  expect(await dialog.locator('video').evaluate(video => video.muted)).toBe(true);
  await expect(dialog.getByRole('button', { name: 'Enable sound' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'Replay video', exact: true }).click();
  await expect(dialog.locator('video')).toBeVisible();
  await dialog.locator('video').evaluate(video => video.dispatchEvent(new Event('error')));
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.kfg-content')).toBeVisible();
});

test.describe('welcome scene across reference widths', () => {
  for (const width of [360, 390, 430, 512, 768, 1024, 1440]) test(`welcome fades and reaches family details at ${width}px`, async ({ page }, info) => {
    await phase8Fixtures(page);
    await page.setViewportSize({ width, height: 896 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/templates/khmer-floral-gold/demo');
    await page.locator('.kfg-open').click();
    await expect(page.locator('.kfg-welcome-scene')).toBeVisible();
    await expect.poll(() => page.locator('.kfg-welcome-scene').evaluate(node => Number(getComputedStyle(node).opacity))).toBeGreaterThan(.98);
    if (info.project.name === 'desktop-chromium') await page.screenshot({ path: `../../docs/design/khmer-floral-gold/screenshots/v2/welcome-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'រំលង', exact: true }).click();
    await expect(page.locator('.kfg-content > section').first()).toHaveAttribute('data-section-key', 'family');
    await expect(page.locator('.kfg-family h2')).toHaveText('យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ');
  });
});
