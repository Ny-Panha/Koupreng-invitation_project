import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { openPhase06Fixture as open } from './support/phase06Fixtures.js';

test('Phase07 edges: footer credits remain readable above the support launcher at page end', async ({ page }) => {
  await open(page, 'home', { anonymous: true, lang: 'km', mode: 'dark' });
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => {
      const launcher = document.querySelector('.kp-support-toggle').getBoundingClientRect();
      return [...document.querySelectorAll('.kp-footer-bottom span')].every(el => {
        const credit = el.getBoundingClientRect();
        return credit.bottom <= launcher.top || credit.top >= launcher.bottom || credit.right <= launcher.left || credit.left >= launcher.right;
      });
    })).toBe(true);
  }
});

test('Phase07 edges: slow illustrative photos reserve space without blocking discovery', async ({ page }) => {
  await open(page, 'venues');
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const image = await readFile(new URL('./support/fixtures/general-qr.png', import.meta.url));
  await page.route('https://images.unsplash.com/**', async route => {
    await pending; await route.fulfill({ contentType: 'image/png', body: image });
  });
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    const card = page.locator('.venue-card').first();
    await expect(card.getByRole('button', { name: /View details/ })).toBeVisible();
    await card.scrollIntoViewIfNeeded();
    expect(await card.locator('.venue-image-container').evaluate(el => el.getBoundingClientRect().height)).toBe(240);
    await expect(card.locator('.venue-img')).toHaveAttribute('loading', 'lazy');
    release();
    await expect.poll(() => card.locator('img').evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  } finally { release(); }
});

test('Phase07 edges: malformed email and offline submission preserve entries', async ({ page }) => {
  await open(page, 'contact');
  await page.locator('#contact-name').fill('Fictional Host');
  await page.locator('#contact-email').fill('not-an-email');
  await page.locator('#contact-message').fill('Fixture support question');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('#contact-email')).toBeFocused();
  await expect(page.locator('#contact-email')).toHaveAttribute('aria-describedby', 'contact-email-error');
  await page.locator('#contact-email').fill('audit@example.test');
  await page.route('**/api/v1/contact', route => route.abort('internetdisconnected'));
  await page.locator('button[type=submit]').click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('#contact-message')).toHaveValue('Fixture support question');
  await expect(page.locator('button[type=submit]')).toBeEnabled();
});

test('Phase07 edges: venue inquiry reaches contact and client metadata leaves with marketing', async ({ page }) => {
  await open(page, 'venues', { path: '/venues/1' });
  await page.getByRole('dialog').getByRole('link', { name: 'Contact Koupreng' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page).toHaveTitle(/Contact/);
  await page.locator('.kp-brand').click();
  await page.locator('.kp-showcase-copy a').click();
  await expect(page.locator('.sh-cover .sh-button')).toBeVisible();
  await expect(page.locator('meta[name=description]')).toHaveCount(0);
});

test('Phase07 edges: contact draft survives marketing Back and clears after accepted delivery', async ({ page }) => {
  await open(page, 'contact', { anonymous: true });
  await page.locator('#contact-name').fill('Fictional Draft Host');
  await page.locator('#contact-email').fill('draft@example.test');
  await page.locator('#contact-message').fill('Unsent fictional question');
  await page.locator('.kp-contact-help a[href="/pricing"]').click();
  await expect(page).toHaveURL(/\/pricing$/); await page.goBack();
  await expect(page.locator('#contact-name')).toHaveValue('Fictional Draft Host');
  await expect(page.locator('#contact-message')).toHaveValue('Unsent fictional question');
  await page.route('**/api/v1/contact', route => route.fulfill({json:{data:{accepted:true,delivery:'SMTP_ACCEPTED'}}}));
  await page.locator('button[type=submit]').click();await expect(page.getByRole('status')).toBeVisible();
  await page.getByRole('button', { name: 'Send another message' }).click();
  await expect(page.locator('#contact-message')).toHaveValue('');
  await page.locator('.kp-contact-help a[href="/pricing"]').click();
  await expect(page).toHaveURL(/\/pricing$/);await expect(page.locator('#contact-form')).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('#contact-name')).toHaveValue('');
  await expect(page.locator('#contact-message')).toHaveValue('');
});
