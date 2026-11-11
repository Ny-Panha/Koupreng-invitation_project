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

test('original route presets confirm replacement, undo, fit, pan, save and export local Khmer', async ({ page }, info) => {
  const { events }=await setup(page);await section(page,'scheduleVenue','venue');
  await page.locator('.pe-lang-pill-btn').nth(1).click();await page.locator('[data-map-entry]').getByRole('button',{name:'Edit map',exact:true}).click();
  await page.getByRole('button',{name:'Presets',exact:true}).click();await page.getByRole('button',{name:/Main road to venue/}).click();
  await expect(page.locator('.map-layer-list button')).toHaveCount(5);await page.locator('.map-layer-list button').filter({hasText:'Event venue'}).click();
  await page.getByLabel('អក្សរខ្មែរ',{exact:true}).fill('ទីតាំងកម្មវិធីសាកល្បង');
  await page.getByRole('button',{name:/Main road to venue/}).click();await page.locator('.k-confirm-dialog').getByRole('button',{name:'Cancel',exact:true}).click();
  await expect(page.getByLabel('អក្សរខ្មែរ',{exact:true})).toHaveValue('ទីតាំងកម្មវិធីសាកល្បង');
  await page.getByRole('button',{name:/Landmark route/}).click();await page.locator('.k-confirm-dialog').getByRole('button',{name:'Confirm',exact:true}).click();await page.getByRole('button',{name:'Undo design',exact:true}).click();
  await page.locator('.map-layer-list button').filter({hasText:'Event venue'}).click();await expect(page.getByLabel('អក្សរខ្មែរ',{exact:true})).toHaveValue('ទីតាំងកម្មវិធីសាកល្បង');
  const canvas=page.locator('.map-canvas-sheet svg');await canvas.focus();await canvas.press('ArrowLeft');const x=await page.getByLabel('Position X',{exact:true}).inputValue();
  await page.getByRole('button',{name:'Pan canvas',exact:true}).click();const box=await canvas.boundingBox();await page.mouse.move(box.x+50,box.y+50);await page.mouse.down();await page.mouse.move(box.x+80,box.y+50);await page.mouse.up();
  await expect(page.getByLabel('Position X',{exact:true})).toHaveValue(x);await page.locator('.map-canvas-toolbar').getByRole('button',{name:'Zoom in',exact:true}).click();await page.getByRole('button',{name:'Fit canvas',exact:true}).click();await expect(page.locator('.map-canvas-toolbar output')).toHaveText('100%');
  await download(page,'SVG','svg',info,'venue-map');await download(page,'PNG','png',info,'venue-map');await download(page,'WEBP','webp',info,'venue-map');
  await page.getByRole('button',{name:'Save design',exact:true}).click();await expect(page.locator('.map-save-state')).toHaveText('Saved to server');expect(JSON.parse(events.get(101).contentJson).illustratedMap.nodes).toHaveLength(5);
  const axe=await new AxeBuilder({page}).include('.map-designer-modal').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);
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
  await page.locator('.studio-authoring-options > summary').click();
  await page.locator('.studio-locale-checklist summary').click();
  await page.getByRole('button', { name: 'Copy Khmer value: Event title', exact: true }).click();
  await page.locator('.studio-locale-checklist').getByRole('button', { name: 'Venue address', exact: true }).click();
  await expect(page.locator('[data-studio-section="venue"] [name="venueAddress"]')).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('koupreng.lang'))).toBe('en');
  await expect(page.locator('.pe-lang-pill-btn').nth(1)).toHaveAttribute('aria-pressed', 'true');
});

