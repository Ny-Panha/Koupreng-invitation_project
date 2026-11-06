import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { phase8Fixtures, phase8Content } from './support/phase8Fixtures';
import { phase9Fixtures } from './support/phase9Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';

const song = '/music/Noly%20Record%20-%20wedding-Song.mp3';

test('actual transparent ornament and MP3 play only on the opening gesture and survive scenes', async ({ page }) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  const trackResponse = await page.request.get(song);
  expect(trackResponse.status()).toBe(200);
  expect(trackResponse.headers()['content-type']).toContain('audio/mpeg');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  const audio = page.locator('audio');
  await expect(audio).toHaveCount(1);
  await expect(audio).toHaveAttribute('src', song);
  expect(await audio.evaluate(node => node.paused && node.currentTime === 0 && node.preload === 'none')).toBe(true);
  const frame = page.locator('.kfg-monogram-art');
  await frame.evaluate(node => node.decode());
  await page.evaluate(() => document.fonts.ready);
  expect(await frame.evaluate(node => {
    const canvas = document.createElement('canvas'); canvas.width = node.naturalWidth; canvas.height = node.naturalHeight;
    const context = canvas.getContext('2d'); context.drawImage(node, 0, 0);
    return { center: context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data[3], corner: context.getImageData(0, 0, 1, 1).data[3], square: node.naturalWidth === node.naturalHeight };
  })).toEqual({ center: 0, corner: 0, square: true });
  const stairs = page.locator('.kfg-monogram-staircase > span');
  await expect(stairs).toHaveText(['វីរៈ', '&', 'សុមាលី']);
  const rows = await stairs.evaluateAll(nodes => nodes.map(node => {
    const range = document.createRange(); range.selectNodeContents(node);
    const rect = range.getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y };
  }));
  expect(rows[0].y).toBeLessThan(rows[1].y); expect(rows[1].y).toBeLessThan(rows[2].y);
  expect(rows[0].x).toBeLessThan(rows[1].x); expect(rows[1].x).toBeLessThan(rows[2].x);
  await audio.evaluate(node => { window.floralV5Audio = node; });
  const opener = page.locator('.kfg-open');
  await opener.focus(); await opener.press('Enter');
  await expect(page.locator('.kfg-music')).toHaveAttribute('data-music-status', 'playing');
  await expect(page.locator('.kfg-welcome-scene')).toBeVisible();
  await expect.poll(() => audio.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  const first = await audio.evaluate(node => ({ time: node.currentTime, duration: node.duration, volume: node.volume, loop: node.loop }));
  expect(first.time).toBeGreaterThan(0);
  expect(first.duration).toBeGreaterThan(213); expect(first.duration).toBeLessThan(215);
  expect(first.volume).toBe(.5); expect(first.loop).toBe(true);
  await expect(page.locator('.kfg-content')).toBeVisible();
  await page.locator('.kfg-language select').selectOption('km');
  await page.locator('.kfg-footer').scrollIntoViewIfNeeded();
  expect(await audio.evaluate(node => node === window.floralV5Audio && node.currentTime > 3 && !node.paused)).toBe(true);
  await page.locator('.kfg-music').click();
  await expect(page.locator('.kfg-music')).toHaveAttribute('data-music-status', 'paused');
  const pausedAt = await audio.evaluate(node => node.currentTime);
  await page.locator('.kfg-music').click();
  await expect(page.locator('.kfg-music')).toHaveAttribute('data-music-status', 'playing');
  expect(await audio.evaluate(node => node.currentTime)).toBeGreaterThanOrEqual(pausedAt);
  await expect(audio).toHaveCount(1);
  await page.goto('/templates');
  expect(await page.evaluate(() => window.floralV5Audio?.paused ?? true)).toBe(true);
});

test('the template listing shows the actual opening cover instead of the old SVG mockup', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.goto('/templates');
  const card = page.locator('.kp-design-card[data-template="khmer-floral-gold"]');
  const image = card.locator('.kp-design-media > img');
  await expect(image).toHaveAttribute('src', '/templates/khmer-floral-gold/cover-preview-640.webp');
  await image.evaluate(node => node.decode());
  expect(await image.evaluate(node => node.naturalWidth > 0)).toBe(true);
  if (info.project.name === 'chromium') {
    await mkdir('../../docs/design/khmer-floral-gold/screenshots/v5', { recursive: true });
    await card.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/catalog-card.png' });
  }
});

