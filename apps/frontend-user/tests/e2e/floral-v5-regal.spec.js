import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { phase8Fixtures, phase8Content } from './support/phase8Fixtures';
import { phase9Fixtures } from './support/phase9Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';

const song = '/music/Noly%20Record%20-%20wedding-Song.mp3';

test('cover content stays visible during entrance motion and an interrupted reload', async ({ page }) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const contentVisible = () => page.locator('.kfg-opening').evaluate(root => ['.kfg-monogram','h1','.kfg-guest','.kfg-open'].every(selector => {
    const node = root.querySelector(selector), box = node.getBoundingClientRect();
    let opacity = 1, parent = node;
    while (parent instanceof Element) { opacity *= Number(getComputedStyle(parent).opacity); parent = parent.parentElement; }
    return box.width > 0 && box.height > 0 && opacity >= .99;
  }));
  await page.goto('/templates/khmer-floral-gold/demo?lang=km');
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-effects','10');
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','false');
  expect(await contentVisible()).toBe(true);
  await page.reload();
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-effects','10');
  expect(await contentVisible()).toBe(true);
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','true');
  expect(await contentVisible()).toBe(true);
  expect(errors).toEqual([]);
});

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
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-stage','closed');
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','true');
  expect(await frame.evaluate(node => {
    const canvas = document.createElement('canvas'); canvas.width = node.naturalWidth; canvas.height = node.naturalHeight;
    const context = canvas.getContext('2d'); context.drawImage(node, 0, 0);
    return { center: context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data[3], corner: context.getImageData(0, 0, 1, 1).data[3], square: node.naturalWidth === node.naturalHeight };
  })).toEqual({ center: 0, corner: 0, square: true });
  const stairs = page.locator('.kfg-monogram-staircase > span');
  await expect(stairs).toHaveCount(3);
  await expect(stairs.nth(0)).toHaveText(/\S/);
  await expect(stairs.nth(1)).toHaveText('&');
  await expect(stairs.nth(2)).toHaveText(/\S/);
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

test('details start higher and the two-day agenda keeps a continuous road through every ceremony', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  await page.locator('.kfg-open').click();
  const content = page.locator('.kfg-content');
  await expect(content).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const heading = await content.locator('.kfg-section h2').first().boundingBox();
  expect(heading.y).toBeGreaterThan(80);
  expect(heading.y).toBeLessThan(160);
  const agenda = page.locator('.kfg-smooth-program');
  await expect(agenda.locator('.kp-program-day-title').first()).toContainText('Day 1');
  await expect(agenda.locator('.kp-program-day-title').nth(1)).toContainText('Day 2');
  await expect(agenda.locator('.kfg-program-road path')).toHaveCount(2);
  const roadError = () => agenda.evaluate(root => {
    const svg = root.querySelector('.kfg-program-road'), matrix = svg.getScreenCTM();
    let error = 0;
    root.querySelectorAll('.kp-program-day').forEach((day, index) => {
      const path = svg.querySelectorAll('path')[index], length = path.getTotalLength();
      day.querySelectorAll('.kp-curve-dot').forEach(dot => {
        const box = dot.getBoundingClientRect(), x = box.left + box.width / 2, y = box.top + box.height / 2;
        let nearest = Infinity;
        for (let sample = 0; sample <= 1000; sample++) {
          const point = path.getPointAtLength(length * sample / 1000).matrixTransform(matrix);
          nearest = Math.min(nearest, Math.hypot(point.x - x, point.y - y));
        }
        error = Math.max(error, nearest);
      });
    });
    return error;
  });
  await expect.poll(roadError).toBeLessThan(2);
  await page.locator('.kfg-language select').selectOption('km');
  await page.setViewportSize({ width: 360, height: 720 });
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(roadError).toBeLessThan(2);
  if (info.project.name === 'chromium') {
    await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/details-compact-top.png' });
    await agenda.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/agenda-two-days.png', style: '.kfg-toolbar,.guest-section-navigation { visibility: hidden !important; }' });
  }
});

