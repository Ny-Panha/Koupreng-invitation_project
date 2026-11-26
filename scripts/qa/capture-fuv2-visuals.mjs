import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
import AxeBuilder from '../../apps/frontend-user/node_modules/@axe-core/playwright/dist/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const stageArg = process.argv.find((arg) => arg.startsWith('--stage='))?.split('=')[1] || 'before';
const outDir = path.resolve(`docs/uxui/frontend-user-v2/evidence/${stageArg}`);
const port = 4316;
const baseURL = `http://127.0.0.1:${port}`;

const TEST_TOKEN = ['eyJhbGciOiJub25lIn0', 'eyJleHAiOjQxMDIyNjg4MDB9', ''].join('.');

const mockEvents = [
  {
    id: 42,
    title: 'សិរីមង្គលអាពាហ៍ពិពាហ៍ វណ្ណៈ និងកុលាប · Vannak & Kolab Royal Wedding',
    groomName: 'វណ្ណៈ (Vannak)',
    brideName: 'កុលាប (Kolab)',
    eventType: 'WEDDING',
    eventDate: '2027-11-28',
    eventTime: '17:00',
    venueName: 'Sokha Phnom Penh Hotel Grand Ballroom',
    venueAddress: 'Keo Chenda St, Sangkat Chroy Changvar, Phnom Penh',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    slug: 'vannak-kolab-2027',
    templateId: 1,
    templateCode: 'khmer-floral-gold',
    templateName: 'Khmer Floral Gold',
    coverUrl: '/templates/khmer-floral-gold/cover-preview-640.webp',
    templateThumbnailUrl: '/templates/khmer-floral-gold/cover-preview-640.webp',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-18T15:30:00Z',
  },
  {
    id: 105,
    title: 'Channary 30th Birthday Gala',
    hostName: 'Channary',
    eventType: 'BIRTHDAY',
    eventDate: '2027-04-12',
    eventTime: '18:30',
    venueName: 'Rosewood Phnom Penh',
    venueAddress: 'Vattanac Capital Tower, Phnom Penh',
    status: 'DRAFT',
    visibility: 'PRIVATE',
    slug: 'channary-30th',
    templateId: 30,
    templateCode: 'event-essential',
    templateName: 'Event Essential',
    coverUrl: '/templates/event-essential.svg',
    templateThumbnailUrl: '/templates/event-essential.svg',
    createdAt: '2026-11-10T12:00:00Z',
    updatedAt: '2026-11-15T09:00:00Z',
  },
  {
    id: 201,
    title: 'Piseth Tech Leadership Summit',
    hostName: 'Piseth',
    eventType: 'CORPORATE',
    eventDate: '2027-08-20',
    eventTime: '09:00',
    venueName: 'Koh Pich Convention Center',
    venueAddress: 'Koh Pich, Phnom Penh',
    status: 'PUBLISHED',
    visibility: 'PASSWORD_PROTECTED',
    shared: true,
    ownerName: 'Piseth Tech Ltd',
    slug: 'tech-leadership-2027',
    templateId: 30,
    templateCode: 'event-essential',
    templateName: 'Event Essential',
    coverUrl: '/templates/event-essential.svg',
    templateThumbnailUrl: '/templates/event-essential.svg',
    createdAt: '2026-11-05T08:00:00Z',
    updatedAt: '2026-11-12T14:00:00Z',
  },
];

