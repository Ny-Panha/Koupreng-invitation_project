import { expect, test } from '@playwright/test';
import { installIdentityFixtures } from './support/templateIdentityFixtures.js';
import { installPhase4Fixtures } from './support/phase4Fixtures.js';
import { installUxFixtures } from './support/uxFixtures.js';

test.use({ reducedMotion: 'reduce' });
test('keyboard preview traps focus, restores the trigger and event navigation closes with Escape', async ({ page }) => {
  await installIdentityFixtures(page);
  await page.setViewportSize({ width:390,height:844 });
  await page.goto('/app/events/101/invitation?mode=guided');
  const trigger=page.getByRole('button',{ name:'Preview invitation',exact:true });
  await trigger.focus(); await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog',{ name:'Invitation preview' }); await expect(dialog).toBeVisible();
  for(let i=0;i<10;i++) { await page.keyboard.press('Tab'); await expect.poll(() => dialog.evaluate(node => node.contains(document.activeElement)), { message:`Preview focus after Tab ${i+1}` }).toBe(true); }
  await page.keyboard.press('Escape'); await expect(dialog).toBeHidden(); await expect(trigger).toBeFocused();
  const menu=page.getByRole('button',{ name:'Open event navigation' }); await menu.focus(); await page.keyboard.press('Enter');
  const navigation=page.getByRole('dialog',{ name:'Event navigation' }); await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape'); await expect(navigation).toBeHidden(); await expect(menu).toBeFocused();
});

for(const lang of ['en','km']) for(const width of [640,320]) test(`reflow equivalent ${width===640?'200':'400'} percent and increased text spacing ${lang}`,async ({ page },info) => {
  await installPhase4Fixtures(page,{ count:2,lang });
  await page.setViewportSize({ width,height:900 }); await page.goto('/app/events/101/guests');
  await expect(page.locator('.guest-record-row')).toHaveCount(2);
  await page.addStyleTag({ content:'p { margin-bottom:2em !important; } body * { line-height:1.5 !important; letter-spacing:.12em !important; word-spacing:.16em !important; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  await page.getByLabel(lang==='en'?'Select guest: Review Guest 2':'ជ្រើសរើសភ្ញៀវ៖ Review Guest 2').check();
  await expect(page.locator('.guest-list-tools button')).toBeEnabled();
  await page.screenshot({ path:info.outputPath(`reflow-${lang}-${width}.png`),fullPage:true });
});

test('text size can double and a dirty generic form can cancel navigation without losing edits',async ({ page },info) => {
  await installUxFixtures(page);
  await page.goto('/app/events/101/invitation');
  await page.addStyleTag({ content:'html { font-size:200% !important; }' });
  const title=page.getByRole('textbox',{ name:'Event title',exact:true }); await title.fill('Preserve these private draft edits');
  const menu=page.getByRole('button',{ name:'Toggle modules menu',exact:true });
  if (await menu.isVisible()) await menu.click();
  page.once('dialog',dialog => dialog.dismiss());
  await page.getByRole('link',{ name:'Back to My Events',exact:true }).click();
  const navigation=page.getByRole('dialog',{ name:'Event navigation',exact:true });
  if (await navigation.isVisible()) await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/101\/invitation$/); await expect(title).toHaveValue('Preserve these private draft edits');
  expect(await page.evaluate(() => document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({ path:info.outputPath('double-text-generic.png'),fullPage:true });
});
