import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPhase06Fixture as open } from './support/phase06Fixtures.js';

test('venue search reset clears the displayed value and returns input focus', async ({ page }) => {
  await open(page, 'venues');
  await expect(page).toHaveTitle(/Wedding Venues/);
  const search = page.getByRole('textbox', { name: /Search by name/ });
  await search.fill('no-such-place');
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(page.locator('.venue-card')).toHaveCount(4);
});

test('venue modal isolates background and returns focus after Escape', async ({ page }) => {
  await open(page, 'venues');
  const trigger = page.getByRole('button', { name: /View details/ }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Koh Pich Theatre' });
  await expect(dialog).toBeVisible();
  expect(await page.locator('.kp-brand').evaluate(el => { el.focus(); return document.activeElement === el; })).toBe(false);
  await dialog.getByRole('button', { name: 'Close', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/\/venues$/);
});

test('venue click creates history; browser Back returns to the directory', async ({ page }) => {
  await open(page, 'venues');
  await page.getByRole('button', { name: /View details/ }).first().click();
  await expect(page).toHaveURL(/\/venues\/1$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/venues$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('venue direct entry closes safely and unknown IDs explain recovery', async ({ page }) => {
  await open(page, 'venues', { path: '/venues/2' });
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/venues$/);
  await expect(page.getByRole('textbox', { name: /Search by name/ })).toBeFocused();
  await page.goto('/venues/999');
  await expect(page.getByRole('heading', { name: 'Venue not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse venues', exact: true }).click();
  await expect(page).toHaveURL(/\/venues$/);
});

test('venue failed photos have a truthful fallback and selected media is eager', async ({ page }) => {
  await open(page, 'venues', { path: '/venues/1' });
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('img')).toHaveAttribute('loading', 'eager');
  await expect(dialog.getByText('Photo unavailable', { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Illustrative/)).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Contact/ })).toHaveAttribute('href', '/contact');
});

test('home discovery, disclosures, signed-out continuation and skip link work', async ({ page }) => {
  const state = await open(page, 'home', { anonymous: true });
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.kp-hero a.kp-button')).toHaveAttribute('href', '/app/events/new');
  await expect(page.locator('.kp-hero a.kp-text-link')).toHaveAttribute('href', '/templates');
  const summary = page.locator('.kp-faq summary').first();
  await summary.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.kp-faq details').first()).toHaveAttribute('open', '');
  await page.keyboard.press('Space');
  await expect(page.locator('.kp-faq details').first()).not.toHaveAttribute('open', '');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await skip.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#marketing-content')).toBeFocused();
  await page.locator('.kp-hero a.kp-button').click();
  await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fevents%2Fnew/);
  expect(state.writes).toEqual([]);
});

test('mobile drawer is modal, traps keyboard, closes and follows route navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await open(page, 'home', { anonymous: true });
  const trigger = page.getByRole('button', { name: 'Open navigation menu' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await expect(dialog).toBeVisible();
  expect(await page.locator('.kp-brand').evaluate(el => { el.focus(); return document.activeElement === el; })).toBe(false);
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.locator(':focus')).toHaveCount(1);
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('#marketing-content')).toBeFocused();
});

test('contact preserves a draft through locale, theme, pending, rejection and retry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, 'contact', { anonymous: true });
  await expect(page).toHaveTitle(/Contact/);
  const send = () => page.locator('button[type=submit]');
  await send().click();
  await expect(page.locator('#contact-name')).toBeFocused();
  await expect(page.locator('#contact-name')).toHaveAttribute('aria-describedby', 'contact-name-error');
  await page.locator('#contact-name').fill('Fictional Host');
  await page.locator('#contact-email').fill('audit@example.test');
  await page.locator('#contact-message').fill('Fictional support question. No real email.');
  await page.getByRole('switch').first().click();
  await page.getByRole('button', { name: /dark|light|ងងឹត|ភ្លឺ/i }).first().click();
  await expect(page.locator('#contact-name')).toHaveValue('Fictional Host');
  let release; let calls = 0;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/api/v1/contact', async route => {
    calls++;
    expect(route.request().postDataJSON()).toMatchObject({ name: 'Fictional Host', email: 'audit@example.test' });
    if (calls === 1) { await pending; await route.fulfill({ status: 429, json: { message: 'Fixture rate limit' } }); }
    else await route.fulfill({ json: { data: { accepted: true, delivery: 'SMTP_ACCEPTED' } } });
  });
  await send().click();
  await expect(send()).toBeDisabled();
  await expect(page.locator('form')).toHaveAttribute('aria-busy', 'true');
  expect(calls).toBe(1); release();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('#contact-message')).toHaveValue('Fictional support question. No real email.');
  await send().click();
  await expect(page.getByRole('status')).toBeFocused();
  expect(calls).toBe(2);
});

