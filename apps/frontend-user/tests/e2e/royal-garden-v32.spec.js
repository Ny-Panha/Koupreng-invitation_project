import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';

const code = 'royal-garden-cinematic', portrait = '/templates/silk-heritage/portrait.webp';
const evidence = '../../output/playwright/royal-garden-v3-2';
const content = {
  cinematicIntro: { style: 'royal-arch', titleMode: 'text', animationPreset: 'still', duration: 2 }, informationScene: { enabled: true, fixedBackground: true, motionPreset: 'subtle' },
  messageText: 'សូមអញ្ជើញចូលរួមអបអរសាទរពិធីមង្គលការរបស់យើងខ្ញុំ។ '.repeat(3),
  eventTimezone: 'Asia/Phnom_Penh', calendarUid: 'v32-fixture',
  saveTheDate: { enabled: true, showCountdown: true, showCalendar: true, showAddToCalendar: true, calendarNavigation: true, numerals: 'latin' },
  programDays: [{ id: 'one', date: '2026-12-31', title: 'ពិធីគ្រួសារ', titleEn: 'Family day', extension: 'keep day' }, { id: 'two', date: '2027-01-01', title: 'ពិធីមង្គលការ', titleEn: 'Wedding day' }],
  schedule: [{ id: 'blessing', dayId: 'one', time: '17:00', endTime: '18:00', title: 'ពិធីសូត្រមន្ត', titleEn: 'Family blessing', description: 'សូមគោរពអញ្ជើញចូលរួមជាមួយក្រុមគ្រួសារ។', descriptionEn: 'Please join our families.', iconKey: 'blessing', extension: 'keep row' },
    { id: 'reception', dayId: 'two', time: '11:00', title: 'ពិធីទទួលភ្ញៀវ', titleEn: 'Wedding reception', iconKey: 'reception', location: 'សួនច្បារ', locationEn: 'Garden hall' }],
  showDressCode: true, dressCode: { name: 'Formal Khmer', style: 'Traditional attire', description: 'Please wear the suggested colors.' }, dressColors: [{ hex: '#d4af37', name: 'Champagne gold' }, { hex: '#fff6df', name: 'Ivory' }],
  khqrDollar: { qrUrl: '/invitations/khmer-celestial/qr-usd.jpg', bankName: 'Fictional bank', accountName: 'Fictional USD recipient', accountNumber: '000111' },
  khqrRiel: { qrUrl: '/invitations/khmer-celestial/qr-khr.jpg', bankName: 'Fictional bank', accountName: 'Fictional KHR recipient' },
  thankYouTitle: 'Thank you', thankYouText: 'Thank you for celebrating with our families.', apologyTitle: 'Our apology', apologyText: 'Please accept our apologies for any oversight.',
  sectionOrder: ['countdown', 'schedule', 'dressCode', 'venue', 'gallery', 'family', 'invitation', 'gift', 'rsvp', 'wishes', 'closing'],
};
async function setup(page, patch = {}) {
  const state = await phase9Fixtures(page, { code, content: { ...content, ...patch } });
  state.events.set(101, { ...state.events.get(101), eventDate: '2026-12-31', eventTime: '17:00', groomName: 'Fictional groom', brideName: 'Fictional bride',
    designJson: JSON.stringify({ coverBackgroundImage: portrait }), googleMapUrl: '',
    enabledSections: JSON.stringify({ countdown: true, schedule: true, dressCode: true, gallery: true, gift: true, rsvp: true }) });
  for (const currency of ['usd', 'khr']) await page.route(`**/invitations/khmer-celestial/qr-${currency}.jpg`, async route => route.fulfill({ contentType: 'image/svg+xml', body: await fs.readFile(new URL(`./support/fixtures/v32-gift-${currency}.svg`, import.meta.url)) }));
  await page.route('**/api/v1/public/invitations/review-celestial/media', route => route.fulfill({ json: { data: {} } }));
  return state;
}
async function open(page, language = 'en') {
  await page.goto(`/i/review-celestial?lang=${language}`); await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
}
async function save(page) { await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved'); }
async function capture(page, name) {
  await fs.mkdir(evidence, { recursive: true }); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${evidence}/${name}.jpg`, type: 'jpeg', quality: 82, animations: 'disabled' });
}

test('RG32-01–25: Studio edits canonical dates, two program days and dress code through preview, save, reload and publication', async ({ page }) => {
  const { events } = await setup(page, { programDays: [], schedule: [], showDressCode: false, dressCode: null, dressColors: [] });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/app/events/101/invitation'); await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
  await chooseStudioSection(page, 'scheduleVenue', 'Save the date & calendar');
  await page.getByLabel('Event date', { exact: true }).fill('2027-12-31');
  await page.getByLabel('Show calendar', { exact: true }).check();
  await page.getByLabel('Show countdown', { exact: true }).check();
  const frame = page.frameLocator('iframe');
  await page.getByRole('button', { name: 'Preview information', exact: true }).click();
  await expect(frame.locator('.rg-calendar-date time')).toHaveAttribute('datetime', '2027-12-31');
  await expect(frame.getByRole('timer')).toBeVisible();
  await chooseStudioSection(page, 'scheduleVenue', 'Schedule');
  for (const [number, date, heading, ceremony] of [[1, '2027-12-31', 'First day', 'New blessing'], [2, '2028-01-01', 'Second day', 'New reception']]) {
    await page.getByRole('button', { name: 'Add program day', exact: true }).click();
    const day = page.getByRole('group', { name: `Day ${number}`, exact: true });
    await day.getByLabel('Program date', { exact: false }).fill(date); await day.getByLabel('Day heading', { exact: true }).fill(`ពិធីថ្ងៃទី ${number}`);
    await day.getByLabel('Day heading in English', { exact: true }).fill(heading);
    await day.getByRole('button', { name: 'Add ceremony', exact: true }).click();
    await day.getByLabel('Ceremony / Khmer', { exact: true }).fill('ពិធីមង្គលការ'); await day.getByLabel('Ceremony in English', { exact: true }).fill(ceremony);
    await day.getByLabel(/^Start time/).fill('17:00'); await day.getByLabel(/^Ceremony icon/).selectOption('blessing');
  }
  const dayOne = page.getByRole('group', { name: 'Day 1', exact: true });
  await dayOne.getByRole('button', { name: 'Add ceremony', exact: true }).click();
  await dayOne.getByLabel('Ceremony / Khmer', { exact: true }).nth(1).fill('ពិធីលាក់'); await dayOne.getByLabel('Ceremony in English', { exact: true }).nth(1).fill('Disabled ceremony');
  await dayOne.getByRole('button', { name: 'Move ceremony 2 up' }).click(); await dayOne.getByLabel('Show this ceremony', { exact: true }).first().uncheck();
  await expect(frame.locator('[data-date="2027-12-31"]')).toHaveAttribute('data-ceremony', 'true');
  await frame.getByRole('button', { name: 'Next month', exact: true }).click(); await frame.locator('[data-date="2028-01-01"]').click();
  await expect(frame.getByRole('region', { name: 'Selected day' })).toContainText('New reception');
  await expect(frame.locator('.rg-program')).not.toContainText('Disabled ceremony');
  await chooseStudioSection(page, 'guestExperience', 'Dress code'); await page.getByRole('checkbox', { name: 'Show dress code', exact: true }).check();
  await page.getByLabel('Dress code name', { exact: true }).fill('Owner formal attire'); await page.getByLabel('Style', { exact: true }).fill('Traditional dress');
  await page.getByLabel('Dress code description', { exact: true }).fill('Owner color instructions'); await page.getByRole('button', { name: 'Add color', exact: true }).click();
  await page.getByLabel('Color name 1', { exact: true }).fill('Owner gold');
  await expect(frame.locator('#rg-dressCode')).toContainText('Owner gold');
  await page.getByRole('checkbox', { name: 'Show dress code', exact: true }).uncheck(); await expect(frame.locator('#rg-dressCode')).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Show dress code', exact: true }).check(); await save(page);
  const saved = JSON.parse(events.get(101).contentJson); expect(saved.eventDate).toBe('2027-12-31'); expect(saved.programDays).toHaveLength(2);
  expect(saved.schedule[0]).toMatchObject({ enabled: false, titleEn: 'Disabled ceremony' }); expect(saved.dressCode.name).toBe('Owner formal attire');
  await capture(page, 'studio-live-preview'); await page.reload(); await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
  await chooseStudioSection(page, 'guestExperience', 'Dress code'); await expect(page.getByLabel('Dress code name', { exact: true })).toHaveValue('Owner formal attire');
  await open(page); await expect(page.locator('#rg-dressCode')).toContainText('Owner gold'); await expect(page.locator('.rg-calendar-date time')).toHaveAttribute('datetime', '2027-12-31');
  await page.getByRole('button', { name: 'Next month', exact: true }).click(); await page.locator('[data-date="2028-01-01"]').click();
  await expect(page.getByRole('region', { name: 'Selected day' })).toContainText('New reception');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'All wedding ceremonies', exact: true }).click();
  const file = await download; const ics = await fs.readFile(await file.path(), 'utf8'); expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2); expect(ics).not.toContain('Disabled ceremony');
});

test('RG32-09–14,19–20: selected days, program navigation, localized controls and export share the saved program', async ({ page }) => {
  await setup(page); await open(page);
  await expect(page.locator('#rg-closing')).toContainText('Thank you for celebrating with our families.');
  await expect(page.locator('#rg-closing')).toContainText('Please accept our apologies for any oversight.');
  await expect(page.locator('[data-date="2026-12-31"]')).toHaveAttribute('data-main', 'true');
  await expect(page.getByRole('region', { name: 'Selected day' })).toContainText('Family blessing');
  await page.getByRole('button', { name: 'Next month', exact: true }).focus(); await page.keyboard.press('Enter');
  await page.locator('[data-date="2027-01-01"]').focus(); await page.keyboard.press('Space');
  await expect(page.getByRole('region', { name: 'Selected day' })).toContainText('Wedding reception');
  await page.getByRole('button', { name: 'View this day’s programme', exact: true }).click();
  await expect(page.locator('#rg-program-day-two')).toBeFocused(); expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.locator('.rg-language select').selectOption('km'); await expect(page.locator('#rg-program-day-two')).toContainText('ពិធីទទួលភ្ញៀវ');
  await expect(page.getByRole('button', { name: 'ខែមុន', exact: true })).toBeAttached();
  await page.locator('.rg-language select').selectOption('en');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'All wedding ceremonies', exact: true }).click();
  const ics = await fs.readFile(await (await download).path(), 'utf8'); expect(ics).toContain('DTSTART:20261231T100000Z'); expect(ics).toContain('DTSTART:20270101T040000Z');
  expect(ics).not.toMatch(/Fictional USD|000111|token|qrUrl/);
});

test('RG32-26–29: gift currency/enlargement and real RSVP form keep private wishes out of public content', async ({ page }) => {
  await setup(page); const submissions = [], wishesRequests = [];
  page.on('request', request => { if (request.url().includes('/wishes')) wishesRequests.push(request.url()); });
  await page.route('**/api/v1/public/invitations/review-celestial/rsvp', async route => {
    submissions.push(route.request().postDataJSON()); return route.fulfill({ json: { data: { id: 45, guestName: 'Fixture guest', responseStatus: 'ATTENDING', attendeeCount: 2, message: 'PRIVATE-WISH' } } });
  });
  await page.route('**/api/v1/public/invitations/review-celestial/wishes*', route => route.fulfill({ json: { data: [{ guestName: 'OTHER-PRIVATE-GUEST', message: 'OTHER-PRIVATE-WISH' }] } }));
  await open(page); await page.getByRole('button', { name: 'KHR', exact: true }).click(); await expect(page.locator('#rg-gift')).toContainText('Fictional KHR recipient');
  await page.getByRole('button', { name: 'Enlarge gift QR', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await page.getByRole('button', { name: 'Close gift QR', exact: true }).click();
  expect(await page.locator('#rg-gift').innerText()).not.toMatch(/payment confirmed|paid/i);
  await page.getByLabel('Guest name', { exact: true }).fill('Fixture guest'); await page.getByLabel('Attendee count', { exact: true }).fill('2'); await page.getByLabel('Message', { exact: true }).fill('PRIVATE-WISH');
  await page.getByRole('button', { name: 'Submit RSVP', exact: true }).click(); await expect(page.getByText('RSVP received', { exact: true })).toBeVisible();
  expect(submissions).toHaveLength(1); expect(submissions[0]).toMatchObject({ responseStatus: 'ATTENDING', attendeeCount: 2, message: 'PRIVATE-WISH' });
  expect(wishesRequests).toHaveLength(0); await expect(page.locator('.pub-wishes-wall')).toHaveCount(0); await expect(page.locator('body')).not.toContainText('OTHER-PRIVATE');
});

test('RG32-30–34: fixed frame and all enabled sections fit nine responsive viewports; capture real browser evidence', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-chromium', 'Nine viewport evidence runs once; functional cases run in both projects.');
  test.setTimeout(180000); await setup(page); await open(page);
  for (const [width, height] of [[320,568],[375,667],[390,844],[430,932],[768,1024],[834,1194],[1024,768],[1440,900],[1920,1080]]) {
    await page.setViewportSize({ width, height });
    const frame = page.locator('.rg-information-background'), before = await frame.boundingBox();
    const ticket = await page.locator('.public-ticket-button').boundingBox(), pane = await page.locator('.rg-content-scroll').boundingBox();
    expect(ticket.y + ticket.height).toBeLessThanOrEqual(pane.y);
    for (const [name, selector] of [['countdown','#rg-countdown'],['calendar','.rg-month-calendar'],['program','#rg-schedule'],['dress','#rg-dressCode'],['venue','#rg-venue'],['gift','#rg-gift'],['rsvp','#rg-rsvp'],['closing','#rg-closing']]) {
      await page.locator(selector).evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
      expect(await page.locator(selector).evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      expect(await page.locator('.rg-content-scroll').evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      const after = await frame.boundingBox(); expect(after.y).toBe(before.y); expect(await page.evaluate(() => scrollY)).toBe(0);
      await capture(page, `${width}x${height}-${name}`);
    }
    await page.getByRole('button', { name: 'Next month', exact: true }).click(); await page.locator('[data-date="2027-01-01"]').click(); await page.locator('.rg-selected-day').evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await capture(page, `${width}x${height}-selected-day-two`); await page.getByRole('button', { name: 'Return to wedding month', exact: true }).click();
  }
});

test('RG32: Khmer authored content and numerals remain readable with the same machine dates', async ({ page }, info) => {
  await setup(page, { saveTheDate: { ...content.saveTheDate, numerals: 'khmer' }, dressCode: { name: 'សម្លៀកបំពាក់ប្រពៃណី', description: 'សូមជ្រើសរើសសម្លៀកបំពាក់តាមពណ៌ដែលបានណែនាំ។' }, dressColors: [{ hex: '#d4af37', name: 'មាស' }] });
  await page.setViewportSize({ width: 390, height: 844 }); await open(page, 'km');
  await expect(page.locator('[data-date="2026-12-31"] time')).toHaveText('៣១');
  await expect(page.locator('.rg-program')).toContainText('ពិធីសូត្រមន្ត');
  if (info.project.name === 'chromium') for (const key of ['countdown','schedule','dressCode','rsvp','closing']) {
    await page.locator(`#rg-${key}`).evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' })); await capture(page, `390x844-km-${key}`);
  }
});

