import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { phase9Fixtures } from './support/phase9Fixtures';
import { phase8Content } from './support/phase8Fixtures';

const templates = JSON.parse(readFileSync(new URL('../../../../docs/phase10/01-studio-template-contract-matrix.json', import.meta.url), 'utf8')).templates;
test('all catalog templates shape long Khmer names with external font servers unavailable', async ({ page }, info) => {
  test.setTimeout(180000);
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  const groom = 'ខៀវ សុវណ្ណវិសាល ចន្ទមុនីឫទ្ធិ', bride = 'សុខ សុភ័ក្ត្រស្រីពេជ្រ ច័ន្ទរចនា';
  await fs.mkdir('../../docs/phase10/evidence/typography', { recursive: true });
  for (const template of templates) {
    const { events } = await phase9Fixtures(page, { lang: 'kh', code: template.code, content: { ...phase8Content, couple: { groom, bride }, fontKhmer: 'Battambang', fontLatin: 'DM Sans', languageMode: 'BOTH' } });
    events.set(101, { ...events.get(101), groomName: groom, brideName: bride, hostName: groom, partnerName: bride });
    await page.goto('/i/review-celestial'); await expect(page.locator('body')).toContainText(groom, { timeout: 15000 });
    const loaded = await page.evaluate(async () => ({ body: (await document.fonts.load('16px "Battambang"', 'សិរីសួស្តី')).length, fallback: (await document.fonts.load('16px "Noto Sans Khmer"', 'អាពាហ៍ពិពាហ៍')).length }));
    expect(loaded.body).toBeGreaterThan(0); expect(loaded.fallback).toBeGreaterThan(0);
    for (const width of [320,1440]) {
      await page.setViewportSize({ width, height: 960 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), template.code).toBe(true);
      if (info.project.name === 'chromium' && width === 320) await page.screenshot({ path: `../../docs/phase10/evidence/typography/${template.code}-long-khmer-320.png` });
    }
  }
});
