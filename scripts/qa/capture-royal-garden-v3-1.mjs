import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

const phase = process.argv[2] || 'after', out = `docs/design/royal-garden-v3-1/evidence/${phase}`;
await mkdir(out, { recursive: true });
const browser = await chromium.launch(), records = [];
try {
  for (const [width, height] of [[320,568],[375,667],[390,844],[430,932],[600,800],[768,1024],[834,1194],[1024,768],[1280,800],[1440,900],[1920,1080],[834,600],[600,360]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.route('**/api/v1/**', route => route.fulfill({ json: { data: [] } }));
    const entry = { viewport: { width, height }, scenes: {} };
    async function snap(scene) {
      await page.evaluate(() => document.fonts.ready);
      await page.locator('img').evaluateAll(images => Promise.all(images.filter(img => img.loading !== 'lazy').map(img => img.decode().catch(() => {}))));
      await page.evaluate(() => document.getAnimations().filter(a => Number.isFinite(a.effect?.getTiming().iterations)).forEach(a => a.finish()));
      entry.scenes[scene] = await page.evaluate(() => Object.fromEntries(['.rg-entrance-stage','.rg-open','.rg-royal-guest','.rg-video-section','.rg-video-monogram','.rg-video-calligraphy','.rg-video-date','.rg-content-scroll','.rg-information-background','#rg-closing','.rg-footer'].map(sel => {
        const node = document.querySelector(sel); if (!node) return [sel, null];
        const b = node.getBoundingClientRect(), s = getComputedStyle(node);
        return [sel, { x:b.x,y:b.y,width:b.width,height:b.height,fontSize:s.fontSize,lineHeight:s.lineHeight,overflow:s.overflow }];
      })));
      await page.screenshot({ path: `${out}/${width}x${height}-${scene}.jpg`, type: 'jpeg', quality: 92, animations: 'disabled' });
    }
    await page.goto(`${process.env.ROYAL_PREVIEW_URL || 'http://127.0.0.1:4186'}/templates/royal-garden-cinematic?lang=km`);
    await page.locator('.rg-open').waitFor(); await snap('cover');
    await page.locator('.rg-open').click(); await page.waitForFunction(() => document.querySelector('.cinematic-inline-stage video')?.currentTime > 0);
      await page.locator('.cinematic-inline-stage video').evaluate(async node => { node.pause(); await new Promise(resolve => { node.addEventListener('seeked', resolve, { once:true }); node.currentTime=.5; }); await node.play(); });
    await snap('video-km');
    await page.locator('.rg-language select').selectOption('en'); await snap('video-en');
    await page.locator('.cinematic-playback-actions > button').click(); await page.locator('[data-stage=CONTENT]').waitFor();
    await page.locator('.rg-language select').selectOption('km');
    await page.locator('.rg-content-scroll').evaluate(node => node.scrollTo({top:0,behavior:'instant'})); await snap('information');
    for (const section of ['venue','closing']) { await page.locator(`#rg-${section}`).evaluate(node => node.scrollIntoView({behavior:'instant'})); await snap(section); }
    await page.locator('.rg-content-scroll').evaluate(node => node.scrollTo({top:node.scrollHeight,behavior:'instant'})); await snap('ending');
    records.push(entry); await page.close();
  }
  await writeFile(`${out}/geometry.json`,JSON.stringify({browser:browser.version(),phase,records},null,2));
  console.log(`Captured ${records.length * 7} actual browser views; film seeked to 0.5s and resumed for playing-state screenshots.`);
} finally { await browser.close(); }
