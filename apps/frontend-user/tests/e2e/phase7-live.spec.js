import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
test.use({ reducedMotion:'reduce' });

// Credentials exist only in an ACL-protected fixture file outside the repository.
const fixtureFile=process.env.PHASE7_BROWSER_FIXTURES;
test.skip(!fixtureFile,'Requires explicit credentials for the owned loopback Phase 7 disposable environment.');
let fixtures;
test.beforeAll(async () => { fixtures=JSON.parse(await readFile(fixtureFile,'utf8')); expect(fixtures.plan.code).toMatch(/^P7-BROWSER-/); });
async function login(page,actor) {
  await page.addInitScript(() => localStorage.setItem('koupreng.lang','en'));
  await page.goto('/login');
  await page.locator('input[autocomplete="username"]').fill(fixtures[actor].email);
  await page.getByLabel('Password',{ exact:true }).fill(fixtures[actor].password);
  await page.locator('.auth-form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/app\/events/);
}
async function api(request,method,path,actor,body) {
  const response=await request.fetch(`http://127.0.0.1:8187/api${path}`,{ method,headers:{ Authorization:`Bearer ${fixtures[actor].auth.accessToken}` },data:body });
  expect(response.ok(),`${method} ${path} HTTP ${response.status()}`).toBe(true);
  return (await response.json()).data;
}
test('real login and a registered Free user receive the configured current plan',async ({ page },info) => {
  await login(page,'stranger'); await page.goto('/app/packages');
  await expect(page.getByRole('button',{ name:'Current plan',exact:true })).toBeDisabled();
  await expect(page.getByRole('region',{ name:'Current subscription' })).toContainText('Free');
  await expect(page.getByText('Plan could not be verified',{ exact:true })).toHaveCount(0);
  await page.screenshot({ path:info.outputPath('actual-free-package.png'),fullPage:true });
});
test('actual create, guided edit, reload, publish, public RSVP and attendance totals reconcile',async ({ page,request },info) => {
  await login(page,'owner');
  await page.goto('/app/events/new'); await page.getByRole('button',{ name:'Birthday',exact:true }).click();
  await page.getByLabel('Event title',{ exact:false }).fill(`Phase 7 fictional birthday ${Date.now()}`);
  await page.getByLabel('Celebrant name',{ exact:false }).fill('Fictional celebrant');
  await page.getByLabel('Event date',{ exact:false }).fill('2027-01-10'); await page.getByLabel('Event time',{ exact:false }).fill('17:30');
  await page.getByRole('textbox',{ name:'Venue',exact:true }).fill('Fictional garden'); await page.getByLabel('Address (optional)').fill('Fictional Phnom Penh address');
  await page.getByRole('button',{ name:/^Select .*Event Essential$/ }).click();
  await page.getByRole('button',{ name:'Create event',exact:true }).click();
  await expect(page).toHaveURL(/\/app\/events\/\d+\/invitation\?mode=guided/);
  await expect(page.getByRole('navigation',{ name:'Creation steps' })).toBeVisible();
  const id=page.url().match(/events\/(\d+)/)[1];
  await page.getByLabel('Event title',{ exact:false }).fill('Phase 7 saved fictional birthday');
  const write=page.waitForResponse(response => response.request().method()==='PUT' && new URL(response.url()).pathname===`/api/v1/invitations/${id}`);
  await page.getByRole('button',{ name:'Save details',exact:true }).click();
  expect((await (await write).json()).data.title).toBe('Phase 7 saved fictional birthday');
  await expect(page.getByText('Saved to event',{ exact:true })).toBeVisible();
  await page.reload(); await expect(page.getByLabel('Event title',{ exact:false })).toHaveValue('Phase 7 saved fictional birthday');
  const guest=await api(request,'POST',`/v1/invitations/${id}/guests`,'owner',{ guestName:'Fictional public RSVP guest',seatCount:2 });
  await page.getByRole('button',{ name:'Review publication',exact:true }).click(); await page.getByRole('button',{ name:'Confirm publication',exact:true }).click();
  const view=page.getByRole('link',{ name:'View invitation',exact:true }); await expect(view).toBeVisible();
  const url=await view.getAttribute('href'), slug=url.split('/').at(-1);
  const response=await request.post(`http://127.0.0.1:8187/api/v1/public/invitations/${slug}/guests/${guest.inviteToken}/rsvp`,{ data:{ responseStatus:'ATTENDING',attendeeCount:2 } }); expect(response.status()).toBe(201);
  await page.goto(`/app/events/${id}/guests`); await expect(page.getByText(/2 attendees are confirmed in stored RSVPs/)).toBeVisible();
  await page.goto(`/app/events/${id}/analytics`); await expect(page.getByRole('table')).toBeVisible();
  await page.screenshot({ path:info.outputPath('actual-attendance-analytics.png'),fullPage:true });
  const report=await api(request,'GET',`/v1/invitations/${id}/analytics?from=2026-10-01&to=2026-10-31`,'owner');
  expect(report.current).toMatchObject({ guestRecords:1,reservedSeats:2,respondedRecords:1,confirmedAttendees:2 });
  await page.goto(`${url}?token=${encodeURIComponent(guest.inviteToken)}`); await expect(page.getByText('Phase 7 saved fictional birthday',{ exact:true }).first()).toBeVisible();
});

test('real team invite, acceptance, reviewed linking and removal enforce viewer permissions',async ({ page,request,browser },info) => {
  await login(page,'owner');
  const teams=await api(request,'GET','/v1/organizations','owner');
  const org=teams.find(team => team.name.startsWith('Phase 7 fictional live team ') && team.ownerUserId===fixtures.owner.auth.user.id)
    || await api(request,'POST','/v1/organizations','owner',{ name:`Phase 7 fictional live team ${Date.now()}` });
  const templates=await api(request,'GET','/v1/templates','owner');
  const ownedEvents=await api(request,'GET','/v1/invitations/my','owner');
  const event=ownedEvents.find(event => event.title==='Phase 7 fictional shared birthday') || await api(request,'POST','/v1/invitations','owner',{ title:'Phase 7 fictional shared birthday',eventType:'BIRTHDAY',hostName:'Fictional host',eventDate:'2027-01-10',eventTime:'17:30',venueName:'Fictional venue',venueAddress:'Fictional address',visibility:'PRIVATE',templateId:templates.find(template => template.code==='event-essential').id });
  await page.goto(`/app/organizations/${org.id}`); await page.getByRole('button',{ name:'Invite member',exact:true }).click();
  await page.getByLabel('Member email').fill(fixtures.member.email);
  await page.getByRole('button',{ name:'Create invitation code',exact:true }).click();
  const code=page.getByLabel('One-time invitation code'); await expect(code).toBeVisible(); const token=await code.inputValue();
  await page.screenshot({ path:info.outputPath('actual-team-pending.png'),mask:[code],fullPage:true });
  await page.getByRole('button',{ name:'Done',exact:true }).click();
  await page.goto(`/app/events/${event.id}/team`);
  const linkedTeam=page.getByLabel('Linked team');
  if(await linkedTeam.inputValue()===String(org.id)) {
    await linkedTeam.selectOption(''); await page.getByRole('button',{ name:'Review team change',exact:true }).click();
    await page.getByRole('button',{ name:'Confirm',exact:true }).click(); await expect(page.getByRole('link',{ name:'View linked team' })).toHaveCount(0);
  }
  await linkedTeam.selectOption(String(org.id));
  await page.getByRole('button',{ name:'Review team change',exact:true }).click(); await page.getByRole('button',{ name:'Confirm',exact:true }).click();
  await expect(page.getByRole('link',{ name:'View linked team' })).toBeVisible();
  const context=await browser.newContext({ baseURL:'http://127.0.0.1:4286' }), member=await context.newPage();
  try {
    await login(member,'member'); await member.goto('/app/organizations'); await member.getByLabel('Invitation code',{ exact:true }).fill(token);
    await member.getByRole('button',{ name:'Accept invitation',exact:true }).click(); await expect(member.getByText('Team joined.',{ exact:false })).toBeVisible();
    await member.goto(`/app/events/${event.id}/analytics`); await expect(member.getByRole('table')).toBeVisible();
    const denied=await request.get(`http://127.0.0.1:8187/api/v1/invitations/${event.id}/guests/page`,{ headers:{ Authorization:`Bearer ${fixtures.member.auth.accessToken}` } }); expect(denied.status()).toBe(403);
    await member.goto(`/app/events/${event.id}/guests`); await expect(member.getByText('You do not have permission for this event section.',{ exact:true })).toBeVisible();
    await page.goto(`/app/organizations/${org.id}`); await page.getByRole('row').filter({ hasText:fixtures.member.email }).getByRole('button',{ name:'Remove member',exact:true }).click();
    await page.getByRole('dialog',{ name:'Remove workspace member' }).getByRole('button',{ name:'Remove member',exact:true }).click();
    await expect(page.getByRole('row').filter({ hasText:fixtures.member.email })).toHaveCount(0);
    await member.goto(`/app/events/${event.id}/analytics`); await expect(member.getByText(/Access denied\. Open an event/)).toBeVisible();
    await member.screenshot({ path:info.outputPath('actual-removed-member-denied.png'),fullPage:true });
  } finally { await context.close(); }
});

test('actual admin dashboard shows server facts in both languages and opens existing reports',async ({ page },info) => {
  await page.addInitScript(() => { if (!localStorage.getItem('koupreng.admin.lang')) localStorage.setItem('koupreng.admin.lang','en'); });
  await page.goto('http://127.0.0.1:4287/login'); await page.locator('#identifier').fill(fixtures.admin.email); await page.locator('#password').fill(fixtures.admin.password);
  await page.locator('button[type="submit"]').click(); await expect(page).toHaveURL(/4287\/dashboard/);
  await expect(page.getByRole('heading',{ name:'Recorded platform receipts',exact:true })).toBeVisible();
  await expect(page.getByText(/99.98% Uptime|98% delivery success|4772|4,772|16% vs last week/)).toHaveCount(0);
  for(const lang of ['en','km']) {
    if (lang==='km') { await page.getByRole('button',{ name:'EN',exact:true }).click(); await page.getByRole('button',{ name:/ភាសាខ្មែរ \(KM\)/ }).click(); }
    await expect(page.getByRole('heading',{ name:lang==='en'?'Recorded platform receipts':'ប្រាក់ដែលបានកត់ត្រារបស់ប្រព័ន្ធ',exact:true })).toBeVisible();
    for(const width of [390,1440]) { await page.setViewportSize({ width,height:950 }); await page.evaluate(() => document.fonts.ready); await page.screenshot({ path:info.outputPath(`actual-admin-${lang}-${width}.png`),fullPage:true }); }
  }
  await page.goto('http://127.0.0.1:4287/reports'); await expect(page.locator('main')).toBeVisible();
});
