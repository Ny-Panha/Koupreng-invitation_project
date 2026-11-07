import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import process from 'node:process';
import { phase9Fixtures } from './support/phase9Fixtures';

const evidence = '../../docs/design/royal-garden-v4/evidence/video-footer';
const baseline = 'tests/e2e/support/fixtures/royal-garden-footer-positions.json';
const portrait = '/templates/silk-heritage/portrait.webp';
const root = '/templates/royal-garden/v3-1';

async function setup(page, theme) {
  const state = await phase9Fixtures(page, { code:'royal-garden-cinematic', content:{
    cinematicIntro:{style:'royal-arch',titleMode:'text',buttonStyle:'circle'},
    informationScene:{colorPreset:theme,monogram:{mode:'artwork'},video:{footer:true}},
  } });
  const event = { ...state.events.get(101), designJson:JSON.stringify({coverBackgroundImage:portrait}), status:'PUBLISHED', cinematicOpening:{enabled:true,videoMediaId:107,posterUrl:portrait} };
  await page.route('**/api/v1/public/invitations/review-celestial*', route=>route.fulfill({json:{data:event}}));
  await page.route('**/cinematic-content',async route=>route.fulfill({contentType:'video/mp4',body:await fs.readFile('public/templates/royal-garden/v3/video/pre-wedding-demo.mp4')}));
}

