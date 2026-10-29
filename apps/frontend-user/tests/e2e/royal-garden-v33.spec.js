import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import { phase9Fixtures, chooseStudioSection } from './support/phase9Fixtures';

const evidence='../../output/playwright/royal-garden-v3-3';
const code='royal-garden-cinematic';
const sizes=[[320,568],[375,667],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]];
const node=(id,type,x,y,width,height,label='')=>({id,type,x,y,width,height,rotation:0,label:{km:label?'ទីតាំងគំរូ':'',en:label}});
const original={version:1,enabled:true,aspectRatio:'landscape',theme:'ivory',description:{km:'ផែនទីគំរូ',en:'Example route'},nodes:[node('saved-road','road',.45,.65,.6,.035),node('saved-venue','destination',.75,.3,.1,.12,'Saved venue')]};
const content={
  cinematicIntro:{enabled:false,style:'royal-arch',titleMode:'text',duration:2},informationScene:{enabled:true,fixedBackground:true,motionPreset:'subtle'},
  illustratedMap:original,eventTimezone:'Asia/Phnom_Penh',calendarUid:'royal-v33-example',
  saveTheDate:{enabled:true,showCountdown:true,showCalendar:true,showAddToCalendar:true,numerals:'latin',calendarNavigation:true},
  programDays:[{id:'one',date:'2027-12-31',titleEn:'Family blessings',titleKm:'ពិធីគ្រួសារ'},{id:'two',date:'2028-01-01',titleEn:'Wedding celebration',titleKm:'ពិធីមង្គលការ'}],
  schedule:[{id:'blessing',dayId:'one',time:'16:00',title:'ពិធីសូត្រមន្ត',titleEn:'Family blessings'},{id:'reception',dayId:'two',time:'17:00',title:'ពិធីទទួលភ្ញៀវ',titleEn:'Wedding reception'}],
  sectionOrder:['countdown','venue','schedule','gallery','family','invitation','rsvp','closing'],photos:[],
};
const plan=(id,code,features)=>({id,code,packageName:code,price:code==='FREE'?0:code==='PRO'?20:50,currency:'USD',billingCycle:'YEARLY',purchasable:true,eligibleFeatures:features,maxGuests:null,maxInvitations:null,maxGuestsPerInvitation:null,maxTeamMembers:null});

