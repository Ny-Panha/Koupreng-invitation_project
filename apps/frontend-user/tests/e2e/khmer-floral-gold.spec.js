import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import { KHMER_FLORAL_GOLD_TEMPLATE as demo } from '../../src/features/templates/data/khmerFloralGoldTemplate.js';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';
import { chooseStudioSection } from './support/studioNavigationActions.js';
import { fixtureToken } from './support/fixtureToken.js';
import { Buffer } from 'node:buffer';

const code = 'khmer-floral-gold';
// Synthetic catalog ID is scoped to intercepted browser contracts, never shipped as a renderer ID.
const catalog = { id: 81, code, name: 'Khmer Floral Gold', status: 'ACTIVE', category: 'TRADITIONAL', premium: false, price: 0, currency: 'USD', supportedEventTypes: ['WEDDING'], supportedLanguages: ['KH','EN','BOTH'], thumbnailUrl: `/templates/${code}/preview.svg`, description: JSON.stringify(demo.design) };
const json = (route, data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });
const open = async page => { await page.locator('.kfg-open').click(); await expect.poll(async () => await page.locator('.kfg-content, .kfg-welcome-scene').count()).toBeGreaterThan(0); if (await page.locator('.kfg-continue').count()) await page.locator('.kfg-continue').click(); await expect(page.locator('.kfg-content')).toBeVisible(); };
async function publicFixtures(page, { published = false, failure = false, contentOverrides = {} } = {}) {
  let rsvps = [], attempts = 0;
  const content = { ...demo, couple: { groom: demo.groom, bride: demo.bride }, photos: [], localizedContentV1: demo.localizedContentV1, ...contentOverrides };
  delete content.photos;
  const event = { id: 101, slug: 'floral-review', status: 'PUBLISHED', templateId: 81, templateCode: code, eventType: 'WEDDING', visibility: 'PUBLIC', languageMode: contentOverrides.languageMode || 'KH', eventDate: content.eventDate, eventTime: content.eventTime, venueName: demo.venueName, venueAddress: demo.venueAddress, enabledSections: JSON.stringify(demo.enabledSections), contentJson: JSON.stringify(content), designJson: JSON.stringify({ ...demo.design, gallery: content.gallery, monogramText: demo.monogramText, sketchMapImage: content.sketchMapImage }) };
  await page.route('**/api/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path === '/api/v1/templates') return json(route, [catalog]);
    if (path.startsWith('/api/v1/templates/')) return json(route, catalog);
    if (published && path.endsWith('/floral-review')) return json(route, event);
    if (path.endsWith('/guest-view')) return json(route, { guestName: 'Floral Guest', rsvpStatus: 'PENDING', seatCount: 2 });
    if (path.includes('/rsvp') && request.method() === 'POST') {
      attempts++;
      if (failure && attempts === 1) return json(route, { message: 'RSVP service unavailable' }, 503);
      rsvps.push(request.postDataJSON()); return json(route, { id: 92, ...request.postDataJSON() });
    }
    if (path.endsWith('/media')) return json(route, {});
    return json(route, []);
  });
  return { rsvps };
}

