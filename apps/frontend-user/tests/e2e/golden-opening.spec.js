import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';

const code = 'royal-garden-cinematic', artwork = '/templates/royal-garden/golden-calligraphy.webp';
const image = '/templates/silk-heritage/portrait.webp', second = '/templates/silk-heritage/together.webp';
const evidence = '../../docs/design/royal-garden-golden-opening/evidence';
async function setup(page, intro = {}) {
  const state = await phase9Fixtures(page, { code, content: { title: 'Our fictional celebration', messageText: 'Please celebrate with our families.', cinematicIntro: { duration: 2, slides: [{ id: 'first', src: image, alt: 'First portrait', x: 50, y: 50 }, { id: 'second', src: second, alt: 'Second portrait', x: 50, y: 50 }], ...intro }, photos: [], schedule: [] } });
  state.events.set(101, { ...state.events.get(101), designJson: '{}', groomName: 'First fictional partner', brideName: 'Second fictional partner', hostName: 'First fictional partner', partnerName: 'Second fictional partner', enabledSections: JSON.stringify({ gallery: false, schedule: false, countdown: false, rsvp: true, gift: false }) });
  const uploads = [];
  await page.route('**/api/v1/invitations/101/media/gallery', async route => { uploads.push(route.request().postDataBuffer()?.length || 0); return route.fulfill({ json: { data: [{ id: 501 + uploads.length, fileUrl: uploads.length === 1 ? image : second, mediaType: 'GALLERY_IMAGE', mimeType: 'image/webp' }] } }); });
  await page.route('**/api/v1/invitations/101/publish', route => { state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' }); return route.fulfill({ json: { data: state.events.get(101) } }); });
  return { ...state, uploads };
}
async function studio(page) {
  await page.goto('/app/events/101/invitation'); await expect(page.locator('.invitation-studio')).toBeVisible();
  await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
  await chooseStudioSection(page, 'mediaOpening', 'Cinematic intro');
}
async function save(page) { await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved'); }
async function capture(page, name, info) {
  if (['chromium', 'mobile-chromium'].includes(info.project.name)) {
    // Playwright's JS clock does not advance the compositor's CSS timeline.
    // Sample deterministic animation poses without changing the scene timer.
    await page.evaluate(name => {
      const times = { 'rg-gold-reveal': 2200, 'rg-pattern-reveal': 2200, 'rg-butterfly-float': 2500, 'rg-gold-sweep': name.includes('lettering') ? 1100 : 2200, 'rg-gold-recede': 1200, 'rg-portrait-arrival': 1200, 'rg-title-in': 1800, 'rg-ken-burns': 1000 };
      for (const animation of document.getAnimations()) {
        if (Object.hasOwn(times, animation.animationName)) { animation.pause(); animation.currentTime = times[animation.animationName]; }
        else if (animation.transitionProperty) animation.finish();
      }
    }, name);
    if (name.endsWith('-names')) { await page.clock.runFor(32); await expect(page.locator('.rg-calligraphy-copy')).toHaveCSS('opacity', '1'); }
    await fs.mkdir(evidence, { recursive: true }); await page.screenshot({ path: `${evidence}/${info.project.name}-${name}.png`, style: name.endsWith('-names') ? '.rg-calligraphy-copy { animation: none !important; opacity: 1 !important; transform: none !important; }' : undefined });
  }
}
function contrast(a, b) {
  const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
  const luminance = color => color.map(v => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const x = luminance(rgb(a)), y = luminance(rgb(b)); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
for (const palette of ['ivory-royal', 'emerald-gold', 'burgundy-romance']) test(`${palette}: independent artwork, reveal, readable text and portrait handoff`, async ({ page }, info) => {
  await setup(page, { palette }); await page.clock.install(); await page.goto('/i/review-celestial');
  const art = page.locator('.rg-calligraphy-image'); await expect(art).toBeVisible(); await expect(art).toHaveJSProperty('complete', true);
  await expect(page.locator('.public-ticket-button')).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  expect(await art.evaluate(node => getComputedStyle(node).objectFit)).toBe('contain');
  await page.clock.runFor(2000); await capture(page, `${palette}-cover`, info);
  const colors = await page.locator('.rg-open').evaluate(node => ({ color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor })); expect(contrast(colors.color, colors.background)).toBeGreaterThanOrEqual(4.5);
  await page.locator('.rg-open').click(); await page.clock.runFor(1800); await capture(page, `${palette}-lettering`, info);
  await page.clock.runFor(600); await expect(page.locator('[data-scene=TITLE_REVEAL]')).toBeVisible(); await page.clock.runFor(1200);
  await expect(page.locator('.rg-intro-portrait[data-active=true]')).toHaveAttribute('src', image);
  await expect(page.locator('.rg-calligraphy-copy')).toContainText('First fictional partner');
  await expect(page.locator('.rg-calligraphy-copy')).toContainText('Second fictional partner');
  const copyColors = await page.locator('.rg-calligraphy-copy h1').evaluate(node => ({ color: getComputedStyle(node).color, background: getComputedStyle(node.closest('.rg-intro')).getPropertyValue('--rg-opening-bg').trim() }));
  const rgbBackground = await page.evaluate(color => { const probe = document.createElement('span'); probe.style.color = color; document.body.append(probe); const result = getComputedStyle(probe).color; probe.remove(); return result; }, copyColors.background); expect(contrast(copyColors.color, rgbBackground)).toBeGreaterThanOrEqual(4.5);
  await capture(page, `${palette}-names`, info); await page.clock.runFor(3000);
  await expect(page.locator('[data-scene=PHOTO_SLIDESHOW]')).toBeVisible();
  await expect(page.locator('.rg-calligraphy-image')).toHaveCount(0); await expect(page.locator('.rg-save-date-overlay > span')).toHaveCount(0);
  await expect(page.locator('.rg-save-date-overlay')).toContainText('First fictional partner'); await capture(page, `${palette}-portrait`, info);
  await page.clock.runFor(4700); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await expect(page.locator('.public-ticket-button')).toBeVisible();
});

test('owner artwork upload, replacement, clear and default restore survive save/reload and public rendering', async ({ page }, info) => {
  const { events, uploads } = await setup(page); await studio(page);
  await page.getByLabel('Upload opening artwork').setInputFiles('public/templates/royal-garden/golden-calligraphy-960.webp');
  await expect(page.locator('.studio-opening-artwork-preview')).toHaveAttribute('src', /^data:image\/webp/);
  await page.getByLabel('Artwork description').fill('Our golden artwork'); await page.getByLabel('Opening palette').selectOption('emerald-gold');
  await page.getByLabel('Artwork scale').fill('0.85'); await page.getByLabel('Artwork position').selectOption('upper'); await page.getByLabel('Opening animation').selectOption('shimmer');
  await save(page); expect(uploads).toHaveLength(1);
  let saved = JSON.parse(events.get(101).contentJson).cinematicIntro;
  expect(saved).toMatchObject({ artworkSrc: image, artworkAlt: 'Our golden artwork', artworkScale: .85, artworkPosition: 'upper', palette: 'emerald-gold', animationPreset: 'shimmer' }); expect(saved.slides.map(slide => slide.id)).toEqual(['first', 'second']);
  await page.reload(); await chooseStudioSection(page, 'mediaOpening', 'Cinematic intro'); await expect(page.locator('.studio-opening-artwork-preview')).toHaveAttribute('src', image);
  await page.getByLabel('Upload opening artwork').setInputFiles('public/templates/silk-heritage/together.webp'); await expect(page.locator('.studio-opening-artwork-preview')).toHaveAttribute('src', /^data:/); await save(page); expect(uploads).toHaveLength(2);
  await page.goto('/i/review-celestial'); await expect(page.locator('.rg-calligraphy-image')).toHaveAttribute('src', second); await expect(page.locator('.rg-intro')).toHaveAttribute('data-palette', 'emerald-gold');
  await studio(page); await page.getByRole('button', { name: 'Remove opening artwork', exact: true }).click(); await save(page);
  saved = JSON.parse(events.get(101).contentJson).cinematicIntro; expect(saved.artworkSrc).toBe(''); expect(saved.slides).toHaveLength(2);
  await page.reload(); await chooseStudioSection(page, 'mediaOpening', 'Cinematic intro'); await expect(page.locator('.studio-opening-artwork-preview')).toHaveCount(0);
  await page.goto('/i/review-celestial'); await expect(page.locator('.rg-calligraphy-image')).toHaveCount(0); await expect(page.locator('.rg-open')).toBeVisible();
  await studio(page); await page.getByRole('button', { name: 'Use default golden artwork', exact: true }).click(); await save(page);
  await page.getByRole('button', { name: 'Publish', exact: true }).click(); await page.getByRole('button', { name: 'Confirm publication', exact: true }).click(); await expect.poll(() => events.get(101).status).toBe('PUBLISHED');
  await page.goto('/i/review-celestial'); await expect(page.locator('.rg-calligraphy-image')).toHaveAttribute('src', artwork);
  await capture(page, 'restored-default', info);
});

test('keyboard skip, reduced motion, stable live preview and responsive canvas', async ({ page }, info) => {
  await setup(page); await page.clock.install(); await page.goto('/i/review-celestial');
  await page.locator('.rg-open').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.rg-intro-controls button').last()).toBeFocused(); await page.keyboard.press('Enter'); await page.clock.runFor(30000);
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.reload(); await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.clock.resume(); await page.setViewportSize({ width: 1440, height: 960 }); await studio(page);
  const frame = page.frameLocator('iframe'); const identity = page.locator('iframe'); await identity.evaluate(node => { node.dataset.goldenIdentity = 'retained'; });
  await page.getByLabel('Opening palette').selectOption('burgundy-romance');
  await page.getByRole('tab', { name: 'Cover', exact: true }).click();
  await expect(frame.locator('.rg-intro')).toHaveAttribute('data-palette', 'burgundy-romance'); await expect(identity).toHaveAttribute('data-golden-identity', 'retained');
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true); }
  const axe = await new AxeBuilder({ page }).include('.studio-intro-editor').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(axe.violations).toEqual([]);
  await capture(page, 'studio-artwork', info);
  await page.getByLabel('Opening palette').scrollIntoViewIfNeeded(); await capture(page, 'studio-controls', info);
});

test('controlled oval and golden comparisons preserve owner cover media', async ({ page }, info) => {
  const { events } = await setup(page, { style: 'oval' });
  await page.clock.install(); await page.goto('/i/review-celestial'); await page.clock.runFor(2000); await capture(page, 'comparison-oval', info);
  const content = JSON.parse(events.get(101).contentJson); content.cinematicIntro.style = 'golden-calligraphy'; content.coverBackgroundImage = second;
  events.set(101, { ...events.get(101), contentJson: JSON.stringify(content), designJson: JSON.stringify({ coverBackgroundImage: second }) });
  await page.reload(); await page.clock.runFor(2000); await expect(page.locator('.rg-calligraphy-image')).toHaveAttribute('src', artwork);
  await expect(page.locator('.cover-bg-root img')).toHaveAttribute('src', second); await capture(page, 'comparison-golden', info);
});

test('owner video remains a muted background and reduced motion uses its poster', async ({ page }) => {
  const { events } = await setup(page);
  const video = '/invitations/khmer-celestial/burgundy-bokeh.mp4';
  events.set(101, { ...events.get(101), designJson: JSON.stringify({ openingVideoUrl: video }) });
  await page.goto('/i/review-celestial');
  await expect(page.locator('.cover-bg-root video')).toHaveAttribute('src', video);
  await expect(page.locator('.cover-bg-root video')).toHaveJSProperty('muted', true);
  await expect(page.locator('.rg-calligraphy-image')).toHaveAttribute('src', artwork);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.reload();
  await expect(page.locator('.cover-bg-root video')).toHaveCount(0);
  await expect(page.locator('.cover-bg-root img')).toBeVisible();
  await expect(page.locator('.rg-calligraphy-image')).toHaveAttribute('src', artwork);
});

test('large artwork leaves room for Skip and text on short and narrow screens', async ({ page }) => {
  await setup(page, { artworkScale: 1.2, artworkPosition: 'upper' }); await page.clock.install();
  for (const viewport of [{ width: 1280, height: 540 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport); await page.goto('/i/review-celestial');
    await page.locator('.rg-open').click(); await page.clock.runFor(3600);
    await page.evaluate(() => { for (const animation of document.getAnimations()) if (animation.transitionProperty) animation.finish(); });
    const art = await page.locator('.rg-golden-artwork').boundingBox(), skip = await page.locator('.rg-intro-controls').boundingBox(), copy = await page.locator('.rg-calligraphy-copy').boundingBox();
    expect(art.y).toBeGreaterThan(skip.y + skip.height); expect(art.y + art.height).toBeLessThan(copy.y);
  }
});

test('real-time title reveal paints editable names without a mocked animation clock', async ({ page }, info) => {
  await setup(page); await page.goto('/i/review-celestial'); await page.locator('.rg-open').click();
  await expect(page.locator('[data-scene=TITLE_REVEAL]')).toBeVisible();
  await expect(page.locator('.rg-calligraphy-copy')).toHaveCSS('opacity', '1');
  await expect(page.locator('.rg-calligraphy-copy h1')).toHaveText('First fictional partner & Second fictional partner');
  if (['chromium', 'mobile-chromium'].includes(info.project.name)) await page.screenshot({ path: `${evidence}/${info.project.name}-natural-names.png` });
});