async function setup(page,{allowed=true,unknown=false,initial=content}={}){
  const state=await phase9Fixtures(page,{code,content:initial});
  state.events.set(101,{...state.events.get(101),eventDate:'2027-12-31',eventTime:'17:00',groomName:'Example groom',brideName:'Example bride',googleMapUrl:'',languageMode:'BILINGUAL',enabledSections:JSON.stringify({countdown:true,schedule:true,venue:true,gallery:true,rsvp:true})});
  const access={owner:true,permissions:['MANAGE_INVITATION','MANAGE_GUESTS'],...(unknown?{}:{ownerFeatures:allowed?['ILLUSTRATED_VENUE_MAP','COUPLE_MONOGRAM','QR_INVITATIONS']:[]})};
  await page.route('**/api/v1/invitations/101/access',route=>route.fulfill({json:{data:access}}));
  await page.route('**/api/v1/me/entitlements',route=>route.fulfill({json:{data:{packagePlan:plan(1,allowed?'PRO':'FREE',[]),source:'PAID_SUBSCRIPTION',features:allowed?['ILLUSTRATED_VENUE_MAP']:[],quotas:{}}}}));
  await page.route('**/api/v1/public/packages',route=>route.fulfill({json:{data:[plan(2,'PRO',['ILLUSTRATED_VENUE_MAP']),plan(3,'PREMIUM',['ILLUSTRATED_VENUE_MAP'])]}}));
  await page.route('**/api/v1/public/invitations/review-celestial/media',route=>route.fulfill({json:{data:{}}}));
  return state;
}
async function studio(page,{open=true}={}){
  await page.goto('/app/events/101/invitation');
  await expect(page.getByRole('button',{name:'Save',exact:true})).toBeVisible();
  await page.locator('.pe-lang-pill-btn').nth(1).click();
  await chooseStudioSection(page,'scheduleVenue','Venue');
  if(open)await page.locator('[data-map-entry]').getByRole('button',{name:'Edit map',exact:true}).click();
}
async function designer(page){await studio(page);await expect(page.getByRole('dialog',{name:'Illustrated map designer'})).toBeVisible();}
async function screenshot(page,name){await fs.mkdir(evidence,{recursive:true});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${evidence}/${name}.jpg`,type:'jpeg',quality:80,animations:'disabled'});}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
async function showProperties(page){if(page.viewportSize().width<=850)await page.getByRole('button',{name:'Properties',exact:true}).click();}
async function showCanvas(page){if(page.viewportSize().width<=850)await page.getByRole('button',{name:'Canvas',exact:true}).click();}
async function showElements(page){if(page.viewportSize().width<600)await page.getByRole('button',{name:'Elements',exact:true}).click();}

test('V33 map modal: V1 editing, pointer/keyboard, history, exports and save/reload/public synchronization',async({page},info)=>{
  test.setTimeout(120000);await setup(page);await designer(page);
  await showProperties(page);await page.locator('.map-layer-list').getByRole('button',{name:'2. Saved venue'}).click();
  await page.getByLabel('អក្សរខ្មែរ',{exact:true}).fill('ទីតាំងមង្គលការរបស់យើង');await page.getByLabel('English label',{exact:true}).fill('Our wedding venue');
  await page.getByLabel('Rotation',{exact:true}).fill('12');
  await showCanvas(page);const canvas=page.locator('.map-canvas-sheet > svg');
  await canvas.focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Alt+ArrowRight');
  await showProperties(page);expect(Number(await page.getByLabel('Position X').inputValue())).toBeGreaterThan(.75);await expect(page.getByLabel('Rotation',{exact:true})).toHaveValue('17');
  await showCanvas(page);const element=canvas.locator('[data-map-node="saved-venue"] > rect[data-editor-only]');const box=await element.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2-25,box.y+box.height/2+15,{steps:8});await page.mouse.up();
  await showProperties(page);const x=Number(await page.getByLabel('Position X').inputValue());expect(x).toBeLessThan(.755);
  const previousWidth=Number(await page.getByLabel('Width',{exact:true}).inputValue());
  await showCanvas(page);let handle=await canvas.locator('[data-map-resize]').boundingBox();
  await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(handle.x+handle.width/2+18,handle.y+handle.height/2+12,{steps:5});await page.mouse.up();
  await showProperties(page);expect(Number(await page.getByLabel('Width',{exact:true}).inputValue())).toBeGreaterThan(previousWidth);
  await showCanvas(page);handle=await canvas.locator('[data-map-rotate]').boundingBox();
  await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(handle.x+handle.width/2+28,handle.y+handle.height/2+16,{steps:5});await page.mouse.up();
  await showProperties(page);expect(Number(await page.getByLabel('Rotation',{exact:true}).inputValue())).not.toBe(17);
  await page.getByLabel('Connect or align with').selectOption('saved-road');await page.getByRole('button',{name:'Connect road',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(3);
  await page.getByRole('button',{name:'Undo design',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(2);
  await page.getByRole('button',{name:'Duplicate',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(3);await page.getByRole('button',{name:'Delete',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(2);
  await showCanvas(page);await page.locator('.map-canvas-toolbar').getByRole('button',{name:'Zoom in',exact:true}).click();await expect(page.locator('.map-canvas-toolbar output')).toHaveText('125%');await page.locator('.map-canvas-toolbar').getByRole('button',{name:'Fit canvas',exact:true}).click();
  for(const format of ['SVG','PNG','WEBP']){
    const pending=page.waitForEvent('download');await page.getByRole('button',{name:format,exact:true}).click();const file=await pending,bytes=await fs.readFile(await file.path());
    if(format==='SVG'){const text=bytes.toString('utf8');expect(text).toContain('SIL OPEN FONT LICENSE');expect(text).toContain('Our wedding');expect(text).not.toMatch(/<(script|foreignObject|image)|data-editor-only|onpointer/i);}
    else if(format==='PNG')expect(bytes.subarray(1,4).toString()).toBe('PNG');else expect(bytes.subarray(8,12).toString()).toBe('WEBP');
    if(info.project.name==='desktop-chromium'){await fs.mkdir(`${evidence}/exports`,{recursive:true});await fs.writeFile(`${evidence}/exports/venue-map.${format.toLowerCase()}`,bytes);}
  }
  await page.getByRole('button',{name:'Save design',exact:true}).click();await expect(page.locator('.map-save-state')).toHaveText('Saved to server');
  await page.getByRole('button',{name:'Close designer',exact:true}).click();await expect(page.locator('[data-map-entry]').getByRole('button',{name:'Edit map',exact:true})).toBeFocused();
  await page.reload();await page.locator('.pe-lang-pill-btn').nth(1).click();await chooseStudioSection(page,'scheduleVenue','Venue');await page.locator('[data-map-entry]').getByRole('button',{name:'Edit map',exact:true}).click();await showProperties(page);
  await page.locator('.map-layer-list button').nth(1).click();await expect(page.getByLabel('English label',{exact:true})).toHaveValue('Our wedding venue');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Illustrated map designer'})).toHaveCount(0);
  await page.goto('/i/review-celestial?lang=en');await expect(page.locator('.kp-illustrated-map')).toContainText('Our wedding venue');
  await expect(page.getByRole('button',{name:/Add to Calendar/})).toBeVisible();
});

test('V33 preset replacement, undo/redo and unsaved modal confirmation',async({page})=>{
  test.setTimeout(90000);await setup(page);await designer(page);await showElements(page);
  await page.getByRole('button',{name:'Presets',exact:true}).click();await page.getByRole('button',{name:/Royal blue & gold/}).click();
  await expect(page.locator('.k-confirm-dialog')).toBeVisible();await page.locator('.k-confirm-dialog').getByRole('button',{name:'Cancel',exact:true}).click();
  await showProperties(page);await expect(page.locator('.map-layer-list button')).toHaveCount(2);
  await showElements(page);await page.getByRole('button',{name:/Royal blue & gold/}).click();await page.locator('.k-confirm-dialog').getByRole('button',{name:'Confirm',exact:true}).click();
  await showProperties(page);await expect(page.locator('.map-layer-list button')).toHaveCount(7);
  await page.getByRole('button',{name:'Undo design',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(2);
  await page.getByRole('button',{name:'Redo design',exact:true}).click();await expect(page.locator('.map-layer-list button')).toHaveCount(7);
  await page.locator('.map-layer-list button').nth(0).click();await page.getByLabel('English label',{exact:true}).fill('Unsaved road');
  await page.getByRole('button',{name:'Close designer',exact:true}).click();await expect(page.locator('.k-confirm-dialog')).toBeVisible();
  await page.locator('.k-confirm-dialog').getByRole('button',{name:'Keep editing',exact:true}).click();await expect(page.getByRole('dialog',{name:'Illustrated map designer'})).toBeVisible();
});

test('V33 Free upgrade and unverified entitlement fail closed',async({page})=>{
  await setup(page,{allowed:false});await studio(page);await expect(page.getByRole('dialog',{name:'Premium Map Designer'})).toBeVisible();await expect(page.getByRole('link',{name:'Compare packages',exact:true})).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Pro or Premium');await expect(page.getByRole('dialog',{name:'Illustrated map designer'})).toHaveCount(0);await noOverflow(page);
  const axe=await new AxeBuilder({page}).include('.access-dialog').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);
  await page.getByRole('button',{name:'Not now',exact:true}).click();
  await setup(page,{allowed:false,unknown:true});await studio(page);await expect(page.getByRole('dialog')).toContainText('cannot currently be verified');await expect(page.getByRole('link',{name:'Compare packages',exact:true})).toHaveCount(0);
});

test('V33 calendar, map and designer visual coverage at all eight requested viewport sizes',async({page},info)=>{
  test.skip(info.project.name!=='desktop-chromium','One explicit eight-viewport sweep covers both pointer layouts.');test.setTimeout(240000);
  await setup(page);
  for(const[width,height]of sizes){
    await page.setViewportSize({width,height});await designer(page);await screenshot(page,`designer-${width}`);await noOverflow(page);
    if(width===1440||width===320){const axe=await new AxeBuilder({page}).include('.map-designer-modal').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);}
    await page.getByRole('button',{name:'Close designer',exact:true}).click();await page.goto('/i/review-celestial?lang=en');
    await expect(page.locator('.rg-wedding-calendar')).toBeVisible();await page.locator('#rg-countdown').scrollIntoViewIfNeeded();await screenshot(page,`calendar-${width}`);await noOverflow(page);
    await page.locator('#rg-venue').scrollIntoViewIfNeeded();await screenshot(page,`guest-map-${width}`);
    const boxes=await page.locator('.rg-wedding-calendar .kp-countdown-unit').evaluateAll(nodes=>nodes.map(n=>({x:n.getBoundingClientRect().x,right:n.getBoundingClientRect().right})));
    for(let i=1;i<boxes.length;i++)expect(boxes[i].x).toBeGreaterThanOrEqual(boxes[i-1].right-1);
  }
});

test('V33 public demo navigation exposes sample calendar and map without the removed overlay, sample detail card or export controls',async({page},info)=>{
  test.setTimeout(90000);await setup(page);await page.emulateMedia({reducedMotion:'reduce'});const requested=[];page.on('request',request=>requested.push(request.url()));
  await page.goto('/templates/royal-garden-cinematic?lang=en');await expect(page.locator('.rg-demo-nav')).toHaveCount(0);await screenshot(page,`landing-cover-${info.project.name}`);await page.locator('.rg-open').click();await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  await page.locator('#rg-countdown').scrollIntoViewIfNeeded();await expect(page.locator('.rg-wedding-calendar')).toBeVisible();await expect(page.getByRole('button',{name:/Add to Calendar/})).toHaveCount(0);await expect(page.locator('.rg-selected-day')).toHaveCount(0);await expect(page.locator('.rg-calendar-export')).toHaveCount(0);
  await expect(page.locator('[data-ceremony=true]')).toHaveCount(2);await screenshot(page,`landing-calendar-${info.project.name}`);
  await page.locator('#rg-venue').scrollIntoViewIfNeeded();await expect(page.locator('.kp-illustrated-map')).toBeVisible();await expect(page.locator('.kp-illustrated-map')).toContainText('Example');await screenshot(page,`landing-map-${info.project.name}`);
  expect(requested.filter(url=>/IllustratedMapDesignerModal|\.mp4(?:\?|$)/.test(url))).toEqual([]);
  await expect(page.getByRole('button',{name:'Save design',exact:true})).toHaveCount(0);
});

test('V33 locked entry and upgrade dialog remain usable at all eight viewport sizes',async({page},info)=>{
  test.skip(info.project.name!=='desktop-chromium','Explicit viewport sweep is shared.');test.setTimeout(180000);await setup(page,{allowed:false});
  for(const[width,height]of sizes){
    await page.setViewportSize({width,height});await studio(page,{open:false});await page.locator('[data-map-entry]').scrollIntoViewIfNeeded();await screenshot(page,`locked-entry-${width}`);
    await page.locator('[data-map-entry]').getByRole('button',{name:'Edit map',exact:true}).click();await expect(page.getByRole('dialog',{name:'Premium Map Designer'})).toBeVisible();await screenshot(page,`upgrade-${width}`);await noOverflow(page);
    await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  }
});

test('V33 bilingual dark designer uses accessible theme tokens',async({page},info)=>{
  await setup(page);await page.addInitScript(()=>{localStorage.setItem('koupreng.colorMode','dark');});
  await designer(page);await expect(page.locator('html')).toHaveAttribute('data-color-mode','dark');
  await screenshot(page,`designer-dark-${info.project.name}`);const axe=await new AxeBuilder({page}).include('.map-designer-modal').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations).toEqual([]);
});

test('V33 calendar export uses saved ceremony dates and respects the Studio visibility setting',async({page})=>{
  await setup(page);await page.goto('/i/review-celestial?lang=en');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:/Add to Calendar/}).click();const main=await pending;const mainText=await fs.readFile(await main.path(),'utf8');expect(mainText).toContain('DTSTART:20271231T100000Z');
  await page.getByRole('button',{name:'Next month',exact:true}).click();await page.locator('[data-date="2028-01-01"]').click();await expect(page.getByRole('region',{name:'Selected day'})).toContainText('Wedding reception');
  const allPending=page.waitForEvent('download');await page.getByRole('button',{name:'All wedding ceremonies',exact:true}).click();const all=await allPending;const text=await fs.readFile(await all.path(),'utf8');expect(text.match(/BEGIN:VEVENT/g)).toHaveLength(2);expect(text).toContain('DTSTART:20280101T100000Z');
  await setup(page,{initial:{...content,saveTheDate:{...content.saveTheDate,showAddToCalendar:false}}});await page.goto('/i/review-celestial?lang=en');await expect(page.getByRole('button',{name:/Add to Calendar/})).toHaveCount(0);
});