test('contact refuses unacknowledged delivery and recovers from service error', async ({ page }) => {
  await open(page, 'contact');
  await page.locator('#contact-name').fill('Fictional Host');
  await page.locator('#contact-email').fill('audit@example.test');
  await page.locator('#contact-message').fill('Fixture only');
  let calls = 0;
  await page.route('**/api/v1/contact', route => ++calls === 1
    ? route.fulfill({ json: { data: { accepted: true, delivery: 'QUEUED' } } })
    : route.fulfill({ status: 503, json: { message: 'Fixture unavailable' } }));
  await page.locator('button[type=submit]').click(); await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.locator('button[type=submit]').click(); await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('#contact-message')).toHaveValue('Fixture only');
});

test('about/help redirects, route descriptions and 404 recovery are truthful', async ({ page }) => {
  await open(page, 'contact', { path: '/about' });
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page).toHaveTitle(/Contact/);
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /Questions|design|invitation/i);
  await page.goto('/help'); await expect(page).toHaveURL(/\/contact$/);
  await page.goto('/phase07-missing');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to home' }).click();
  await expect(page.locator('.kp-hero')).toBeVisible();
});

for (const mode of ['light', 'dark']) for (const lang of ['en', 'km']) {
  for (const [group, route] of [['home', '/'], ['contact', '/contact'], ['venues', '/venues'], ['venues', '/venues/1']]) {
    test(`marketing reflow and axe: ${route} ${mode}/${lang}`, async ({ page }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page, group, { mode, lang, path: route });
      await page.evaluate(() => document.fonts.ready);
      const rows = [];
      for (const [width, height] of [...[320,360,375,390,414,430,599,600,601,767,768,769,820,1023,1024,1025,1100,1101,1102,1280,1440,1920].map(width => [width,900]),[844,390],[820,430],[768,390]]) {
        await page.setViewportSize({ width, height });
        const selector = route === '/venues/1' ? '.venue-modal-card :is(button,a)' : '#marketing-content :is(button[type=submit],.kp-button,.btn-search)';
        const geometry = await page.evaluate(selector => ({
          overflow: document.documentElement.scrollWidth - innerWidth,
          actions: [...document.querySelectorAll(selector)].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').map(el => {
            const rect = el.getBoundingClientRect();
            return { text: el.textContent.trim() || el.getAttribute('aria-label'), height: rect.height, width: rect.width, left: rect.left, right: rect.right };
          }),
        }), selector);
        rows.push({ route, width, height, ...geometry });
        expect(geometry.overflow, `${route}/${width}`).toBeLessThanOrEqual(1);
        for (const action of geometry.actions) {
          expect(action.height, `${route}/${width}: ${action.text}`).toBeGreaterThanOrEqual(43.5);
          expect(action.left, `${route}/${width}: ${action.text}`).toBeGreaterThanOrEqual(-1);
          expect(action.right, `${route}/${width}: ${action.text}`).toBeLessThanOrEqual(width + 1);
        }
      }
      await testInfo.attach('reflow-geometry', { body: JSON.stringify(rows, null, 2), contentType: 'application/json' });
      const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      await testInfo.attach('axe-violations', { body: JSON.stringify(result.violations, null, 2), contentType: 'application/json' });
      expect(result.violations).toEqual([]);
    });
  }
}

test('reduced motion and forced colors leave venue controls usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await open(page, 'venues');
  await page.getByRole('button', { name: /View details/ }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('signed-in marketing navigation uses the existing account destination', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, 'home');
  await expect(page.locator('.kp-desktop-actions').getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
  for (const link of await page.locator('.kp-footer a').all()) {
    expect(await link.getAttribute('href')).toMatch(/^\/(?:templates|pricing|venues|contact|login)?$/);
  }
});

test('marketing styles retained on SPA navigation preserve the Silk cover', async ({ page, context }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 'template-demo', { path: '/templates/silk-heritage' });
  const paint = () => page.locator('.sh-cover .sh-button').evaluate(el => {
    const style = getComputedStyle(el); const root = getComputedStyle(document.querySelector('.tpl-silk-heritage'));
    return { color: style.color, background: style.backgroundColor, font: style.fontFamily, rootColor: root.color, rootBackground: root.backgroundColor };
  });
  await expect(page.locator('.sh-cover .sh-button')).toBeVisible();
  const direct = await paint();
  await page.goto('/venues'); await expect(page.locator('.venue-card')).toHaveCount(4);
  await page.locator('.kp-brand').click();
  await page.locator('.kp-showcase-copy a').click();
  await expect(page.locator('.sh-cover .sh-button')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
  expect(await paint()).toEqual(direct);
  await testInfo.attach('renderer-after-marketing', { body: await page.screenshot(), contentType: 'image/png' });
  expect(context.pages()).toHaveLength(1);
});
