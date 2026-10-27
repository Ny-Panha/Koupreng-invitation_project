import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import process from 'node:process';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';

const code = 'royal-garden-cinematic', base = '/templates/royal-garden/v3';
const portrait = '/templates/silk-heritage/portrait.webp';
const evidence = '../../docs/design/royal-garden-visual-repair/evidence';
const intro = { style: 'royal-arch', titleMode: 'text', duration: 2, slides: [{ id: 'portrait', src: portrait, alt: 'Owner portrait', x: 50, y: 40 }] };
const information = { enabled: true, fixedBackground: true, motionPreset: 'balanced', effects: { butterfly: true }, video: { footer: true, replay: true } };
const windowsWebKit = info => info.project.name === 'webkit' && process.platform === 'win32';
async function setup(page, { authorized = false, premium = true, content = {}, guest = null } = {}) {
  const state = await phase9Fixtures(page, { code, premium, content: { cinematicIntro: intro, informationScene: information, coverBackgroundImage: portrait, messageText: 'Please join our fictional celebration.', messageTitle: 'With our families',
    gallery: [{ id: 'one', preview: portrait }], schedule: [{ id: 'one', time: '07:00', title: 'Family ceremony', titleEn: 'Family ceremony' }], saveTheDate: { enabled: true, showCountdown: true, showCalendar: true, showAddToCalendar: true },
    ...(authorized ? { preWeddingVideo: { enabled: true, videoMediaId: 107, posterMediaId: null } } : {}), ...content } });
  state.events.set(101, { ...state.events.get(101), designJson: JSON.stringify({ coverBackgroundImage: portrait }), groomName: 'Fictional groom', brideName: 'Fictional bride', hostName: 'Fictional groom', partnerName: 'Fictional bride', googleMapUrl: 'https://maps.google.com/?q=Phnom+Penh', enabledSections: JSON.stringify({ gallery: true, schedule: true, countdown: true, rsvp: true, gift: false }) });
  state.media.push({ id: 107, mediaType: 'PRE_WEDDING_VIDEO', mimeType: 'video/mp4', fileUrl: null, originalFilename: 'Owner film.mp4' });
  await page.route('**/api/v1/public/invitations/review-celestial?*', route => route.fulfill({ json: { data: { ...state.events.get(101), status: 'PUBLISHED', guest, cinematicOpening: authorized && premium ? { enabled: true, videoMediaId: 107, posterUrl: portrait } : null } } }));
  await page.route('**/api/v1/public/invitations/review-celestial', route => route.fulfill({ json: { data: { ...state.events.get(101), status: 'PUBLISHED', guest, cinematicOpening: authorized && premium ? { enabled: true, videoMediaId: 107, posterUrl: portrait } : null } } }));
  await page.route('**/api/v1/invitations/101/media/gallery', route => route.fulfill({ json: { data: [{ id: 501, fileUrl: '/templates/silk-heritage/together.webp', mediaType: 'GALLERY_IMAGE', mimeType: 'image/webp' }] } }));
  await page.route('**/api/v1/invitations/101/media/107/cinematic-content', async route => route.fulfill({ contentType: 'video/mp4', body: await fs.readFile('public/templates/royal-garden/v3/video/pre-wedding-demo.mp4') }));
  return state;
}
async function capture(page, name, info) {
  if (['chromium', 'mobile-chromium'].includes(info.project.name)) {
    await fs.mkdir(evidence, { recursive: true });
    await page.evaluate(() => document.fonts.ready);
    const background = page.locator('.rg-information-background img');
    if (await background.count()) await expect.poll(() => background.evaluate(node => node.naturalWidth)).toBeGreaterThan(0);
    await page.locator('.rg-royal-arch img, .rg-entrance-lettering img, .rg-information-background img').evaluateAll(items => Promise.all(items.map(image => image.decode().catch(() => {}))));
    // Retain device scale: forcing CSS scale can switch srcset density during
    // Chromium's screenshot and capture an undecoded replacement image.
    await page.screenshot({ path: `${evidence}/${info.project.name}-${name}.png`, animations: 'disabled', scale: 'device' });
  }
}
async function openVideo(page) { await page.locator('.rg-open').click(); await expect(page.locator('.cinematic-inline-stage')).toBeVisible(); }
async function skip(page) { await page.locator('.cinematic-inline-stage').getByRole('button', { name: 'Skip video', exact: true }).click(); await expect(page.locator('.tpl-royal-garden[data-stage=CONTENT]')).toBeVisible(); }