test('invitation studio renders complete Khmer localization, authentic placeholders, and bilingual integrity', async ({ page }, info) => {
  const state = await phase9Fixtures(page, {
    lang: 'km',
    content: {
      title: 'ពិធីមង្គលការគំរូ',
      messageText: 'សូមគោរពអញ្ជើញ',
      photos: [],
      schedule: [],
      storyChapters: [],
      party: [],
      faq: []
    }
  });
  state.events.set(101, { ...state.events.get(101), languageMode: 'KH' });
  await page.route('**/api/v1/invitations/101/access', route => route.fulfill({
    json: {
      data: {
        owner: true,
        permissions: ['MANAGE_INVITATION'],
        ownerFeatures: ['COUPLE_MONOGRAM', 'ILLUSTRATED_VENUE_MAP']
      }
    }
  }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/app/events/101/invitation');
  await expect(page.getByRole('button', { name: 'រក្សាទុក', exact: true })).toBeVisible();

  // 1. Verify Khmer Family & Name Arrangement panel
  await section(page, 'eventInformation', 'family');
  await expect(page.getByRole('heading', { name: 'ការរៀបចំក្រុមគ្រួសារ និងឈ្មោះ' })).toBeVisible();
  await expect(page.getByLabel('ការរៀបចំទីតាំងឈ្មោះ')).toBeVisible();
  await expect(page.locator('select option[value="template-default"]')).toHaveText('តាមលំនាំដើមនៃគំរូ');
  await expect(page.locator('legend').filter({ hasText: 'ក្រុមគ្រួសារខាងកូនកំលោះ (ដៃគូទី១)' })).toBeVisible();
  await expect(page.getByPlaceholder('ឧ. លោក, កញ្ញា, ឯកឧត្តម').first()).toBeVisible();

  // Add host and verify Khmer placeholders
  await page.getByRole('button', { name: '+ បន្ថែមអ្នករៀបចំ', exact: true }).first().click();
  await page.getByPlaceholder('ឧ. ឈឹម សុខា').first().fill('ឈឹម សុខា ពិសិដ្ឋ');
  await page.getByPlaceholder('ឧ. លោក, លោកស្រី').first().fill('លោក');
  await page.getByPlaceholder('ឧ. ឪពុក, ម្តាយ, អាណាព្យាបាល').first().fill('ឪពុក');

  // 2. Verify Khmer Monogram Editor
  await section(page, 'designCover', 'cover');
  await expect(page.getByRole('heading', { name: 'តែមអក្សរកាត់គូស្នេហ៍ · Premium' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ផ្កាពងក្រពើ' })).toBeVisible();
  await expect(page.getByLabel('បើកដំណើរការតែមអក្សរកាត់')).toBeVisible();
  await expect(page.getByPlaceholder('ឧ. វ & ស')).toBeVisible();
  await page.getByLabel('បើកដំណើរការតែមអក្សរកាត់').check();
  await page.getByPlaceholder('ឧ. វ & ស').fill('វ & ស');
  await expect(page.getByRole('button', { name: 'ទាញយកតែម SVG' })).toBeVisible();

  // 3. Verify Khmer Wording Presets
  await section(page, 'eventInformation', 'invitation');
  await expect(page.getByLabel('ជម្រើសឃ្លាគំរូ').first()).toBeVisible();
  await expect(page.locator('option[value="formal"]').first()).toHaveText('ពិធីមង្គលការផ្លូវការតាមប្រពៃណី');

  // 4. Capture screenshot of complete Khmer Studio
  if (info.project.name.includes('chromium')) {
    const evidenceDir = new URL('../../../../docs/phase12/evidence/after', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
    await fs.mkdir(evidenceDir, { recursive: true });
    await page.screenshot({ path: `${evidenceDir}/khmer-studio-complete-${info.project.name}.png`, fullPage: true });
  }

  // 5. Save and verify data persisted cleanly without corruption
  await page.getByRole('button', { name: 'រក្សាទុក', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  const saved = JSON.parse(state.events.get(101).contentJson);
  expect(saved.familyGroupsV1[0].members[0].name.km).toBe('ឈឹម សុខា ពិសិដ្ឋ');
  expect(saved.coupleMonogram.text).toBe('វ & ស');
});

test('true bilingual switching (KM -> EN -> KM -> EN) verifies UI controls, placeholders, and preserves authored content', async ({ page }, info) => {
  const state = await phase9Fixtures(page, {
    lang: 'km',
    content: {
      title: 'ពិធីមង្គលការរបស់ វីរៈ និង សុម៉ាលី',
      groomName: 'វីរៈ',
      brideName: 'សុម៉ាលី',
      messageText: 'សូមគោរពអញ្ជើញ',
      photos: [],
      schedule: [],
      storyChapters: [],
      party: [],
      faq: []
    }
  });
  state.events.set(101, { ...state.events.get(101), languageMode: 'KH' });
  await page.route('**/api/v1/invitations/101/access', route => route.fulfill({
    json: {
      data: {
        owner: true,
        permissions: ['MANAGE_INVITATION'],
        ownerFeatures: ['COUPLE_MONOGRAM', 'ILLUSTRATED_VENUE_MAP']
      }
    }
  }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/app/events/101/invitation');

  // --- PASS 1: KHMER (KM) INITIAL STATE ---
  await expect(page.getByRole('button', { name: 'រក្សាទុក', exact: true })).toBeVisible();
  await expect(page.locator('.app-language-toggle').first()).toHaveAttribute('aria-checked', 'false');

  // Verify Khmer in Family panel
  await section(page, 'eventInformation', 'family');
  await expect(page.getByRole('heading', { name: 'ការរៀបចំក្រុមគ្រួសារ និងឈ្មោះ' })).toBeVisible();
  await expect(page.getByLabel('ការរៀបចំទីតាំងឈ្មោះ')).toBeVisible();
  await expect(page.locator('legend').filter({ hasText: 'ក្រុមគ្រួសារខាងកូនកំលោះ (ដៃគូទី១)' })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ បន្ថែមអ្នករៀបចំ', exact: true }).first()).toBeVisible();

  // Add host and verify Khmer placeholders
  await page.getByRole('button', { name: '+ បន្ថែមអ្នករៀបចំ', exact: true }).first().click();
  await page.getByPlaceholder('ឧ. ឈឹម សុខា').first().fill('ឈឹម សុខា');
  await page.getByPlaceholder('ឧ. លោក, លោកស្រី').first().fill('លោក');

  // Verify Khmer in Monogram panel
  await section(page, 'designCover', 'cover');
  await expect(page.getByRole('heading', { name: 'តែមអក្សរកាត់គូស្នេហ៍ · Premium' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'អក្សរកាត់រង្វង់មូល' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ផ្កាពងក្រពើ' })).toBeVisible();
  await expect(page.getByLabel('បើកដំណើរការតែមអក្សរកាត់')).toBeVisible();
  await page.getByLabel('បើកដំណើរការតែមអក្សរកាត់').check();
  await page.getByPlaceholder('ឧ. វ & ស').fill('វ & ស');
  await expect(page.getByRole('button', { name: 'ទាញយកតែម SVG' })).toBeVisible();

  // Verify Khmer in Wording Presets
  await section(page, 'eventInformation', 'invitation');
  await expect(page.getByLabel('ជម្រើសឃ្លាគំរូ').first()).toBeVisible();
  await expect(page.locator('option[value="formal"]').first()).toHaveText('ពិធីមង្គលការផ្លូវការតាមប្រពៃណី');

  // --- SWITCH 1: KHMER -> ENGLISH (KM -> EN) ---
  await page.locator('.app-language-toggle').first().click();
  await expect(page.locator('.app-language-toggle').first()).toHaveAttribute('aria-checked', 'true');

  // Verify English UI chrome
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();

  // Verify English Family panel
  await section(page, 'eventInformation', 'family');
  await expect(page.getByRole('heading', { name: 'Family and name arrangement' })).toBeVisible();
  await expect(page.getByLabel('Name placement')).toBeVisible();
  await expect(page.locator('legend').filter({ hasText: 'First partner / groom family' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add host', exact: true }).first()).toBeVisible();
  // Verify authored host name persisted without corruption across language switch
  await expect(page.locator('input[value="ឈឹម សុខា"]')).toBeVisible();

  // Verify English Monogram panel
  await section(page, 'designCover', 'cover');
  await expect(page.getByRole('heading', { name: 'Couple monogram · Premium' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Round initials' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Oval petals' })).toBeVisible();
  await expect(page.getByLabel('Enable monogram')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export monogram SVG' })).toBeVisible();
  // Verify authored monogram text persisted
  await expect(page.locator('input[value="វ & ស"]')).toBeVisible();

  // Verify English Wording Presets
  await section(page, 'eventInformation', 'invitation');
  await expect(page.getByLabel('Editable wording preset').first()).toBeVisible();
  await expect(page.locator('option[value="formal"]').first()).toHaveText('Traditional formal wedding');

  // --- SWITCH 2: ENGLISH -> KHMER (EN -> KM) ---
  await page.locator('.app-language-toggle').first().click();
  await expect(page.locator('.app-language-toggle').first()).toHaveAttribute('aria-checked', 'false');

  // Verify Khmer UI chrome restored
  await expect(page.getByRole('button', { name: 'រក្សាទុក', exact: true })).toBeVisible();

  // Verify Khmer Family restored
  await section(page, 'eventInformation', 'family');
  await expect(page.getByRole('heading', { name: 'ការរៀបចំក្រុមគ្រួសារ និងឈ្មោះ' })).toBeVisible();
  await expect(page.getByLabel('ការរៀបចំទីតាំងឈ្មោះ')).toBeVisible();
  await expect(page.locator('legend').filter({ hasText: 'ក្រុមគ្រួសារខាងកូនកំលោះ (ដៃគូទី១)' })).toBeVisible();
  await expect(page.locator('input[value="ឈឹម សុខា"]')).toBeVisible();

  // Verify Khmer Monogram restored
  await section(page, 'designCover', 'cover');
  await expect(page.getByRole('heading', { name: 'តែមអក្សរកាត់គូស្នេហ៍ · Premium' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'អក្សរកាត់រង្វង់មូល' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ទាញយកតែម SVG' })).toBeVisible();
  await expect(page.locator('input[value="វ & ស"]')).toBeVisible();

  // --- SWITCH 3: KHMER -> ENGLISH (KM -> EN) ---
  await page.locator('.app-language-toggle').first().click();
  await expect(page.locator('.app-language-toggle').first()).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();

  // Capture bilingual screenshot evidence
  if (info.project.name.includes('chromium')) {
    const evidenceDir = new URL('../../../../docs/phase12/evidence/after', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
    await fs.mkdir(evidenceDir, { recursive: true });
    await page.screenshot({ path: `${evidenceDir}/bilingual-switching-${info.project.name}.png`, fullPage: true });
  }

  // Save and assert persisted integrity
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
  const savedPayload = JSON.parse(state.events.get(101).contentJson);
  expect(savedPayload.familyGroupsV1[0].members[0].name.km).toBe('ឈឹម សុខា');
  expect(savedPayload.coupleMonogram.text).toBe('វ & ស');
});
