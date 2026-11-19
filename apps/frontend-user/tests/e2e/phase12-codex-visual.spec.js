import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
import { establishUserSession, setupMockApis } from './phase12-codex-fixtures';

const stage = process.env.PHASE12_CAPTURE || 'after';
const output = path.resolve('../../output/phase12-codex', stage);
const viewports = [[1440,900],[1920,1080],[1280,720],[1024,768],[768,1024],[393,851],[360,800],[320,568],[844,390]];

for (const [surface, route, ready] of [['list','/app/events','.event-card'],['overview','/app/events/42','.overview-hero']]) {
  test(`${surface} geometry and visual matrix`, async ({ page }, testInfo) => {
    fs.mkdirSync(output, { recursive: true });
    await page.clock.setFixedTime(new Date('2026-11-19T08:00:00Z'));
    await establishUserSession(page);
    await setupMockApis(page);
    await page.goto(route);
    await expect(page.locator(ready).first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const measurements = [];
    for (const [width,height] of viewports) {
      await page.setViewportSize({ width,height });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const geometry = await page.evaluate(() => {
        const selectors = ['.host-header-container','.events-page-header','.events-filters-container','.event-card','.event-workspace-sidebar','.overview-hero','.overview-preparation','.overview-metrics'];
        return { viewport: { width: innerWidth, height: innerHeight }, scrollWidth: document.documentElement.scrollWidth,
          rects: Object.fromEntries(selectors.map(selector => { const element=document.querySelector(selector); const r=element?.getBoundingClientRect(); return [selector,r ? { x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom } : null]; })),
          scrollOwners: [...document.querySelectorAll('*')].filter(e => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight>e.clientHeight).map(e => ({className:e.className,height:e.clientHeight,scrollHeight:e.scrollHeight})) };
      });
      const filename = `${surface}-${testInfo.project.name}-${width}x${height}-en-light.png`;
      await page.screenshot({ path:path.join(output,filename) });
      const sha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(output,filename))).digest('hex');
      measurements.push({filename,sha256,...geometry});
      if(stage==='after') expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
    }
    fs.writeFileSync(path.join(output,`${surface}-${testInfo.project.name}-geometry.json`), JSON.stringify(measurements,null,2));
    if(stage==='after') {
      await page.setViewportSize({width:1440,height:900});
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      fs.writeFileSync(path.join(output,`${surface}-${testInfo.project.name}-axe.json`),JSON.stringify({violations:axe.violations,incomplete:axe.incomplete},null,2));
      expect(axe.violations).toEqual([]);
    }
  });
}
