import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openPhase06Fixture } from './support/phase06Fixtures.js';

test.describe('Phase 08.1 — Identity, Authentication & Account Lifecycle', () => {

  test('01. Email/phone login: password reveal toggle, validation, and safe continuation', async ({ page }) => {
    await openPhase06Fixture(page, 'auth-login', { path: '/login?next=%2Ftemplates%2Fbrowse', anonymous: true });

    await expect(page.getByRole('heading', { name: /Welcome Back|សូមស្វាគមន៍មកវិញ/i })).toBeVisible();
    const identifierInput = page.locator('input[autocomplete="username"]');
    const passwordInput = page.locator('input[autocomplete="current-password"]');
    const submitBtn = page.locator('form button[type="submit"]');

    await expect(identifierInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Eye button toggle
    const eyeBtn = page.locator('.auth-eye-btn');
    await expect(eyeBtn).toBeVisible();
    await expect(eyeBtn).toHaveAttribute('aria-pressed', 'false');

    await eyeBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(eyeBtn).toHaveAttribute('aria-pressed', 'true');

    await eyeBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(eyeBtn).toHaveAttribute('aria-pressed', 'false');

    // Safe continuation target is preserved in the register link
    const registerLink = page.locator('.auth-footer-text a');
    await expect(registerLink).toHaveAttribute('href', /register\?next=%2Ftemplates%2Fbrowse/);

    // Forgot password link is present and preserves continuation
    const forgotLink = page.locator('.auth-footer-link');
    await expect(forgotLink).toHaveAttribute('href', /forgot-password\?next=%2Ftemplates%2Fbrowse/);
  });

  test('02. Registration: phone, password policy checklist, and confirm mismatch', async ({ page }) => {
    await openPhase06Fixture(page, 'auth-register', { path: '/register', anonymous: true });

    await expect(page.getByRole('heading', { name: /Create Account|បង្កើតគណនី/i })).toBeVisible();
    const nameInput = page.locator('input[autocomplete="name"]');
    const phoneInput = page.locator('input[type="tel"]');
    const passwordInput = page.locator('input[autocomplete="new-password"]').first();
    const confirmInput = page.locator('input[autocomplete="new-password"]').nth(1);
    const submitBtn = page.locator('form button[type="submit"]');

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Fill name and phone
    await nameInput.fill('មាស សុខា');
    await phoneInput.fill('012345678');

    // Typing in password triggers the 5-rule checklist
    await passwordInput.fill('abc');
    const guidance = page.locator('.auth-password-guidance');
    await expect(guidance).toBeVisible();
    await expect(page.locator('.auth-password-rule.is-unmet')).toHaveCount(3);

    // Complete valid password
    await passwordInput.fill('SecurePass1');
    await expect(page.locator('.auth-password-rule.is-met')).toHaveCount(5);

    // Confirm password mismatch
    await confirmInput.fill('DifferentPass1');
    await expect(page.locator('.auth-password-rule.is-unmet')).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Match password
    await confirmInput.fill('SecurePass1');
    await expect(page.locator('#' + await confirmInput.getAttribute('aria-describedby'))).toContainText(/match/i);
    await expect(submitBtn).toBeEnabled();
  });

  test('03. Forgot password: email request, phone account hint, and recovery transition', async ({ page }) => {
    await openPhase06Fixture(page, 'auth-forgot', { path: '/forgot-password', anonymous: true });

    await expect(page.getByRole('heading', { name: /Forgot.*password|ភ្លេចលេខសម្ងាត់/i })).toBeVisible();
    const emailInput = page.locator('input[type="email"]');
    const submitBtn = page.locator('.auth-card form button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(page.locator('.auth-recovery-hint')).toBeVisible();
    await expect(page.locator('.auth-recovery-hint')).toContainText(/phone|ទូរស័ព្ទ/i);

    // Intercept forgot-password request
    await page.route('**/auth/forgot-password', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'If this email is registered, password reset instructions have been sent.' }),
      })
    );

    await emailInput.fill('host@example.com');
    await submitBtn.click();

    await expect(page.locator('.auth-success')).toBeVisible();
    await expect(page.locator('.auth-success-title')).toContainText(/Request received|ផ្ញើសំណើកំណត់លេខសម្ងាត់/i);
    await expect(page.locator('a.auth-submit')).toHaveAttribute('href', /reset-password/);
  });

  test('04. Reset password: query token prefill, toggles, and completion link', async ({ page }) => {
    await openPhase06Fixture(page, 'auth-reset', { path: '/reset-password?token=secret-token-xyz', anonymous: true });

    await expect(page.getByRole('heading', { name: /Set new password|កំណត់លេខសម្ងាត់ថ្មី/i })).toBeVisible();
    await expect(page).not.toHaveURL(/token=/);
    await expect(page.getByLabel('Reset token', { exact:true })).toHaveCount(0);
    expect(await page.content()).not.toContain('secret-token-xyz');

    const newPw = page.locator('input[autocomplete="new-password"]').first();
    const confirmPw = page.locator('input[autocomplete="new-password"]').nth(1);
    const submitBtn = page.locator('.auth-card form button[type="submit"]');

    await expect(submitBtn).toBeDisabled();

    // Toggle reveal
    const eyeBtns = page.locator('.auth-eye-btn');
    await expect(eyeBtns).toHaveCount(2);
    await eyeBtns.first().click();
    await expect(newPw).toHaveAttribute('type', 'text');
    await eyeBtns.first().click();
    await expect(newPw).toHaveAttribute('type', 'password');

    // Intercept reset-password request
    await page.route('**/auth/reset-password', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password reset successfully.' }),
      })
    );

    await newPw.fill('NewSecure123');
    await confirmPw.fill('NewSecure123');
    await expect(submitBtn).toBeEnabled();

    await submitBtn.click();
    await expect(page.locator('.auth-success')).toBeVisible();
    await expect(page.locator('.auth-success-title')).toContainText(/Password updated successfully|បានប្តូរលេខសម្ងាត់ដោយជោគជ័យ/i);
    await expect(page.locator('a.auth-submit')).toHaveAttribute('href', /login/);
  });

  test('05. Profile management: authenticated view, form inputs, and change-password accordion', async ({ page }) => {
    await openPhase06Fixture(page, 'profile', { path: '/app/profile' });

    await expect(page.locator('.profile-page')).toBeVisible();
    await expect(page.locator('#profile-heading')).toContainText(/profile|ប្រវត្តិរូប/i);

    const nameInput = page.locator('.profile-page input[autoComplete="name"]');
    const emailInput = page.locator('.profile-page input[autoComplete="email"]');
    const phoneInput = page.locator('.profile-page input[autoComplete="tel"]');

    await expect(nameInput).toHaveValue('Audit Host');
    await expect(emailInput).toBeDisabled();
    await expect(phoneInput).toBeVisible();

    // Password accordion
    const accordionToggle = page.locator('.profile-pw-toggle');
    await expect(accordionToggle).toBeVisible();
    await expect(accordionToggle).toHaveAttribute('aria-expanded', 'false');

    await accordionToggle.click();
    await expect(accordionToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.profile-pw-section')).toBeVisible();
    await expect(page.locator('input[autoComplete="current-password"]')).toBeVisible();
  });

  test('06. Change password page: direct route, toggles, and validation', async ({ page }) => {
    await openPhase06Fixture(page, 'password', { path: '/app/change-password' });

    await expect(page.getByRole('heading', { name: /Change password|ប្តូរពាក្យសម្ងាត់/i })).toBeVisible();
    const currentInput = page.locator('input[autocomplete="current-password"]');
    const newInput = page.locator('input[autocomplete="new-password"]').first();
    const confirmInput = page.locator('input[autocomplete="new-password"]').nth(1);
    const submitBtn = page.locator('.dash-panel form button[type="submit"]');

    await expect(currentInput).toBeVisible();
    await expect(newInput).toBeVisible();
    await expect(confirmInput).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Check eye buttons
    const eyeBtns = page.locator('.dash-eye-btn');
    await expect(eyeBtns).toHaveCount(3);
  });

  test('07. Access control: anonymous access to /app/profile redirects to login with return target', async ({ page }) => {
    await openPhase06Fixture(page, 'profile', { path: '/app/profile', anonymous: true });

    await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fprofile/);
    await expect(page.locator('input[autocomplete="username"]')).toBeVisible();
  });

  test('08. Bilingual & dark mode: language switch and dark theme support', async ({ page }) => {
    await openPhase06Fixture(page, 'auth-login', { path: '/login', lang: 'km', mode: 'dark', anonymous: true });

    await expect(page.getByRole('heading', { name: 'សូមស្វាគមន៍មកវិញ' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');

    // Check language toggle button
    const enBtn = page.locator('.auth-lang-btn').filter({ hasText: 'English' });
    await enBtn.click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('09. Accessibility: WCAG 2.2 AA audit on /login, /register, and /forgot-password', async ({ page }, testInfo) => {
    for (const route of ['/login', '/register', '/forgot-password']) {
      await page.goto(`http://127.0.0.1:4173${route}`);
      await expect(page.locator('.auth-card')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      await testInfo.attach(`axe-${route.replace('/', '')}.json`, {
        body: JSON.stringify(results, null, 2),
        contentType: 'application/json',
      });

      expect(results.violations.map(v => ({ rule: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    }
  });

});
