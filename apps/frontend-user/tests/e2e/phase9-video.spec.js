import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { phase9Fixtures } from './support/phase9Fixtures';

for (const code of ['khmer-celestial', 'garden-royal-khmer-wedding', 'silk-heritage', 'the-digital-yes-wedding', 'emerald-canva-luxe-wedding', 'khmer-royal-lotus', 'khmer-golden-canva-inspired-wedding', 'withjoy-modern-portal', 'bliss-editorial-wedding', 'event-essential']) {
  test(`optional cinematic stage preserves ${code} and permits immediate keyboard dismissal`, async ({ page }, info) => {
    const state = await phase9Fixtures(page, { code });
    state.events.set(101, { ...state.events.get(101), cinematicOpening: { enabled: true, videoMediaId: 400 }, status: 'PUBLISHED' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    let mediaLoads = 0;
    // Keep loading pending long enough to verify Skip independently of codecs/network speed.
    await page.route('**/cinematic-content', async route => { mediaLoads++; await new Promise(resolve => setTimeout(resolve, 1500)); return route.abort(); });
    await page.goto('/i/review-celestial');
    expect(mediaLoads).toBe(0);
    const open = page.getByRole('button', { name: /Open invitation|View invitation details|Open Invitation|បើកសំបុត្រ|Tap seal|ចុចបើក|បើកធៀប|ចុចទីនេះដើម្បីមើលព័ត៌មានលម្អិត/ }).first();
    await open.focus(); await open.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Pre-wedding video', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Skip video', exact: true }).last()).toBeVisible();
    await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0);
    expect(mediaLoads).toBe(1);
    if (info.project.name === 'chromium' && code === 'khmer-celestial') await page.screenshot({ path: '../../docs/phase9/evidence/after/video-skipped-en-1440.png', fullPage: true });
  });
}

test('real browser video is muted, supports sound, ended/error recovery and scoped axe checks', async ({ page }, info) => {
  await page.addInitScript(() => {
    window.phase9CodecErrors = [];
    document.addEventListener('error', event => {
      if (event.target instanceof HTMLVideoElement && event.target.error) window.phase9CodecErrors.push({ code: event.target.error.code, message: event.target.error.message });
    }, true);
  });
  const state = await phase9Fixtures(page);
  state.events.set(101, { ...state.events.get(101), cinematicOpening: { enabled: true, videoMediaId: 400 }, status: 'PUBLISHED' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/i/review-celestial');
  const open = page.getByRole('button', { name: /Open invitation|បើកសំបុត្រ/ }).first(); await open.focus(); await open.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Pre-wedding video', exact: true });
  await expect.poll(() => page.evaluate(() => {
    if (window.phase9CodecErrors.length) return 'codec-error';
    return document.querySelector('.cinematic-stage-dialog video')?.readyState >= 2 ? 'ready' : 'loading';
  }), { timeout: 10000 }).not.toBe('loading');
  const failures = await page.evaluate(() => window.phase9CodecErrors);
  if (failures.length) {
    expect(info.project.name).toBe('webkit');
    expect(failures.some(failure => [3,4].includes(failure.code))).toBe(true);
    await info.attach('unsupported-codec.json', { body: JSON.stringify(failures), contentType: 'application/json' });
    info.annotations.push({ type: 'codec limitation', description: 'Bundled WebKit reported an unsupported/undecodable MP4; normal invitation recovery verified. MP4 playback was not verified in this engine.' });
    await expect(page.locator('.kc-invitation')).toBeVisible();
    await expect(dialog).toHaveCount(0);
    return;
  }
  await expect(dialog).toBeVisible();
  expect(await dialog.locator('video').evaluate(video => video.muted)).toBe(true);
  await dialog.getByRole('button', { name: 'Enable sound' }).click();
  expect(await dialog.locator('video').evaluate(video => video.muted)).toBe(false);
  const axe = await new AxeBuilder({ page }).include('.cinematic-stage-dialog').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await info.attach('cinematic-axe.json', { body: JSON.stringify(axe), contentType: 'application/json' }); expect(axe.violations).toEqual([]);
  if (info.project.name === 'chromium') await page.screenshot({ path: '../../docs/phase9/evidence/after/video-playing-en-1440.png' });
  await dialog.locator('video').evaluate(video => video.dispatchEvent(new Event('ended')));
  await expect(dialog).toHaveCount(0);
});

test('reduced motion bypasses cinematic media entirely', async ({ page }) => {
  const state = await phase9Fixtures(page);
  state.events.set(101, { ...state.events.get(101), cinematicOpening: { enabled: true, videoMediaId: 400 }, status: 'PUBLISHED' });
  const requests = []; page.on('request', request => { if (request.url().endsWith('cinematic-content')) requests.push(request.url()); });
  await page.goto('/i/review-celestial');
  await page.getByRole('button', { name: /Open invitation|បើកសំបុត្រ/ }).first().click();
  await expect(page.locator('.kc-invitation')).toBeVisible();
  expect(requests).toEqual([]);
});
