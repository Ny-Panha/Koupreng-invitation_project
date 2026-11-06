import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { phase8Fixtures, phase8Content } from './support/phase8Fixtures';
import { chooseStudioSection } from './support/studioNavigationActions';

test('the landing phone previews Floral and opens the same invitation on desktop and mobile', async ({page},info)=>{
  await phase8Fixtures(page,{code:'khmer-floral-gold'});
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const [width,height] of [[390,844],[1440,1000]]) {
    await page.setViewportSize({width,height});
    await page.goto('/');
    const poster=page.locator('.public-demo-poster img');
    await expect(poster).toHaveAttribute('src','/templates/khmer-floral-gold/phone-preview-440.webp');
    await poster.evaluate(image=>image.decode());
    await expect(page.locator('iframe')).toHaveCount(0);
    const open=page.getByRole('button',{name:'Try the invitation',exact:true});
    await open.scrollIntoViewIfNeeded();
    if(info.project.name==='chromium') {
      await mkdir('../../docs/design/khmer-floral-gold/screenshots/mobile-studio',{recursive:true});
      await page.screenshot({path:`../../docs/design/khmer-floral-gold/screenshots/mobile-studio/home-poster-${width}.png`});
    }
    await open.click();
    const iframe=page.locator('iframe.public-demo-iframe'),frame=page.frameLocator('iframe.public-demo-iframe');
    await expect(iframe).toHaveAttribute('src','/templates/khmer-floral-gold?embed=demo&lang=en');
    await expect(iframe).toHaveClass(/is-ready/);
    await expect(frame.locator('.kfg-invitation[data-template-renderer="khmer-floral-gold"]')).toBeAttached();
    await expect(frame.locator('.kfg-open')).toBeInViewport({ratio:.999});
    const region=width<768?page.getByRole('dialog'):page.locator('.public-invitation-demo');
    await expect(region.getByRole('link',{name:'View the full demo'})).toHaveAttribute('href','/templates/khmer-floral-gold');
    await frame.locator('.kfg-open').click();
    await expect(frame.locator('.kfg-content')).toBeVisible();
    await iframe.focus();await page.keyboard.press('Escape');
    await expect(iframe).toHaveCount(0);await expect(open).toBeFocused();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('mobile and tablet covers preserve the desktop composition and a compact Open button', async ({ page }, info) => {
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await phase8Fixtures(page,{code:'khmer-floral-gold'});
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const [width,height] of [[320,568],[360,640],[390,844],[440,956],[768,1024],[1440,900],[844,390]]) {
    await page.setViewportSize({width,height});
    await page.goto('/templates/khmer-floral-gold/demo?lang=km');
    await page.locator('.kfg-monogram-art').evaluate(image=>image.decode());
    await page.evaluate(()=>document.fonts.ready);
    const metrics=await page.locator('.kfg-opening').evaluate(root=>{
      const button=root.querySelector('.kfg-open'),label=button.querySelector('span'),rect=button.getBoundingClientRect();
      const range=document.createRange();range.selectNodeContents(label);
      const heading=root.querySelector('h1'),guest=root.querySelector('.kfg-guest-frame > span');
      const lines=node=>node.getBoundingClientRect().height / parseFloat(getComputedStyle(node).lineHeight);
      const text=root.querySelector('.kfg-monogram > span'),inner=text.firstElementChild;
      const flowers=[...root.querySelectorAll('.kfg-cover-side')].map(node=>node.getBoundingClientRect());
      const clear=[root.querySelector('.kfg-monogram'),heading,root.querySelector('.kfg-guest-frame'),button].every(node=>{
        const box=node.getBoundingClientRect();return flowers.every(flower=>Math.max(flower.left-box.right,box.left-flower.right,flower.top-box.bottom,box.top-flower.bottom)>=7.5);
      });
      const bottom=parseFloat(getComputedStyle(root.parentElement.querySelector('.kfg-paper-art'),'::after').height);
      return {bottomGap:innerHeight-44-bottom-rect.bottom,scroll:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth,headingLines:lines(heading),guestLines:lines(guest),guestFont:parseFloat(getComputedStyle(guest).fontSize),buttonHeight:rect.height,buttonWidth:rect.width,emptySpace:rect.width-range.getBoundingClientRect().width,textFits:inner.scrollWidth<=text.clientWidth+1&&inner.scrollHeight<=text.clientHeight+1,clear};
    });
    expect(metrics.overflow,`${width}: horizontal overflow`).toBe(false);
    expect(metrics.scroll,`${width}: cover requires scrolling`).toBeLessThanOrEqual(height+1);
    expect(metrics.headingLines,`${width}: heading wrapped`).toBeLessThan(1.1);
    if (height>500) expect(metrics.guestLines,`${width}: demo guest wrapped`).toBeLessThan(1.1);
    expect(metrics.guestFont).toBeGreaterThanOrEqual(12);
    expect(metrics.emptySpace).toBeLessThanOrEqual(90);
    expect(metrics.buttonHeight).toBeGreaterThanOrEqual(44);
    expect(metrics.buttonWidth).toBeGreaterThanOrEqual(44);
    expect(metrics.bottomGap).toBeLessThanOrEqual(24);
    expect(metrics.bottomGap).toBeGreaterThanOrEqual(6);
    expect(metrics.textFits).toBe(true);
    expect(metrics.clear).toBe(true);
    await expect(page.locator('.kfg-open')).toBeInViewport({ratio:.999});
    if(info.project.name==='chromium'&&[320,440,844].includes(width)) {
      await mkdir('../../docs/design/khmer-floral-gold/screenshots/mobile-studio',{recursive:true});
      await page.screenshot({path:`../../docs/design/khmer-floral-gold/screenshots/mobile-studio/cover-${width}x${height}.png`});
    }
  }
  expect(errors).toEqual([]);
});

test('the complete welcome calendar fits phones, tablets and a six-week month',async ({page},info)=>{
  const state=await phase8Fixtures(page,{code:'khmer-floral-gold'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  for (const [width,height] of [[320,568],[375,667],[390,844],[440,956],[768,1024],[844,390]]) {
    await page.setViewportSize({width,height});
    await page.goto('/templates/khmer-floral-gold/demo?lang=km');
    await page.locator('.kfg-open').click();
    const scene=page.locator('.kfg-welcome-scene'),calendar=scene.locator('.kp-calendar');
    await expect(calendar).toBeVisible();
    await expect(scene).toHaveCSS('opacity','1');
    await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-stage','welcome');
    await expect(page.locator('.kfg-invitation')).toHaveAttribute('data-motion-settled','true');
    await expect(calendar).toBeInViewport({ratio:.999});
    await expect(scene.locator('.kfg-continue')).toHaveCount(0);
    await expect(page.locator('.kfg-skip-welcome')).toBeInViewport({ratio:.999});
    if(height>500) {
      const box=await calendar.boundingBox(),sceneBox=await scene.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(height*.25);
      expect(sceneBox.y+sceneBox.height-box.y-box.height).toBeLessThanOrEqual(40);
    }
    await expect(calendar.locator('thead th')).toHaveCount(7);
    expect(await calendar.evaluate(node=>{const box=node.getBoundingClientRect();return box.width<=innerWidth&&node.scrollWidth<=node.clientWidth+1&&[...node.querySelectorAll('time')].every(day=>day.getBoundingClientRect().right<=box.right&&day.getBoundingClientRect().left>=box.left);})).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(info.project.name==='chromium'&&[320,375,440,844].includes(width)) {
      await mkdir('../../docs/design/khmer-floral-gold/screenshots/mobile-studio',{recursive:true});
      await page.screenshot({path:`../../docs/design/khmer-floral-gold/screenshots/mobile-studio/calendar-${width}x${height}.png`});
    }
  }
  state.events.set(101,{...state.events.get(101),eventDate:'2027-01-20'});
  await page.setViewportSize({width:375,height:667});
  await page.goto('/i/review-celestial');await page.locator('.kfg-open').click();
  const calendar=page.locator('.kfg-welcome-scene .kp-calendar');
  await expect(calendar.locator('tbody tr')).toHaveCount(6);
  await expect(calendar).toBeInViewport({ratio:.999});
  await expect(calendar.locator('.kp-calendar-event')).toHaveAttribute('datetime','2027-01-20');
});

test('long personalized guests and every couple frame fit narrow phones with separate short cover names', async ({ page })=>{
  const guest='លោក សុវណ្ណវិសាល និងលោកស្រី សុភមង្គល ព្រមទាំងក្រុមគ្រួសារ';
  const settings={motion:'none',monogramMode:'short-names',groomShortNameEn:'Visal',brideShortNameEn:'Sophea',monogramTextLayout:'staircase'};
  const state=await phase8Fixtures(page,{code:'khmer-floral-gold',content:{...phase8Content,guestName:guest,invitationStyleV1:settings}});
  const event=state.events.get(101);
  state.events.set(101,{...event,groomName:'Visal a very long full family name',brideName:'Sophea another complete family name'});
  await page.setViewportSize({width:320,height:640});
  for (const monogram of ['regal-scroll-gold','oval','diamond','ornate','minimal']) {
    state.events.set(101,{...state.events.get(101),contentJson:JSON.stringify({...phase8Content,guestName:guest,invitationStyleV1:{...settings,monogram}})});
    await page.goto('/i/review-celestial');
    await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('.kfg-monogram')).toHaveText('Visal&Sophea');
    await expect(page.locator('.kfg-guest-frame')).toHaveText(guest);
    await expect(page.locator('.kfg-cover-details time')).toHaveAttribute('datetime','2027-12-05');
    await expect(page.locator('.kfg-cover-details address')).toContainText('Fictional Phnom Penh address');
    const fits=await page.locator('.kfg-monogram > span').evaluate(node=>node.firstElementChild.scrollHeight<=node.clientHeight+1&&node.firstElementChild.scrollWidth<=node.clientWidth+1);
    expect(fits,monogram).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1)).toBe(true);
    await expect(page.locator('.kfg-open')).toBeInViewport({ratio:.999});
  }
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-honored-guest')).toHaveText(guest);
  await expect(page.locator('.kfg-groom strong')).toHaveText('Visal a very long full family name');
  await expect(page.locator('.kfg-bride strong')).toHaveText('Sophea another complete family name');
});

