import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const repo = process.cwd().replaceAll('\\', '/');
const out = 'D:/Koupreng-UXUI-Phase4';
const require = createRequire(`${repo}/apps/frontend-user/package.json`);
const { chromium } = require('playwright');
const { installOverhaulFixtures } = await import(pathToFileURL(`${repo}/apps/frontend-user/tests/e2e/support/overhaulFixtures.js`));
const phase = process.argv[2] || 'before';
const base = process.env.PHASE4_BASE || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ headless: true });
const records = [];
const json = (route, data) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data }) });
const guests = Array.from({ length: 24 }, (_, i) => ({ id: 501 + i, guestName: `Review Guest ${String(i + 1).padStart(2, '0')}`, phone: `012340${String(i).padStart(3, '0')}`, email: `guest${i}@example.test`, seatCount: i % 3 + 1, guestGroup: 'Bride Side', sideType: 'Family', note: 'Synthetic review record', sendStatus: 'PENDING' }));
const rsvps = guests.slice(0, 10).map((g, i) => ({ id: 900 + i, guestId: g.id, guestName: g.guestName, responseStatus: i % 2 ? 'NOT_ATTENDING' : 'ATTENDING', attendeeCount: i % 2 ? 0 : g.seatCount, respondedAt: '2026-10-20T08:30:00Z', message: i === 0 ? 'Looking forward to celebrating with you.' : '' }));
function geometry() {
  const box = selector => { const e = document.querySelector(selector); if (!e) return null; const r = e.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height, scrollTop: e.scrollTop, clientHeight: e.clientHeight, scrollHeight: e.scrollHeight, overflow: getComputedStyle(e).overflowY }; };
  return { windowY: scrollY, documentWidth: document.documentElement.scrollWidth, viewport: { width: innerWidth, height: innerHeight }, sidebar: box('.event-workspace-sidebar'), main: box('.event-workspace-main'), context: box('.event-navigation-header'), footer: box('.event-navigation-footer'), menu: box('.event-navigation-body') };
}
async function capture(name, module, width = 1440, lang = 'en', action = null, folder = phase) {
  const page = await browser.newPage({ viewport: { width, height: width < 768 ? (width === 320 ? 568 : 844) : 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await installOverhaulFixtures(page, lang, { published: true });
  await page.route('**/api/v1/invitations/101/guests', route => json(route, guests));
  await page.route('**/api/v1/invitations/101/seating', route => json(route, { invitationId: 101, tables: [], assignments: [], unassignedGuests: guests }));
  await page.route('**/api/v1/invitations/101/seating/summary', route => json(route, { totalTables: 0, totalCapacity: 0, assignedSeats: 0 }));
  await page.route('**/api/v1/invitations/101/rsvps', route => json(route, rsvps));
  await page.route('**/api/v1/invitations/101/rsvps/summary', route => json(route, { totalGuests: 24, attending: 5, notAttending: 5, pending: 14, totalAttendeeCount: rsvps.reduce((sum, r) => sum + r.attendeeCount, 0) }));
  await page.route('**/api/v1/invitations/101/dashboard', route => json(route, { totalGuests: 24, totalInvited: guests.reduce((sum, g) => sum + g.seatCount, 0), attending: 5, declined: 5, pending: 14, deliverySent: 0 }));
  await page.route('**/api/v1/invitations/101/delivery/summary', route => json(route, { totalGuests: guests.length, ready: guests.length, sent: 0, failed: 0, guests: guests.map(g => ({ ...g, guestId: g.id, invitationUrl: `https://koupreng.example/w/review-${g.id}` })) }));
  await page.route('**/api/v1/invitations/101/media', route => json(route, { coverImage: null, galleryImages: [], video: null, backgroundMusic: null, all: [] }));
  await page.route('**/*', route => ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()) ? route.fallback() : route.abort('blockedbyclient'));
  await page.goto(`${base}/app/events${module === 'events' ? '' : `/101${module ? `/${module}` : ''}`}`);
  await page.getByRole('main').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const scroll = [];
  if (action === 'add') await page.getByRole('button', { name: 'Add guest', exact: true }).click();
  if (action === 'edit') await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
  if (action === 'add' || action === 'edit') await page.waitForTimeout(250);
  if (action === 'scroll') {
    scroll.push(await page.evaluate(geometry));
    for (const dy of [400, 500, 100000]) {
      await page.locator('.event-workspace-main').hover(); await page.mouse.wheel(0, dy); await page.waitForTimeout(200); scroll.push(await page.evaluate(geometry));
    }
  }
  const path = `${out}/screenshots/${folder}/${name}.png`;
  await mkdir(`${out}/screenshots/${folder}`, { recursive: true });
  await page.screenshot({ path });
  records.push({ name, phase, lang, path, route: new URL(page.url()).pathname, browser: browser.version(), geometry: await page.evaluate(geometry), scroll, pageErrors: errors });
  console.log(`${phase}: ${name}`);
  await page.close();
}
try {
  for (const [name, module, action] of [['event-dashboard', ''], ['guests', 'guests'], ['add-guest', 'guests', 'add'], ['edit-guest', 'guests', 'edit'], ['rsvp', 'rsvp'], ['delivery', 'delivery'], ['media', 'media'], ['seating', 'seating'], ['my-events', 'events'], ['sidebar-scroll', 'guests', 'scroll']]) await capture(name, module, 1440, 'en', action);
  if (phase === 'after') for (const width of [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]) for (const module of ['', 'guests', 'rsvp', 'delivery', 'media', 'seating', 'events']) await capture(`${module || 'dashboard'}-km-${width}`, module, width, 'km', null, 'responsive');
  await mkdir(`${out}/metadata`, { recursive: true });
  await writeFile(`${out}/metadata/${phase}-captures.json`, JSON.stringify(records, null, 2));
} finally { await browser.close(); }
