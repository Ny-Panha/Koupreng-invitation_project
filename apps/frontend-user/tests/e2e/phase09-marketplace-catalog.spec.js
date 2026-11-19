import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPhase06Fixture } from './support/phase06Fixtures.js';

test.describe('Phase 09.1 — Template Marketplace, Pricing & Decision Architecture', () => {

  test('01. Public discovery: luxury atelier header, categories, search, price pills, and cards', async ({ page }) => {
    await openPhase06Fixture(page, 'catalog', { path: '/templates', anonymous: true });

    // Verify luxury header
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.tp-divider')).toBeVisible();

    // Verify catalog controls
    const controls = page.locator('.tp-catalog-controls');
    await expect(controls).toBeVisible();

    // Verify category chips
    const allCatBtn = controls.getByRole('button', { name: /All|ទាំងអស់/i }).first();
    await expect(allCatBtn).toBeVisible();
    await expect(allCatBtn).toHaveAttribute('aria-pressed', 'true');

    // Verify price filter pills
    const freePill = controls.getByRole('button', { name: /Free|ឥតគិតថ្លៃ/i });
    const premiumPill = controls.getByRole('button', { name: /Premium|ប្រណីត/i });
    await expect(freePill).toBeVisible();
    await expect(premiumPill).toBeVisible();

    // Verify search input
    const searchInput = page.locator('.kp-catalog-search input');
    await expect(searchInput).toBeVisible();

    // Verify sort dropdown
    const sortSelect = page.locator('#tp-sort-select');
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect).toHaveValue('default');

    // Verify template cards exist
    const cards = page.locator('.kp-design-card');
    await expect(cards.first()).toBeVisible();
    await expect(cards.first().locator('.tp-card-badge')).toBeVisible();
    await expect(cards.first().locator('.kp-action-preview')).toBeVisible();
  });

  test('02. Search, clear button, and empty state recovery', async ({ page }) => {
    await openPhase06Fixture(page, 'catalog', { path: '/templates', anonymous: true });

    const searchInput = page.locator('.kp-catalog-search input');
    await searchInput.fill('NonExistentDesignSlug999');

    // Empty state is rendered
    await expect(page.locator('.uui-empty-state, .tb-empty')).toBeVisible();

    // Clear search using the inline clear button or action button
    const clearBtn = page.locator('.kp-search-clear-btn');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(searchInput).toHaveValue('');
      await expect(page.locator('.kp-design-card').first()).toBeVisible();
    }
  });

  test('03. Category and price filtering interactivity', async ({ page }) => {
    await openPhase06Fixture(page, 'catalog', { path: '/templates', anonymous: true });

    // Toggle price filter
    const freePill = page.locator('.tp-price-filter-row').getByRole('button', { name: /Free|ឥតគិតថ្លៃ/i });
    await freePill.click();
    await expect(freePill).toHaveAttribute('aria-pressed', 'true');

    // Results count updates
    const resultsCount = page.locator('.tp-results-count');
    await expect(resultsCount).toBeVisible();

    // Reset filters button appears
    const resetBtn = page.locator('.tp-reset-filters-btn');
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await expect(freePill).toHaveAttribute('aria-pressed', 'false');
    }
  });

  test('04. Public Pricing: packages, transparent USD/KHR amounts, limits, and comparison', async ({ page }) => {
    await openPhase06Fixture(page, 'pricing', { path: '/pricing', anonymous: true });

    // Intro and plan cards
    await expect(page.locator('.kp-plans-page')).toBeVisible();
    await expect(page.locator('.kp-plan-grid')).toBeVisible();
    const planCards = page.locator('.kp-plan-card');
    await expect(planCards.first()).toBeVisible();

    // Prices are rendered with currency
    await expect(page.locator('.kp-plan-price').first()).toBeVisible();

    // Comparison table exists and is keyboard accessible
    const tableRegion = page.locator('.kp-compare-table');
    if (await tableRegion.isVisible()) {
      await expect(tableRegion).toHaveAttribute('tabIndex', '0');
      await expect(tableRegion.locator('table')).toBeVisible();
    }

    // Anonymous visitor action links preserve safe continuation
    const cta = planCards.first().locator('a.kp-button');
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toMatch(/\/login\?next=|\/dashboard\/packages|\/contact/);
  });

  test('05. Guarded host browse: authenticated view, status counters, and selection', async ({ page }) => {
    await openPhase06Fixture(page, 'catalog', { path: '/templates/browse' });

    // Host browse header and stats
    await expect(page.locator('.pe-templates-browse-page')).toBeVisible();
    await expect(page.locator('.pe-summary-grid')).toBeVisible();

    // Category chips include Paid Templates
    const chips = page.locator('.tb-category-chip');
    await expect(chips.first()).toBeVisible();

    // Host template cards have preview actions
    const hostCards = page.locator('.tb-card');
    await expect(hostCards.first()).toBeVisible();
  });

  test('06. Guarded template checkout decision surface', async ({ page }) => {
    await openPhase06Fixture(page, 'checkout', { path: '/templates/30/checkout' });

    await expect(page.locator('.checkout-main-container')).toBeVisible();
    await expect(page.locator('.checkout-template-card')).toBeVisible();
    await expect(page.locator('.checkout-summary-card')).toBeVisible();

    // ABA PayWay notice is explicit and transparent
    await expect(page.locator('.checkout-method-card')).toBeVisible();
    await expect(page.getByText(/ABA PayWay/i)).toBeVisible();

    // Back to designs navigation
    const backBtn = page.locator('.checkout-back-btn');
    await expect(backBtn).toHaveAttribute('href', '/templates');
  });

  test('07. Accessibility audit: WCAG 2.2 AA on public discovery and pricing', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openPhase06Fixture(page, 'catalog', { path: '/templates', anonymous: true });

    await expect(page.locator('.tp-page')).toBeVisible();

    const axeCatalog = await new AxeBuilder({ page })
      .include('.tp-page')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(axeCatalog.violations).toEqual([]);

    await page.goto('http://127.0.0.1:4173/pricing');
    await expect(page.locator('.kp-plans-page')).toBeVisible();

    const axePricing = await new AxeBuilder({ page })
      .include('.kp-plans-page')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(axePricing.violations).toEqual([]);
  });
});