test('catalog: supplied film loads after click, plays inline without a dialog/form, then reveals fixed information', async ({ page }, info) => {
  await setup(page); const requests = []; page.on('request', request => { if (request.url().includes('pre-wedding-demo.mp4')) requests.push(request.url()); });
  await page.goto(`/templates/${code}?lang=en`); await expect(page.locator('[data-stage=COVER]')).toBeVisible();
  await expect.poll(() => page.locator('.rg-royal-arch img').evaluate(node => node.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.rg-entrance-photo img')).toHaveAttribute('src', portrait);
  if (info.project.name === 'chromium') await expect.poll(() => page.locator('.rg-entrance-photo img').evaluate(node => node.currentSrc)).toContain('demo-portrait-640.webp');
  expect(requests).toHaveLength(0); await capture(page, 'entrance', info);
  await openVideo(page); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(page.locator('.cinematic-inline-stage form')).toHaveCount(0);
  const video = page.locator('.cinematic-inline-stage video'); await expect(video).toHaveAttribute('src', `${base}/video/pre-wedding-demo.mp4`);
  await expect.poll(() => video.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  await expect(page.locator('.cinematic-film-footer')).toBeVisible();
  await expect(page.locator('.rg-paper .cinematic-inline-stage')).toBeVisible();
  await expect(page.locator('#rg-family')).toBeVisible();
  expect(await page.locator('[data-cinematic-content]').getAttribute('hidden')).toBeNull();
  const filmBounds = await video.boundingBox(), footerBounds = await page.locator('.cinematic-film-footer').boundingBox();
  expect(footerBounds.y).toBeGreaterThanOrEqual(filmBounds.y + filmBounds.height);
  const bgNode = await page.locator('.rg-information-background').elementHandle();
  await capture(page, 'inline-video', info);
  await page.getByRole('button', { name: 'Enable sound', exact: true }).click(); await expect(video).toHaveJSProperty('muted', false);
  await page.getByRole('button', { name: 'Mute video', exact: true }).click();
  await page.getByRole('button', { name: 'Pause video', exact: true }).click(); await expect(video).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Replay video', exact: true }).click(); await expect(video).toHaveJSProperty('muted', true);
  await skip(page); expect(await bgNode.evaluate(node => node.isConnected)).toBe(true); await capture(page, 'information', info);
  const background = page.locator('.rg-information-background'); const before = await background.boundingBox();
  await page.locator('.rg-content-scroll').evaluate(node => node.scrollTo({ top: 850, behavior: 'instant' })); const after = await background.boundingBox(); expect(after.y).toBe(before.y);
  expect(await page.locator('.rg-content-scroll').evaluate(node => node.scrollTop)).toBeGreaterThan(0); expect(await page.evaluate(() => window.scrollY)).toBe(0); await expect(background).toHaveCSS('border-image-repeat', 'stretch repeat'); await expect(page.locator('#rg-schedule .kp-timeline li')).toHaveCount(9);
});

test('hosted: authorized protected film completes, errors recover, and guest text stays live', async ({ page }, info) => {
  const { events } = await setup(page, { authorized: true, guest: { guestName: 'លោក សុខ និងក្រុមគ្រួសារ', guestGroup: 'Family', seatCount: 2 } });
  let calls = 0; await page.route('**/cinematic-content', async route => { calls++; expect(route.request().method()).toBe('POST'); return route.fulfill({ contentType: 'video/mp4', body: await fs.readFile('public/templates/royal-garden/v3/video/pre-wedding-demo.mp4') }); });
  await page.goto('/i/review-celestial?token=fictional-guest'); await expect(page.locator('.rg-guest-frame')).toContainText('លោក សុខ');
  await expect(page.locator('.public-ticket-button')).toBeHidden();
  if (windowsWebKit(info)) {
    // This installed Windows WebKit rejects even a standalone valid MP4 blob
    // (MEDIA_ERR_SRC_NOT_SUPPORTED). Exercise its required error recovery;
    // do not claim that this verifies protected-film decoding on native Safari.
    info.annotations.push({ type: 'platform limitation', description: 'Windows WebKit MP4 blob decoding unavailable; verified authorized request and graceful fallback. Native Safari playback remains unverified.' });
    await page.locator('.rg-open').click(); await expect.poll(() => calls).toBe(1);
  } else {
    await openVideo(page); await expect.poll(() => calls).toBe(1);
    const video = page.locator('.cinematic-inline-stage video'); await expect(video).toHaveAttribute('src', /^blob:/);
    await expect.poll(() => video.evaluate(node => node.currentTime)).toBeGreaterThan(0);
    await video.evaluate(node => { node.currentTime = node.duration - .3; return node.play(); });
  }
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await expect(page.locator('.public-ticket-button')).toBeVisible();
  await expect(page.locator('#rg-invitation')).toContainText('Fictional groom'); await expect(page.locator('#rg-venue a')).toHaveAttribute('href', /maps.google.com/);
  await page.goto('/i/review-celestial');
  if (windowsWebKit(info)) await page.locator('.rg-open').click();
  else { await openVideo(page); await page.locator('.cinematic-inline-stage video').evaluate(node => node.dispatchEvent(new Event('error'))); }
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); expect(JSON.parse(events.get(101).contentJson).preWeddingVideo).toEqual({ enabled: true, videoMediaId: 107, posterMediaId: null });
  await capture(page, 'hosted-content', info);
});

test('unavailable video, absent photo, failed artwork, cleared lettering and long names stay usable', async ({ page }) => {
  await setup(page, { premium: false, content: { preWeddingVideo: { enabled: true, videoMediaId: 107 }, coverBackgroundImage: '', cinematicIntro: { ...intro, artworkSrc: '', entranceFrame: '/missing-frame.webp' } }, guest: { guestName: 'លោកអ្នក និងក្រុមគ្រួសារ '.repeat(20) } });
  let calls = 0; page.on('request', request => { if (request.url().includes('cinematic-content') || request.url().includes('pre-wedding-demo.mp4')) calls++; });
  await page.goto('/i/review-celestial'); await expect(page.locator('.rg-open')).toBeVisible(); await expect(page.locator('.rg-entrance-lettering h1')).toBeVisible();
  await page.locator('.rg-open').click(); await page.locator('.rg-entrance-skip').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); expect(calls).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('legacy calligraphy covers also use the inline film rather than a popup', async ({ page }, info) => {
  await setup(page, { authorized: true, content: { cinematicIntro: { ...intro, style: 'golden-calligraphy' } } });
  await page.goto('/i/review-celestial'); await page.locator('.rg-open').click();
  if (windowsWebKit(info)) {
    info.annotations.push({ type: 'platform limitation', description: 'Windows WebKit MP4 blob decoding unavailable; legacy opening verifies safe content fallback.' });
    await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  } else {
    await expect(page.locator('.cinematic-inline-stage')).toBeVisible(); await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.cinematic-inline-stage form')).toHaveCount(0); await skip(page);
  }
});

test('reduced motion skips video, disables effects, and keeps keyboard access', async ({ page }) => {
  await setup(page, { authorized: true }); await page.emulateMedia({ reducedMotion: 'reduce' });
  let calls = 0; page.on('request', request => { if (request.url().includes('cinematic-content')) calls++; });
  await page.goto('/i/review-celestial'); await expect(page.locator('.rg-motion-layer')).toHaveCount(0);
  await page.locator('.rg-open').focus(); await page.keyboard.press('Enter'); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); expect(calls).toBe(0);
  await expect(page.locator('.rg-motion-layer')).toHaveCount(0); await page.keyboard.press('Tab'); expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
});

test('Studio settings update the same iframe and survive save/reload/published rendering', async ({ page }, info) => {
  const { events } = await setup(page, { authorized: true }); await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/app/events/101/invitation'); await expect(page.locator('.invitation-studio')).toBeVisible(); await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
  await chooseStudioSection(page, 'mediaOpening', 'Cinematic intro'); await page.getByRole('combobox', { name: 'Opening style', exact: true }).selectOption('royal-arch');
  await page.getByLabel('Opening button label', { exact: true }).fill('Join our celebration');
  const frame = page.frameLocator('iframe'); await expect(frame.locator('.rg-open')).toHaveAccessibleName('Join our celebration');
  const identity = await page.locator('iframe').getAttribute('src');
  await chooseStudioSection(page, 'mediaOpening', 'Pre-wedding video');
  await page.getByRole('combobox', { name: 'After the video', exact: true }).selectOption('poster');
  await page.getByRole('combobox', { name: 'Video sound', exact: true }).selectOption('on');
  if (!windowsWebKit(info)) {
    await page.getByRole('button', { name: 'Preview video scene', exact: true }).click();
    await expect(frame.locator('.cinematic-inline-stage video')).toBeVisible();
    await page.getByRole('combobox', { name: 'Video fit', exact: true }).selectOption('cover');
    await expect(frame.locator('.cinematic-inline-stage video')).toHaveCSS('object-fit', 'cover');
    await page.getByRole('combobox', { name: 'Video fit', exact: true }).selectOption('contain');
    await expect(frame.locator('.cinematic-inline-stage video')).toHaveCSS('object-fit', 'contain');
    await frame.getByRole('button', { name: 'Skip video', exact: true }).click();
  }
  await chooseStudioSection(page, 'designCover', 'Colors & typography'); await page.getByRole('combobox', { name: 'Effect intensity', exact: true }).selectOption('cinematic');
  await page.getByRole('slider', { name: 'Background shade', exact: true }).fill('0.4');
  await page.getByLabel('Accent', { exact: true }).fill('#edcd88');
  await page.getByRole('button', { name: 'Preview information', exact: true }).click(); await expect(frame.locator('[data-stage=CONTENT]')).toBeVisible();
  await expect(frame.locator('.rg-paper')).toHaveCSS('--rg-information-overlay', '0.4');
  await expect(frame.locator('.rg-names')).toHaveCSS('color', 'rgb(237, 205, 136)');
  await expect(frame.locator('.rg-motion-layer i')).toHaveCount(16);
  const editorAudit = await new AxeBuilder({ page }).include('.studio-royal-scenes').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(editorAudit.violations).toEqual([]);
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(JSON.parse(events.get(101).contentJson).informationScene).toMatchObject({ motionPreset: 'cinematic', contentOverlay: .4 }); expect(await page.locator('iframe').getAttribute('src')).toBe(identity);
  expect(JSON.parse(events.get(101).contentJson).informationScene.video).toMatchObject({ endBehavior: 'poster', sound: 'on' });
  await page.reload(); await expect(page.locator('.invitation-studio')).toBeVisible(); await page.getByRole('button', { name: 'Preview video scene', exact: true }).click();
  if (windowsWebKit(info)) {
    info.annotations.push({ type: 'platform limitation', description: 'Windows WebKit owner MP4 blob preview verifies fallback; native Safari decoding is unverified.' });
  } else {
    await expect(frame.locator('.cinematic-inline-stage')).toBeVisible(); await expect(frame.getByRole('dialog')).toHaveCount(0);
    await frame.getByRole('button', { name: 'Skip video', exact: true }).click();
  }
  await expect(frame.locator('[data-stage=CONTENT]')).toBeVisible();
  await page.getByRole('button', { name: 'Restart animation', exact: true }).click(); await expect(frame.locator('[data-stage=COVER]')).toBeVisible();
  await capture(page, 'studio', info);
  await page.goto('/i/review-celestial'); await expect(page.locator('.rg-open')).toHaveAccessibleName('Join our celebration');
  if (windowsWebKit(info)) { await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); }
  else { await openVideo(page); await skip(page); }
  await expect(page.locator('.rg-paper')).toHaveCSS('--rg-information-overlay', '0.4');
});

test('responsive references and scoped accessibility', async ({ page }, info) => {
  await setup(page); for (const width of [320,375,390,430,512,768,1024,1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto(`/templates/${code}?lang=en`); await expect(page.locator('.rg-royal-arch img')).toBeVisible();
    const bounds = await page.locator('.rg-open').boundingBox(); expect(bounds.y + bounds.height).toBeLessThan(900);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (info.project.name === 'chromium') await capture(page, `entrance-${width}`, info);
  }
  const entrance = await new AxeBuilder({ page }).include('.rg-royal-entrance').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(entrance.violations).toEqual([]);
  await openVideo(page); const video = await new AxeBuilder({ page }).include('.cinematic-inline-stage').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(video.violations).toEqual([]); await skip(page);
  const content = await new AxeBuilder({ page }).include('.rg-paper').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(content.violations).toEqual([]);
});

test('repair: short phones retain the complete artwork, safe portrait window and separate video footer', async ({ page }, info) => {
  await setup(page);
  for (const [width, height] of [[320,568],[375,667],[390,844],[430,932],[512,910],[768,1024],[1440,960]]) {
    await page.setViewportSize({ width, height }); await page.goto(`/templates/${code}?lang=en`);
    await expect(page.locator('.rg-royal-arch img')).toBeVisible();
    const action = await page.locator('.rg-open').boundingBox(), guest = await page.locator('.rg-royal-guest').boundingBox();
    expect(action.y + action.height).toBeLessThanOrEqual(height);
    expect(guest.y + guest.height).toBeLessThanOrEqual(action.y + 1);
    await expect(page.locator('.rg-royal-arch')).toHaveCSS('border-image-repeat', 'stretch repeat');
    const circle = await page.locator('.rg-open').boundingBox(); expect(circle.width).toBe(circle.height); expect(circle.width).toBeGreaterThanOrEqual(44); await expect(page.locator('.rg-open svg')).toBeVisible();
    expect((await page.locator('.rg-entrance-photo .cover-bg-root').boundingBox()).height).toBeGreaterThan(height * .75);
    await capture(page, `repair-cover-${width}x${height}`, info);
  }
  await page.setViewportSize({ width: 375, height: 667 }); await page.goto(`/templates/${code}?lang=km`);
  await expect(page.locator('.rg-open')).toBeVisible();
  await capture(page, 'repair-cover-khmer-375', info);
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/templates/${code}?lang=en`);
  await expect(page.locator('.rg-open')).toBeVisible();
  if (['chromium', 'mobile-chromium'].includes(info.project.name)) {
    await page.clock.install(); await page.clock.pauseAt(new Date(Date.now() + 1000));
    await page.locator('.rg-open').click(); await capture(page, 'repair-transition', info);
    await page.clock.runFor(1000); await page.clock.resume(); await expect(page.locator('.cinematic-inline-stage')).toBeVisible();
  } else await openVideo(page);
  const film = page.locator('.cinematic-inline-stage video'); await expect.poll(() => film.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause video', exact: true }).click(); await film.evaluate(node => { node.currentTime = .5; });
  await capture(page, 'repair-video-beginning', info);
  const footer = page.locator('.cinematic-film-footer'); await footer.evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().bottom + scrollY - innerHeight + 110, behavior: 'instant' })); await capture(page, 'repair-video-footer', info);
  const fb = await footer.boundingBox(), vb = await film.boundingBox(); expect(fb.y).toBeGreaterThanOrEqual(vb.y + vb.height);
  await page.getByRole('button', { name: 'Continue to invitation', exact: true }).click();
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  for (const key of ['family','invitation','schedule','venue','gallery','rsvp','closing']) {
    await page.locator(`#rg-${key}`).evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await capture(page, `repair-${key}`, info);
  }
  await page.locator('.rg-current-photo').click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('repair: real public section contracts retain gift, private wishes and RSVP within the same shell', async ({ page }, info) => {
  const qr = `data:image/png;base64,${(await fs.readFile('tests/e2e/support/fixtures/ticket-qr.png')).toString('base64')}`;
  const { events } = await setup(page, { content: { cinematicIntro: { ...intro, enabled: false }, gift: [{ id: 'review', currency: 'Review QR', account: 'Fictional test QR - not payment', qrImage: qr }] }, guest: { guestName: 'Fictional review guest', seatCount: 2 } });
  events.set(101, { ...events.get(101), enabledSections: JSON.stringify({ gift: true, wishes: true, rsvp: true, gallery: true, schedule: true }) });
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/i/review-celestial?token=fictional-guest');
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  await page.locator('#rg-gift').scrollIntoViewIfNeeded();
  await expect(page.locator('#rg-gift img')).toBeVisible();
  for (const key of ['gift','wishes','rsvp','closing']) {
    await page.locator(`#rg-${key}`).evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await capture(page, `repair-hosted-${key}`, info);
  }
  await expect(page.locator('#rg-wishes')).toContainText('private');
  await expect(page.locator('#rg-rsvp form')).toBeVisible();
});

test('critical: language changes preserve the active film, authorized guest data and private RSVP wording', async ({ page }, info) => {
  const { events } = await setup(page, { authorized: true, guest: { guestName: 'Authorized guest', seatCount: 2 } });
  const saved = events.get(101).contentJson;
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/i/review-celestial?token=fictional-guest');
  const language = page.locator('.rg-language select');
  await expect(language).toBeVisible(); await language.selectOption('km');
  await expect(page.locator('.tpl-royal-garden')).toHaveAttribute('lang', 'km');
  await expect(page.locator('.rg-guest-frame')).toContainText('Authorized guest');
  await language.selectOption('en');
  if (windowsWebKit(info)) {
    await page.locator('.rg-open').click();
    info.annotations.push({ type: 'platform limitation', description: 'Windows WebKit protected MP4 blob path tests safe fallback; native Safari still needs device verification.' });
    await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  } else {
    await openVideo(page);
    const video = page.locator('.cinematic-inline-stage video'), element = await video.elementHandle();
    await expect.poll(() => video.evaluate(node => node.currentTime)).toBeGreaterThan(0);
    await language.selectOption('km'); await expect(page.locator('[data-stage=PRE_WEDDING_VIDEO]')).toBeVisible();
    expect(await element.evaluate(node => node === document.querySelector('.cinematic-inline-stage video'))).toBe(true);
    await expect(page.locator('.cinematic-playback-actions button').last()).toHaveAccessibleName(/\u179a\u17c6/);
    await language.selectOption('en'); await expect(page.getByRole('button', { name: 'Skip video', exact: true })).toBeVisible();
    await skip(page);
  }
  await language.selectOption('km'); await expect(page.locator('.tpl-royal-garden')).toHaveAttribute('lang', 'km');
  await page.locator('#rg-rsvp').evaluate(node => node.scrollIntoView({ behavior: 'instant' }));
  await expect(page.locator('#rg-rsvp form')).toBeVisible();
  await page.locator('#rg-rsvp textarea').fill('A private wish');
  await language.selectOption('en'); await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('A private wish');
  expect(events.get(101).contentJson).toBe(saved); expect(new URL(page.url()).searchParams.get('token')).toBe('fictional-guest');
  await capture(page, 'critical-hosted-language-rsvp', info);
});

test('critical: immersive media and one inner scroll preserve the complete frame and reachable ending', async ({ page }, info) => {
  await setup(page); await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/templates/${code}?lang=km`);
  const button = await page.locator('.rg-open').boundingBox(); expect(button.width).toBe(button.height); expect(button.width).toBeGreaterThanOrEqual(44);
  const band = await page.locator('.rg-guest-frame img').boundingBox(); expect(band.width / band.height).toBeCloseTo(3, 1);
  const guest = await page.locator('.rg-royal-guest').boundingBox(); expect(guest.y + guest.height).toBeLessThan(button.y);
  await capture(page, 'critical-cover-km', info); await page.locator('.rg-language select').selectOption('en'); await capture(page, 'critical-cover-en', info);
  await openVideo(page); const film = page.locator('.cinematic-inline-stage video'); await expect.poll(() => film.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  const painted = await film.evaluate(node => { const r = node.getBoundingClientRect(), scale = Math.min(r.width / node.videoWidth, r.height / node.videoHeight); return { width: node.videoWidth * scale, height: node.videoHeight * scale }; });
  expect(painted.width).toBeGreaterThanOrEqual(390 * .9); expect(painted.height).toBeGreaterThanOrEqual(844 * .75);
  const mediaBounds = await film.boundingBox(), footer = await page.locator('.cinematic-film-footer').boundingBox(); expect(footer.y).toBeGreaterThanOrEqual(mediaBounds.y + mediaBounds.height - 1); expect(footer.width / footer.height).toBeCloseTo(3, 1);
  for (const box of await page.locator('.cinematic-playback-actions button,.cinematic-film-controls button').all()) { const r = await box.boundingBox(); expect(r.width).toBeGreaterThanOrEqual(44); expect(r.height).toBeGreaterThanOrEqual(44); expect(r.y + r.height).toBeLessThanOrEqual(footer.y); }
  await page.getByRole('button', { name: 'Pause video', exact: true }).click(); await capture(page, 'critical-video', info); await skip(page);
  const pane = page.locator('.rg-content-scroll'), frame = page.locator('.rg-information-background'); const before = await frame.boundingBox();
  await pane.evaluate(node => node.scrollTo({ top: 0, behavior: 'instant' }));
  const paneTop = await pane.boundingBox(), heading = await page.locator('#rg-family h2').boundingBox(); expect(heading.y).toBeGreaterThanOrEqual(paneTop.y - 1);
  await capture(page, 'critical-information-top', info);
  await page.getByRole('button', { name: 'Venue', exact: true }).click(); await expect.poll(() => pane.evaluate(node => node.scrollTop)).toBeGreaterThan(100);
  expect(await frame.boundingBox()).toEqual(before); await capture(page, 'critical-information-scrolled', info);
  await pane.focus(); await page.keyboard.press('End'); await expect.poll(() => pane.evaluate(node => Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop))).toBeLessThan(2);
  const end = await page.locator('.rg-footer').boundingBox(), safe = await pane.boundingBox(); expect(end.y + end.height).toBeLessThanOrEqual(safe.y + safe.height + 1);
  expect(await page.evaluate(() => window.scrollY)).toBe(0); await capture(page, 'critical-information-ending', info);
});

test('compatibility: saved fixed-frame opt-out keeps the hosted ending reachable', async ({ page }) => {
  await setup(page, { content: { cinematicIntro: { ...intro, enabled: false }, informationScene: { ...information, fixedBackground: false } } });
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/i/review-celestial');
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  await expect(page.locator('.rg-paper')).toHaveAttribute('data-fixed', 'false');
  await expect(page.locator('.public-royal-garden')).toHaveCSS('overflow', 'visible');
  await page.locator('.rg-footer').scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  const footer = await page.locator('.rg-footer').boundingBox(); expect(footer.y + footer.height).toBeLessThanOrEqual(844);
});
