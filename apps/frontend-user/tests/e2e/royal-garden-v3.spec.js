import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import process from 'node:process';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';

const code = 'royal-garden-cinematic', base = '/templates/royal-garden/v3';
const portrait = '/templates/silk-heritage/portrait.webp';
const evidence = process.env.ROYAL_EVIDENCE_DIR || '../../docs/design/royal-garden-v3-1/evidence/browser';
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
    await page.screenshot({ path: `${evidence}/${info.project.name}-${name}.jpg`, type: 'jpeg', quality: 90, animations: 'disabled', scale: 'device' });
  }
}
async function openVideo(page) { await page.locator('.rg-open').click(); await expect(page.locator('.cinematic-inline-stage')).toBeVisible(); }
async function skip(page) { await page.locator('.cinematic-inline-stage').getByRole('button', { name: 'Skip video', exact: true }).click(); await expect(page.locator('.tpl-royal-garden[data-stage=CONTENT]')).toBeVisible(); }

test('catalog: supplied film loads after click, plays inline without a dialog/form, then reveals fixed information', async ({ page }, info) => {
  await setup(page); const requests = []; page.on('request', request => { if (request.url().includes('pre-wedding-demo.mp4')) requests.push(request.url()); });
  await page.goto(`/templates/${code}?lang=en`); await expect(page.locator('[data-stage=COVER]')).toBeVisible();
  await expect.poll(() => page.locator('.rg-royal-arch img').evaluate(node => node.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.rg-entrance-photo img')).toHaveAttribute('src', portrait);
  if (info.project.name === 'chromium') await expect.poll(() => page.locator('.rg-entrance-photo img').evaluate(node => node.currentSrc)).toContain('demo-portrait-480.webp');
  expect(requests).toHaveLength(0); await capture(page, 'entrance', info);
  await openVideo(page); await expect(page.getByRole('dialog')).toHaveCount(0); await expect(page.locator('.cinematic-inline-stage form')).toHaveCount(0);
  const video = page.locator('.cinematic-inline-stage video'); await expect(video).toHaveAttribute('src', `${base}/video/pre-wedding-demo.mp4`);
  await expect.poll(() => video.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  await expect(page.locator('.cinematic-film-footer')).toBeVisible();
  await expect(page.locator('.rg-paper .cinematic-inline-stage')).toBeVisible();
  await expect(page.locator('#rg-family')).toHaveCount(0);
  expect(await page.locator('[data-cinematic-content]').getAttribute('hidden')).toBeNull();
  const filmBounds = await video.boundingBox(), footerBounds = await page.locator('.cinematic-film-footer').boundingBox();
  expect(Math.abs(footerBounds.y + footerBounds.height - filmBounds.y - filmBounds.height)).toBeLessThanOrEqual(1);
  const bgNode = await page.locator('.rg-information-background').elementHandle();
  await capture(page, 'inline-video', info);
  await expect(video).toHaveJSProperty('muted', true);
  await expect(page.getByRole('button', { name: 'Enable sound', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Pause video', exact: true }).click(); await expect(video).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Replay video', exact: true }).click(); await expect(video).toHaveJSProperty('muted', true);
  await skip(page); expect(await bgNode.evaluate(node => node.isConnected)).toBe(true); await capture(page, 'information', info);
  const background = page.locator('.rg-information-background'); const before = await background.boundingBox();
  await page.locator('.rg-content-scroll').evaluate(node => node.scrollTo({ top: 850, behavior: 'instant' })); const after = await background.boundingBox(); expect(after.y).toBe(before.y);
  expect(await page.locator('.rg-content-scroll').evaluate(node => node.scrollTop)).toBeGreaterThan(0); expect(await page.evaluate(() => window.scrollY)).toBe(0); await expect(background).toHaveCSS('border-image-repeat', 'stretch repeat'); await expect(page.locator('#rg-schedule .kp-timeline li')).toHaveCount(4);
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
    await expect(page.locator('.public-ticket-button')).toBeHidden();
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
  await setup(page, { premium: false, content: { preWeddingVideo: { enabled: true, videoMediaId: 107 }, coverBackgroundImage: '', cinematicIntro: { ...intro, animationPreset: 'still', artworkSrc: '', entranceFrame: '/missing-frame.webp' } }, guest: { guestName: 'លោកអ្នក និងក្រុមគ្រួសារ '.repeat(20) } });
  let calls = 0; page.on('request', request => { if (request.url().includes('cinematic-content') || request.url().includes('pre-wedding-demo.mp4')) calls++; });
  await page.goto('/i/review-celestial'); await expect(page.locator('.rg-open')).toBeVisible(); await expect(page.locator('.rg-entrance-lettering h1')).toBeVisible();
  expect(await page.locator('.rg-entrance-lettering').evaluate(node => getComputedStyle(node, '::after').animationName)).toBe('none');
  await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); expect(calls).toBe(0);
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
  await page.getByRole('combobox', { name: 'Cover button style', exact: true }).selectOption('text');
  await page.getByLabel('Opening button label', { exact: true }).fill('Join our celebration');
  const frame = page.frameLocator('iframe'); await expect(frame.locator('.rg-open')).toHaveAccessibleName('Join our celebration');
  await expect(frame.locator('.rg-open')).toHaveAttribute('data-button-style', 'text');
  await page.getByRole('combobox', { name: 'Cover button style', exact: true }).selectOption('artwork');
  await expect(frame.locator('.rg-open img')).toBeVisible();
  const identity = await page.locator('iframe').getAttribute('src');
  await chooseStudioSection(page, 'mediaOpening', 'Pre-wedding video');
  await page.getByRole('combobox', { name: 'After the video', exact: true }).selectOption('poster');
  await page.getByRole('slider', { name: 'Video horizontal focus', exact: true }).fill('30');
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
  await page.getByRole('combobox', { name: 'Monogram mode', exact: true }).selectOption('artwork');
  await page.getByRole('slider', { name: 'Monogram scale', exact: true }).fill('0.9');
  await page.getByRole('combobox', { name: 'Information spacing', exact: true }).selectOption('compact');
  await page.getByRole('combobox', { name: 'Closing signature', exact: true }).selectOption('text');
  await page.getByRole('combobox', { name: 'Film date typography', exact: true }).selectOption('battambang');
  await page.getByRole('checkbox', { name: 'Include event time', exact: true }).check();
  await page.getByRole('slider', { name: 'Background shade', exact: true }).fill('0.4');
  await page.getByLabel('Accent', { exact: true }).fill('#edcd88');
  await page.getByRole('button', { name: 'Preview information', exact: true }).click(); await expect(frame.locator('[data-stage=CONTENT]')).toBeVisible();
  await expect(frame.locator('.rg-paper')).toHaveCSS('--rg-information-overlay', '0.4');
  await expect(frame.locator('.rg-paper')).toHaveAttribute('data-spacing', 'compact');
  await expect(frame.locator('.rg-ceremonial-monogram img')).toBeVisible();
  await expect(frame.locator('.rg-names')).toHaveCSS('color', 'rgb(237, 205, 136)');
  await expect(frame.locator('.rg-motion-layer i')).toHaveCount(16);
  const editorAudit = await new AxeBuilder({ page }).include('.studio-royal-scenes').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(editorAudit.violations).toEqual([]);
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(JSON.parse(events.get(101).contentJson).informationScene).toMatchObject({ motionPreset: 'cinematic', contentOverlay: .4 }); expect(await page.locator('iframe').getAttribute('src')).toBe(identity);
  expect(JSON.parse(events.get(101).contentJson).informationScene.video).toMatchObject({ endBehavior: 'poster', positionX: 30 });
  expect(JSON.parse(events.get(101).contentJson).cinematicIntro.buttonStyle).toBe('artwork');
  expect(JSON.parse(events.get(101).contentJson).informationScene).toMatchObject({ spacing:'compact', brandStyle:'text', monogram:{mode:'artwork',scale:.9},video:{dateFont:'battambang',showTime:true} });
  await page.reload(); await expect(page.locator('.invitation-studio')).toBeVisible(); await page.getByRole('button', { name: 'Preview video scene', exact: true }).click();
  if (windowsWebKit(info)) {
    info.annotations.push({ type: 'platform limitation', description: 'Windows WebKit owner MP4 blob preview verifies fallback; native Safari decoding is unverified.' });
  } else {
    await expect(frame.locator('.cinematic-inline-stage')).toBeVisible(); await expect(frame.getByRole('dialog')).toHaveCount(0);
    await expect(frame.locator('.rg-video-lettering')).toHaveAttribute('data-date-font', 'battambang');
    await expect(frame.locator('.rg-video-date')).toContainText('17:30');
    await frame.getByRole('button', { name: 'Skip video', exact: true }).click();
  }
  await expect(frame.locator('[data-stage=CONTENT]')).toBeVisible();
  await page.getByRole('button', { name: 'Restart animation', exact: true }).click(); await expect(frame.locator('[data-stage=COVER]')).toBeVisible();
  await capture(page, 'studio', info);
  await page.goto('/i/review-celestial'); await expect(page.locator('.rg-open')).toHaveAccessibleName('Join our celebration');
  if (windowsWebKit(info)) { await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); }
  else { await openVideo(page); await skip(page); }
  await expect(page.locator('.rg-paper')).toHaveCSS('--rg-information-overlay', '0.4');
  await expect(page.locator('.rg-paper')).toHaveAttribute('data-spacing', 'compact');
  await expect(page.locator('.rg-ceremonial-monogram img')).toBeVisible();
});

test('refinement: new transparent foreground, shadow-free artwork control and larger inner scroll stay inside the frame', async ({ page }, info) => {
  await setup(page);
  for (const [width,height] of [[375,667],[390,844],[768,1024],[1440,900]]) {
    await page.setViewportSize({width,height}); await page.goto(`/templates/${code}?lang=en`);
    const photo = page.locator('.rg-entrance-photo'), action=page.locator('.rg-open');
    await expect(photo).toHaveAttribute('data-frame-ready','true');
    await expect(page.locator('.rg-royal-arch img')).toHaveAttribute('src',/v3-1\/opening-frame-1200.webp$/);
    await expect(photo).toHaveCSS('clip-path','none'); await expect(photo.locator('img')).toHaveCSS('object-fit','cover');
    expect(await photo.evaluate(n=>Number(getComputedStyle(n).zIndex))).toBeLessThan(await page.locator('.rg-royal-arch').evaluate(n=>Number(getComputedStyle(n).zIndex)));
    await expect(action).toHaveCSS('box-shadow','none'); await expect(action).toHaveCSS('filter','none'); await expect(action).toHaveCSS('background-image','none');
    await action.hover(); await expect(action).toHaveCSS('box-shadow','none'); await page.mouse.move(0,0);
    const [stage,button,guest]=await Promise.all(['.rg-entrance-stage','.rg-open','.rg-royal-guest'].map(s=>page.locator(s).boundingBox()));
    expect(button.y).toBeGreaterThan(guest.y+guest.height);
    expect(button.x-stage.x).toBeGreaterThan(stage.width*.19); expect(stage.x+stage.width-button.x-button.width).toBeGreaterThan(stage.width*.19);
    expect(stage.y+stage.height-button.y-button.height).toBeGreaterThan(stage.width*.25); expect(button.height).toBeGreaterThanOrEqual(44);
    await capture(page,`v31-cover-${width}`,info);
    await openVideo(page); await skip(page);
    const pane=page.locator('.rg-content-scroll'), background=page.locator('.rg-information-background'), border=await background.boundingBox();
    const safe=await pane.boundingBox(); expect(safe.height).toBeGreaterThan(stage.height-stage.width*.63-50);
    expect(stage.y+stage.height-safe.y-safe.height).toBeLessThan(stage.width*.35);
    await expect(page.locator('.rg-information-footer')).toHaveCount(0);
    await pane.evaluate(n=>n.scrollTo({top:0,behavior:'instant'}));
    expect((await page.locator('#rg-family h2').boundingBox()).y).toBeGreaterThanOrEqual(safe.y-1);
    await capture(page,`v31-information-top-${width}`,info);
    await pane.evaluate(n=>n.scrollTo({top:n.scrollHeight,behavior:'instant'}));
    expect(await background.boundingBox()).toEqual(border); const end=await page.locator('.rg-footer').boundingBox();
    expect(end.y+end.height).toBeLessThanOrEqual(safe.y+safe.height+1); expect(await page.evaluate(()=>scrollY)).toBe(0);
    await capture(page,`v31-information-ending-${width}`,info);
  }
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

test('refinement: lower film lettering, live date and two separated top controls across responsive canvases', async ({ page }, info) => {
  await setup(page);
  for (const [width,height] of [[375,667],[390,844],[768,1024],[1440,900]]) {
    await page.setViewportSize({width,height}); await page.goto(`/templates/${code}?lang=km`); await openVideo(page);
    const film=page.locator('.cinematic-inline-stage video'), audio=page.locator('.tpl-royal-garden audio');
    await expect.poll(()=>film.evaluate(n=>n.currentTime)).toBeGreaterThan(0);
    await expect(page.locator('.rg-music')).toHaveCount(1); await expect(page.locator('.cinematic-playback-actions > button')).toHaveCount(1);
    await expect(page.locator('.cinematic-film-controls')).toHaveCount(0);
    await expect(page.locator('.cinematic-film-toggle-icon')).toHaveCSS('opacity','0');
    await page.locator('.rg-video-calligraphy').evaluate(n=>n.decode());
    // Measure the settled composition, after its finite entrance crossfades.
    await page.evaluate(()=>document.getAnimations().filter(a=>Number.isFinite(a.effect?.getTiming().iterations)).forEach(a=>a.finish()));
    const boxes=await Promise.all(['.rg-music','.cinematic-playback-actions > button','.rg-language'].map(s=>page.locator(s).boundingBox()));
    for(let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++) { const a=boxes[i],b=boxes[j]; expect(a.x+a.width<=b.x || b.x+b.width<=a.x || a.y+a.height<=b.y || b.y+b.height<=a.y).toBe(true); }
    const art=await page.locator('.rg-video-calligraphy').boundingBox(), date=await page.locator('.rg-video-date').boundingBox(), footer=await page.locator('.cinematic-film-footer').boundingBox();
    expect(art.width/art.height).toBeCloseTo(3840/1313,1); expect(art.y).toBeGreaterThan(height*.5);
    const crestTop=footer.y+footer.width*(602/3840), artworkGoldBottom=art.y+art.height*(1138/1313);
    const fontSize=await page.locator('.rg-video-date').evaluate(n=>parseFloat(getComputedStyle(n).fontSize));
    expect(date.y+fontSize*.4-artworkGoldBottom).toBeGreaterThan(2);
    expect(crestTop-date.y-date.height).toBeCloseTo(4,0);
    const node=await film.elementHandle(), song=await audio.elementHandle();
    await page.locator('.rg-language select').selectOption('en'); await expect(page.locator('.rg-video-date')).toContainText('31 December 2026');
    expect(await node.evaluate(n=>n===document.querySelector('.cinematic-inline-stage video'))).toBe(true); expect(await song.evaluate(n=>n===document.querySelector('audio'))).toBe(true);
    await expect(film).toHaveJSProperty('muted',true); await expect(page.locator('.rg-music')).toHaveAttribute('data-state','playing');
    await capture(page,`v31-playing-video-${width}`,info); await skip(page);
  }
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
    const button = page.locator('.rg-open'), artwork = await button.locator('img').boundingBox(); expect(artwork.width / artwork.height).toBeCloseTo(3, 1); expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await expect(button).toHaveCSS('box-shadow', 'none'); await expect(button).toHaveCSS('filter', 'none'); await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
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
  const fb = await footer.boundingBox(), vb = await film.boundingBox(); expect(Math.abs(fb.y + fb.height - vb.y - vb.height)).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Skip video', exact: true }).click();
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
    await expect(page.locator('.cinematic-playback-actions > button')).toHaveAccessibleName(/\u179a\u17c6/);
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
  await setup(page); await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/templates/${code}?lang=km`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.rg-open')).toBeVisible();
  const button = await page.locator('.rg-open').boundingBox(); expect(button.width / button.height).toBeCloseTo(3, 1); expect(button.height).toBeGreaterThanOrEqual(44);
  const band = await page.locator('.rg-guest-frame img').boundingBox(); expect(band.width / band.height).toBeCloseTo(3, 1);
  const guest = await page.locator('.rg-royal-guest').boundingBox(); expect(guest.y + guest.height).toBeLessThan(button.y);
  await capture(page, 'critical-cover-km', info); await page.locator('.rg-language select').selectOption('en'); await capture(page, 'critical-cover-en', info);
  await openVideo(page); const film = page.locator('.cinematic-inline-stage video'); await expect.poll(() => film.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  const painted = await film.evaluate(node => { const r = node.getBoundingClientRect(), scale = Math.min(r.width / node.videoWidth, r.height / node.videoHeight); return { width: node.videoWidth * scale, height: node.videoHeight * scale }; });
  expect(painted.width).toBeGreaterThanOrEqual(390 * .9); expect(painted.height).toBeGreaterThanOrEqual(844 * .75);
  const mediaBounds = await film.boundingBox(), footer = await page.locator('.cinematic-film-footer').boundingBox(); expect(Math.abs(footer.y + footer.height - mediaBounds.y - mediaBounds.height)).toBeLessThanOrEqual(1); expect(footer.width / footer.height).toBeCloseTo(3, 1);
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

async function auditedSong(page, rejectOnce = false) {
  await setup(page);
  await page.addInitScript(reject => {
    window.royalAudioAudit = [];
    const nativePlay = HTMLMediaElement.prototype.play;
    let blocked = reject;
    HTMLMediaElement.prototype.play = function () {
      if (this.tagName === 'AUDIO') {
        window.royalAudioAudit.push({ source: this.getAttribute('src'), userActivation: navigator.userActivation?.isActive, time: this.currentTime });
        if (blocked) { blocked = false; return Promise.reject(new DOMException('Synthetic permission denial', 'NotAllowedError')); }
      }
      return nativePlay.call(this);
    };
  }, rejectOnce);
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto(`/templates/${code}?lang=en`);
  await expect(page.locator('.rg-open')).toBeVisible();
  const song = page.locator('.tpl-royal-garden audio');
  await expect(song).toHaveAttribute('src', '/music/Nisai-និស្ស័យ.mp3');
  await expect(song).toHaveCount(1); await expect(song).toHaveJSProperty('paused', true);
  expect(await page.evaluate(() => window.royalAudioAudit)).toEqual([]);
  return song;
}

test('soundtrack: one real song continues through locked video, language, duplicate completion and information', async ({ page }, info) => {
  const song = await auditedSong(page), audio = await song.elementHandle();
  await openVideo(page); const video = page.locator('.cinematic-inline-stage video'), film = await video.elementHandle();
  await expect.poll(() => song.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  await expect(video).toHaveJSProperty('muted', true); await expect(song).toHaveJSProperty('paused', false);
  await video.evaluate(node => { node.muted = false; }); await expect(video).toHaveJSProperty('muted', true);
  await expect(page.getByRole('button', { name: 'Enable sound', exact: true })).toHaveCount(0);
  await expect(page.locator('.cinematic-film-progress')).toHaveCount(0);
  await expect(page.locator('#rg-family,.rg-bottom-nav')).toHaveCount(0);
  await page.mouse.move(190, 600); await page.mouse.wheel(0, 2400);
  if (info.project.name === 'mobile-chromium') {
    const touch = await page.context().newCDPSession(page);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 650 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y: 250 }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touch.detach();
  }
  await page.locator('.rg-video-section').focus();
  for (const key of ['PageDown', 'End', 'ArrowDown', 'Space']) await page.keyboard.press(key);
  await page.evaluate(() => { location.hash = 'rg-rsvp'; });
  for (let i = 0; i < 9; i++) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => Boolean(document.activeElement?.closest('main,.rg-bottom-nav')))).toBe(false); }
  await expect(page.locator('#rg-family,#rg-rsvp')).toHaveCount(0);
  expect(await page.evaluate(() => scrollY)).toBe(0); expect(await page.locator('.rg-content-scroll').evaluate(node => node.scrollTop)).toBe(0);
  await page.locator('.rg-language select').selectOption('km'); await page.locator('.rg-language select').selectOption('en');
  expect(await film.evaluate(node => node === document.querySelector('.cinematic-inline-stage video'))).toBe(true);
  expect(await audio.evaluate(node => node === document.querySelector('.tpl-royal-garden audio'))).toBe(true);
  await expect(video).toHaveJSProperty('muted', true);
  const before = await song.evaluate(node => node.currentTime);
  await capture(page, 'soundtrack-locked-video', info);
  await page.evaluate(() => { window.exitCount = 0; new MutationObserver(() => { if (document.querySelector('.tpl-royal-garden')?.dataset.stage === 'VIDEO_EXITING') window.exitCount++; }).observe(document.querySelector('.tpl-royal-garden'), { attributes: true, attributeFilter: ['data-stage'] }); });
  await page.getByRole('button', { name: 'Skip video', exact: true }).click();
  await expect(page.locator('[data-stage=VIDEO_EXITING]')).toBeVisible(); await film.evaluate(node => node.dispatchEvent(new Event('ended')));
  await expect(page.locator('#rg-family')).toHaveCount(0); await capture(page, 'soundtrack-gold-exit', info);
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await expect(page.locator('#rg-family')).toBeVisible();
  await expect.poll(() => page.locator('.rg-content-scroll').evaluate(node => node.scrollTop)).toBeLessThan(1);
  await expect(song).toHaveJSProperty('paused', false); expect(await song.evaluate(node => node.currentTime)).toBeGreaterThan(before);
  expect(await page.evaluate(() => window.exitCount)).toBe(1);
  const audit = await page.evaluate(() => window.royalAudioAudit); expect(audit).toHaveLength(1); expect(audit[0].userActivation).toBe(true);
  await capture(page, 'soundtrack-information', info);
  if (info.project.name === 'chromium') await fs.writeFile(`${evidence}/soundtrack-and-gate-proof.json`, JSON.stringify({ project: info.project.name, audioPlayCalls: audit, videoForcedMuted: true, onePersistentAudio: true, informationAbsentDuringGate: true, wheelKeyboardHashAndTabCannotExposeInformation: true, exitTransitions: 1, audioTimeBeforeExit: before, audioTimeAfterExit: await song.evaluate(node => node.currentTime), audioPausedAfterExit: await song.evaluate(node => node.paused) }, null, 2));
});

test('soundtrack: denied playback is retryable during video and guest-paused music stays paused after ended', async ({ page }) => {
  const song = await auditedSong(page, true);
  await openVideo(page); await expect(page.getByRole('button', { name: 'Play music', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.rg-music')).toHaveAttribute('data-state','blocked'); await expect(page.locator('.rg-music .lucide-circle-alert')).toBeVisible();
  await expect(song).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Play music', exact: true }).click(); await expect.poll(() => song.evaluate(node => node.currentTime)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause music', exact: true }).click(); await expect(song).toHaveJSProperty('paused', true);
  await expect(page.locator('.rg-music')).toHaveAttribute('data-state','idle');
  const stoppedAt = await song.evaluate(node => node.currentTime);
  await page.locator('.rg-language select').selectOption('km'); await page.locator('.rg-language select').selectOption('en');
  await page.locator('.cinematic-inline-stage video').evaluate(node => node.dispatchEvent(new Event('ended')));
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await expect(song).toHaveJSProperty('paused', true);
  expect(await song.evaluate(node => node.currentTime)).toBeCloseTo(stoppedAt, 1);
  await page.getByRole('button', { name: 'Play music', exact: true }).click(); await expect(song).toHaveJSProperty('paused', false);
});
