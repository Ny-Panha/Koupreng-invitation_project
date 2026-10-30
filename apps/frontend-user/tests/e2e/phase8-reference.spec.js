import { activateOpening } from './support/activateOpening';
import { test, expect } from '@playwright/test';
import { phase8Fixtures } from './support/phase8Fixtures';

// Read-only comparison against the already running, unmodified Phase 7 build.
// The opt-in origin is supplied by the verifier; it is never started or changed here.
import process from 'node:process';
for (const stage of ['before', 'after']) for (const [lang, width] of [['kh',390],['en',1440]]) test(`${stage} existing artwork ${lang} ${width}`, async ({ page }, info) => {
  test.skip(!process.env.PHASE8_BASELINE_ORIGIN, 'Requires the preserved Phase 7 preview server.');
  await phase8Fixtures(page, { lang }); await page.setViewportSize({ width, height: 950 });
  await page.goto(`${stage === 'before' ? process.env.PHASE8_BASELINE_ORIGIN : 'http://127.0.0.1:4288'}/app/events/101/preview`);
  await activateOpening(page);
  await page.evaluate(() => document.fonts.ready);
  for (const [name, selector] of [['program','.kc-schedule'],['save-date','.kc-countdown']]) {
    await expect(page.locator(selector)).toBeVisible();
    await page.locator(selector).screenshot({ path: info.outputPath(`${stage}-${name}-${lang}-${width}.png`) });
  }
});