test('Studio saves, refreshes, previews and publishes Regal settings and the chosen library song', async ({ page }) => {
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.route('**/api/v1/invitations/101/publish', async route => {
    state.events.set(101, { ...state.events.get(101), status: 'PUBLISHED' });
    await route.fulfill({ json: { data: state.events.get(101) } });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page, 'designCover', 'Invitation styles');
  const editor = page.locator('.studio-invitation-styles');
  await editor.getByRole('radio', { name: 'Oval', exact: true }).check();
  await editor.getByLabel('Initials', { exact: true }).fill('B & V');
  await editor.getByRole('radio', { name: 'Regal Scroll Gold', exact: true }).check();
  await expect(editor.getByLabel('Initials', { exact: true })).toHaveValue('B & V');
  await editor.getByLabel('Frame size', { exact: true }).fill('1.1');
  await editor.getByLabel('Center text size', { exact: true }).fill('30');
  await editor.getByLabel('Frame opacity', { exact: true }).fill('0.85');
  await editor.getByLabel('Frame vertical offset', { exact: true }).fill('6');
  await editor.getByRole('combobox', { name: 'Gold treatment', exact: true }).selectOption('champagne');
  await chooseStudioSection(page, 'mediaOpening', 'Music');
  await page.getByRole('button', { name: 'Change track', exact: true }).click();
  await page.getByRole('button', { name: /Noly Record - Wedding Song/ }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  let saved = JSON.parse(state.events.get(101).contentJson);
  expect(saved.invitationStyleV1).toMatchObject({ monogram: 'regal-scroll-gold', monogramSize: 1.1, monogramTextSize: 30, monogramOpacity: .85, monogramOffset: 6, monogramTreatment: 'champagne' });
  expect(saved.monogramText).toBe('B & V'); expect(saved.musicUrl).toBe(song);
  await page.reload();
  await chooseStudioSection(page, 'designCover', 'Invitation styles');
  await expect(editor.getByRole('radio', { name: 'Regal Scroll Gold' })).toBeChecked();
  await expect(editor.getByLabel('Frame size', { exact: true })).toHaveValue('1.1');
  if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
  const phone = page.frameLocator('iframe[title="Live User Template Preview"]');
  await expect(phone.locator('.kfg-invitation')).toBeVisible();
  await page.getByRole('tab', { name: 'Cover', exact: true }).click();
  await expect(phone.locator('.kfg-monogram')).toHaveAttribute('data-frame', 'regal-scroll-gold');
  await expect(phone.locator('.kfg-monogram')).toContainText('B & V');
  if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Return to editing', exact: true }).click();
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm publication', exact: true }).click();
  await expect.poll(() => state.events.get(101).status).toBe('PUBLISHED');
  await page.goto('/i/review-celestial');
  await expect(page.locator('.kfg-monogram')).toHaveAttribute('data-frame', 'regal-scroll-gold');
  await expect(page.locator('.kfg-monogram')).toContainText('B & V');
  await expect(page.locator('audio')).toHaveAttribute('src', song);
  saved = JSON.parse(state.events.get(101).contentJson);
  expect(saved.futureExtension).toEqual(phase8Content.futureExtension);
});

for (const [name, selected] of [['No Music', { musicTrackId: 'none', musicUrl: '' }], ['missing owner song', {}], ['owner song', { musicTrackId: 'custom', musicUrl: song }]]) test(`published invitation honors ${name}`, async ({ page }) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold', content: { ...phase8Content, ...selected, invitationStyleV1: { monogram: 'ornate', motion: 'none' } } });
  await page.goto('/i/review-celestial');
  await expect(page.locator('.kfg-monogram svg')).toBeVisible();
  await expect(page.locator('.kfg-monogram-art')).toHaveCount(0);
  await expect(page.locator('audio')).toHaveCount(selected.musicUrl ? 1 : 0);
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-content')).toBeVisible();
  if (selected.musicUrl) await expect(page.locator('audio')).toHaveAttribute('src', selected.musicUrl);
});

test('blocked music can be retried without blocking wedding details', async ({ page }) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let blocked = false;
    HTMLMediaElement.prototype.play = function () {
      if (this instanceof HTMLAudioElement && !blocked) { blocked = true; return Promise.reject(new DOMException('Blocked for QA', 'NotAllowedError')); }
      return play.call(this);
    };
  });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-content')).toBeVisible();
  await expect(page.locator('.kfg-audio-error')).toBeVisible();
  await expect(page.locator('.kfg-music')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('.kfg-music').click();
  await expect(page.locator('.kfg-music')).toHaveAttribute('data-music-status', 'playing');
  await expect(page.locator('.kfg-audio-error')).toHaveCount(0);
});