const mockCatalog = [
  {
    id: 1,
    code: 'khmer-floral-gold',
    slug: 'khmer-floral-gold',
    name: 'Khmer Floral Gold',
    category: 'ANCIENT',
    status: 'ACTIVE',
    premium: true,
    price: 19,
    currency: 'USD',
    thumbnailUrl: '/templates/khmer-floral-gold/cover-preview-640.webp',
    supportedEventTypes: ['WEDDING', 'ENGAGEMENT'],
    supportedLanguages: ['KH', 'EN', 'BOTH'],
  },
  {
    id: 2,
    code: 'silk-heritage',
    slug: 'silk-heritage',
    name: 'Silk Heritage',
    category: 'TRADITIONAL',
    status: 'ACTIVE',
    premium: false,
    price: 0,
    currency: 'USD',
    thumbnailUrl: '/templates/silk-heritage/cover.svg',
    supportedEventTypes: ['WEDDING', 'ENGAGEMENT'],
    supportedLanguages: ['KH', 'EN', 'BOTH'],
  },
  {
    id: 30,
    code: 'event-essential',
    slug: 'event-essential',
    name: 'Event Essential',
    category: 'MINIMALIST',
    status: 'ACTIVE',
    premium: false,
    price: 0,
    currency: 'USD',
    thumbnailUrl: '/templates/event-essential.svg',
    supportedEventTypes: ['WEDDING', 'ENGAGEMENT', 'BIRTHDAY', 'ANNIVERSARY', 'CORPORATE', 'OTHER'],
    supportedLanguages: ['KH', 'EN', 'BOTH'],
  },
];

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Preview server did not start within ${timeoutMs}ms`);
}

async function setupContext(browser, { width, height, lang = 'en', theme = 'light', auth = true } = {}) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();

  await page.addInitScript(({ token, lang, theme, auth }) => {
    window.localStorage.setItem('koupreng.lang', lang);
    window.localStorage.setItem('koupreng.colorMode', theme);
    window.localStorage.setItem('theme', theme);
    if (auth) {
      const env = JSON.stringify({
        accessToken: token,
        tokenType: 'Bearer',
        expiresAt: '2100-01-01T00:00:00Z',
        user: { id: 7, fullName: 'Sokha Meas', email: 'sokha@example.test', role: 'USER' },
      });
      window.sessionStorage.setItem('koupreng.auth', env);
      window.localStorage.setItem('koupreng.auth', env);
    } else {
      window.sessionStorage.removeItem('koupreng.auth');
      window.localStorage.removeItem('koupreng.auth');
    }
  }, { token: TEST_TOKEN, lang, theme, auth });

  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname;
    const method = route.request().method();
    const json = (data, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });

    if (p.endsWith('/i18n/messages')) return json({ messages: {} });
    if (p.endsWith('/auth/me') || p.endsWith('/users/me')) {
      return json({ id: 7, fullName: 'Sokha Meas', email: 'sokha@example.test', role: 'USER' });
    }
    if (p === '/api/v1/templates' || p === '/api/v1/templates/public') return json(mockCatalog);
    if (p === '/api/v1/templates/recommendations') {
      return json(mockCatalog.map((template) => ({ template, score: 98, styleMatch: true })));
    }
    if (p.startsWith('/api/v1/templates/')) return json(mockCatalog[0]);
    if (p.includes('/invitations/my')) return json(mockEvents);
    if (p === '/api/v1/invitations/42' || p === '/api/v1/invitations/42/preview') {
      return json(mockEvents[0]);
    }
    if (p === '/api/v1/invitations/42/access') {
      return json({
        owner: true,
        permissions: ['VIEW_EVENT', 'EDIT_EVENT', 'MANAGE_SETTINGS', 'MANAGE_INVITATION', 'MANAGE_GUESTS', 'MANAGE_BUDGET', 'MANAGE_SEATING', 'MANAGE_CHECKIN', 'MANAGE_RSVP', 'VIEW_REPORTS'],
        ownerFeatures: ['QR_INVITATIONS', 'SEATING', 'QR_CHECK_IN', 'TEAM_MEMBERS'],
      });
    }
    if (p === '/api/v1/invitations/42/dashboard') {
      return json({
        totalGuests: 240,
        totalInvited: 240,
        attending: 176,
        declined: 18,
        maybe: 12,
        pending: 34,
        deliverySent: 190,
      });
    }
    if (p === '/api/v1/invitations/42/budget-items') {
      return json([
        { id: 1, category: 'Venue & Catering', actualCost: 3500, estimatedCost: 4000, currency: 'USD' },
        { id: 2, category: 'Traditional Music', actualCost: 2000000, estimatedCost: 2400000, currency: 'KHR' },
      ]);
    }
    if (p === '/api/v1/invitations/42/gifts') {
      return json([
        { id: 1, guestName: 'Bopha', amount: 200, currency: 'USD' },
        { id: 2, guestName: 'Rithy', amount: 800000, currency: 'KHR' },
      ]);
    }
    if (p === '/api/v1/invitations/42/check-in/summary') {
      return json({ totalCheckedIn: 112, checkedIn: 112 });
    }
    if (p === '/api/v1/invitations/42/guests/page') {
      const items = [
        {
          guest: {
            id: 1,
            invitationId: 42,
            guestName: 'Chanthy & Sophea',
            companionName: 'Sophea',
            phone: '012 345 678',
            guestGroup: 'Bride Side',
            sideType: 'Family',
            tableNumber: 'VIP Table 1',
            seatCount: 2,
            sendStatus: 'SENT',
            inviteToken: 'tok-chanthy-1',
          },
          rsvpStatus: 'ATTENDING',
          attendeeCount: 2,
          respondedAt: '2026-11-18T12:30:00Z',
          checkedIn: true,
          checkedInAt: '2026-11-18T16:15:00Z',
        },
        {
          guest: {
            id: 2,
            invitationId: 42,
            guestName: 'Visal Dara',
            companionName: '',
            phone: '077 889 900',
            guestGroup: 'Groom Side',
            sideType: 'Coworker',
            tableNumber: '',
            seatCount: 1,
            sendStatus: 'PENDING',
            inviteToken: 'tok-visal-2',
          },
          rsvpStatus: 'PENDING',
          attendeeCount: 1,
          respondedAt: null,
          checkedIn: false,
          checkedInAt: null,
        },
        {
          guest: {
            id: 3,
            invitationId: 42,
            guestName: 'Dara & Pisey',
            companionName: 'Pisey',
            phone: '098 221 334',
            guestGroup: 'Groom Side',
            sideType: 'Friend',
            tableNumber: 'Table 2',
            seatCount: 2,
            sendStatus: 'OPENED',
            inviteToken: 'tok-dara-3',
          },
          rsvpStatus: 'ATTENDING',
          attendeeCount: 2,
          respondedAt: '2026-11-18T13:10:00Z',
          checkedIn: false,
          checkedInAt: null,
        },
      ];
      return json({ items, page: 0, size: 25, totalElements: items.length, totalPages: 1 });
    }
    if (p === '/api/v1/invitations/42/guests/overview') {
      return json({
        guestRecords: 3,
        reservedSeats: 5,
        attendingRecords: 2,
        declinedRecords: 0,
        maybeRecords: 0,
        unansweredRecords: 1,
        respondedRecords: 2,
        toInviteRecords: 1,
        checkedInRecords: 1,
        confirmedAttendees: 4,
        markedSentRecords: 2,
      });
    }
    if (p === '/api/v1/invitations/42/guests') {
      return json([
        { id: 1, invitationId: 42, guestName: 'Chanthy & Sophea', companionName: 'Sophea', phone: '012 345 678', guestGroup: 'Bride Side', sideType: 'Family', tableNumber: 'VIP Table 1', seatCount: 2, sendStatus: 'SENT', inviteToken: 'tok-chanthy-1' },
        { id: 2, invitationId: 42, guestName: 'Visal Dara', phone: '077 889 900', guestGroup: 'Groom Side', sideType: 'Coworker', tableNumber: '', seatCount: 1, sendStatus: 'PENDING', inviteToken: 'tok-visal-2' },
        { id: 3, invitationId: 42, guestName: 'Dara & Pisey', companionName: 'Pisey', phone: '098 221 334', guestGroup: 'Groom Side', sideType: 'Friend', tableNumber: 'Table 2', seatCount: 2, sendStatus: 'OPENED', inviteToken: 'tok-dara-3' },
      ]);
    }
    if (p.includes('/notifications')) {
      return json([
        { id: 1, title: 'RSVP Confirmed', message: 'Chanthy confirmed 2 seats.', createdAt: '2026-11-18T14:20:00Z' },
      ]);
    }
    if (p === '/api/v1/invitations/42/seating') {
      return json({
        invitationId: 42,
        tables: [
          {
            id: 1,
            invitationId: 42,
            tableName: 'VIP Table 1',
            tableLabel: 'Family & Elders',
            capacity: 10,
            assignedSeats: 2,
            remainingSeats: 8,
            sortOrder: 1,
            notes: '{"x":25,"y":35}',
          },
          {
            id: 2,
            invitationId: 42,
            tableName: 'Table 2',
            tableLabel: 'Colleagues & Friends',
            capacity: 10,
            assignedSeats: 2,
            remainingSeats: 8,
            sortOrder: 2,
            notes: '{"x":75,"y":35}',
          },
        ],
        assignments: [
          {
            id: 10,
            invitationId: 42,
            tableId: 1,
            tableName: 'VIP Table 1',
            guestId: 1,
            guestName: 'Chanthy & Sophea',
            guestGroup: 'Bride Side',
            seatLabel: 'Seats 1-2',
            seatCount: 2,
            notes: '',
            assignedAt: '2026-11-18T14:25:00Z',
          },
          {
            id: 11,
            invitationId: 42,
            tableId: 2,
            tableName: 'Table 2',
            guestId: 3,
            guestName: 'Dara & Pisey',
            guestGroup: 'Groom Side',
            seatLabel: 'Seats 1-2',
            seatCount: 2,
            notes: '',
            assignedAt: '2026-11-18T14:30:00Z',
          },
        ],
        unassignedGuests: [
          {
            id: 2,
            invitationId: 42,
            guestName: 'Visal Dara',
            guestGroup: 'Groom Side',
            sideType: 'Coworker',
            seatCount: 1,
          },
        ],
      });
    }
    if (p === '/api/v1/invitations/42/seating/layout') {
      return json({
        eventId: 42,
        version: 1,
        data: {
          schemaVersion: 1,
          positions: { 1: { x: 25, y: 35 }, 2: { x: 75, y: 35 } },
          venue: {
            stage: { x: 50, y: 9 },
            entrance: { x: 50, y: 92 },
            walkway: { x: 50, y: 51, orientation: 'vertical', enabled: true },
          },
        },
        updatedAt: '2026-11-18T14:00:00Z',
      });
    }
    if (p === '/api/v1/invitations/42/seating/summary') {
      return json({ invitationId: 42, totalTables: 2, totalCapacity: 20, assignedSeats: 4, remainingSeats: 16 });
    }
    if (p === '/api/v1/public/invitations/protected-sample' && method === 'GET') {
      return route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ message: 'Invitation password required' }) });
    }
    if (p === '/api/v1/public/invitations/vannak-kolab-2027' && method === 'GET') {
      return json(mockEvents[0]);
    }
    return json({});
  });

  return { context, page };
}

async function measureAndShoot(page, fileName, options = {}) {
  const { waitForSelector, waitForDetached, fullPage = false, scrollToY = 0, runAxe = true } = options;
  if (waitForSelector) {
    await page.locator(waitForSelector).first().waitFor({ state: 'visible', timeout: 15000 });
  }
  if (waitForDetached) {
    await page.locator(waitForDetached).first().waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(350);
  if (scrollToY > 0) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollToY);
    await page.waitForTimeout(250);
  }
  const metrics = await page.evaluate(() => {
    const html = document.documentElement;
    const sidebar = document.querySelector('.event-workspace-sidebar');
    const navBody = document.querySelector('.event-navigation-body');
    const main = document.querySelector('.event-workspace-main');
    const h1 = document.querySelector('h1');
    const btn = document.querySelector('button, .workspace-button, .kp-button');
    return {
      url: location.pathname,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: html.scrollWidth,
      overflowPx: html.scrollWidth - window.innerWidth,
      scrollY: window.scrollY,
      docHeight: html.scrollHeight,
      colorMode: html.dataset.colorMode || null,
      lang: html.lang || null,
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      btnFontSize: btn ? getComputedStyle(btn).fontSize : null,
      sidebarStyle: sidebar
        ? {
            position: getComputedStyle(sidebar).position,
            top: getComputedStyle(sidebar).top,
            height: getComputedStyle(sidebar).height,
            rect: sidebar.getBoundingClientRect().toJSON(),
          }
        : null,
      navBodyStyle: navBody
        ? {
            overflowY: getComputedStyle(navBody).overflowY,
            scrollHeight: navBody.scrollHeight,
            clientHeight: navBody.clientHeight,
          }
        : null,
      mainStyle: main
        ? {
            overflowY: getComputedStyle(main).overflowY,
            rect: main.getBoundingClientRect().toJSON(),
          }
        : null,
    };
  });

  let axeViolations = [];
  if (runAxe) {
    try {
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      axeViolations = axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        help: v.help,
        targets: v.nodes.map((n) => n.target.join(' ')).slice(0, 10),
      }));
    } catch (e) {
      axeViolations = [{ id: 'axe-error', help: String(e) }];
    }
  }

  await page.screenshot({ path: path.join(outDir, fileName), fullPage });
  return { fileName, ...metrics, axeViolations };
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const server = spawn(
    'node',
    ['./node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: path.resolve('apps/frontend-user'), stdio: 'ignore' }
  );

  try {
    await waitForServer(baseURL);
    const browser = await chromium.launch();
    const results = [];

    const cases = [
      { name: '01-home-light-en-1440.png', route: '/', width: 1440, height: 900, lang: 'en', theme: 'light', auth: false, waitForSelector: '.kp-hero h1' },
      { name: '02-home-dark-km-390.png', route: '/', width: 390, height: 844, lang: 'km', theme: 'dark', auth: false, waitForSelector: '.kp-hero h1' },
      { name: '03-login-light-en-1440.png', route: '/login', width: 1440, height: 900, lang: 'en', theme: 'light', auth: false, waitForSelector: 'form' },
      { name: '04-login-dark-km-390.png', route: '/login', width: 390, height: 844, lang: 'km', theme: 'dark', auth: false, waitForSelector: 'form' },
      { name: '05-templates-light-en-1440.png', route: '/templates', width: 1440, height: 900, lang: 'en', theme: 'light', auth: false, waitForSelector: '.tp-card' },
      { name: '06-templates-dark-km-390.png', route: '/templates', width: 390, height: 844, lang: 'km', theme: 'dark', auth: false, waitForSelector: '.tp-card' },
      { name: '07-events-light-en-1440.png', route: '/app/events', width: 1440, height: 900, lang: 'en', theme: 'light', auth: true, waitForSelector: '.events-page' },
      { name: '08-events-dark-km-320.png', route: '/app/events', width: 320, height: 640, lang: 'km', theme: 'dark', auth: true, waitForSelector: '.events-page' },
      { name: '09-dashboard-top-light-en-1440.png', route: '/app/events/42', width: 1440, height: 900, lang: 'en', theme: 'light', auth: true, waitForSelector: '.overview-hero', scrollToY: 0 },
      { name: '10-dashboard-scrolled-light-en-1440.png', route: '/app/events/42', width: 1440, height: 900, lang: 'en', theme: 'light', auth: true, waitForSelector: '.overview-hero', scrollToY: 700 },
      { name: '11-dashboard-dark-en-1440.png', route: '/app/events/42', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.overview-hero', scrollToY: 0 },
      { name: '12-dashboard-short-768x600.png', route: '/app/events/42', width: 1024, height: 600, lang: 'en', theme: 'light', auth: true, waitForSelector: '.overview-hero', scrollToY: 0 },
      { name: '13-dashboard-mobile-km-390.png', route: '/app/events/42', width: 390, height: 844, lang: 'km', theme: 'light', auth: true, waitForSelector: '.overview-hero', scrollToY: 0 },
      { name: '14-guests-light-en-1440.png', route: '/app/events/42/guests', width: 1440, height: 900, lang: 'en', theme: 'light', auth: true, waitForSelector: '.guest-record-row', fullPage: true },
      { name: '15-guests-dark-km-390.png', route: '/app/events/42/guests', width: 390, height: 844, lang: 'km', theme: 'dark', auth: true, waitForSelector: '.guest-record-row', fullPage: true },
      { name: '16-studio-light-en-1440.png', route: '/app/events/42/invitation', width: 1440, height: 900, lang: 'en', theme: 'light', auth: true, waitForSelector: '.invitation-studio', waitForDetached: '.studio-preview-recovery', runAxe: false },
      { name: '17-public-password-gate-km-390.png', route: '/i/protected-sample', width: 390, height: 844, lang: 'km', theme: 'light', auth: false, waitForSelector: '.protected-gate-card' },
    ];

    if (stageArg === 'after') {
      cases.push(
        { name: '18-studio-dark-en-1440.png', route: '/app/events/42/invitation', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.invitation-studio', waitForDetached: '.studio-preview-recovery', runAxe: false },
        { name: '19-settings-dark-en-1440.png', route: '/app/events/42/settings', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.event-settings' },
        { name: '20-seating-dark-en-1440.png', route: '/app/events/42/seating', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.seating-table-card' },
        { name: '21-calendar-dark-en-1440.png', route: '/app/events?view=calendar', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.event-calendar-container' },
        { name: '22-budget-dark-en-1440.png', route: '/app/events/42/budget', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.exp-page' },
      );
    }

    for (const c of cases) {
      const { context, page } = await setupContext(browser, c);
      try {
        await page.goto(`${baseURL}${c.route}`, { waitUntil: 'domcontentloaded' });
        const metric = await measureAndShoot(page, c.name, c);
        results.push(metric);
        console.log(`[${stageArg}] ${c.name}: overflow=${metric.overflowPx}px sidebarPos=${metric.sidebarStyle?.position} sidebarTop=${metric.sidebarStyle?.rect?.top} axe=${metric.axeViolations.length}`);
        if (metric.axeViolations.length > 0) {
          console.log(`  AXE DETAILS (${c.name}):`, JSON.stringify(metric.axeViolations));
        }
      } finally {
        await context.close();
      }
    }

    await fs.writeFile(path.join(outDir, 'metrics.json'), JSON.stringify({ stage: stageArg, capturedAt: new Date().toISOString(), results }, null, 2));
    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
