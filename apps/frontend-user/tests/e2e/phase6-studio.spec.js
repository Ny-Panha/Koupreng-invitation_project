import { test, expect } from '@playwright/test';
test.setTimeout(60000);
test.use({ reducedMotion: 'reduce' });
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';
import { chooseStudioSection } from './support/studioNavigationActions';
import { activateOpening } from './support/activateOpening';

for (const [id, code] of [[4, 'khmer-celestial'], [5, 'silk-heritage']]) {
  test(`${code}: two days and Khmer story survive save/reopen and public rendering`, async ({ page }, info) => {
    const dialogs = [];
    page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });
    const fixture = await installIdentityFixtures(page);
    Object.assign(fixture.events.get(101), { templateId: id, templateCode: code, contentJson: JSON.stringify({ schedule: [{ id: 'one', time: '07:00', title: 'ពិធីមង្គល', day: 1 }], storyChapters: [] }) });
    await page.goto('/app/events/101/invitation', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.kp-site-preloader')).toBeHidden();
    await chooseStudioSection(page, 'scheduleVenue', 'Schedule');
    const program = page.getByRole('region', { name: 'Wedding program' });
    await program.getByLabel('Program date', { exact: false }).first().fill('2028-02-29');
    await program.getByRole('combobox', { name: 'Period', exact: true }).first().selectOption('MORNING');
    await program.getByRole('button', { name: 'Add program day', exact: true }).click();
    await program.getByLabel('Program date', { exact: false }).nth(1).fill('2028-03-02');
    await program.getByRole('group', { name: 'Day 2', exact: true }).getByRole('button', { name: 'Add ceremony', exact: true }).click();
    await program.getByRole('textbox', { name: /^Start time/ }).nth(1).fill('17:30');
    await program.getByRole('combobox', { name: 'Period', exact: true }).nth(1).selectOption('EVENING');
    await program.getByRole('textbox', { name: 'Ceremony / Khmer', exact: true }).nth(1).fill('ពិធីថ្ងៃទីពីរ');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase', 'saved');
    await page.screenshot({ path: info.outputPath(`studio-program-${code}.png`), fullPage: true });
    const content = JSON.parse(fixture.events.get(101).contentJson);
    expect(content.schedule.map(row => row.date)).toEqual(['2028-02-29', '2028-03-02']);
    // Use saved host JSON to model a real reload, not local form state.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.kp-site-preloader')).toBeHidden();
    await chooseStudioSection(page, 'scheduleVenue', 'Schedule');
    await expect(program.getByLabel('Program date', { exact: false }).nth(1)).toHaveValue('2028-03-02');
    await chooseStudioSection(page, 'guestExperience', 'Our story');
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
    await expect(frame.locator('time[datetime="2028-03-02"]').first()).toBeVisible();
    await page.screenshot({ path: info.outputPath(`studio-story-${code}.png`), fullPage: true });
    await page.goto('/i/review-celestial', { waitUntil: 'domcontentloaded' });
    const opening = page.getByRole('button', { name: /បើក|Open invitation/i }).first();
    await expect(page.locator("[data-template-renderer]")).toBeAttached();
    await activateOpening(page, opening);
    await expect(page.locator('body')).toContainText('យើងបានជួបគ្នា');
    await expect(page.locator('time[datetime="2028-02-29"]').first()).toBeVisible();
    await expect(page.locator('time[datetime="2028-03-02"]').first()).toBeVisible();
    expect(dialogs).toEqual([]);
    await expect(page.locator('script').filter({ hasText: 'alert(1)' })).toHaveCount(0);
  });
}
