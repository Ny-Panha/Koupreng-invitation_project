import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
import AxeBuilder from '../../apps/frontend-user/node_modules/@axe-core/playwright/dist/index.mjs';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const stageArg = process.argv.find((arg) => arg.startsWith('--stage='))?.split('=')[1] || 'before';
const outDirArg = process.argv.find((arg) => arg.startsWith('--out-dir='))?.split('=')[1]
  || `docs/uxui/frontend-user-v2/2026-11-26-obsidian-gold/evidence/${stageArg}`;
const outDir = path.resolve(outDirArg);
const port = 4318;
const baseURL = `http://127.0.0.1:${port}`;

const TEST_TOKEN = ['eyJhbGciOiJub25lIn0', 'eyJleHAiOjQxMDIyNjg4MDB9', ''].join('.');

const mockEvents = [
  {
    id: 42,
    title: 'សិរីមង្គលអាពាហ៍ពិពាហ៍ វណ្ណៈ និងកុលាប · Vannak & Kolab Royal Wedding',
    groomName: 'វណ្ណៈ (Vannak)',
    brideName: 'កុលាប (Kolab)',
    hostName: 'វណ្ណៈ (Vannak)',
    partnerName: 'កុលាប (Kolab)',
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

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname;
    const method = route.request().method();
    const json = (data, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ data }) });

    if (p.endsWith('/i18n/messages')) return json({ messages: {} });
    if (p.endsWith('/auth/me') || p.endsWith('/users/me')) {
      return json({ id: 7, fullName: 'Sokha Meas', email: 'sokha@example.test', role: 'USER', phone: '012 345 678' });
    }
    if (p === '/api/v1/templates' || p === '/api/v1/templates/public') return json(mockCatalog);
    if (p === '/api/v1/templates/recommendations') {
      return json(mockCatalog.map((template) => ({ template, score: 98, styleMatch: true })));
    }
    if (p.startsWith('/api/v1/templates/')) return json(mockCatalog[0]);
    if (p === '/api/v1/packages' || p === '/api/v1/public/packages' || p === '/api/v1/subscriptions/packages') {
      return json([
        { id: 1, code: 'FREE', name: 'Starter', active: true, status: 'ACTIVE', priceUsd: 0, priceKhr: 0, maxInvitations: 1, maxGuestsPerInvitation: 50, durationDays: 30, premiumTemplatesEnabled: false, seatingEnabled: false, qrCheckInEnabled: false },
        { id: 2, code: 'PRO', name: 'Royal Atelier', active: true, status: 'ACTIVE', priceUsd: 19, priceKhr: 78000, maxInvitations: 5, maxGuestsPerInvitation: 500, durationDays: 365, premiumTemplatesEnabled: true, seatingEnabled: true, qrCheckInEnabled: true },
      ]);
    }
    if (p.includes('/subscriptions/me')) return json({ planCode: 'PRO', status: 'ACTIVE' });
    if (p.includes('/payments/my')) return json([]);
    if (p.includes('/organizations')) return json([]);
    if (p.includes('/invitations/my')) return json(mockEvents);
    if (p === '/api/v1/invitations/42' || p === '/api/v1/invitations/42/preview') return json(mockEvents[0]);
    if (p === '/api/v1/invitations/42/access') {
      return json({
        owner: true,
        permissions: ['VIEW_EVENT', 'EDIT_EVENT', 'MANAGE_SETTINGS', 'MANAGE_INVITATION', 'MANAGE_GUESTS', 'MANAGE_BUDGET', 'MANAGE_SEATING', 'MANAGE_CHECKIN', 'MANAGE_RSVP', 'VIEW_REPORTS'],
        ownerFeatures: ['QR_INVITATIONS', 'SEATING', 'QR_CHECK_IN', 'TEAM_MEMBERS'],
      });
    }
    if (p === '/api/v1/invitations/42/dashboard') {
      return json({ totalGuests: 240, totalInvited: 240, attending: 176, declined: 18, maybe: 12, pending: 34, deliverySent: 190 });
    }
    if (p === '/api/v1/invitations/42/budget-items') {
      return json([
        { id: 1, category: 'Venue & Catering', actualCost: 3500, estimatedCost: 4000, currency: 'USD' },
        { id: 2, category: 'Traditional Music', actualCost: 2000000, estimatedCost: 2400000, currency: 'KHR' },
      ]);
    }
    if (p === '/api/v1/invitations/42/gifts') {
      return json([
        { id: 1, guestName: 'Bopha', amount: 200, currency: 'USD', method: 'Bakong QR', date: '2026-11-18' },
        { id: 2, guestName: 'Rithy', amount: 800000, currency: 'KHR', method: 'ABA', date: '2026-11-18' },
      ]);
    }
    if (p === '/api/v1/invitations/42/check-in/summary') return json({ totalCheckedIn: 112, checkedIn: 112, totalGuests: 240 });
    if (p === '/api/v1/invitations/42/check-in/list') {
      return json([
        { id: 1, guestId: 1, guestName: 'Chanthy & Sophea', seatCount: 2, checkedInAt: '2026-11-18T16:15:00Z' },
      ]);
    }
    if (p === '/api/v1/invitations/42/guests/page') {
      const items = [
        {
          guest: {
            id: 1, invitationId: 42, guestName: 'Chanthy & Sophea', companionName: 'Sophea',
            phone: '012 345 678', guestGroup: 'Bride Side', sideType: 'Family',
            tableNumber: 'VIP Table 1', seatCount: 2, sendStatus: 'SENT', inviteToken: 'tok-chanthy-1',
          },
          rsvpStatus: 'ATTENDING', attendeeCount: 2, respondedAt: '2026-11-18T12:30:00Z',
          checkedIn: true, checkedInAt: '2026-11-18T16:15:00Z',
        },
        {
          guest: {
            id: 2, invitationId: 42, guestName: 'Visal Dara', companionName: '',
            phone: '077 889 900', guestGroup: 'Groom Side', sideType: 'Coworker',
            tableNumber: '', seatCount: 1, sendStatus: 'PENDING', inviteToken: 'tok-visal-2',
          },
          rsvpStatus: 'PENDING', attendeeCount: 1, respondedAt: null, checkedIn: false, checkedInAt: null,
        },
      ];
      return json({ items, page: 0, size: 25, totalElements: items.length, totalPages: 1 });
    }
    if (p === '/api/v1/invitations/42/guests/overview') {
      return json({
        guestRecords: 2, reservedSeats: 3, attendingRecords: 1, declinedRecords: 0, maybeRecords: 0,
        unansweredRecords: 1, respondedRecords: 1, toInviteRecords: 1, checkedInRecords: 1, confirmedAttendees: 2, markedSentRecords: 1,
      });
    }
    if (p === '/api/v1/invitations/42/guests') {
      return json([
        { id: 1, invitationId: 42, guestName: 'Chanthy & Sophea', companionName: 'Sophea', phone: '012 345 678', guestGroup: 'Bride Side', sideType: 'Family', tableNumber: 'VIP Table 1', seatCount: 2, sendStatus: 'SENT', inviteToken: 'tok-chanthy-1' },
        { id: 2, invitationId: 42, guestName: 'Visal Dara', phone: '077 889 900', guestGroup: 'Groom Side', sideType: 'Coworker', tableNumber: '', seatCount: 1, sendStatus: 'PENDING', inviteToken: 'tok-visal-2' },
      ]);
    }
    if (p === '/api/v1/invitations/42/rsvps') return json([]);
    if (p === '/api/v1/invitations/42/wishes') return json([]);
    if (p.includes('/notifications')) {
      return json([{ id: 1, title: 'RSVP Confirmed', message: 'Chanthy confirmed 2 seats.', status: 'SENT', read: false, createdAt: '2026-11-18T14:20:00Z' }]);
    }
    if (p === '/api/v1/invitations/42/seating') {
      return json({
        invitationId: 42,
        tables: [
          { id: 1, invitationId: 42, tableName: 'VIP Table 1', tableLabel: 'Family & Elders', capacity: 10, assignedSeats: 2, remainingSeats: 8, sortOrder: 1, notes: '{"x":25,"y":35}' },
          { id: 2, invitationId: 42, tableName: 'Table 2', tableLabel: 'Colleagues & Friends', capacity: 10, assignedSeats: 2, remainingSeats: 8, sortOrder: 2, notes: '{"x":75,"y":35}' },
        ],
        assignments: [
          { id: 10, invitationId: 42, tableId: 1, tableName: 'VIP Table 1', guestId: 1, guestName: 'Chanthy & Sophea', guestGroup: 'Bride Side', seatLabel: 'Seats 1-2', seatCount: 2, notes: '', assignedAt: '2026-11-18T14:25:00Z' },
        ],
        unassignedGuests: [
          { id: 2, invitationId: 42, guestName: 'Visal Dara', guestGroup: 'Groom Side', sideType: 'Coworker', seatCount: 1 },
        ],
      });
    }
    if (p === '/api/v1/invitations/42/seating/layout') {
      return json({ eventId: 42, version: 1, data: { schemaVersion: 1, positions: { 1: { x: 25, y: 35 }, 2: { x: 75, y: 35 } }, venue: { stage: { x: 50, y: 9 }, entrance: { x: 50, y: 92 }, walkway: { x: 50, y: 51, orientation: 'vertical', enabled: true } } }, updatedAt: '2026-11-18T14:00:00Z' });
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
    if (p === '/api/v1/public/invitations/vannak-kolab-2027/media' && method === 'GET') {
      return json([]);
    }
    if (p === '/api/v1/invitations/42/analytics' || p === '/api/v1/invitations/42/attendance') {
      return json({
        from: '2026-10-28',
        to: '2026-11-26',
        timezone: 'Asia/Phnom_Penh',
        days: [
          { date: '2026-11-14', guestRecordsCreated: 25, latestRsvpRecords: 18, attendingRecords: 16, declinedRecords: 2, maybeRecords: 0, activeCheckInRecords: 0 },
          { date: '2026-11-16', guestRecordsCreated: 60, latestRsvpRecords: 48, attendingRecords: 42, declinedRecords: 4, maybeRecords: 2, activeCheckInRecords: 24 },
          { date: '2026-11-18', guestRecordsCreated: 155, latestRsvpRecords: 128, attendingRecords: 118, declinedRecords: 12, maybeRecords: 10, activeCheckInRecords: 88 },
        ],
        current: { guestRecords: 240, reservedSeats: 260, respondedRecords: 194, confirmedAttendees: 210, checkedInRecords: 112 },
      });
    }
    return json({});
  });

  return { context, page };
}

