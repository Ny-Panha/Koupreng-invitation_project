import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { phase9Fixtures } from './support/phase9Fixtures';

const evidence='../../docs/design/royal-garden-v4/evidence/video-footer/mobile-navigation';

test('touch navigation stays visible and only information scrolls as the mobile viewport changes',async({page},info)=>{
  await fs.mkdir(evidence,{recursive:true});
  await phase9Fixtures(page,{code:'royal-garden-cinematic'});
  // This isolates the information UI from Windows WebKit's MP4 codec limitation.
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/templates/royal-garden-cinematic?lang=en');
  await page.locator('.rg-open').tap(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  const paper=page.locator('.rg-paper'), scroll=page.locator('.rg-content-scroll'), nav=page.getByRole('navigation',{name:'Invitation sections'});
  for(const [width,height] of [[390,663],[390,844],[844,390],[320,568],[430,740]]) {
    await page.setViewportSize({width,height});
    await expect.poll(()=>paper.evaluate(node=>Math.round(node.getBoundingClientRect().height))).toBe(height);
    await expect(nav.getByRole('button')).toHaveCount(5);
    const frame=await paper.boundingBox(), bar=await nav.boundingBox(), reading=await scroll.boundingBox();
    expect(frame.y).toBeCloseTo(0,0); expect(bar.y+bar.height).toBeLessThanOrEqual(height);
    expect(reading.y+reading.height).toBeLessThanOrEqual(bar.y);
    for(const button of await nav.getByRole('button').all()) {
      expect(await button.evaluate(node=>{const box=node.getBoundingClientRect();return node.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2));})).toBe(true);
    }
    for(const key of ['venue','schedule','gallery','countdown']) {
      await nav.locator(`[aria-controls="rg-${key}"]`).tap();
      await expect.poll(()=>new URL(page.url()).searchParams.get('section')).toBe(key);
      await expect.poll(()=>page.locator(`#rg-${key}`).evaluate(node=>{
        const parent=node.closest('.rg-content-scroll');return Math.abs(node.getBoundingClientRect().top-parent.getBoundingClientRect().top-8);
      })).toBeLessThan(2);
      expect(await page.evaluate(()=>scrollY)).toBe(0);
      expect((await nav.boundingBox()).y).toBeCloseTo(bar.y,0);
    }
    await scroll.evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:'instant'}));
    await expect(page.locator('.rg-footer')).toBeVisible();
    expect(await page.evaluate(()=>scrollY)).toBe(0);
    await nav.locator('[aria-controls="rg-venue"]').tap();
    await page.screenshot({path:`${evidence}/${info.project.name}-${width}x${height}.png`,animations:'disabled'});
  }
});