test('page two retains curtain, autoplay, original crest and lettering positions across viewports',async({page})=>{
  test.setTimeout(180000);
  await fs.mkdir(evidence,{recursive:true});
  const writing = process.env.ROYAL_FOOTER_BASELINE === '1';
  const poses = writing ? {} : JSON.parse(await fs.readFile(baseline,'utf8'));
  for(const [width,height] of [[280,640],[320,480],[320,568],[360,640],[375,667],[390,844],[412,915],[430,932],[540,720],[768,1024],[834,1194],[844,390],[1024,768],[1440,900],[1920,1080]]) {
    await setup(page,'burgundy-heritage'); await page.setViewportSize({width,height});
    let requests=0; const watch=request=>{if(request.url().includes('cinematic-content')) requests++;}; page.on('request',watch);
    await page.goto('/i/review-celestial?lang=km'); await expect(page.locator('.rg-open')).toBeVisible(); expect(requests).toBe(0);
    await page.locator('.rg-open').click(); await expect(page.locator('.rg-royal-montage,.rg-montage-frame')).toHaveCount(0);
    await expect(page.locator('[data-stage=CURTAIN_OPENING]')).toBeVisible();
    const film=page.locator('.cinematic-inline-stage video'); await expect(film).toBeVisible(); await expect.poll(()=>film.evaluate(video=>video.currentTime)).toBeGreaterThan(0);
    expect(requests).toBe(1); await expect(film).toHaveJSProperty('muted',true);
    await expect(page.locator('.rg-video-monogram img')).toHaveAttribute('src',`${root}/monogram-256.webp`);
    await expect(page.locator('.rg-video-calligraphy')).toHaveAttribute('src',`${root}/video-calligraphy-480.webp`);
    await page.getByRole('button',{name:'ផ្អាកវីដេអូ',exact:true}).click();
    await expect(page.locator('.rg-curtains[data-settled=true]')).toBeVisible();
    expect(await page.locator('.cinematic-playback-actions button').evaluate(node=>{const box=node.getBoundingClientRect();return node.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2));})).toBe(true);
    const folds=await page.locator('.rg-curtains[data-settled=true] .rg-curtain-panel').evaluateAll(nodes=>nodes.map(node=>{
      const css=getComputedStyle(node),matrix=new DOMMatrixReadOnly(css.transform),width=parseFloat(css.width),origin=parseFloat(css.transformOrigin),canvas=node.parentElement;
      const endpoints=[0,width].map(x=>node.offsetLeft+origin+matrix.a*(x-origin)+matrix.e);
      const left=node.classList.contains('rg-curtain-panel--left'),inner=left ? Math.max(...endpoints) : Math.min(...endpoints);
      return {top:(left ? inner : canvas.clientWidth-inner)/canvas.clientWidth,body:(left ? inner+matrix.c*canvas.clientHeight*.4 : canvas.clientWidth-inner-matrix.c*canvas.clientHeight*.4)/canvas.clientWidth};
    }));
    for(const fold of folds) {expect(fold.top).toBeGreaterThan(.18);expect(fold.top).toBeLessThan(.22);expect(fold.body).toBeLessThan(.02);}
    await film.evaluate(video=>new Promise(resolve=>{ video.addEventListener('seeked',resolve,{once:true}); video.currentTime=1; }));
    await page.locator('.cinematic-film-footer,.rg-video-monogram img,.rg-video-calligraphy').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:`${evidence}/${writing?'before':'after'}-${width}x${height}.png`,animations:'disabled'});
    const key=`${width}x${height}`, pose={};
    for(const selector of ['.rg-video-monogram','.rg-video-lettering','.rg-video-date','.cinematic-film-footer']) pose[selector]=await page.locator(selector).boundingBox();
    const video=await film.boundingBox();
    if(writing) poses[key]=pose;
    else if(poses[key] && width<1024) for(const [selector,box] of Object.entries(pose).filter(([selector])=>selector!=='.cinematic-film-footer')) {
      const old=poses[key][selector], oldWidth=poses[key]['.cinematic-film-footer'].width;
      expect(Math.abs((box.x+box.width/2-video.x)/video.width-(old.x+old.width/2-(width-oldWidth)/2)/oldWidth),`${key} ${selector} center`).toBeLessThan(.02);
      expect(Math.abs((box.y+box.height/2-video.y)/height-(old.y+old.height/2)/height),`${key} ${selector} vertical position`).toBeLessThan(.02);
    }
    if(!writing) await expect(page.locator('.cinematic-film-footer')).toHaveAttribute('src','/templates/royal-garden/v4/video-footer-1280.webp');
    const footer=pose['.cinematic-film-footer'];
    expect(footer.width/footer.height).toBeCloseTo(3,2);
    const lower=footer.y+footer.height-video.y-video.height; expect(lower).toBeGreaterThan(0); expect(lower).toBeLessThan(video.width*.02+2);
    expect(video.y).toBeLessThanOrEqual(1); expect(Math.abs(video.height-height)).toBeLessThanOrEqual(2);
    const headerBoxes=await page.locator('.rg-language,.rg-music,.cinematic-playback-actions button').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
    for(let i=0;i<headerBoxes.length;i++) for(let j=i+1;j<headerBoxes.length;j++) {const a=headerBoxes[i],b=headerBoxes[j];expect(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)).toBeLessThanOrEqual(0);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    page.off('request',watch);
  }
  if(writing) await fs.writeFile(baseline,JSON.stringify(poses,null,2));
});

