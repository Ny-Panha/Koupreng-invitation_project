import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

// Catalog geometry evidence only. Protected media and persistence use the E2E
// fixtures in royal-garden-v3.spec.js, not this empty-catalog route fallback.
const out = process.env.ROYAL_EVIDENCE_DIR || 'docs/design/royal-garden-visual-repair/final-steering';
await mkdir(`${out}/evidence`, { recursive: true });
const browser = await chromium.launch();
const records = [];
const selectors = {
  cover: ['.rg-entrance-stage', '.rg-entrance-photo', '.rg-entrance-photo .cover-bg-root', '.rg-entrance-lettering', '.rg-entrance-names', '.rg-royal-guest', '.rg-guest-frame', '.rg-open'],
  video: ['.rg-video-section', '.cinematic-film-frame', '.cinematic-film-frame video', '.rg-video-monogram', '.rg-video-calligraphy', '.cinematic-playback-actions', '.cinematic-film-controls', '.cinematic-film-footer'],
  information: ['.rg-information-background', '.rg-content-scroll', '.rg-section--family', '#rg-family h2', '.rg-family', '.rg-section--invitation', '#rg-invitation .rg-copy', '.rg-ceremonial-monogram', '.rg-bottom-nav'],
};
try {
  for (const [width, height] of [[390, 844], [512, 900]]) for (const lang of ['km', 'en']) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.route('**/api/v1/**', route => route.fulfill({ json: { data: [] } }));
    const record = { viewport: { width, height }, language: lang, scenes: {} };
    const prefix = `final-${width}x${height}-${lang}`;
    async function capture(name, list) {
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.rg-royal-arch img,.rg-information-background img,.rg-entrance-photo img,.cinematic-film-footer img').evaluateAll(images => Promise.all(images.map(img => img.decode().catch(() => {}))));
      // Finish finite Web Animations before measuring; CSS screenshot handling
      // alone does not settle the section observer's native animate() reveal.
      await page.evaluate(() => document.getAnimations().filter(animation => Number.isFinite(animation.effect?.getTiming().iterations)).forEach(animation => animation.finish()));
      record.scenes[name] = await page.evaluate(sels => Object.fromEntries(sels.map(selector => {
        const element = document.querySelector(selector); if (!element) return [selector, null];
        const r = element.getBoundingClientRect(), s = getComputedStyle(element);
        return [selector, { x: r.x, y: r.y, width: r.width, height: r.height, xPercent: r.x / innerWidth * 100, yPercent: r.y / innerHeight * 100, widthPercent: r.width / innerWidth * 100, heightPercent: r.height / innerHeight * 100, zIndex: s.zIndex, fontSize: s.fontSize, lineHeight: s.lineHeight, objectFit: s.objectFit, overflow: s.overflow }];
      })), list);
      await page.screenshot({ path: `${out}/evidence/${prefix}-${name}.png`, animations: 'disabled' });
    }
    await page.goto(`${process.env.ROYAL_PREVIEW_URL || 'http://127.0.0.1:4186'}/templates/royal-garden-cinematic?lang=${lang}`);
    await page.locator('.rg-open').waitFor();
    await capture('cover', selectors.cover);
    await page.locator('.rg-open').click();
    await page.waitForFunction(() => document.querySelector('.cinematic-inline-stage video')?.currentTime > 0);
    await page.locator('.cinematic-inline-stage video').evaluate(async video => {
      video.pause();
      await new Promise(resolve => { video.addEventListener('seeked', resolve, { once: true }); video.currentTime = .5; });
    });
    await capture('video', selectors.video);
    await page.locator('.cinematic-playback-actions > button').click();
    await page.locator('[data-stage=CONTENT]').waitFor();
    await page.locator('.rg-content-scroll').evaluate(node => node.scrollTo({ top: 0, behavior: 'instant' }));
    await capture('information', selectors.information);
    await page.locator('#rg-venue').evaluate(node => node.scrollIntoView({ behavior: 'instant' }));
    await capture('information-scrolled', [...selectors.information, '#rg-venue']);
    await page.locator('.rg-content-scroll').evaluate(node => node.scrollTo({ top: node.scrollHeight, behavior: 'instant' }));
    await capture('ending', [...selectors.information, '.rg-footer']);
    records.push(record); await page.close();
  }
  await writeFile(`${out}/final-geometry.json`, JSON.stringify({ recordedAt: new Date().toISOString(), browser: browser.version(), description: 'Final production-preview catalog screenshots; controlled paused video at 0.5s; full frame and one inner scroller. Source-equivalent portrait canvas is 512x900.', records }, null, 2));
  console.log(`Captured ${records.length * 5} scenes and measured actual browser geometry.`);
} finally { await browser.close(); }
