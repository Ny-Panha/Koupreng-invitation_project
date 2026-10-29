import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';

async function setup(page, premium = true) {
  const state = await phase9Fixtures(page, { lang: 'en', content: { title: 'Phase 11 fictional celebration', messageText: 'Authored Khmer invitation', photos: [], schedule: [], storyChapters: [], party: [], faq: [] } });
  state.events.set(101, { ...state.events.get(101), languageMode: 'KH' });
  await page.route('**/api/v1/invitations/101/access', route => route.fulfill({ json: { data: { owner: true, permissions: ['MANAGE_INVITATION', 'MANAGE_GUESTS'], ownerFeatures: premium ? ['COUPLE_MONOGRAM', 'ILLUSTRATED_VENUE_MAP', 'PRE_WEDDING_VIDEO'] : [] } } }));
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/app/events/101/invitation');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  return state;
}
async function section(page, tab, key) {
  await page.locator(`[data-studio-tab="${tab}"]`).click();
  await page.locator(`[data-studio-section="${key}"] details`).evaluate(node => { node.open = true; });
}
async function openMap(page) {
  await page.locator('.pe-lang-pill-btn').nth(1).click();
  await page.locator('[data-map-entry]').getByRole('button', { name:'Edit map',exact:true }).click();
  await expect(page.getByRole('dialog', { name:'Illustrated map designer' })).toBeVisible();
}
test('Premium diagram drag, keyboard, layer edits, undo, export and reopen use saved structured data', async ({ page }) => {
  const { events } = await setup(page);
  await section(page,'scheduleVenue','venue'); await openMap(page);
  await page.getByLabel('English directions note').fill('Fictional venue route illustration');
  await page.getByRole('button',{name:'Landmarks',exact:true}).click();
  await page.getByRole('button',{name:'Destination pin',exact:true}).click();
  await page.getByLabel('English label',{exact:true}).fill('Our venue');
  const canvas=page.locator('.map-canvas-sheet svg');await canvas.focus();await canvas.press('ArrowRight');
  await expect(page.getByLabel('Position X',{exact:true})).toHaveValue('0.505');
  const node=canvas.locator('[data-map-node] > rect[data-editor-only]').first(),box=await node.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+45,box.y+box.height/2+20,{steps:5});await page.mouse.up();
  expect(Number(await page.getByLabel('Position X',{exact:true}).inputValue())).toBeGreaterThan(.505);
  await page.getByRole('button',{name:'Duplicate',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(2);
  await page.getByRole('button',{name:'Undo design',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(1);
  await page.getByRole('button',{name:'Redo design',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(2);
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'SVG',exact:true}).click();const file=await pending,text=await fs.readFile(await file.path(),'utf8');
  expect(text).toContain('Our venue');expect(text).not.toMatch(/<script|onpointer|data-editor-only/);
  await page.getByRole('button',{name:'Save design',exact:true}).click();await expect(page.locator('.map-save-state')).toHaveText('Saved to server');
  expect(JSON.parse(events.get(101).contentJson).illustratedMap).toMatchObject({version:2});
  await page.getByRole('button',{name:'Close designer',exact:true}).click();await page.reload();await section(page,'scheduleVenue','venue');await openMap(page);
  await expect(page.locator('.map-layer-list button')).toHaveCount(2);
  const axe=await new AxeBuilder({page}).include('.map-designer-modal').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);
});

test('family layout, custom host and decorative monogram retain canonical identities', async ({ page }, info) => {
  const { events } = await setup(page);
  await section(page, 'eventInformation', 'family');
  await page.getByLabel('Name placement').selectOption('bride-left');
  await page.getByRole('button', { name: 'Add host', exact: true }).first().click();
  await page.getByLabel('name (km)', { exact: true }).fill('Fictional guardian');
  await page.getByLabel('honorific (km)', { exact: true }).fill('Dr');
  await section(page, 'designCover', 'cover');
  await page.getByLabel('Enable monogram').check(); await page.getByLabel('Monogram text').fill('A & B');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  const saved = JSON.parse(events.get(101).contentJson);
  expect(saved.coupleLayout).toBe('bride-left'); expect(saved.familyGroupsV1[0].members[0].name.km).toBe('Fictional guardian');
  expect(saved.coupleMonogram.text).toBe('A & B'); expect(events.get(101).groomName).toBe('Celestial host');
  if (info.project.name === 'chromium') await page.screenshot({ path: '../../docs/phase11/evidence/after/monogram-editor-1440.png' });
});
test('unentitled Studio has no Premium canvas or monogram activation', async ({ page }) => {
  await setup(page, false); await section(page, 'scheduleVenue', 'venue');
  await expect(page.locator('.map-designer-modal')).toHaveCount(0);
  await section(page, 'designCover', 'cover'); await expect(page.getByLabel('Enable monogram')).toHaveCount(0);
});

test('native touch moves a diagram node and cancellation preserves the last committed position', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Native touch injection uses Chromium CDP; other engines cover pointer and keyboard.');
  await setup(page); await section(page, 'scheduleVenue', 'venue');
  await openMap(page); await page.getByRole('button',{name:'Landmarks',exact:true}).click();
  await page.getByRole('button', { name: 'Destination pin', exact: true }).click();
  const node = page.locator('.map-canvas-sheet [data-map-node] > rect[data-editor-only]').first();
  await node.scrollIntoViewIfNeeded();
  const box = await node.boundingBox();
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const start = { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + 45, y: start.y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(Number(await page.getByLabel('Position X', { exact: true }).inputValue())).toBeGreaterThan(.5);
  const committed = await page.getByLabel('Position X', { exact: true }).inputValue();
  const nextBox = await node.boundingBox();
  const next = { x: Math.round(nextBox.x + nextBox.width / 2), y: Math.round(nextBox.y + nextBox.height / 2) };
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [next] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: next.x + 30, y: next.y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(page.getByLabel('Position X', { exact: true })).toHaveValue(committed);
});
