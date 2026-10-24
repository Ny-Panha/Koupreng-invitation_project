import { test, expect } from '@playwright/test';
test.setTimeout(60000);
test.use({ reducedMotion: 'reduce' });
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';

for (const [id, code] of [[4, 'khmer-celestial'], [2, 'garden-royal-khmer-wedding'], [5, 'silk-heritage']]) {
  test(`${code}: two days and Khmer story survive save/reopen and public rendering`, async ({ page }) => {
    const fixture = await installIdentityFixtures(page);
    Object.assign(fixture.events.get(101), { templateId: id, templateCode: code, contentJson: JSON.stringify({ schedule: [{ id: 'one', time: '07:00', title: 'ពិធីមង្គល', day: 1 }], storyChapters: [] }) });
    await page.goto('/app/events/101/invitation', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.kp-site-preloader')).toBeHidden();
    await page.getByRole('button', { name: 'Schedule', exact: true }).click();
    const program = page.getByRole('region', { name: 'Wedding program' });
    await program.getByLabel('Date', { exact: true }).first().fill('2028-02-29');
    await program.getByLabel('Period', { exact: true }).first().selectOption('MORNING');
    await program.getByRole('button', { name: 'Add Day 2' }).click();
    await program.getByLabel('Date', { exact: true }).nth(1).fill('2028-03-02');
    await program.getByLabel('Start time', { exact: true }).nth(1).fill('17:30');
    await program.getByLabel('Period', { exact: true }).nth(1).selectOption('EVENING');
    await program.getByLabel('Ceremony', { exact: true }).nth(1).fill('ពិធីថ្ងៃទីពីរ');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
    await page.screenshot({ path: `D:/Koupreng-UXUI-Phase6/screenshots/after/studio-day1-day2/${code}.png`, fullPage: true });
    const content = JSON.parse(fixture.events.get(101).contentJson);
    expect(content.schedule.map(row => row.date)).toEqual(['2028-02-29', '2028-03-02']);
    // Use saved host JSON to model a real reload, not local form state.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.kp-site-preloader')).toBeHidden();
    await page.getByRole('button', { name: 'Schedule', exact: true }).click();
    await expect(page.getByLabel('Date', { exact: true }).nth(1)).toHaveValue('2028-03-02');
    await page.getByRole('button', { name: 'Our story', exact: true }).click();
    await page.getByRole('button', { name: /បន្ថែមដំណាក់កាល|Add chapter/ }).click();
    const story = page.locator('.pe-story-item-card');
    const text = story.locator('textarea');
    await text.fill('យើងបានជួបគ្នា\nសេចក្ដីស្រឡាញ់ <script>alert(1)</script>');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
    if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Preview invitation', exact: true }).click();
    const frame = page.frameLocator('iframe[title="Live User Template Preview"]');
    await page.getByRole('tab', { name: 'Full invitation', exact: true }).click();
    await expect(frame.locator('body')).toContainText('យើងបានជួបគ្នា');
    await expect(frame.locator('body')).toContainText('2028-03-02');
    await page.screenshot({ path: `D:/Koupreng-UXUI-Phase6/screenshots/after/studio-love-story/${code}.png`, fullPage: true });
    await page.goto('/i/review-celestial', { waitUntil: 'domcontentloaded' });
    const opening = page.getByRole('button', { name: /បើក|Open invitation/i }).first();
    await expect(page.locator("[data-template-renderer]")).toBeAttached();
    if (await opening.count() && await opening.isVisible()) await opening.click({ force: true });
    await expect(page.locator('body')).toContainText('យើងបានជួបគ្នា');
    await expect(page.locator('body')).toContainText('2028-02-29');
    await expect(page.locator('body')).toContainText('2028-03-02');
  });
}