test('catalog uses the new footer and preserved original Khmer artwork',async({page})=>{
  await phase9Fixtures(page,{code:'royal-garden-cinematic'});
  await page.setViewportSize({width:390,height:844}); await page.goto('/templates/royal-garden-cinematic?lang=km');
  await expect(page.locator('.rg-entrance-photo img')).toHaveAttribute('src','/templates/royal-garden/v4/pich-pisey/photo-03-1280.webp');
  await expect(page.locator('.kp-site-preloader')).toBeHidden();
  await page.locator('.rg-entrance-photo img,.rg-guest-frame img,.rg-frame-source').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await page.screenshot({path:`${evidence}/pich-pisey-cover-390x844.png`,animations:'disabled'});
  await page.locator('.rg-open').click(); await expect(page.locator('.rg-royal-montage,.rg-montage-frame')).toHaveCount(0);
  await expect(page.locator('[data-stage=CURTAIN_OPENING]')).toBeVisible();
  const film=page.locator('.cinematic-inline-stage video'); await expect(film).toBeVisible();
  await expect.poll(()=>film.evaluate(video=>video.currentTime)).toBeGreaterThan(0);
  await expect(page.locator('.rg-video-monogram img')).toHaveAttribute('src',`${root}/monogram-256.webp`);
  await expect(page.locator('.rg-video-calligraphy')).toHaveAttribute('src',`${root}/video-calligraphy-480.webp`);
  await expect(page.locator('.cinematic-film-footer')).toHaveAttribute('src','/templates/royal-garden/v4/video-footer-1280.webp');
  await page.getByRole('button',{name:'ផ្អាកវីដេអូ',exact:true}).click();
  await film.evaluate(video=>new Promise(resolve=>{video.addEventListener('seeked',resolve,{once:true});video.currentTime=1;}));
  await page.locator('.cinematic-film-footer,.rg-video-monogram img,.rg-video-calligraphy').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await page.screenshot({path:`${evidence}/after-catalog-390x844.png`,animations:'disabled'});
  await page.getByRole('button',{name:'រំលងវីដេអូ',exact:true}).click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
  await expect(page.locator('.rg-photo-tile')).toHaveCount(12);
  await expect(page.locator('.rg-photo-tile img').first()).toHaveAttribute('src',/pich-pisey\/photo-03-480.webp/);
  await page.locator('#rg-gallery').evaluate(node=>node.scrollIntoView({behavior:'instant',block:'start'}));
  await page.locator('.rg-photo-tile img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await page.screenshot({path:`${evidence}/pich-pisey-gallery-390x844.png`,animations:'disabled'});
});

test('Pich-Pisey catalog cover and information fit small phones, landscape, tablets and desktops',async({page})=>{
  test.setTimeout(120000); await phase9Fixtures(page,{code:'royal-garden-cinematic'}); await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[280,640],[320,480],[320,568],[360,640],[375,667],[390,844],[412,915],[430,932],[540,720],[768,1024],[834,1194],[844,390],[1024,768],[1440,900],[1920,1080]]) {
    await page.setViewportSize({width,height}); await page.goto('/templates/royal-garden-cinematic?lang=km');
    await expect(page.locator('.rg-open')).toBeVisible(); await expect(page.locator('.kp-site-preloader')).toBeHidden();
    await page.locator('.rg-entrance-photo img,.rg-guest-frame img,.rg-frame-source').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
    await expect(page.locator('.rg-entrance-stage')).toHaveCSS('box-shadow','none');
    await expect(page.locator('.rg-entrance-vignette')).toHaveCSS('display','none');
    await page.screenshot({path:`${evidence}/cover-${width}x${height}.png`,animations:'disabled',fullPage:true});
    await page.locator('.rg-open').click(); await expect(page.locator('[data-stage=CONTENT]')).toBeVisible();
    const frame=await page.locator('.rg-paper').boundingBox(), nav=await page.locator('.rg-bottom-nav').boundingBox();
    const reading=await page.locator('.rg-content-scroll').boundingBox();
    expect(reading.width/frame.width).toBeGreaterThan(.84); expect(reading.height/frame.height).toBeGreaterThan(height<=480?.60:.72);
    expect(frame.y).toBeLessThanOrEqual(1); expect(Math.abs(frame.height-height)).toBeLessThanOrEqual(1);
    expect(nav.x).toBeGreaterThanOrEqual(frame.x); expect(nav.x+nav.width).toBeLessThanOrEqual(frame.x+frame.width);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await expect(page.locator('.rg-photo-tile')).toHaveCount(12);
    await page.screenshot({path:`${evidence}/information-${width}x${height}.png`,animations:'disabled'});
    await page.locator('.rg-footer').evaluate(node=>node.scrollIntoView({behavior:'instant',block:'end'}));
    expect(await page.locator('.rg-content-scroll').evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(()=>scrollY)).toBe(0);
  }
});
