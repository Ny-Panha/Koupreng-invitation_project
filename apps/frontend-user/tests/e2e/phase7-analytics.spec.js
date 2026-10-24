import { expect, test } from '@playwright/test';
import { installUxFixtures } from './support/uxFixtures.js';

for (const lang of ['en','kh']) test(`attendance analytics ${lang} has readable date facts and an equivalent table`, async ({ page }, info) => {
  await installUxFixtures(page,lang);
  await page.route('**/api/v1/invitations/101/analytics?**', route => route.fulfill({ json: { data: {
    from: '2026-10-01', to: '2026-10-24', timezone: 'Asia/Phnom_Penh', current: { guestRecords: 4, reservedSeats: 10, respondedRecords: 3, confirmedAttendees: 2, checkedInRecords: 1 },
    days: Array.from({ length: 24 }, (_,i) => ({ date: `2026-10-${String(i+1).padStart(2,'0')}`, guestRecordsCreated: i===0?4:0, latestRsvpRecords: i===2?3:0, attendingRecords: i===2?1:0, declinedRecords: i===2?1:0, maybeRecords: i===2?1:0, activeCheckInRecords: i===23?1:0 }))
  } } }));
  await page.goto('/app/events/101/analytics');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('75.0%', { exact: true })).toBeVisible();
  for(const width of [320,375,390,430,768,1024,1366,1440,1920]) {
    await page.setViewportSize({ width, height: width<500?780:950 });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: info.outputPath(`analytics-${lang}-${width}.png`), fullPage: true });
  }
});
