import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { phase9Fixtures } from './support/phase9Fixtures';
import { phase8Content } from './support/phase8Fixtures';
import { activateOpening } from './support/activateOpening';

const matrix = JSON.parse(readFileSync(new URL('../../../../docs/phase10/01-studio-template-contract-matrix.json', import.meta.url), 'utf8'));
async function openPublic(page, code) {
  const buttons = page.getByRole('button', { name: /^(Open invitation|View invitation details|បើកសំបុត្រ|បើកធៀប|ចុចទីនេះ|ចុចដើម្បីបើក|សូមចុច)/i });
  if (['withjoy-modern-portal', 'bliss-editorial-wedding', 'event-essential', 'template-boilerplate'].includes(code)) {
    await expect(buttons).toHaveCount(0);
    return;
  }
  await activateOpening(page, buttons.first());
}

for (const template of matrix.templates) test(`${template.code}: edit, actual preview, authoritative save/reload, publish and guest DOM`, async ({ page }, info) => {
  test.skip(['garden-royal-khmer-wedding','khmer-royal-lotus'].includes(template.code), 'Retired by V50; inactive exclusion is tested separately');
  test.setTimeout(90000);
  const generic = template.code === 'event-essential';
  const { events } = await phase9Fixtures(page, { code: template.code, content: { ...phase8Content,
    couple: { groom: 'សុវណ្ណ វិសាល', bride: 'សុភ័ក្រ ស្រីពេជ្រ' }, fontKhmer: 'Battambang', fontLatin: 'DM Sans',
    messageText: 'Authored invitation wording', studioStyle: { motion: 'minimal' },
  } });
  if (generic) events.set(101, { ...events.get(101), eventType: 'BIRTHDAY', hostName: 'សុវណ្ណ វិសាល' });
  await page.route('**/api/v1/invitations/101/publish', route => {
    events.set(101, { ...events.get(101), status: 'PUBLISHED' });
    return route.fulfill({ json: { data: events.get(101) } });
  });
  await page.setViewportSize({ width: 1440, height: 960 }); await page.goto('/app/events/101/invitation');
  const title = `Authored ${template.code}`;
  await (generic ? page.locator('#event-title') : page.getByRole('textbox', { name: 'Main Title', exact: true })).fill(title);
  if (!generic) {
    await expect(page.frameLocator('iframe').locator('body')).toContainText(title, { timeout: 15000 });
  }
  await page.getByRole('button', { name: generic ? 'Save details' : 'Save', exact: true }).click();
  if (generic) await expect(page.getByText('Saved to event', { exact: true })).toBeVisible();
  else await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(events.get(101).title).toBe(title);
  expect(JSON.parse(events.get(101).contentJson).futureExtension).toEqual({ preserve: 'authored metadata' });
  await page.reload();
  await expect(generic ? page.locator('#event-title') : page.getByRole('textbox', { name: 'Main Title', exact: true })).toHaveValue(title, { timeout: 15000 });
  await page.getByRole('button', { name: generic ? 'Review publication' : 'Publish', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm publication', exact: true }).click();
  await expect.poll(() => events.get(101).status).toBe('PUBLISHED');
  await page.goto('/i/review-celestial'); await expect(page.locator('body')).toContainText('សុវណ្ណ វិសាល', { timeout: 15000 });
  await expect(page.locator('body')).toContainText(title);
  await openPublic(page, template.code);
  await expect(page.getByText('Review venue', { exact: true }).first()).toBeVisible({ timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('16px "Battambang"', 'សិរីសួស្តី'));
  expect(await page.evaluate(() => document.fonts.check('16px "Battambang"', 'សិរីសួស្តី'))).toBe(true);
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({ width, height: 960 });
    const overflow = await page.evaluate(() => ({ ok: document.documentElement.scrollWidth <= innerWidth + 1, nodes: [...document.querySelectorAll('body *')].filter(node => node.getBoundingClientRect().right > innerWidth + 1).slice(0,6).map(node => ({ tag: node.tagName, class: node.className, width: node.getBoundingClientRect().width })) }));
    expect(overflow.ok, JSON.stringify(overflow.nodes)).toBe(true);
    if (info.project.name === 'chromium' && width === 390) {
      await fs.mkdir('../../docs/phase10/evidence/templates', { recursive: true });
      await page.screenshot({ path: `../../docs/phase10/evidence/templates/${template.code}-390.png` });
    }
  }
});