for (const width of [360,390,430,512,768,1024,1440]) test(`reference scenes fit ${width}px`, async ({ page }, info) => {
  await page.setViewportSize({ width, height: 896 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await publicFixtures(page);
  await page.goto(`/templates/${code}`);
  await expect(page.locator('.kfg-invitation')).toHaveAttribute('lang', 'km');
  await expect(page.locator('.kfg-monogram')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const directory = '../../docs/design/khmer-floral-gold/screenshots/v2';
  await mkdir(directory, { recursive: true });
  if (info.project.name === 'desktop-chromium') await page.screenshot({ path: `${directory}/cover-${width}.png`, scale: 'css' });
  await open(page);
  await expect(page.locator('.kfg-section')).toHaveCount(8);
  await expect(page.locator('.kfg-family')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.kfg-invitation').evaluate(node => [...node.querySelectorAll('h1,h2,h3,p,button,input,select')].filter(n => n.clientWidth > 2 && n.scrollWidth > n.clientWidth + 2).map(n => ({ tag: n.tagName, text: n.textContent?.slice(0, 80), width: n.clientWidth, scroll: n.scrollWidth })))).toEqual([]);
  if (info.project.name === 'desktop-chromium') {
    await page.screenshot({ path: `${directory}/invitation-${width}.png`, fullPage: true, scale: 'css' });
    if (width === 512) for (const section of ['family','couplePhoto','countdown','schedule','map','gallery','closing','rsvp']) {
      await page.locator(`[data-section-key="${section}"]`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${directory}/${section}-512.png`, scale: 'css' });
    }
  }
});

test('English, calendar download, lightbox keyboard/focus and nonpersistent demo form', async ({ page }, info) => {
  await publicFixtures(page);
  await page.goto(`/templates/${code}`);
  await page.locator('.kfg-language select').selectOption('en');
  await expect(page.locator('.kfg-opening h1')).toHaveText(demo.localizedContentV1.en.title);
  await open(page);
  await expect(page.locator('.kfg-family')).toContainText('Vireak');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Add to calendar', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.ics$/);
  const trigger = page.getByRole('button', { name: 'Open photograph 1', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Wedding photo viewer' });
  await expect(dialog).toBeVisible();
  await dialog.evaluate(node => Promise.all([...node.getAnimations({ subtree: true }), ...node.parentElement.getAnimations()].map(animation => animation.finished.catch(() => {}))));
  await mkdir('../../docs/design/khmer-floral-gold/screenshots/v2', { recursive: true });
  await page.screenshot({ path: `../../docs/design/khmer-floral-gold/screenshots/v2/lightbox-${info.project.name}.png`, scale: 'css' });
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('header')).toContainText('2 / 12');
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape'); await expect(page.locator('.kfg-slide')).toBeFocused();
  const bounds = await page.locator('.kfg-slide').boundingBox();
  await page.mouse.move(bounds.x + bounds.width * .7, bounds.y + bounds.height / 2);
  await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width * .3, bounds.y + bounds.height / 2, { steps: 8 }); await page.mouse.up();
  await expect(page.locator('.kfg-carousel-controls')).toContainText('3 / 12');
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'View larger venue map' }).click();
  await expect(page.getByRole('dialog', { name: 'Venue diagram' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Guest name', exact: true }).fill('Demo guest');
  await page.getByRole('radio', { name: 'Not attending', exact: true }).check();
  await page.getByRole('button', { name: 'Try RSVP', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Preview only' })).toBeVisible();
  const a11y = await new AxeBuilder({ page }).include('.kfg-invitation').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(a11y.violations).toEqual([]);
});

test('owner music starts after a gesture, pauses and stops after navigating away', async ({ page }) => {
  // Original silent PCM fixture: no third-party recording or music license involved.
  const wav = Buffer.alloc(44 + 16000);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(16000, 40);
  await publicFixtures(page, { published: true, contentOverrides: { music: { url: '/floral-test.wav' }, musicUrl: '/floral-test.wav' } });
  await page.route('**/floral-test.wav', route => route.fulfill({ contentType: 'audio/wav', body: wav }));
  await page.goto('/w/floral-review?lang=en');
  await expect(page.locator('audio')).toHaveCount(1);
  expect(await page.locator('audio').evaluate(node => node.paused)).toBe(true);
  await open(page);
  await expect(page.getByRole('button', { name: 'Pause music' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Pause music' }).click();
  expect(await page.locator('audio').evaluate(node => node.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play music' }).click();
  await page.evaluate(() => { window.__floralTestAudio = document.querySelector('audio'); });
  await page.locator('.kfg-footer').getByRole('link', { name: 'Koupreng', exact: true }).click();
  await expect(page.locator('audio')).toHaveCount(0);
  expect(await page.evaluate(() => window.__floralTestAudio.paused)).toBe(true);
});

test('published guest RSVP waits for server confirmation and retains credentials across languages', async ({ page }) => {
  const { rsvps } = await publicFixtures(page, { published: true, failure: true });
  await page.goto('/w/floral-review?token=floral-guest');
  await page.locator('.kfg-language select').selectOption('en');
  await expect(page).toHaveURL(/token=floral-guest/);
  await open(page);
  await page.getByRole('radio', { name: 'Not attending', exact: true }).check();
  await page.getByRole('button', { name: 'Submit RSVP', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Service Unavailable');
  await expect(page.getByText('RSVP received', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Submit RSVP', exact: true }).click();
  await expect(page.getByText('RSVP received', { exact: true })).toBeVisible();
  expect(rsvps).toHaveLength(1);
  expect(rsvps[0].responseStatus).toBe('NOT_ATTENDING');
});

test('missing host media never becomes demo people, map, agenda or a sample date', async ({ page }) => {
  await publicFixtures(page, { published: true, contentOverrides: { coverImage: '', backgroundImage: '', invitationImage: '', invitationImage2: '', sketchMapImage: '', gallery: [], schedule: [], eventDate: '', eventTime: '', localizedContentV1: null, languageMode: 'EN' } });
  await page.goto('/w/floral-review?lang=en');
  await open(page);
  await expect(page.locator('.kfg-couple-photograph img')).toHaveCount(0);
  await expect(page.locator('.kfg-portraits img')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View larger venue map' })).toHaveCount(0);
  await expect(page.locator('.kfg-schedule')).toContainText('The program will be announced soon.');
  await expect(page.locator('.kfg-gallery')).toContainText('Photographs will be shared here.');
});

test('visitor browses, previews, signs in, creates, edits, publishes and receives a guest RSVP', async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript(() => localStorage.setItem('koupreng.lang', 'en'));
  await publicFixtures(page);
  await page.goto('/templates');
  await page.locator('.tp-card').filter({ hasText: 'Khmer Floral Gold' }).getByRole('link', { name: 'Preview', exact: true }).click();
  await expect(page.locator('.kfg-open')).toBeVisible();
  await page.locator('.kfg-demo-actions a[href^="/login"]').click();
  await expect(page).toHaveURL(/\/login\?next=/);
  const { events, writes } = await installIdentityFixtures(page, { catalog: [catalog] });
  const responses = [];
  let creates = 0;
  await page.route('**/api/v1/**', route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (path.endsWith('/templates/recommendations')) return json(route, [{ template: catalog, score: 100 }]);
    if (path === '/api/v1/invitations' && request.method() === 'POST') {
      creates++;
      const event = { ...events.get(101), ...request.postDataJSON(), templateId: 81, templateCode: code, slug: 'review-celestial', venueAddress: 'Owner address' };
      events.set(101, event); return json(route, event, 201);
    }
    if (path === '/api/v1/invitations/101/publish') { events.set(101, { ...events.get(101), status: 'PUBLISHED' }); return json(route, events.get(101)); }
    if (path.endsWith('/rsvp') && request.method() === 'POST') { responses.push(request.postDataJSON()); return json(route, { id: 92, ...request.postDataJSON() }); }
    return route.fallback();
  });
  await page.route('**/auth/login', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ accessToken: fixtureToken, user: { id: 7, fullName: 'Floral owner', email: 'floral@example.test', role: 'USER' } }) }));
  await page.locator('input[autocomplete="username"]').fill('floral@example.test');
  await page.locator('input[autocomplete="current-password"]').fill('BrowserFixture123!');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/app\/events\/new\?template=khmer-floral-gold/);
  await page.locator('[name="title"]').fill('Owner floral wedding');
  await page.locator('[name="groomName"]').fill('Owner Dara');
  await page.locator('[name="brideName"]').fill('Owner Sophea');
  await page.locator('[name="eventDate"]').fill('2027-02-14');
  await page.locator('[name="eventTime"]').fill('17:00');
  await page.locator('[name="venueName"]').fill('Owner hall');
  await page.locator('.event-preferences-disclosure summary').click();
  await page.locator('.event-preferences select').nth(1).selectOption('EN');
  await page.getByRole('button', { name: 'Select Khmer Floral Gold', exact: true }).click();
  await page.getByRole('button', { name: 'Create event', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/events\/101\/invitation/);
  await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
  await chooseStudioSection(page, 'designCover');
  await page.getByLabel('Couple initials', { exact: true }).fill('DS');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => writes.length).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm publication', exact: true }).click();
  await expect.poll(() => events.get(101).status).toBe('PUBLISHED');
  await page.goto('/w/review-celestial');
  await open(page);
  await expect(page.locator('.kfg-family')).toContainText('Owner Dara');
  await expect(page.locator('.kfg-couple-photograph img')).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Guest name', exact: true }).fill('Floral guest');
  await page.getByRole('button', { name: 'Submit RSVP', exact: true }).click();
  await expect(page.getByText('RSVP received', { exact: true })).toBeVisible();
  expect(responses).toHaveLength(1); expect(creates).toBe(1);
});

for (const plan of ['FREE','BASIC','PRO','PREMIUM','CUSTOM']) test(`${plan} can edit, persist, refresh and publish floral without checkout`, async ({ page }) => {
  const { events, writes } = await installIdentityFixtures(page, { catalog: [catalog] });
  events.set(101, { ...events.get(101), templateId: 81, templateCode: code, designJson: JSON.stringify(demo.design), title: 'Owner wedding', groomName: 'Owner Dara', brideName: 'Owner Sophea', venueAddress: 'Owner address', contentJson: JSON.stringify({ monogramText: 'OS', invitationImage: demo.invitationImage, invitationImage2: demo.invitationImage2, sketchMapImage: demo.sketchMapImage, gallery: demo.gallery }) });
  const payments = [];
  await page.route('**/api/v1/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes('payments') && route.request().method() === 'POST') payments.push(path);
    if (path.endsWith('/entitlements')) return json(route, { packageCode: plan, maxInvitations: 5, maxGuestsPerInvitation: 40, features: [] });
    if (path.endsWith('/subscriptions/current')) return json(route, plan === 'FREE' ? null : { active: true, paymentStatus: 'PAID', status: 'ACTIVE', endDate: '2028-01-01T00:00:00Z', packagePlan: { code: plan, maxInvitations: 5 } });
    if (path === '/api/v1/invitations/101/publish') { events.set(101, { ...events.get(101), status: 'PUBLISHED' }); return json(route, events.get(101)); }
    return route.fallback();
  });
  await page.goto('/app/events/101/invitation');
  await expect(page.locator('.pe-template-tag')).toHaveText('Khmer Floral Gold');
  await chooseStudioSection(page, 'designCover');
  const initials = page.getByLabel('Couple initials', { exact: true });
  await initials.fill('DS');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => writes.length).toBeGreaterThan(0);
  expect(JSON.parse(writes.at(-1).payload.designJson).monogramText).toBe('DS');
  await page.reload();
  await chooseStudioSection(page, 'designCover');
  await expect(initials).toHaveValue('DS');
  if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
  await expect(page.frameLocator('iframe[title="Live User Template Preview"]').locator('.kfg-invitation')).toBeVisible();
  if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Return to editing', exact: true }).click();
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm publication', exact: true }).click();
  await expect.poll(() => events.get(101).status).toBe('PUBLISHED');
  expect(payments).toEqual([]);
});