test('the welcome fits responsive screens, holds seven seconds and puts Skip beside music', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [index, [width,height]] of [[360,640],[390,844],[1440,720],[320,568]].entries()) {
    await page.setViewportSize({ width, height });
    await page.goto('/templates/khmer-floral-gold/demo?lang=km');
    await page.locator('.kfg-open').click();
    const welcome = page.locator('.kfg-welcome-scene');
    await expect(welcome).toBeVisible();
    const start = Date.now();
    await expect(welcome).toHaveCSS('opacity','1');
    await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-stage','welcome');
    await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','true');
    await page.evaluate(() => document.fonts.ready);
    const heading = await welcome.locator('h2').boundingBox();
    expect(heading.y).toBeLessThan(120);
    await expect(welcome.locator('.kfg-continue')).toBeInViewport({ ratio: .999 });
    const continueBox = await welcome.locator('.kfg-continue').boundingBox();
    expect(continueBox.y).toBeGreaterThanOrEqual(0);
    expect(continueBox.y + continueBox.height).toBeLessThanOrEqual(height + 1);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const skip = await page.locator('.kfg-skip-welcome').boundingBox(), music = await page.locator('.kfg-music').boundingBox();
    expect(Math.abs(skip.y + skip.height / 2 - music.y - music.height / 2)).toBeLessThan(1);
    expect(music.x - skip.x - skip.width).toBeGreaterThanOrEqual(7.9);
    expect(music.x - skip.x - skip.width).toBeLessThan(10);
    if (index === 0) {
      await expect(welcome.locator('.kfg-welcome-compact-date')).toBeVisible();
      if (info.project.name === 'chromium') await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/welcome-responsive-640.png' });
      const remaining = 5100 - (Date.now() - start);
      if (remaining > 0) await page.waitForTimeout(remaining);
      await expect(welcome).toBeVisible();
      await expect(page.locator('.kfg-content')).toBeVisible();
      expect(Date.now() - start).toBeGreaterThanOrEqual(6500);
      expect(Date.now() - start).toBeLessThan(10000);
    }
  }
});

