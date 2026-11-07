import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import process from 'node:process';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';
import { phase8Content } from './support/phase8Fixtures';
import { createMapPreset } from '../../src/features/templates/shared/mapPresets';

const evidence = '../../docs/design/royal-garden-v4/evidence/browser';
const portrait = '/templates/silk-heritage/portrait.webp', second = '/templates/silk-heritage/together.webp';
const photos = [{ id:'one', src:portrait, alt:'Owner wedding portrait', width:960, height:1280 }, { id:'two', src:second, alt:'Together', width:960, height:1280 }, { id:'wide', src:'/templates/khmer-floral-gold/romantic-02.webp', alt:'Wedding in the garden', width:960, height:640 }];
const opening = { style:'royal-arch', titleMode:'text', buttonStyle:'circle', duration:2, slides:photos.map(photo => ({ ...photo, x:50, y:40 })) };
const information = { enabled:true, colorPreset:'burgundy-heritage', galleryPresentation:'collage', motionPreset:'off' };
async function setup(page, patch = {}, authorized = false) {
  const content = { ...phase8Content, cinematicIntro:opening, informationScene:information, gallery:photos, photos, coverBackgroundImage:portrait, invitationTitle:'សិរីសួស្តីអាពាហ៍ពិពាហ៍', musicUrl:'', messageText:'សូមគោរពអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។', ...patch };
  const state = await phase9Fixtures(page, { code:'royal-garden-cinematic', content });
  const event = { ...state.events.get(101), title:content.invitationTitle, designJson:JSON.stringify({coverBackgroundImage:portrait}), groomName:'កូនប្រុស', brideName:'កូនស្រី', hostName:'កូនប្រុស', partnerName:'កូនស្រី', status:'PUBLISHED', enabledSections:JSON.stringify({ gallery:true, venue:true, schedule:true, countdown:true, rsvp:true, gift:false, ...patch.enabledSections }), cinematicOpening:authorized ? { enabled:true, videoMediaId:107, posterUrl:portrait } : null };
  state.events.set(101,event);
  await page.route('**/api/v1/public/invitations/review-celestial*', route => route.fulfill({ json:{ data:event } }));
  await page.route('**/api/v1/invitations/101/media/gallery', route => route.fulfill({ json:{ data:photos.map((photo,i) => ({ id:501+i, fileUrl:photo.src, mediaType:'GALLERY_IMAGE', mimeType:'image/webp' })) } }));
  return state;
}
async function shot(page, name) {
  await fs.mkdir(evidence,{recursive:true});
  await page.locator('.tpl-royal-garden').waitFor({state:'visible'});
  await expect(page.locator('.kp-site-preloader')).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.rg-frame-source').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
  await page.locator('.rg-entrance-photo img,.rg-intro-portrait[data-active=true],.rg-photo-tile img,.rg-expanded-photo').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
  // Capture the settled photo, rather than a CSS crossfade's first compositor frame.
  await page.locator('.rg-intro-portrait[data-active=true]').evaluateAll(images=>images.forEach(image=>image.getAnimations().filter(animation=>animation.transitionProperty==='opacity').forEach(animation=>animation.finish())));
  await page.screenshot({ path:`${evidence}/${name}.png` });
}
test('reference comparison: cover and information baseline', async ({ page }) => {
  test.skip(!process.env.ROYAL_V4_BASELINE, 'Baseline is captured before implementation only.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await phase9Fixtures(page, { code: 'royal-garden-cinematic' });
  await page.goto('/templates/royal-garden-cinematic');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.rg-frame-source').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
  await fs.mkdir(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/before-cover.png` });
  await page.locator('.rg-open').click();
  await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  await page.locator('.rg-frame-source').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
  await page.screenshot({ path: `${evidence}/before-information.png` });
});

test('curtains directly reveal the authorized film without an intermediate portrait page', async ({ page }) => {
  await page.setViewportSize({ width:390,height:844 }); await setup(page,{},true);
  const protectedRequests=[]; page.on('request',request => { if(request.url().includes('cinematic-content')) protectedRequests.push(request.url()); });
  await page.goto('/i/review-celestial?lang=en'); await shot(page,'after-cover');
  await page.clock.install({time:new Date('2030-01-01T00:00:00Z')}); await page.clock.pauseAt(new Date('2030-01-01T00:00:10Z'));
  await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=COVER_EXITING]')).toBeVisible();
  const curtainSkip=page.getByRole('button',{name:'Skip intro',exact:true}); await expect(curtainSkip).toBeVisible();
  expect((await curtainSkip.boundingBox()).y).toBeLessThan(60);
  await expect(page.locator('main,.rg-royal-montage,.rg-montage-frame')).toHaveCount(0);
  await page.clock.runFor(360); await expect(page.locator('[data-stage=CURTAIN_PREPARING]')).toBeVisible(); await shot(page,'after-curtain-closed');
  await page.clock.runFor(420); await expect(page.locator('[data-stage=CURTAIN_OPENING]')).toBeVisible();
  await page.evaluate(() => document.getAnimations().filter(a=>a.animationName?.startsWith('rg-v4-curtain') || a.animationName==='rg-v4-valance').forEach(a => { a.pause(); a.currentTime=850; }));
  await shot(page,'after-curtain-opening');
  await page.evaluate(() => document.getAnimations().filter(a=>a.animationName?.startsWith('rg-v4-curtain') || a.animationName==='rg-v4-valance').forEach(a => a.finish()));
  await page.clock.runFor(2600); await expect(page.locator('[data-stage=PRE_WEDDING_VIDEO]')).toBeVisible();
  const film=page.locator('.cinematic-inline-stage video'); await expect(film).toBeVisible();
  const mediaNode=await film.elementHandle();
  await page.locator('.rg-language select').selectOption('km');
  expect(await mediaNode.evaluate(node=>node===document.querySelector('.cinematic-inline-stage video'))).toBe(true);
  await page.getByRole('button',{name:'រំលងវីដេអូ',exact:true}).click(); await page.clock.runFor(750); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  expect(protectedRequests).toHaveLength(1); await page.clock.runFor(30000); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
});

test('collage and lightbox retain focus, keyboard, swipe, failures and scroll position', async ({ page }) => {
  await setup(page); await page.emulateMedia({reducedMotion:'reduce'}); await page.setViewportSize({width:390,height:844});
  await page.goto('/i/review-celestial?lang=en'); await page.locator('.rg-open').click();
  await page.locator('#rg-gallery').evaluate(node=>node.scrollIntoView({behavior:'instant',block:'start'}));
  const tile=page.locator('.rg-photo-tile').first(); await expect(tile).toBeVisible(); await shot(page,'after-collage');
  const scrollTop=await page.locator('.rg-content-scroll').evaluate(node=>node.scrollTop);
  await tile.click(); const dialog=page.getByRole('dialog',{name:'Photo gallery'}); await expect(dialog).toBeVisible();
  await expect(dialog.locator('.rg-expanded-photo')).toHaveCSS('object-fit','contain'); await shot(page,'after-lightbox-portrait');
  await page.keyboard.press('ArrowRight'); await expect(dialog.locator('.rg-expanded-actions')).toContainText('2 / 3');
  const media=dialog.locator('.rg-lightbox');
  await media.evaluate(node=>{ const touch=(x,y)=>new Touch({identifier:1,target:node,clientX:x,clientY:y}); node.dispatchEvent(new TouchEvent('touchstart',{touches:[touch(290,300)],bubbles:true})); node.dispatchEvent(new TouchEvent('touchend',{changedTouches:[touch(80,310)],bubbles:true})); });
  await expect(dialog.locator('.rg-expanded-actions')).toContainText('3 / 3'); await shot(page,'after-lightbox-landscape');
  await dialog.locator('.rg-expanded-photo').evaluate(node=>node.dispatchEvent(new Event('error'))); await expect(dialog.getByRole('status')).toContainText('could not be loaded');
  await page.keyboard.press('ArrowLeft'); await expect(dialog.locator('.rg-expanded-photo')).toHaveAttribute('src',second);
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(tile).toBeFocused();
  expect(await page.locator('.rg-content-scroll').evaluate(node=>node.scrollTop)).toBe(scrollTop);
});

for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[768,1024],[834,1194],[1024,768],[1440,900],[1920,1080]]) {
  test(`reference frame and native information scroll at ${width}x${height}`,async({page})=>{
    await setup(page); await page.setViewportSize({width,height}); await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/i/review-celestial?lang=km'); await expect(page.locator('.rg-open')).toBeVisible(); await shot(page,`cover-${width}x${height}`);
    await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible(); await shot(page,`information-${width}x${height}`);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    const frame=await page.locator('.rg-paper').boundingBox(); expect(frame.width/frame.height).toBeLessThan(.7); expect(frame.width).toBeLessThanOrEqual(width);
    const scroll=page.locator('.rg-content-scroll'); expect((await scroll.boundingBox()).height).toBeGreaterThan(180);
    const sections=await page.locator('main [data-section-key]').evaluateAll(nodes=>nodes.map(node=>node.dataset.sectionKey));
    for(const key of sections) await page.locator(`#rg-${key}`).evaluate(node=>node.scrollIntoView({behavior:'instant',block:'start'}));
    expect(await scroll.evaluate(node=>node.scrollTop)).toBeGreaterThan(0); expect(await page.evaluate(()=>scrollY)).toBe(0);
  });
}

test('Studio settings update the same preview and survive save and reload',async({page})=>{
  const {events}=await setup(page); await page.goto('/app/events/101/invitation'); await page.locator('.pe-lang-pill-btn').nth(1).click();
  await chooseStudioSection(page,'designCover','Colors & typography');
  await page.getByRole('combobox',{name:'Royal Garden colors',exact:true}).selectOption('burgundy-heritage');
  await page.getByRole('combobox',{name:'Photo gallery layout',exact:true}).selectOption('collage');
  await chooseStudioSection(page,'mediaOpening','Cinematic intro');
  await page.getByRole('combobox',{name:'Curtain speed',exact:true}).selectOption('gentle');
  await page.getByRole('checkbox',{name:'Velvet curtain reveal',exact:true}).uncheck();
  const preview=page.frameLocator('iframe'); await expect(preview.locator('.tpl-royal-garden')).toHaveAttribute('data-theme','burgundy-heritage');
  await page.getByRole('button',{name:'Save',exact:true}).click(); await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase','saved');
  const saved=JSON.parse(events.get(101).contentJson); expect(saved.cinematicIntro).toMatchObject({curtainSpeed:'gentle',curtainEnabled:false}); expect(saved.informationScene).toMatchObject({colorPreset:'burgundy-heritage',galleryPresentation:'collage'});
  await page.reload(); await page.locator('.pe-lang-pill-btn').nth(1).click(); await chooseStudioSection(page,'mediaOpening','Cinematic intro');
  await expect(page.getByRole('combobox',{name:'Curtain speed',exact:true})).toHaveValue('gentle'); await expect(page.getByRole('checkbox',{name:'Velvet curtain reveal',exact:true})).not.toBeChecked();
});

test('reference storyboard: formal document, venue, programme, calendar, gift, RSVP and closing',async({page})=>{
  await setup(page,{ sectionOrder:['family','invitation','venue','schedule','gallery','countdown','gift','rsvp','wishes','closing'], enabledSections:{gift:true}, venueName:'ទីតាំងកម្មវិធី', venueMapMode:'illustrated', illustratedMap:{version:2,enabled:true,aspectRatio:'landscape',theme:'royal-blue',nodes:createMapPreset('royal-blue',{idPrefix:'v4-example'}),settings:{showDirectionsButton:false}}, khqrDollar:{qrUrl:'/v4-test-qr.svg',bankName:'Test bank',accountName:'Test recipient'}, thankYouTitle:'សូមថ្លែងអំណរគុណ', thankYouText:'សូមអរគុណចំពោះការចូលរួមរបស់លោកអ្នក។', apologyTitle:'លិខិតសូមអភ័យទោស', apologyText:'សូមអភ័យទោសចំពោះកំហុសឆ្គង។' });
  await page.route('**/v4-test-qr.svg',async route=>route.fulfill({contentType:'image/svg+xml',body:await fs.readFile(new URL('./support/fixtures/v32-gift-usd.svg',import.meta.url))}));
  await page.setViewportSize({width:390,height:844}); await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/i/review-celestial?lang=km'); await page.locator('.rg-open').click();
  for(const key of ['family','invitation','venue','schedule','gallery','countdown','gift','rsvp','wishes','closing']) {
    const section=page.locator(`#rg-${key}`); await expect(section).toBeAttached(); await section.evaluate(node=>node.scrollIntoView({behavior:'instant',block:'start'})); await shot(page,`scene-${key}`);
  }
  await page.locator('.rg-footer').evaluate(node=>node.scrollIntoView({behavior:'instant',block:'end'})); await shot(page,'scene-footer');
  await expect(page.locator('#rg-wishes')).toContainText('ព័ត៌មានឯកជន'); await expect(page.locator('#rg-rsvp form')).toBeAttached();
  const audit=await new AxeBuilder({page}).include('.rg-paper').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze(); expect(audit.violations).toEqual([]);
});

test('records local Chromium rendering and scroll measurements',async({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.emulateMedia({reducedMotion:'reduce'}); await setup(page);
  await page.addInitScript(()=>{
    window.__royalMetrics={lcpMs:0,cls:0,longTasksMs:0};
    for(const type of ['largest-contentful-paint','layout-shift','longtask']) new PerformanceObserver(list=>{for(const entry of list.getEntries()) {if(type==='largest-contentful-paint')window.__royalMetrics.lcpMs=entry.startTime; if(type==='layout-shift'&&!entry.hadRecentInput)window.__royalMetrics.cls+=entry.value; if(type==='longtask')window.__royalMetrics.longTasksMs+=entry.duration;}}).observe({type,buffered:true});
  });
  await page.goto('/i/review-celestial?lang=en'); await page.locator('.rg-entrance-photo img').evaluate(image=>image.decode()); await page.evaluate(()=>document.fonts.ready);
  await page.locator('.rg-open').click(); await page.locator('#rg-gallery').evaluate(node=>node.scrollIntoView({behavior:'instant',block:'start'}));
  const metrics=await page.evaluate(async()=>{const frames=[];let previous=performance.now();const scroll=document.querySelector('.rg-content-scroll');for(let i=0;i<60;i++)await new Promise(resolve=>requestAnimationFrame(now=>{frames.push(now-previous);previous=now;scroll.scrollTop+=4;resolve();})); return {...window.__royalMetrics,heapBytes:performance.memory?.usedJSHeapSize,scrollFrameP95Ms:frames.sort((a,b)=>a-b)[Math.floor(frames.length*.95)],requests:performance.getEntriesByType('resource').length,userAgent:navigator.userAgent};});
  await fs.mkdir('../../.cache/royal-garden-v4',{recursive:true}); await fs.writeFile('../../.cache/royal-garden-v4/performance.json',JSON.stringify({profile:'Local Vite preview of production build; desktop Chromium; 390x844; reduced motion; no network or CPU throttling; API fixtures; single sample',...metrics},null,2));
  expect(metrics.cls).toBeLessThan(.1);
});
