import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { phase8Content, phase8Fixtures } from './support/phase8Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';

// Functional assertions use the same motion policy and timeout as the Phase 8 config.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 60000 });

test('guided multi-day editing, save/reload, advanced settings, public display and ICS', async ({ page }, info) => {
  const { events, writes } = await phase8Fixtures(page);
  await page.goto('/app/events/101/invitation?mode=guided');
  await page.getByRole('button', { name: /Design & content/ }).click();
  await page.getByRole('button', { name: 'Program', exact: true }).click();
  await page.getByRole('button', { name: 'Add program day' }).click();
  const day = page.getByRole('group', { name: 'Day 3', exact: true });
  await day.getByLabel('Day heading', { exact: true }).fill('ពិធីថ្ងៃទីបី');
  await day.getByRole('button', { name: 'Add ceremony' }).click();
  await day.getByLabel('Ceremony / Khmer', { exact: true }).fill('ពិធីដែលបានកែសម្រួល');
  await day.getByLabel('Ceremony in English', { exact: true }).fill('Edited ceremony');
  await day.getByRole('button', { name: 'Add ceremony' }).click();
  await day.getByLabel('Ceremony in English', { exact: true }).nth(1).fill('Last ceremony');
  await day.getByRole('button', { name: 'Move ceremony 2 up' }).click();
  await page.getByRole('button', { name: 'Move day 3 up' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  const saved = JSON.parse(events.get(101).contentJson);
  expect(saved.programDays).toHaveLength(3); expect(saved.futureExtension).toEqual(phase8Content.futureExtension);
  expect(saved.schedule[0].note).toBe('preserve row extension');
  expect(saved.schedule.filter(row => row.day === 2).map(row => row.titleEn)).toEqual(['Last ceremony', 'Edited ceremony']);
  expect(writes.length).toBeGreaterThan(0);
  await page.reload(); await page.getByRole('button', { name: 'Advanced editor', exact: true }).click();
  await chooseStudioSection(page, 'scheduleVenue', 'Schedule');
  await expect(page.getByRole('group', { name: 'Day 3', exact: true })).toBeVisible();
  await chooseStudioSection(page, 'scheduleVenue', 'Save the date & calendar');
  await page.getByLabel('Event timezone', { exact: true }).fill('America/New_York');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Invitation preview' }); await expect(dialog).toBeVisible();
  const frame = dialog.frameLocator('iframe');
  await expect(frame.locator('.kp-calendar-event')).toHaveAttribute('datetime', '2027-12-05');
  await page.keyboard.press('Escape');
  await page.goto('/i/review-celestial');
  await page.getByRole('button', { name: /^(Open invitation|បើកសំបុត្រអញ្ជើញ)$/ }).click();
  await expect(page.getByText('Edited ceremony', { exact: true })).toBeVisible();
  await expect(page.locator('.kp-calendar-event')).toHaveAttribute('datetime', '2027-12-05');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Add to calendar', exact: true }).click();
  const calendar = await download; await calendar.saveAs(info.outputPath('celebration.ics'));
  expect(calendar.suggestedFilename()).toBe('celebration.ics');
});

test('date/program panels pass axe, keyboard calendar navigation and 400% reflow', async ({ page }, info) => {
  await phase8Fixtures(page);
  await page.goto('/app/events/101/preview'); await expect(page.locator('.kp-save-date')).toBeVisible();
  await page.getByRole('button', { name: /^(Open invitation|បើកសំបុត្រអញ្ជើញ)$/ }).click();
  await page.getByRole('button', { name: 'Next month', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'January 2028', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Return to event month' }).click();
  const result = await new AxeBuilder({ page }).include('.kp-save-date').include('.kp-program').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  await info.attach('axe-event-sections.json', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
  expect(result.violations).toEqual([]);
  await page.setViewportSize({ width: 320, height: 850 });
  await page.addStyleTag({ content: '.kp-save-date,.kp-program { font-size: 200%; line-height: 2; letter-spacing: .12em; word-spacing: .16em; }' });
  for (const selector of ['.kp-save-date', '.kp-program']) {
    const overflow = await page.locator(selector).evaluate(el => el.scrollWidth > el.clientWidth + 1); expect(overflow).toBe(false);
  }
  await page.screenshot({ path: info.outputPath('event-sections-text-reflow.png'), fullPage: true });
});

for (const status of [401,409,503]) test(`save ${status} retains date/program edits and exposes recovery`, async ({ page }) => {
  await phase8Fixtures(page);
  await page.route('**/api/v1/invitations/101', route => route.request().method() === 'PUT' ? route.fulfill({ status, json: { message: 'Simulated save rejection' } }) : route.fallback());
  await page.goto('/app/events/101/invitation?mode=guided');
  await page.getByRole('button', { name: /Design & content/ }).click(); await page.getByRole('button', { name: 'Save the date & calendar', exact: true }).click();
  await page.getByLabel('Subtitle', { exact: true }).fill('Keep my unsaved date text');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', status === 401 ? 'expired' : status === 409 ? 'conflict' : 'failed');
  await expect(page.getByLabel('Subtitle', { exact: true })).toHaveValue('Keep my unsaved date text');
  if (status !== 503) await expect(page.getByRole('button', { name: 'Download unsaved draft' })).toBeVisible();
});

test('program visibility round trip keeps saved days and ceremonies', async ({ page }) => {
  const { events } = await phase8Fixtures(page);
  await page.goto('/app/events/101/invitation?mode=guided');
  await page.getByRole('button', { name: /Design & content/ }).click(); await page.getByRole('button', { name: 'Program', exact: true }).click();
  await page.getByLabel('Show program section', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(JSON.parse(events.get(101).contentJson).schedule).toHaveLength(2);
  await page.goto('/i/review-celestial'); await page.getByRole('button', { name: /^(Open invitation|បើកសំបុត្រអញ្ជើញ)$/ }).click();
  await expect(page.locator('.kp-program')).toHaveCount(0);
  await page.goto('/app/events/101/invitation?mode=guided');
  await page.getByRole('button', { name: /Design & content/ }).click(); await page.getByRole('button', { name: 'Program', exact: true }).click();
  await page.getByLabel('Show program section', { exact: true }).check();
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  await page.goto('/i/review-celestial'); await page.getByRole('button', { name: /^(Open invitation|បើកសំបុត្រអញ្ជើញ)$/ }).click();
  await expect(page.locator('.kp-timeline li')).toHaveCount(2);
});

test('offline retry retains the date settings until the server acknowledges them', async ({ page, context }) => {
  await phase8Fixtures(page); await page.goto('/app/events/101/invitation?mode=guided');
  await page.getByRole('button', { name: /Design & content/ }).click(); await page.getByRole('button', { name: 'Save the date & calendar', exact: true }).click();
  await context.setOffline(true);
  await page.getByLabel('Subtitle', { exact: true }).fill('My offline date settings');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'offline');
  await expect(page.getByLabel('Subtitle', { exact: true })).toHaveValue('My offline date settings');
  await context.setOffline(false); await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
});

test('Event Essential weddings author multiple days in the existing five-step guide', async ({ page }) => {
  const { events } = await phase8Fixtures(page, { code: 'event-essential', content: { schedule: [] } });
  await page.goto('/app/events/101/invitation?mode=guided');
  await page.getByRole('button', { name: /Design & content/ }).click();
  for (let index = 1; index <= 3; index++) await page.getByRole('button', { name: 'Add program day' }).click();
  await page.getByRole('group', { name: 'Day 3', exact: true }).getByRole('button', { name: 'Add ceremony' }).click();
  await page.getByLabel('Ceremony in English', { exact: true }).fill('Essential wedding ceremony');
  await page.getByRole('button', { name: 'Save details', exact: true }).click();
  await expect(page.getByText('Saved to event', { exact: true })).toBeVisible();
  const content = JSON.parse(events.get(101).contentJson); expect(content.programDays).toHaveLength(3); expect(content.schedule[0].titleEn).toBe('Essential wedding ceremony');
  await page.reload(); await page.getByRole('button', { name: /Design & content/ }).click();
  await expect(page.getByRole('group', { name: 'Day 3', exact: true })).toBeVisible();
});

test('program and date editor controls pass scoped accessibility checks', async ({ page }, info) => {
  await phase8Fixtures(page); await page.goto('/app/events/101/invitation?mode=guided');
  await page.getByRole('button', { name: /Design & content/ }).click();
  for (const [name, selector] of [['Program','.studio-program'], ['Save the date & calendar','.studio-date-editor']]) {
    await page.getByRole('button', { name, exact: true }).click(); await expect(page.locator(selector)).toBeVisible();
    const result = await new AxeBuilder({ page }).include(selector).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    await info.attach(`axe-${selector.slice(1)}.json`, { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
    expect(result.violations.map(item => ({ rule: item.id, nodes: item.nodes.map(node => node.failureSummary) }))).toEqual([]);
  }
});
