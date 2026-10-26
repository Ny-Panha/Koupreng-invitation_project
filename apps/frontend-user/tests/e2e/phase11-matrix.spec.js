import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';
const matrix = JSON.parse(readFileSync(new URL('../../../../docs/phase10/01-studio-template-contract-matrix.json', import.meta.url), 'utf8'));
const km = { title: 'ពិធីអបអរសាទរ', groomName: 'សុវណ្ណ វិសាល សិរីមង្គល', brideName: 'សុភ័ក្រ ស្រីពេជ្រ សិរីមង្គល', hostName: 'ម្ចាស់កម្មវិធី', messageText: 'សូមអញ្ជើញចូលរួមកម្មវិធីរបស់យើងខ្ញុំ។', venueName: 'ទីតាំងកម្មវិធី', venueAddress: 'អាសយដ្ឋានកម្មវិធី' };
const en = { title: 'Our celebration', groomName: 'Fictional first partner', brideName: 'Fictional second partner', hostName: 'Fictional event host', partnerName: 'Fictional second partner', messageText: 'Please join our celebration.', venueName: 'Fictional venue', venueAddress: 'Fictional address' };
const features = {
  coupleLayout: 'bride-left', coupleMonogram: { version: 1, enabled: true, text: 'A & B', color: '#996633', motif: 'diamond', layout: 'round', size: 100 },
  familyGroupsV1: [{ side: 'groom', label: { km: 'ក្រុមគ្រួសារ', en: 'Our hosts' }, members: [{ id: 'host-one', name: { km: 'ម្ចាស់កម្មវិធី', en: 'Fictional guardian' }, honorific: { km: '', en: '' }, relationship: { km: '', en: '' } }] }],
  illustratedMap: { version: 1, enabled: true, aspectRatio: 'landscape', theme: 'ivory', description: { km: 'គំនូរទីតាំងកម្មវិធី', en: 'An illustrative route supplied by the host' }, nodes: [
    { id: 'road', type: 'road', x: .45, y: .5, width: .65, height: .05, rotation: 0, label: { km: '', en: '' } },
    { id: 'venue', type: 'destination', x: .75, y: .4, width: .1, height: .1, rotation: 0, label: { km: 'ទីតាំងកម្មវិធី', en: 'Our venue' } },
    { id: 'arrow', type: 'arrow', x: .45, y: .4, width: .2, height: .05, rotation: 0, label: { km: '', en: '' } },
  ] },
};
async function openPublic(page) {
  const buttons = page.getByRole('button', { name: /^(Open invitation|View invitation details|បើកសំបុត្រ|បើកធៀប|ចុចទីនេះ|ចុចដើម្បីបើក|សូមចុច)/i });
  for (let i = 0; i < await buttons.count(); i++) if (await buttons.nth(i).isVisible()) { await buttons.nth(i).click(); return; }
}
for (const template of matrix.templates) for (const locale of ['km', 'en']) test(`${template.code} approved ${locale} across eight viewport widths`, async ({ page }, info) => {
  test.setTimeout(120000);
  const { events } = await phase9Fixtures(page, { code: template.code, content: { ...km, ...features, studioStyle: { motion: 'minimal' },
    localizedContentV1: { version: 1, km, en, enabledLocales: ['km', 'en'], defaultLocale: 'km' },
    programDays: [{ id: 'one', title: 'កម្មវិធី', titleEn: 'Celebration program' }],
    schedule: [{ id: 'gather', dayId: 'one', day: 1, time: '17:30', title: 'ជួបជុំគ្រួសារ', titleEn: 'Family gathering', iconKey: 'gathering' }],
    showStory: false, showFaq: false, showDressCode: false, showParty: false, photos: [] } });
  events.set(101, { ...events.get(101), title: km.title, groomName: km.groomName, brideName: km.brideName, hostName: km.hostName, eventType: template.code === 'event-essential' ? 'BIRTHDAY' : 'WEDDING', languageMode: 'KH', enabledSections: JSON.stringify({ rsvp: false, gallery: false, gift: false, story: false, countdown: false, map: true, schedule: true }) });
  await page.goto(`/i/review-celestial?lang=${locale}`);
  await expect(page.locator('body')).toContainText(locale === 'en' ? en.title : km.title, { timeout: 15000 });
  await openPublic(page);
  await expect(page.locator('body')).toContainText(locale === 'en' ? en.venueName : km.venueName, { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${template.code}/${locale}/${width} overflows`).toBe(true);
    if (info.project.name === 'chromium' && template.code === 'khmer-celestial' && [390, 1440].includes(width)) {
      await fs.mkdir('../../docs/phase11/evidence/after', { recursive: true });
      for (const [key, selector] of [['family', '.kc-family'], ['program', '.kp-program'], ['map', '.kp-illustrated-map']]) {
        const section = page.locator(selector).first(); await section.scrollIntoViewIfNeeded();
        await section.screenshot({ path: `../../docs/phase11/evidence/after/celestial-${key}-${locale}-${width}.png` });
      }
      await page.locator('.public-locale-switch').screenshot({ path: `../../docs/phase11/evidence/after/guest-locale-${locale}-${width}.png` });
    }
  }
});
