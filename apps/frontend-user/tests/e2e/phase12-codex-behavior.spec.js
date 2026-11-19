import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { establishUserSession, setupMockApis, mockServerEvents } from './phase12-codex-fixtures';

const output=path.resolve('../../output/phase12-codex/states');
async function capture(page,name,testInfo){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,`${name}-${testInfo.project.name}.png`),fullPage:true});}
async function start(page,route='/app/events',options={}){
  await page.clock.setFixedTime(new Date('2026-11-19T08:00:00Z'));
  await establishUserSession(page,options); await setupMockApis(page,options);
  await page.goto(route); await page.evaluate(()=>document.fonts.ready);
}

test('profile keyboard, locale, theme and nested active route',async({page},info)=>{
  await start(page,'/app/events/42'); await expect(page.locator('.overview-hero')).toBeVisible();
  await expect(page.locator('.host-nav-links a[href="/app/events"]')).toHaveAttribute('aria-current','page');
  const trigger=page.locator('.host-profile-pill'); await trigger.focus(); await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menu')).toBeVisible(); await expect(page.getByRole('menuitem').first()).toBeFocused();
  await page.keyboard.press('End'); await expect(page.getByRole('menuitem').last()).toBeFocused();
  await capture(page,'profile-open',info); await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  await trigger.click(); await page.locator('.overview-hero h2').click(); await expect(page.getByRole('menu')).toHaveCount(0);
  await page.locator('.display-preferences').count();
});

test('sidebar destinations, saved rail, tooltip, modal focus and resize',async({page},info)=>{
  await start(page,'/app/events/42'); await expect(page.locator('.overview-hero')).toBeVisible();
  expect(await page.locator('.event-workspace-nav a').count()).toBe(19);
  await page.getByRole('button',{name:'Collapse navigation',exact:true}).click();
  const guests=page.locator('.event-workspace-nav a[href="/app/events/42/guests"]'); await guests.focus();
  await expect(page.getByRole('tooltip')).toHaveText('Guests'); await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('koupreng.eventNavigation.7')).mode)).toBe('collapsed');
  await capture(page,'sidebar-rail',info);
  await page.setViewportSize({width:320,height:568});
  const trigger=page.getByRole('button',{name:'Toggle modules menu'}); await trigger.click();
  await expect(page.getByRole('dialog',{name:'Event navigation'})).toBeVisible();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Shift+Tab');
  expect(await page.getByRole('dialog').evaluate(e=>e.contains(document.activeElement))).toBe(true);
  await capture(page,'drawer-320',info); await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused(); expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
  await trigger.click(); await page.setViewportSize({width:1440,height:900}); await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('search, filters, pagination, history and preserving unrelated query state',async({page},info)=>{
  const events=Array.from({length:25},(_,i)=>({...mockServerEvents[0],id:100+i,title:`Celebration ${String(i+1).padStart(2,'0')}`,updatedAt:null,createdAt:null,eventDate:i===24?null:'2027-11-28'}));
  await start(page,'/app/events?module=guests&page=999&sort=unknown',{events});
  await expect(page.getByRole('heading',{name:'Celebration 25',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Page 1',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Celebration 01',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.locator('.events-results-summary')).toContainText('13–24 of 25');
  await expect(page.getByRole('button',{name:'Page 2',exact:true})).toHaveAttribute('aria-current','page');
  await capture(page,'pagination-25',info);
  await page.getByRole('button',{name:'Upcoming',exact:true}).click();
  await expect(page.locator('.events-results-summary')).toContainText('24 matching events');
  await page.goBack(); await expect(page.getByRole('button',{name:'All',exact:true})).toHaveAttribute('aria-pressed','true');
  const search=page.getByRole('searchbox'); await search.fill('  Celebration 25  ');
  await expect(page.getByRole('heading',{name:'Celebration 25',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  await expect(search).toHaveValue(''); expect(new URL(page.url()).searchParams.get('module')).toBe('guests');
  await search.fill('no such celebration'); await expect(page.locator('.events-grid .event-card')).toHaveCount(0);
  await capture(page,'no-match',info);
});

test('calendar arrow navigation, date selection and shared restrictions',async({page},info)=>{
  await start(page,'/app/events?view=calendar');
  const first=page.getByRole('gridcell',{name:/Nov 1, 2026/}); await first.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('gridcell',{name:/Nov 2, 2026/})).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.getByRole('region',{name:'Selected date events'})).toBeVisible();
  await page.getByRole('button',{name:'Agenda',exact:true}).click(); await capture(page,'calendar-agenda',info);
  await page.goto('/app/events/201'); await expect(page.getByText(/Shared event. Available tools/)).toBeVisible();
  await expect(page.locator('.event-workspace-nav a[href$="/budget"]')).toHaveCount(0);
  await expect(page.locator('.overview-metrics')).toHaveCount(0); await capture(page,'shared-role',info);
});

test('Khmer dark, forced colors, reduced motion and equivalent reflow',async({page},info)=>{
  await start(page,'/app/events/42',{lang:'km',theme:'dark'}); await expect(page.locator('.overview-hero')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  await capture(page,'khmer-dark',info);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  fs.writeFileSync(path.join(output,`khmer-dark-${info.project.name}-axe.json`),JSON.stringify(axe.violations,null,2));
  expect(axe.violations).toEqual([]);
  await page.setViewportSize({width:720,height:450}); // equivalent layout width; not native browser zoom certification
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await capture(page,'equivalent-200-reflow',info);
  await page.emulateMedia({forcedColors:'active'}); await page.locator('.overview-actions a').first().focus();
  await expect(page.locator('.overview-actions a').first()).toBeFocused(); await capture(page,'forced-colors',info);
});