test('Premium film remains muted while one selected wedding song continues', async ({ page }, info) => {
  await page.addInitScript(() => {
    window.floralV5VideoEvents = [];
    for (const type of ['playing', 'error']) document.addEventListener(type, event => {
      if (event.target instanceof HTMLVideoElement) window.floralV5VideoEvents.push({ type, muted: event.target.muted, code: event.target.error?.code });
    }, true);
  });
  const state = await phase9Fixtures(page, { code: 'khmer-floral-gold', content: { ...phase8Content, musicUrl: song } });
  state.events.set(101, { ...state.events.get(101), cinematicOpening: { enabled: true, videoMediaId: 400 }, status: 'PUBLISHED' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/i/review-celestial');
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-music')).toHaveAttribute('data-music-status', 'playing');
  await expect(page.locator('.kfg-content')).toBeVisible();
  const dialog = page.getByRole('dialog', { name: 'Pre-wedding video', exact: true });
  await expect.poll(() => page.evaluate(() => window.floralV5VideoEvents.length)).toBeGreaterThan(0);
  const events = await page.evaluate(() => window.floralV5VideoEvents);
  if (events.some(event => event.type === 'playing')) expect(events.filter(event => event.type === 'playing').every(event => event.muted)).toBe(true);
  else {
    expect(info.project.name).toBe('webkit');
    expect(events.some(event => [3, 4].includes(event.code))).toBe(true);
    info.annotations.push({ type: 'codec limitation', description: 'Bundled Windows WebKit rejected the MP4 fixture; error recovery and continuing MP3 verified.' });
  }
  if (await dialog.count()) {
    await page.keyboard.press('Escape');
  }
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('audio')).toHaveCount(1);
  expect(await page.locator('audio').evaluate(node => !node.paused && node.currentTime > 2)).toBe(true);
});

test('long Khmer names fit the transparent center on a narrow cover', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold', lang: 'kh', content: { ...phase8Content, invitationStyleV1: { monogramMode: 'names', monogramSize: .8, monogramTextSize: 48, motion: 'none' } } });
  state.events.set(101, { ...state.events.get(101), groomName: 'សុវណ្ណវិសាល សិរីមង្គល', brideName: 'សុភមង្គល បុប្ផារាជសិរី' });
  await page.goto('/i/review-celestial');
  await page.evaluate(() => document.fonts.ready);
  const text = page.locator('.kfg-monogram > span');
  await expect(text).toContainText('&');
  expect(await text.evaluate(node => node.firstElementChild.scrollHeight <= node.clientHeight + 1 && node.firstElementChild.scrollWidth <= node.clientWidth + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-content')).toBeVisible();
});

test('reduced motion, data saving and hidden documents suppress decorative work', async ({ page }) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-content')).toBeVisible();
  await expect(page.locator('.kfg-welcome-scene')).toHaveCount(0);
  await expect(page.locator('[data-scroll-reveal]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const connection = new EventTarget(); connection.saveData = true;
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
  });
  await page.reload();
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-low-power', 'true');
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-content')).toBeVisible();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-page-hidden', 'true');
  await expect(page.locator('.kfg-petals')).toBeHidden();
});

test('details sections fade into view on scroll and stay revealed on return', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-content')).toBeVisible();
  const map = page.locator('.kfg-content > [data-section-key="map"]');
  await expect(map).toHaveAttribute('data-scroll-reveal', 'pending');
  await expect(map).toHaveCSS('opacity', '0');
  await map.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(map).toHaveAttribute('data-scroll-reveal', 'visible');
  await expect(map).toHaveCSS('opacity', '1');
  await expect(map).toHaveCSS('transition-duration', '0.65s, 0.65s');
  if (info.project.name === 'chromium') {
    await map.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/details-map.png' });
    await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/details-background.png' });
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(map).toHaveAttribute('data-scroll-reveal', 'visible');
});

