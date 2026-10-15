// Composition studies: run against the V4 baseline production preview.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const output='../../output/playwright/marketing-v5/concepts';await mkdir(output,{recursive:true});
const browser=await chromium.launch();
const results=[];
for(const lang of ['en','km'])for(const width of [390,1440])for(const concept of ['v4-product-first','a-folio-and-designs','b-centered-stationery']){
 const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});
 await context.addInitScript(lang=>localStorage.setItem('koupreng.lang',lang),lang);
 await context.route('**/api/**',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({data:route.request().url().includes('i18n')?{messages:{}}:[{id:2,code:'silk-heritage',name:'សូត្រមង្គល',nameEn:'Silk Heritage',category:'TRADITIONAL',premium:false,price:0,currency:'USD',thumbnailUrl:'/templates/silk-heritage/preview.svg'},{id:80,code:'khmer-celestial',name:'ខ្មែរចន្ទតារា',category:'TRADITIONAL',premium:true,price:null,currency:'USD',thumbnailUrl:'/facebook/all/06-card/cover-card.jpg'},{id:81,code:'emerald-canva-luxe-wedding',name:'Emerald Luxe',category:'MODERN',premium:true,price:20,currency:'USD',thumbnailUrl:'/templates/canva-luxury/emerald-luxury.jpg'}]})}));
 const page=await context.newPage();await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 if(concept!=='v4-product-first'){
 await page.evaluate(()=>{document.querySelector('.kp-hero-chips')?.remove();const hero=document.querySelector('.kp-hero');hero.after(document.querySelector('.kp-collection'));});
 await page.addStyleTag({content:'.kp-landing .kp-hero {padding-top:110px; padding-bottom:36px} .kp-hero .kp-actions{margin-top:20px} .kp-hero .kp-hero-proof{margin-top:12px} .kp-hero .kp-scroll-link{display:none} @media(max-width:767px){.kp-landing .kp-hero{padding-top:92px;gap:20px}.kp-landing .kp-hero-art{height:340px}.kp-landing .kp-photo-arch{height:300px}.kp-landing .kp-hero-folio{bottom:28px;left:8px;width:172px;height:258px}}'});
 if(concept==='b-centered-stationery')await page.addStyleTag({content:'.kp-landing .kp-hero{grid-template-columns:1fr;text-align:center;gap:36px}.kp-hero-copy{max-width:700px;margin:auto}.kp-hero-lead{margin-inline:auto}.kp-hero .kp-actions,.kp-hero-proof{justify-content:center}.kp-landing .kp-hero-art{width:min(540px,100%);margin:auto}'});
 }
 const positions=await page.evaluate(()=>Object.fromEntries(['.kp-hero','.kp-product','.kp-collection'].map(s=>[s,Math.round(document.querySelector(s).getBoundingClientRect().top+scrollY)])));
 for(const section of await page.locator('main section').all())await section.scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:`${output}/${concept}-${lang}-${width}.png`,fullPage:true});results.push({lang,width,concept,positions});await context.close();
}
await writeFile(`${output}/comparison.json`,JSON.stringify(results,null,2));await browser.close();