test('Rumduol artwork keeps personalized guest names readable and preserves other owner frame choices', async ({ page }, info) => {
  const guestName = 'លោក សុវណ្ណវិសាល និងលោកស្រី សុភមង្គល';
  const content = { ...phase8Content, guestName, invitationStyleV1: { motion: 'none', guestFrame: 'khmer' } };
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold', lang: 'kh', content });
  for (const width of [320,390,560]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/i/review-celestial');
    await page.evaluate(() => document.fonts.ready);
    const frame = page.locator('.kfg-guest-frame');
    await expect(frame).toHaveText(guestName);
    await expect(frame.locator('svg')).toHaveCount(0);
    const metrics = await frame.evaluate(node => {
      const rect = node.getBoundingClientRect(), text = node.firstElementChild.getBoundingClientRect();
      return { source: getComputedStyle(node).borderImageSource, fits: node.scrollWidth <= node.clientWidth && text.left >= rect.left + 39 && text.right <= rect.right - 39 };
    });
    expect(metrics.source).toContain('romduol-kbach-guest-frame.webp');
    expect(metrics.fits).toBe(true);
    await expect(page.getByRole('button', { name: 'សូមគោរពអញ្ចើញ', exact: true })).toBeInViewport({ ratio: .999 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  }
  const artwork = await page.evaluate(async () => Promise.all(['guest-frame','open-button'].map(async name => {
    const image = new Image(); image.src = `/templates/khmer-floral-gold/romduol-kbach-${name}.webp`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d'); context.drawImage(image,0,0);
    return { width: image.naturalWidth, center: context.getImageData(canvas.width / 2,canvas.height / 2,1,1).data[3] };
  })));
  expect(artwork[0].center).toBe(0); expect(artwork[1].center).toBeGreaterThanOrEqual(250);
  expect(artwork.every(asset => asset.width >= 2000)).toBe(true);
  if (info.project.name === 'chromium') await page.locator('.kfg-opening').screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/romduol-personalized-guest.png' });
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-family > h2 + .kfg-honored-guest')).toHaveText(guestName);
  await expect(page.locator('.kfg-family-intro')).toHaveText('ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ព្រមទាំងញាតិមិត្តរាប់អានទាំងឡាយ សូមអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធពរជ័យជូនកូនប្រុសកូនស្រីយើងខ្ញុំ ក្នុងកម្មវិធីមង្គលអាពាហ៍ពិពាហ៍ ដែលរៀបចំឡើងដោយក្តីរីករាយ។');
  state.events.set(101, { ...state.events.get(101), contentJson: JSON.stringify({ ...content, invitationStyleV1: { motion: 'none', guestFrame: 'minimal' } }) });
  await page.reload();
  await expect(page.locator('.kfg-guest-frame')).toHaveClass(/kfg-guest-frame--minimal/);
  await expect(page.locator('.kfg-guest-frame')).toHaveText(guestName);
  expect(await page.locator('.kfg-guest-frame').evaluate(node => getComputedStyle(node).borderImageSource)).toBe('none');
});

test('the saved wedding date uses a rose heart and native lossless petals remain fully opaque', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const state = await phase8Fixtures(page, { code: 'khmer-floral-gold', content: { ...phase8Content, invitationStyleV1: { motion: 'elegant' } } });
  state.events.set(101, { ...state.events.get(101), eventDate: '2027-12-09' });
  await page.goto('/i/review-celestial');
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','true');
  const petals = page.locator('.kfg-realistic-petal');
  await expect(petals).toHaveCount(12);
  await petals.evaluateAll(images => Promise.all(images.map(image => image.decode())));
  expect(await petals.evaluateAll(images => images.every(image => {
    let opacity = 1, node = image;
    while (node instanceof Element) { opacity *= Number(getComputedStyle(node).opacity); node = node.parentElement; }
    return opacity === 1 && image.naturalWidth >= 200;
  }))).toBe(true);
  const source = await petals.first().getAttribute('src'), response = await page.request.get(source);
  expect(String.fromCharCode(...(await response.body()).subarray(12,16))).toBe('VP8L');
  await page.locator('.kfg-open').click();
  const selected = page.locator('.kfg-welcome-scene .kp-calendar-event');
  await expect(selected).toBeVisible();
  await expect(selected).toHaveAttribute('datetime','2027-12-09');
  const marker = await selected.evaluate(node => ({ color: getComputedStyle(node,'::before').backgroundColor, shape: getComputedStyle(node,'::before').clipPath, outline: getComputedStyle(node).outlineStyle }));
  expect(marker.color).toBe('rgb(165, 78, 105)');
  expect(marker.shape).toContain('path(');
  expect(marker.outline).toBe('none');
});

test('realistic HD effects and floral borders frame scenes without crossing the content layer', async ({ page }, info) => {
  await phase8Fixtures(page, { code: 'khmer-floral-gold' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/templates/khmer-floral-gold/demo?lang=en');
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-effects','10');
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','true');
  const layer = page.locator('.kfg-ambience'), paper = page.locator('.kfg-paper-art');
  const expectBorderInViewport = async () => {
    await expect(paper).toHaveCSS('position', 'absolute');
    const difference = await paper.evaluate(node => {
      const root = node.closest('.kfg-invitation').getBoundingClientRect(), bounds = node.getBoundingClientRect();
      return { y: Math.abs(bounds.y - root.y), height: Math.abs(bounds.height - root.height) };
    });
    expect(difference.y).toBeLessThan(1);
    expect(difference.height).toBeLessThan(1);
  };
  await expectBorderInViewport();
  await expect(layer).toHaveCSS('pointer-events', 'none');
  await expect(layer).toHaveAttribute('aria-hidden', 'true');
  await expect(layer.locator('[data-effect]')).toHaveCount(2);
  await expect(page.locator('.kfg-botanical-lines')).toHaveCount(0);
  await expect(page.locator('.kfg-scene-blossoms')).toHaveCount(0);
  await expect(page.locator('.kfg-cover-side')).toHaveCount(4);
  await expect(layer.locator('.kfg-realistic-flight')).toHaveCount(12);
  await expect(layer.locator('.kfg-realistic-petal')).toHaveCount(12);
  await expect(layer.locator('img')).toHaveCount(48);
  await expect(layer.locator('svg,canvas,video')).toHaveCount(0);
  await layer.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  expect(await layer.locator('.kfg-realistic-wing--body').evaluateAll(images => images.every(image => image.naturalWidth >= 600))).toBe(true);
  await expect(layer.locator('.kfg-realistic-flight').first()).toHaveCSS('animation-duration', '16.08s');
  expect(await paper.evaluate(node => getComputedStyle(node, '::before').backgroundImage)).toContain('realistic/white-green-border-top.webp');
  expect(await paper.evaluate(node => getComputedStyle(node, '::after').backgroundImage)).toContain('realistic/white-green-border-bottom.webp');
  expect(await paper.evaluate(node => ['::before','::after'].every(part => { const style = getComputedStyle(node, part); return style.opacity === '1' && style.filter === 'none' && style.maskImage === 'none'; }))).toBe(true);
  const petals = await layer.locator('.kfg-realistic-petal').first().evaluate(node => {
    const animation = node.getAnimations()[0];
    animation.pause(); animation.currentTime = 5000;
    const start = node.getBoundingClientRect();
    animation.currentTime = 12000;
    const end = node.getBoundingClientRect(); animation.play();
    return { dx: end.x + end.width / 2 - start.x - start.width / 2, dy: end.y - start.y };
  });
  expect(Math.abs(petals.dx)).toBeLessThan(1); expect(petals.dy).toBeGreaterThan(150);
  expect(await layer.evaluate(node => Number(getComputedStyle(node).zIndex) < Number(getComputedStyle(document.querySelector('.kfg-opening')).zIndex))).toBe(true);
  await layer.evaluate(node => { window.floralV5Ambience = node; });
  if (info.project.name === 'chromium') await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/animated-cover.png' });
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-welcome-scene')).toBeVisible();
  await expect(page.locator('.kfg-welcome-scene')).toHaveCSS('transform', 'none');
  await expectBorderInViewport();
  await page.locator('.kfg-scene-backdrop img').evaluate(image => image.decode());
  expect(await page.locator('.kfg-scene-backdrop img').evaluate(image => image.naturalWidth)).toBe(1600);
  await expect(page.locator('.kfg-blossom-corner')).toHaveCount(4);
  const expectBottomCornersAboveActions = async () => {
    const actions = await page.locator('.kfg-demo-actions').boundingBox();
    for (const corner of await page.locator('.kfg-blossom-corner--bottom-left,.kfg-blossom-corner--bottom-right').all()) {
      const bounds = await corner.boundingBox();
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(actions.y + 5);
      expect(bounds.y + bounds.height).toBeGreaterThan(actions.y - 5);
    }
  };
  await expectBottomCornersAboveActions();
  await page.locator('.kfg-scene-blossoms img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  expect(await page.locator('.kfg-scene-blossoms img').evaluateAll(images => images.every(image => image.naturalWidth === 1536))).toBe(true);
  expect(await page.locator('.kfg-blossom-corner').evaluateAll(corners => corners.map(corner => getComputedStyle(corner).getPropertyValue('--corner-flip').trim()))).toEqual(['scaleX(-1)','none','scale(-1,-1)','scaleY(-1)']);
  if (info.project.name === 'chromium') {
    await expect(page.locator('.kfg-welcome-scene')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: '../../docs/design/khmer-floral-gold/screenshots/v5/welcome-background.png', fullPage: true });
  }
  await expect(page.locator('.kfg-content')).toBeVisible();
  await expect.poll(() => page.locator('.kfg-content').evaluate(node => Math.abs(new DOMMatrix(getComputedStyle(node).transform).m42))).toBeLessThan(.01);
  await expect(page.locator('.kfg-blossom-corner')).toHaveCount(4);
  await expectBottomCornersAboveActions();
  await page.locator('.kfg-footer').evaluate(node => node.scrollIntoView({ behavior: 'instant' }));
  await expectBorderInViewport();
  expect(await layer.evaluate(node => node === window.floralV5Ambience)).toBe(true);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(layer.locator('.kfg-realistic-flight').first()).toHaveCSS('animation-play-state', 'paused');
  await expect(layer.locator('.kfg-realistic-petal').first()).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(layer).toBeHidden();
  await expect(layer.locator('img')).toHaveCount(0);
});