test('downloaded raster effects span the full background and persist through every scene', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  const layer = page.locator('.kfg-ambience');
  const paper = page.locator('.kfg-paper-art');
  const expectBorderInViewport = async () => {
    await expect(paper).toHaveCSS('position', 'fixed');
    const bounds = await paper.boundingBox();
    expect(Math.abs(bounds.y)).toBeLessThan(1);
    expect(Math.abs(bounds.height - page.viewportSize().height)).toBeLessThan(1);
  };
  await expectBorderInViewport();
  await expect(layer).toBeVisible();
  await expect(layer).toHaveCSS('pointer-events', 'none');
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  await expect(layer.locator('img')).toHaveCount(17);
  await expect(layer.locator('.kfg-ambient-butterfly')).toHaveCount(4);
  await expect(layer.locator('.kfg-lotus-rain')).toHaveAttribute('data-petal-count', '7');
  await expect(layer.locator('.kfg-lotus-petal')).toHaveCount(7);
  await expect(layer.locator('.kfg-lotus-petal').first()).toHaveCSS('animation-name', 'kfg-lotus-rainfall');
  const flight = await layer.locator('.kfg-lotus-petal').first().evaluate(node => {
    const animation = node.getAnimations()[0];
    animation.pause(); animation.currentTime = 5000;
    const start = node.getBoundingClientRect();
    animation.currentTime = 16000;
    const end = node.getBoundingClientRect();
    animation.play();
    return { dx: end.x + end.width / 2 - start.x - start.width / 2, dy: end.y - start.y };
  });
  expect(Math.abs(flight.dx)).toBeLessThan(1); expect(flight.dy).toBeGreaterThan(200);
  expect(await page.locator('.kfg-paper-art').evaluate(node => getComputedStyle(node, '::before').backgroundImage)).toContain('blush-floral-border-top.webp');
  expect(await page.locator('.kfg-paper-art').evaluate(node => getComputedStyle(node, '::after').backgroundImage)).toContain('blush-floral-border-bottom.webp');
  expect(await layer.locator('.kfg-ambient-butterfly img').evaluateAll(images => images.map(image => image.src.split('/').at(-1)).sort())).toEqual(['blue-butterfly.webp', 'golden-butterfly.webp', 'pink-butterfly.webp', 'violet-butterfly.webp']);
  await expect(layer.locator('svg,canvas')).toHaveCount(0);
  await layer.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  const spread = await layer.locator('.kfg-ambient-particle').evaluateAll(nodes => nodes.map(node => parseFloat(node.style.getPropertyValue('--ambient-x'))));
  expect(Math.min(...spread)).toBeLessThan(15); expect(Math.max(...spread)).toBeGreaterThan(85);
  expect(spread.some(x => x > 40 && x < 60)).toBe(true);
  await expect(layer.locator('[data-zone=center] > img').first()).toHaveCSS('opacity', '0.3');
  expect(await layer.evaluate(node => Number(getComputedStyle(node).zIndex) < Number(getComputedStyle(document.querySelector('.kfg-opening')).zIndex))).toBe(true);
  await layer.evaluate(node => { window.floralV5Ambience = node; });
  if (info.project.name === 'chromium') await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/animated-cover.png' });
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-welcome-scene')).toBeVisible();
  await expectBorderInViewport();
  if (info.project.name === 'chromium') {
    await expect(page.locator('.kfg-welcome-scene')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/welcome-background.png' });
  }
  expect(await layer.evaluate(node => node === window.floralV5Ambience)).toBe(true);
  await expect(page.locator('.kfg-content')).toBeVisible();
  await page.locator('.kfg-footer').evaluate(node => node.scrollIntoView({ behavior: 'instant' }));
  await expectBorderInViewport();
  await expect(layer).toBeVisible();
  expect(await layer.evaluate(node => node === window.floralV5Ambience)).toBe(true);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(layer.locator('.kfg-ambient-butterfly').first()).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer).toBeHidden();
  await expect(layer.locator('img')).toHaveCount(0);
});