test('Studio saves and publishes short names, phone sizing, wording and scene controls',async ({page})=>{
  const state=await phase8Fixtures(page,{code:'khmer-floral-gold'});
  await page.route('**/api/v1/invitations/101/publish',async route=>{state.events.set(101,{...state.events.get(101),status:'PUBLISHED'});await route.fulfill({json:{data:state.events.get(101)}});});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/app/events/101/invitation');
  await chooseStudioSection(page,'designCover','Invitation styles');
  const editor=page.locator('.studio-invitation-styles');
  await editor.getByRole('combobox',{name:'Couple initials / logo',exact:true}).selectOption('short-names');
  await editor.getByLabel('Groom short name (Khmer)',{exact:true}).fill('វិសាល');
  await editor.getByLabel('Bride short name (Khmer)',{exact:true}).fill('សុភា');
  await editor.getByLabel('Groom short name (English)',{exact:true}).fill('Visal');
  await editor.getByLabel('Bride short name (English)',{exact:true}).fill('Sophea');
  await editor.getByRole('combobox',{name:'Center text layout',exact:true}).selectOption('staircase');
  await editor.getByRole('combobox',{name:'Heading shape',exact:true}).selectOption('straight');
  await editor.getByLabel('Show venue on cover',{exact:true}).uncheck();
  await editor.getByLabel('Open button label (English)',{exact:true}).fill('Celebrate with us');
  await editor.getByLabel('Button side spacing',{exact:true}).fill('5');
  await editor.getByLabel('Button text size',{exact:true}).fill('15');
  await editor.getByLabel('Guest name text size',{exact:true}).fill('18');
  await editor.getByLabel('General guest greeting (English)',{exact:true}).fill('Our dear friends');
  await editor.getByText('Wedding details wording',{exact:true}).click();
  await editor.getByLabel('Invitation heading (English)',{exact:true}).fill('We warmly invite you');
  await editor.getByLabel('Wedding invitation wording (English)',{exact:true}).fill('Please join our family celebration.');
  await editor.getByText('Flowers and welcome timing',{exact:true}).click();
  await editor.getByLabel('Welcome duration (seconds)',{exact:true}).fill('9');
  await editor.getByLabel('Number of petals',{exact:true}).fill('15');
  await editor.getByLabel('Number of butterflies',{exact:true}).fill('10');
  await editor.getByLabel('Side flower borders',{exact:true}).uncheck();
  await editor.getByLabel('Corner blossom branches',{exact:true}).uncheck();
  await editor.getByLabel('Wedding details flower background',{exact:true}).uncheck();
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.locator('.studio-save-status')).toHaveAttribute('data-phase','saved');
  const expected={monogramMode:'short-names',groomShortName:'វិសាល',brideShortName:'សុភា',groomShortNameEn:'Visal',brideShortNameEn:'Sophea',openButtonLabelEn:'Celebrate with us',openButtonPadding:5,openButtonTextSize:15,guestTextSize:18,genericGuestNameEn:'Our dear friends',familyHeadingEn:'We warmly invite you',familyIntroEn:'Please join our family celebration.',welcomeSeconds:9,petalCount:15,butterflyCount:10,sideFlorals:false,sceneBranches:false,sceneBackground:false};
  expect(JSON.parse(state.events.get(101).contentJson).invitationStyleV1).toMatchObject({...expected,headingShape:'straight',showCoverVenue:false});
  await page.reload();
  await chooseStudioSection(page,'designCover','Invitation styles');
  await expect(editor.getByLabel('Groom short name (English)',{exact:true})).toHaveValue('Visal');
  await expect(editor.getByLabel('Open button label (English)',{exact:true})).toHaveValue('Celebrate with us');
  await page.getByRole('button',{name:'Publish',exact:true}).click();
  await page.getByRole('button',{name:'Confirm publication',exact:true}).click();
  await expect.poll(()=>state.events.get(101).status).toBe('PUBLISHED');
  await page.goto('/i/review-celestial');
  await expect(page.locator('.kfg-monogram')).toHaveText('Visal&Sophea');
  await expect(page.locator('.kfg-guest-frame')).toHaveText('Our dear friends');
  await expect(page.getByRole('button',{name:'Celebrate with us',exact:true})).toBeVisible();
  await expect(page.locator('.kfg-cover-side')).toHaveCount(0);
  await expect(page.locator('.kfg-arched-title')).toHaveCount(0);
  await expect(page.locator('.kfg-cover-details address')).toHaveCount(0);
  await expect(page.locator('.kfg-cover-details time')).toHaveAttribute('datetime','2027-12-05');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.reload();
  await expect(page.locator('.kfg-realistic-petal')).toHaveCount(15);
  await expect(page.locator('.kfg-realistic-flight')).toHaveCount(10);
  await page.locator('.kfg-open').click();
  await expect(page.locator('.kfg-welcome-scene')).toBeVisible();
  expect(await page.locator('.kfg-invitation').evaluate(node=>node.style.getPropertyValue('--kfg-welcome-duration'))).toBe('9000ms');
  await page.locator('.kfg-skip-welcome').click();
  await expect(page.locator('.kfg-family > h2')).toHaveText('We warmly invite you');
  await expect(page.locator('.kfg-family-intro')).toHaveText('Please join our family celebration.');
  await expect(page.locator('.kfg-scene-backdrop')).toHaveCount(0);
  await expect(page.locator('.kfg-blossom-corner')).toHaveCount(0);
  expect(JSON.parse(state.events.get(101).contentJson).futureExtension).toEqual(phase8Content.futureExtension);
});
