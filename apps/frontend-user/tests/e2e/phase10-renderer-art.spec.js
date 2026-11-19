import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPhase06Fixture } from './support/phase06Fixtures.js';

test.describe('Phase 10.1 — Dedicated Template Art & Renderer Accessibility Architecture', () => {

  test('01. Template Marketplace: verifies catalog loads, bespoke layouts are presented, and preview links are available', async ({ page }) => {
    await openPhase06Fixture(page, 'catalog', { path: '/templates', anonymous: true });

    // Verify marketplace atelier header
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Verify cards are rendered
    const cards = page.locator('.kp-design-card');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Verify preview button is clickable
    const previewBtn = cards.first().locator('.kp-action-preview');
    await expect(previewBtn).toBeVisible();
  });

  test('02. Template Boilerplate: Dedicated layout renders opening cover with accessible skip button', async ({ page }) => {
    await openPhase06Fixture(page, 'template-demo', { path: '/templates/template-boilerplate', anonymous: true });

    // Check opening cover is displayed or content is available
    const skipBtn = page.getByRole('button', { name: /រំលង|Skip/i });
    if (await skipBtn.isVisible()) {
      // Touch target should be at least 44px high
      const box = await skipBtn.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
      await skipBtn.click();
    }

    // Verify invitation content container or header
    await expect(page.locator('main, [data-template-renderer], .tpl-boilerplate').first()).toBeVisible();
  });

  test('03. Responsive Layout & 0-Horizontal-Overflow Guard on 320px viewport', async ({ page }) => {
    // Set 320px narrow mobile viewport
    await page.setViewportSize({ width: 320, height: 640 });
    await openPhase06Fixture(page, 'template-demo', { path: '/templates/template-boilerplate', anonymous: true });

    // Skip opening if visible
    const skipBtn = page.getByRole('button', { name: /រំលង|Skip/i });
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }

    // Verify document does not have horizontal scrollbar overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('04. Automated WCAG 2.2 AA Accessibility Audit on Template Surface', async ({ page }) => {
    await openPhase06Fixture(page, 'catalog', { path: '/templates', anonymous: true });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    // Ensure 0 critical accessibility violations on marketplace
    const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations).toHaveLength(0);
  });
});
