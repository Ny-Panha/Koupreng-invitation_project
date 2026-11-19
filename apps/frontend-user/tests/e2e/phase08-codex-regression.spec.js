import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';
import AxeBuilder from '@axe-core/playwright';
import { openPhase06Fixture } from './support/phase06Fixtures.js';

const login = page => page.locator('input[autocomplete="username"]');
const password = page => page.locator('input[autocomplete="current-password"]');
async function credentials(page) { await login(page).fill('fictional@example.invalid'); await password(page).fill('FictionalPass1'); }

test('C08-012 dark account routes and provider errors meet automated text contrast checks',async({page})=>{
  for(const [group,path] of [['auth-login','/login'],['auth-forgot','/forgot-password'],['profile','/app/profile'],['password','/app/change-password']]) {
    await openPhase06Fixture(page,group,{path,mode:'dark',anonymous:group.startsWith('auth-')});
    await page.locator('h1').first().waitFor(); await page.evaluate(()=>document.fonts.ready);
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  }
});

for (const status of [400,401,403,429,500,'offline']) test(`C08 login ${status} retains identifier and never authenticates`, async ({page}) => {
  await openPhase06Fixture(page,'auth-login',{path:'/login?next=%2Fapp%2Fprofile',anonymous:true});
  let calls=0;
  await page.route('**/auth/login',route=>{calls++;return status==='offline'?route.abort('internetdisconnected'):route.fulfill({status,json:{message:'Fictional sign-in failure'}});});
  await credentials(page); await page.locator('form button[type=submit]').click();
  await expect(page.locator('.auth-card > p.auth-error[role=alert]')).toBeVisible();
  await expect(login(page)).toHaveValue('fictional@example.invalid');
  await expect(page).toHaveURL(/\/login/); expect(calls).toBe(1);
  await expect(page.locator('form button[type=submit]')).toBeEnabled();
});
test('C08 pending login suppresses Enter and repeated submit; keyboard toggle retains selection',async({page})=>{
  await openPhase06Fixture(page,'auth-login',{anonymous:true});
  let release,calls=0; const gate=new Promise(resolve=>{release=resolve;});
  await page.route('**/auth/login',async route=>{calls++;await gate;await route.fulfill({status:401,json:{message:'Fictional credentials rejected'}});});
  await credentials(page); await password(page).focus();
  await password(page).evaluate(el=>el.setSelectionRange(3,7));
  await page.locator('.auth-eye-btn').click(); await expect(password(page)).toBeFocused();
  expect(await password(page).evaluate(el=>[el.selectionStart,el.selectionEnd])).toEqual([3,7]);
  await page.locator('.auth-eye-btn').focus(); await page.keyboard.press('Space');
  await expect(password(page)).toHaveAttribute('type','password');
  await page.locator('form button[type=submit]').click(); await expect(page.locator('form')).toHaveAttribute('aria-busy','true');
  await password(page).press('Enter'); expect(calls).toBe(1); release();
  await expect(page.locator('.auth-card > p.auth-error[role=alert]')).toBeVisible();
});
for(const status of [429,500,'offline']) test(`C08 recovery ${status} is failure with retry, never sent`,async({page})=>{
  await openPhase06Fixture(page,'auth-forgot',{anonymous:true});
  await page.route('**/auth/forgot-password',route=>status==='offline'?route.abort():route.fulfill({status,json:{message:'Account exists: do not display'}}));
  await page.locator('input[type=email]').fill('fictional@example.invalid'); await page.locator('form button[type=submit]').click();
  await expect(page.locator('.auth-error')).toBeVisible(); await expect(page.locator('.auth-success')).toHaveCount(0);
  await expect(page.locator('input[type=email]')).toHaveValue('fictional@example.invalid');
  expect(await page.content()).not.toContain('Account exists:');
});
for(const reason of ['invalid','expired','already used']) test(`C08 reset ${reason} token remains private; no false success`,async({page})=>{
  await openPhase06Fixture(page,'auth-reset',{path:'/reset-password?token=fictional-reset&next=%2Fapp%2Fprofile',anonymous:true});
  await expect(page).not.toHaveURL(/token=/); expect(await page.content()).not.toContain('fictional-reset');
  await page.route('**/auth/reset-password',route=>route.fulfill({status:400,json:{message:`Password reset token is ${reason}`}}));
  const inputs=page.locator('input[autocomplete=new-password]'); await inputs.nth(0).fill('lowercase123'); await inputs.nth(1).fill('lowercase123');
  await page.locator('form button[type=submit]').click(); await expect(page.locator('.auth-error')).toBeVisible();
  await expect(page.locator('.auth-success')).toHaveCount(0);
  const leaks=await page.evaluate(()=>[...Object.values(localStorage),...Object.values(sessionStorage)].some(v=>v.includes('fictional-reset')));
  expect(leaks).toBe(false);
});
test('C08 profile failure is visible and retry restores editing',async({page})=>{
  await openPhase06Fixture(page,'profile');
  await page.route('**/users/me',route=>route.fulfill({status:503,json:{message:'Unavailable'}}));
  await page.reload(); await expect(page.locator('.profile-page .profile-msg[role=alert]')).toBeVisible();
  await expect(page.locator('.profile-save-btn')).toBeDisabled();
  await page.unroute('**/users/me'); await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.locator('.profile-save-btn')).toBeEnabled();
});
test('C08 password change revokes local session only after server acceptance',async({page})=>{
  await openPhase06Fixture(page,'password');
  let calls=0;
  await page.route('**/auth/change-password',route=>{calls++;return route.fulfill({json:{data:{message:'Password changed successfully'}}});});
  await password(page).fill('FictionalOld1');
  const inputs=page.locator('input[autocomplete=new-password]'); await inputs.nth(0).fill('lowercase123'); await inputs.nth(1).fill('lowercase123');
  await page.locator('.dash-form button[type=submit]').click();
  await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fchange-password/); expect(calls).toBe(1);
  expect(await page.evaluate(()=>localStorage.getItem('koupreng.auth'))).toBeNull();
});
test('C08 aliases retain query and fragment through guarded canonical profile',async({page})=>{
  await openPhase06Fixture(page,'profile',{path:'/dashboard/profile?from=menu#security'});
  await expect(page).toHaveURL(/\/app\/profile\?from=menu#security/);
  await page.goto('/profile?from=menu#security'); await expect(page).toHaveURL(/\/app\/profile\?from=menu#security/);
});
test('C08 denied profile does not display a successful editable account',async({page})=>{
  await openPhase06Fixture(page,'profile',{anonymous:true});
  await expect(page).toHaveURL(/\/login\?next=/); await expect(page.locator('.profile-page')).toHaveCount(0);
});
test('C08 avatar rejects SVG and keeps server-owned profile image',async({page})=>{
  await openPhase06Fixture(page,'profile');
  await page.locator('input[type=file]').setInputFiles({name:'avatar.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});
  await expect(page.locator('.profile-msg.error')).toBeVisible();
  expect(await page.locator('input[type=file]').inputValue()).toBe('');
});
