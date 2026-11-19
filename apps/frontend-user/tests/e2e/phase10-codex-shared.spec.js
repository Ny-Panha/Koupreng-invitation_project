import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import process from 'node:process';
import { openPhase06Fixture } from './support/phase06Fixtures.js';

const stage = process.env.PHASE10_STAGE || 'acceptance-shared';
const output = resolve('../../output/playwright/phase10-codex-2026-11-18', stage);
mkdirSync(output, { recursive: true });
const build = JSON.parse(readFileSync(resolve('../../output/playwright/phase10-codex-2026-11-18/current-build-source.json'), 'utf8'));

for (const family of ['event-essential', 'koupreng-demo-wedding']) {
  test(`shared identity ${family} paints without granting ownership`, async ({ page }, info) => {
    const width = info.project.name.startsWith('mobile') ? 390 : 1440;
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const state = await openPhase06Fixture(page, 'template-demo', { path: `/templates/${family}`, anonymous: true, lang: 'en' });
    // The showcase shared ID is a dynamic published catalog identity, not a
    // bundled local sample. Supply its public API record before the reload.
    await page.route(`**/api/v1/templates/slug/${family}`, route => route.fulfill({ json: { data: {
      id: 7, code: family, slug: family, name: 'Shared invitation fixture', status: 'ACTIVE', category: 'OTHER', premium: false,
      description: JSON.stringify({ groomName: 'Fictional host', brideName: 'Fictional partner', invitationTitle: 'Shared invitation fixture' }),
    } } }));
    await page.reload();
    const root = page.locator(`[data-template-id="${family}"]`);
    await expect(root).toBeAttached();
    const skip = page.getByRole('button', { name: /Skip|រំលង/ }).filter({ visible: true }).first();
    if (await skip.count()) await skip.click();
    const content = page.locator(family === 'event-essential' ? '.event-wizard-card' : '[data-tx-section="message"]');
    await expect(content.first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const paint = await content.first().evaluate(node => ({ text: node.textContent.trim(), rect: node.getBoundingClientRect().toJSON() }));
    expect(paint.text.length).toBeGreaterThan(20);
    expect(state.errors).toEqual([]);
    const capture = `${info.project.name}-${family}.png`;
    await page.screenshot({ path: join(output, capture), scale: 'css' });
    writeFileSync(join(output, capture + '.json'), JSON.stringify({ stage, fingerprint: build.source_fingerprint, capture_type: 'viewport', geometry: { viewport: { width, height: 900 } } }, null, 2));
    writeFileSync(join(output, `${info.project.name}-${family}.json`), JSON.stringify({ stage, fingerprint: build.source_fingerprint, rows: [{ family, project: info.project.name, viewport: { width, height: 900 }, route: `/templates/${family}`, motion: 'reduce', paint, capture, permission: 'anonymous fixture; no purchase/publish operation', errors: state.errors }] }, null, 2));
  });
}

test('unknown stable identity fails closed rather than borrowing numeric art', async ({ page }) => {
  await openPhase06Fixture(page, 'template-demo', { path: '/templates/phase10-unknown', anonymous: true });
  await page.route('**/api/v1/templates/slug/phase10-unknown', route => route.fulfill({ json: { data: { id: 7, code: 'phase10-unknown', slug: 'phase10-unknown', name: 'Unknown fixture', status: 'ACTIVE' } } }));
  await page.reload();
  await expect(page.getByRole('heading', { name: /Template unavailable/ })).toBeVisible();
  await expect(page.locator('.tdy-card-container,.kfg-invitation,.tpl-silk-heritage')).toHaveCount(0);
});