test('RG32: new guest sections pass scoped WCAG checks and empty optional destinations stay out of navigation', async ({ page }, info) => {
  await setup(page); await open(page); await page.setViewportSize({ width: 390, height: 844 });
  const result = await new AxeBuilder({ page }).include('#rg-countdown').include('#rg-schedule').include('#rg-dressCode').include('#rg-gift').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await info.attach('axe-v32.json', { body: JSON.stringify(result, null, 2), contentType: 'application/json' }); expect(result.violations).toEqual([]);
  await page.goto('/app/events/101/invitation'); await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
  await chooseStudioSection(page, 'scheduleVenue', 'Schedule'); await page.getByLabel('Show program section', { exact: true }).uncheck(); await save(page);
  await open(page); await expect(page.locator('#rg-schedule')).toHaveCount(0); await expect(page.locator('.rg-bottom-nav')).not.toContainText('Program');
  await expect(page.getByRole('button', { name: 'All wedding ceremonies', exact: true })).toHaveCount(0);
});

test('RG32-01: choosing Royal Garden from the Studio selector retains authored optional data', async ({ page }) => {
  const retained = { faq: [{ id: 'q', q: 'Owner question', a: 'Owner answer' }], party: [{ id: 'p', name: 'Owner participant' }], storyChapters: [{ id: 's', title: 'Owner story', text: 'Owner wording' }] };
  const { events } = await setup(page, retained);
  await page.setViewportSize({ width: 1440, height: 900 }); await page.goto('/app/events/101/invitation');
  await page.getByRole('button', { name: /^Change template:/ }).click();
  const card = page.locator(`.tc-card[data-template="${code}"]`); await expect(card).toHaveCount(1);
  await card.getByRole('button', { name: 'Select', exact: true }).click();
  await page.getByRole('button', { name: 'Use selected design' }).click();
  await page.getByRole('dialog', { name: 'Confirm template change' }).getByRole('button', { name: 'Confirm', exact:true }).click();
  await expect(page.getByRole('dialog', { name: 'Change template', exact: true })).toBeHidden();
  const frame = page.frameLocator('iframe'); await expect(frame.locator('.tpl-royal-garden')).toBeVisible();
  await chooseStudioSection(page, 'scheduleVenue', 'Save the date & calendar');
  await page.getByRole('combobox', { name: 'Countdown style', exact: true }).selectOption('minimal');
  await page.getByRole('button', { name: 'Preview information', exact: true }).click();
  await expect(frame.locator('.kp-countdown--minimal .kp-countdown-unit').first()).toHaveCSS('border-top-width', '0px'); await save(page);
  const saved = JSON.parse(events.get(101).contentJson);
  expect(events.get(101).templateCode).toBe(code); expect(saved.schedule.map(row => row.id)).toEqual(['blessing', 'reception']);
  expect(saved.dressCode.name).toBe('Formal Khmer');
  for (const key of ['faq', 'party', 'storyChapters']) expect(saved[key]).toEqual(retained[key]);
});
