import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';

async function setup(page) {
  const state = await phase9Fixtures(page, { content: { title: 'Fictional celebration', messageText: 'សូមអញ្ជើញចូលរួម', photos: [], schedule: [], storyChapters: [], party: [], faq: [] } });
  state.events.set(101, { ...state.events.get(101), languageMode: 'KH' });
  await page.route('**/api/v1/invitations/101/access', route => route.fulfill({ json: { data: { owner: true, permissions: ['MANAGE_INVITATION'], ownerFeatures: ['COUPLE_MONOGRAM', 'ILLUSTRATED_VENUE_MAP'] } } }));
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/app/events/101/invitation');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  return state;
}
async function section(page, tab, key) {
  await page.locator(`[data-studio-tab="${tab}"]`).click(); await page.locator(`[data-studio-section="${key}"] details`).evaluate(node => { node.open = true; });
}
async function download(page, button, format, info, name) {
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: button, exact: true }).click();
  const file = await pending, bytes = await fs.readFile(await file.path());
  expect(file.suggestedFilename()).toMatch(new RegExp(`\\.${format}$`));
  if (format === 'svg') {
    const svg = bytes.toString('utf8'); expect(svg).toContain('data:font/woff2;base64,'); expect(svg).toContain('SIL OPEN FONT LICENSE'); expect(svg).not.toMatch(/<script|<foreignObject|data-editor-only|onpointer|<image/);
  } else if (format === 'png') { expect(bytes.subarray(1, 4).toString()).toBe('PNG'); expect(bytes.readUInt32BE(16)).toBeGreaterThanOrEqual(400); expect(bytes.length).toBeGreaterThan(1500); }
  else { expect(bytes.subarray(0, 4).toString()).toBe('RIFF'); expect(bytes.subarray(8, 12).toString()).toBe('WEBP'); }
  if (info.project.name === 'chromium') { await fs.mkdir('../../docs/phase12/evidence/exports', { recursive: true }); await fs.writeFile(`../../docs/phase12/evidence/exports/${name}.${format}`, bytes); }
}

test('original route presets confirm replacement, undo, fit, lock, save and export local Khmer', async ({ page }, info) => {
  const { events } = await setup(page); await section(page, 'scheduleVenue', 'venue');
  await page.getByLabel('Show diagram publicly').check(); await page.getByRole('button', { name: 'Apply diagram preset' }).click();
  await expect(page.locator('.studio-map-layers button')).toHaveCount(5);
  await page.locator('.studio-map-layers button').filter({ hasText: 'destination' }).click();
  await page.getByLabel('Element label (km)').fill('ទីតាំងកម្មវិធីសាកល្បង');
  page.once('dialog', dialog => dialog.dismiss()); await page.getByRole('button', { name: 'Apply diagram preset' }).click();
  await expect(page.getByLabel('Element label (km)')).toHaveValue('ទីតាំងកម្មវិធីសាកល្បង');
  await page.getByLabel('Diagram starting point').selectOption('landmarks'); page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Apply diagram preset' }).click(); await page.getByRole('button', { name: 'Undo design', exact: true }).click();
  await page.locator('.studio-map-layers button').filter({ hasText: 'destination' }).click();
  await expect(page.getByLabel('Element label (km)')).toHaveValue('ទីតាំងកម្មវិធីសាកល្បង');
  await page.getByLabel('Drag elements (turn off to scroll)').uncheck();
  const canvas = page.locator('.studio-map-stage svg'); await canvas.focus(); await canvas.press('ArrowLeft');
  const x = await page.getByLabel('x', { exact: true }).inputValue();
  const element = canvas.locator('[data-map-node]').filter({ has: page.locator('text', { hasText: 'ទីតាំងកម្មវិធីសាកល្បង' }) });
  const box = await element.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2); await page.mouse.up();
  await expect(page.getByLabel('x', { exact: true })).toHaveValue(x);
  await page.getByLabel('Editor zoom').fill('2'); await page.getByRole('button', { name: 'Fit canvas' }).click(); await expect(page.getByLabel('Editor zoom')).toHaveValue('1');
  await download(page, 'Export safe SVG', 'svg', info, 'venue-map'); await download(page, 'Export PNG', 'png', info, 'venue-map'); await download(page, 'Export WebP', 'webp', info, 'venue-map');
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  expect(JSON.parse(events.get(101).contentJson).illustratedMap.nodes).toHaveLength(5);
  await page.reload(); await section(page, 'scheduleVenue', 'venue'); await expect(page.locator('.studio-map-layers button')).toHaveCount(5);
  const axe = await new AxeBuilder({ page }).include('.studio-map-stage').include('.studio-map-layers').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(axe.violations).toEqual([]);
  if (info.project.name === 'chromium') { await fs.mkdir('../../docs/phase12/evidence/after', { recursive: true }); await page.getByRole('region', { name: 'Illustrated venue map editor' }).screenshot({ path: '../../docs/phase12/evidence/after/map-editor-1440.png' }); }
});

test('monogram starting styles and local font exports preserve names', async ({ page }, info) => {
  const { events } = await setup(page); await section(page, 'designCover', 'cover');
  await page.getByLabel('Enable monogram').check(); await page.getByLabel('Monogram text', { exact: true }).fill('ក និង ខ');
  await page.getByRole('button', { name: 'Oval petals', exact: true }).click(); await page.getByLabel('Monogram font').selectOption('KANTUMRUY');
  await download(page, 'Export monogram SVG', 'svg', info, 'monogram'); await download(page, 'Export monogram PNG', 'png', info, 'monogram');
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  const saved = JSON.parse(events.get(101).contentJson); expect(saved.coupleMonogram).toMatchObject({ text: 'ក និង ខ', layout: 'oval', motif: 'petals' }); expect(events.get(101).groomName).toBe('Celestial host');
});

test('locale checklist opens and focuses missing venue wording without changing the account language', async ({ page }) => {
  await setup(page); await page.locator('.pe-lang-pill-btn').nth(1).click();
  await page.locator('.studio-locale-checklist summary').click();
  await page.getByRole('button', { name: 'Copy Khmer value: Event title', exact: true }).click();
  await page.locator('.studio-locale-checklist').getByRole('button', { name: 'Venue address', exact: true }).click();
  await expect(page.locator('[data-studio-section="venue"] [name="venueAddress"]')).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('koupreng.lang'))).toBe('en');
  await expect(page.locator('.pe-lang-pill-btn').nth(1)).toHaveAttribute('aria-pressed', 'true');
});