async function measureAndShoot(page, fileName, options = {}) {
  const { waitForSelector, waitForDetached, fullPage = false, scrollToY = 0, runAxe = true } = options;
  if (waitForDetached) {
    await page.locator(waitForDetached).first().waitFor({ state: 'detached', timeout: 12000 }).catch(() => {});
  }
  if (waitForSelector) {
    await page.locator(waitForSelector).first().waitFor({ state: 'visible', timeout: 25000 });
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
    const body = document.body;
    const sidebar = document.querySelector('.event-workspace-sidebar');
    const header = document.querySelector('.host-header-container, .kp-header-inner');
    const card = document.querySelector('.overview-hero, .event-card, .guest-list-panel, .kp-metric-card, .auth-card, .event-settings-section, .seating-table-card, .exp-sum-card, .pe-main-editor-card, .protected-gate-card, .notif-stat, .k-org-header-banner, .rsvp-kpi-card');
    const parseRgb = (css) => {
      const m = String(css || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
    };
    const isNeutral = (rgb) => (rgb ? rgb[0] === rgb[1] && rgb[1] === rgb[2] : null);
    const htmlCs = getComputedStyle(html);
    const bodyBg = getComputedStyle(body).backgroundColor;
    const cardBg = card ? getComputedStyle(card).backgroundColor : null;
    const sidebarBg = sidebar ? getComputedStyle(sidebar).backgroundColor : null;
    const sidebarBgImage = sidebar ? getComputedStyle(sidebar).backgroundImage : null;
    const headerBg = header ? getComputedStyle(header).backgroundColor : null;
    return {
      url: location.pathname + location.search,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      overflowPx: html.scrollWidth - window.innerWidth,
      scrollY: window.scrollY,
      colorMode: html.dataset.colorMode || null,
      lang: html.lang || null,
      sidebarTop: sidebar ? Math.round(sidebar.getBoundingClientRect().top) : null,
      tokens: {
        canvas: htmlCs.getPropertyValue('--ui-theme-canvas').trim(),
        surface: htmlCs.getPropertyValue('--ui-theme-surface').trim(),
        subtle: htmlCs.getPropertyValue('--ui-theme-subtle').trim(),
        raised: htmlCs.getPropertyValue('--ui-theme-raised').trim(),
        action: htmlCs.getPropertyValue('--ui-theme-action').trim(),
        railBg: htmlCs.getPropertyValue('--ui-rail-bg').trim(),
        railActiveBg: htmlCs.getPropertyValue('--ui-rail-active-bg').trim(),
      },
      computedColors: {
        bodyBg,
        bodyNeutral: isNeutral(parseRgb(bodyBg)),
        cardBg,
        cardNeutral: isNeutral(parseRgb(cardBg)),
        sidebarBg,
        sidebarBgImage,
        sidebarNeutral: isNeutral(parseRgb(sidebarBg)),
        headerBg,
        headerNeutral: isNeutral(parseRgb(headerBg)),
      },
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
        targets: v.nodes.map((n) => n.target.join(' ')).slice(0, 6),
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
      { name: '01-home-dark-en-1440.png', route: '/', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: false, waitForSelector: '.kp-hero h1' },
      { name: '02-home-light-en-1440.png', route: '/', width: 1440, height: 900, lang: 'en', theme: 'light', auth: false, waitForSelector: '.kp-hero h1' },
      { name: '03-home-dark-km-390.png', route: '/', width: 390, height: 844, lang: 'km', theme: 'dark', auth: false, waitForSelector: '.kp-hero h1' },
      { name: '04-login-dark-en-1440.png', route: '/login', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: false, waitForSelector: 'form' },
      { name: '05-templates-dark-en-1440.png', route: '/templates', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: false, waitForSelector: '.tp-card' },
      { name: '06-pricing-dark-en-1440.png', route: '/pricing', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: false, waitForSelector: '.kp-plan-card' },
      { name: '07-venues-dark-en-1440.png', route: '/venues', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: false, waitForSelector: '.venue-card' },
      { name: '08-events-dark-en-1440.png', route: '/app/events', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.events-page' },
      { name: '09-events-dark-km-320.png', route: '/app/events', width: 320, height: 568, lang: 'km', theme: 'dark', auth: true, waitForSelector: '.events-page' },
      { name: '10-events-calendar-dark-en-1440.png', route: '/app/events?view=calendar', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.event-calendar-container' },
      { name: '11-dashboard-dark-en-1440.png', route: '/app/events/42', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.overview-hero', scrollToY: 0 },
      { name: '12-dashboard-dark-scrolled-1440.png', route: '/app/events/42', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.overview-hero', scrollToY: 700 },
      { name: '13-dashboard-light-en-1440.png', route: '/app/events/42', width: 1440, height: 900, lang: 'en', theme: 'light', auth: true, waitForSelector: '.overview-hero', scrollToY: 0 },
      { name: '14-dashboard-dark-tablet-768.png', route: '/app/events/42', width: 768, height: 1024, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.overview-hero' },
      { name: '15-dashboard-dark-landscape-844x390.png', route: '/app/events/42', width: 844, height: 390, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.overview-hero' },
      { name: '16-guests-dark-km-1440.png', route: '/app/events/42/guests', width: 1440, height: 900, lang: 'km', theme: 'dark', auth: true, waitForSelector: '.guest-record-row' },
      { name: '17-studio-dark-en-1440.png', route: '/app/events/42/invitation', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.invitation-studio', waitForDetached: '.studio-preview-recovery', runAxe: false },
      { name: '18-settings-dark-en-1440.png', route: '/app/events/42/settings', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.event-settings' },
      { name: '19-seating-dark-en-1440.png', route: '/app/events/42/seating', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.seating-table-card' },
      { name: '20-budget-dark-en-1440.png', route: '/app/events/42/budget', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.exp-page' },
      { name: '21-rsvp-dark-en-1440.png', route: '/app/events/42/rsvp', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.rsvp-kpi-card' },
      { name: '22-notifications-dark-en-1440.png', route: '/app/notifications', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.notif-page' },
      { name: '23-profile-dark-en-1440.png', route: '/app/profile', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.profile-page' },
      { name: '24-public-password-gate-dark-km-390.png', route: '/i/protected-sample', width: 390, height: 844, lang: 'km', theme: 'dark', auth: false, waitForSelector: '.protected-gate-card' },
      { name: '25-public-invitation-isolated-dark-390.png', route: '/i/vannak-kolab-2027', width: 390, height: 844, lang: 'km', theme: 'dark', auth: false, waitForDetached: '.k-loading-invitation', waitForSelector: '#root > div > div', runAxe: false },
      ...(stageArg === 'after' ? [
        { name: '26-dashboard-dark-laptop-1024.png', route: '/app/events/42', width: 1024, height: 768, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.overview-hero', scrollToY: 0 },
        { name: '27-gifts-dark-en-1440.png', route: '/app/events/42/gifts', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.wg-page' },
        { name: '28-checkin-dark-en-1440.png', route: '/app/events/42/check-in', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.inv-page' },
        { name: '29-analytics-dark-en-1440.png', route: '/app/events/42/analytics', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: true, waitForSelector: '.workspace-heading h1' },
        { name: '30-template-demo-dark-en-1440.png', route: '/templates/khmer-floral-gold/demo', width: 1440, height: 900, lang: 'en', theme: 'dark', auth: false, waitForDetached: '.k-loading-invitation', waitForSelector: '.ptdp-stage, .tp-demo-bar, #root > div', runAxe: false },
      ] : []),
    ];

    for (const c of cases) {
      const { context, page } = await setupContext(browser, c);
      try {
        await page.goto(`${baseURL}${c.route}`, { waitUntil: 'domcontentloaded' });
        const metric = await measureAndShoot(page, c.name, c);
        results.push(metric);
        console.log(`[${stageArg}] ${c.name}: overflow=${metric.overflowPx}px body=${metric.computedColors.bodyBg} neutral=${metric.computedColors.bodyNeutral} card=${metric.computedColors.cardBg} neutral=${metric.computedColors.cardNeutral} rail=${metric.computedColors.sidebarBg} neutral=${metric.computedColors.sidebarNeutral} axe=${metric.axeViolations.length}`);
        if (metric.axeViolations.length > 0) {
          console.log(`  AXE (${c.name}):`, JSON.stringify(metric.axeViolations));
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
