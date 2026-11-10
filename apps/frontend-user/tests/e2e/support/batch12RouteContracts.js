// Batch12 bounded route contracts, reviewed against the actual page/API sources.
// Every unknown API read and every mutation fails closed. Refine observed legitimate reads
// against source contracts; do not add a generic [] / {} success fallback.
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import { installPhase4Fixtures } from './phase4Fixtures.js';
import { phase8Fixtures } from './phase8Fixtures.js';
import { installBatch11Admin } from './batch11AdminFixtures.js';
import { uxPlans, uxTemplates } from './uxFixtures.js';

const features = ['PREMIUM_TEMPLATES','QR_INVITATIONS','QR_CHECK_IN','SEATING','ADVANCED_ANALYTICS','CUSTOM_BRANDING','TEAM_MEMBERS','AI_ASSISTANT','GUEST_IMPORT','PRE_WEDDING_VIDEO','COUPLE_MONOGRAM','ILLUSTRATED_VENUE_MAP'];
const account = { id:7, fullName:'Audit Host', email:'audit@example.test', role:'USER', status:'ACTIVE', phone:'012345678' };
const admin = { id:1101, fullName:'Batch 11 fictional account', email:'batch11@example.test', role:'ADMIN', status:'ACTIVE', active:true };
const organization = { id:11, name:'Batch12 owned team', ownerId:7, ownerUserId:7, role:'OWNER', myRole:'OWNER', members:[{id:71,userId:7,fullName:'Audit Host',email:'audit@example.test',role:'OWNER'}] };
const access = { owner:true, permissions:['MANAGE_INVITATION','MANAGE_GUESTS','MANAGE_RSVP','MANAGE_SEATING','MANAGE_CHECK_IN','VIEW_REPORTS'], ownerFeatures:features };
const totals = {guestRecords:2,reservedSeats:3,respondedRecords:1,confirmedAttendees:1,checkedInRecords:0};
const plan = {...uxPlans[1],active:true,publicVisible:true,purchasable:true,eligibleFeatures:features,maxGuests:2000};
const entitlements = {packagePlan:plan,features,quotas:{invitations:{used:2,limit:20,remaining:18},guests:{used:2,limit:2000,remaining:1998}}};
const invitation = { id:101,userId:7,title:'Dara & Sophea',eventType:'WEDDING',hostName:'Dara',groomName:'Dara',brideName:'Sophea',status:'PUBLISHED',templateId:30,templateCode:'event-essential',eventDate:'2027-12-20',eventTime:'17:30:00',venueName:'Phnom Penh',venueAddress:'Fictional venue address',visibility:'PUBLIC',slug:'audit-event',languageMode:'EN' };
const pendingOrder = {orderCode:'AUDIT',templateId:30,templateName:'Event Essential',packageName:'Template',amount:15,currency:'USD',status:'PENDING',provider:'ABA_PAYWAY',createdAt:'2026-11-05T08:00:00Z',paymentLink:'https://pay.ababank.com/batch12-fictional-checkout'};
const paidOrder = {...pendingOrder,orderCode:'AUDIT-PAID',status:'PAID',paidAmount:15,paidAt:'2026-11-05T08:10:00Z'};
const reportDefinition = {code:'executive',titleEn:'Executive Overview',titleKm:'Executive Overview',defaultDateDimension:'metric',dateDimensions:['metric'],filters:[],columns:[{key:'metric',labelEn:'Metric',labelKm:'Metric',type:'STRING'},{key:'value',labelEn:'Value',labelKm:'Value',type:'STRING'}],notes:[]};
const report = {definition:reportDefinition,metadata:{snapshotId:'batch12-fictional-snapshot',generatedAt:'2026-11-05T08:00:00Z',timezone:'Asia/Phnom_Penh',filters:{},sort:'metric',direction:'ASC'},report:'executive',filteredSummary:{totalInvitations:2,totalUsers:1,confirmedReceiptsByCurrency:{USD:15,KHR:0}},rows:[{id:1,metric:'Batch12 fixture metric',value:'2'}],series:[],notices:[],totalElements:1,totalPages:1,page:0,size:20};
const monitorEvent = {id:1201,requestId:'batch12-fictional-request',method:'GET',uri:'/api/v1/templates',path:'/api/v1/templates',endpoint:'GET /api/v1/templates',status:200,durationMs:25,timestamp:'2026-11-05T08:00:00Z',sqlQueryCount:1};
const monitorStats = {totalRequests:1,successCount:1,clientErrorCount:0,serverErrorCount:0,slowRequestsCount:0,avgDurationMs:25,p95DurationMs:25,totalSqlQueries:1,nPlusOneCount:0,topEndpoints:[]};

/** Installs existing base fixture plus bounded, source-shaped read overrides. */
export async function installRouteContractFixtures(page, contract, {lang='en'}={}) {
  const unexpected = [], writes = [], errors = [];
  const isAdmin = contract.application === 'frontend-admin';
  const studio = contract.group === 'invitation';
  // Storage seeds are test initialization, not application code. Sandboxed blank
  // child frames have opaque origins and cannot access Web Storage.
  const addInit = page.addInitScript.bind(page);
  page.addInitScript = (script,arg) => typeof script === 'function'
    ? addInit({content:`if (location.origin !== 'null') { (${script.toString()})(${JSON.stringify(arg)}); }`})
    : addInit(script,arg);
  let base;
  if (isAdmin) base = await installBatch11Admin(page,{lang});
  else if (studio) base = await phase8Fixtures(page,{lang});
  else base = await installPhase4Fixtures(page,{lang,count:2});
  page.on('pageerror',error=>errors.push(error.message));
  const png = `data:image/png;base64,${(await readFile(new URL('./fixtures/general-qr.png',import.meta.url))).toString('base64')}`;
  const design = {version:0,layout:'GOLD',accent:'#956d2c',font:'MOUL',frame:'DOUBLE',header:'Fictional invitation',footer:'Present at entrance',backgroundMediaId:null,coverMediaId:null,showGroup:false,showTable:true,showSeatCount:true};
  const appearance = {schemaVersion:1,design,backgroundUrl:null,coverUrl:null};
  const ticket = {kind:'GENERAL',title:'Dara & Sophea',hostName:'Dara',partnerName:'Sophea',eventDate:'2027-12-20',eventTime:'17:30:00',venueName:'Phnom Penh',invitationUrl:'https://koupreng.example/i/audit-event',qrPayload:'https://koupreng.example/i/audit-event',qrCodeDataUri:png,appearance};
  await page.addInitScript(({lang,anonymous,local})=>{
    localStorage.setItem('koupreng.lang',lang); localStorage.setItem('koupreng.admin.lang',lang);
    if (local) localStorage.setItem('koupreng.wedding.drafts',JSON.stringify({'wed-batch12':{id:'wed-batch12',ownerUserId:7,templateId:'silk-heritage',templateCode:'silk-heritage',title:'Batch12 local preview',couple:{groom:'Local Dara',bride:'Local Sophea'},event:{title:'Batch12 local preview',date:'2027-12-20',venueName:'Local fixture venue'},enabledSections:{rsvp:false},extras:{languageMode:'en'}}}));
    if (anonymous) for (const storage of [localStorage,sessionStorage]) {storage.removeItem('koupreng.auth');storage.removeItem('koupreng.admin.auth');}
  },{lang,anonymous:contract.group.startsWith('auth-'),local:contract.group==='local-preview'});
  page.addInitScript = addInit;
  const reply = (route,data,status=200)=>route.fulfill({status,json:{data}});
  await page.route('**/api/**',async route=>{
    const request=route.request(), url=new URL(request.url()), p=url.pathname, method=request.method();
    if (method!=='GET') {writes.push({method,path:p}); return route.fulfill({status:405,json:{message:'Read-only route smoke rejects mutations'}});}
    if (p.endsWith('/i18n/messages')) return reply(route,{messages:{}});
    // The served admin preview embeds the real user renderer and its catalog provider.
    // Allow only its known fictional Event Essential reads; other APIs still fail closed.
    if (isAdmin && contract.group.startsWith('admin-template-')) {
      if (p==='/api/v1/templates') return reply(route,uxTemplates);
      if (['/api/v1/templates/30','/api/v1/templates/event-essential','/api/v1/templates/slug/event-essential'].includes(p)) return reply(route,uxTemplates[0]);
    }
    if (p==='/api/auth/me' || p==='/api/users/me') return route.fulfill({json:account});
    if (p==='/api/v1/me/entitlements') return reply(route,entitlements);
    if (p==='/api/v1/organizations') return reply(route,[organization]);
    if (p==='/api/v1/organizations/11') return reply(route,organization);
    if (p==='/api/v1/notifications') return reply(route,[{id:1201,title:'Batch12 unread notice',message:'Fictional notification',read:false,isRead:false,status:'SENT',createdAt:'2026-11-05T08:00:00Z'}]);
    if (p==='/api/v1/notifications/summary') return reply(route,{unread:1,sent:1,delivered:0,failed:0});
    if (p==='/api/v1/templates/paid' || p==='/api/v1/me/templates/paid') return reply(route,[{templateId:30,templateCode:'event-essential',templateName:'Event Essential',accessType:'PURCHASED',createdAt:'2026-11-05T08:10:00Z'}]);
    if (p==='/api/v1/profile') return reply(route,account);
    if (p==='/api/v1/invitations/101/access') return reply(route,access);
    if (p==='/api/v1/invitations/101/analytics') return reply(route,{from:url.searchParams.get('from'),to:url.searchParams.get('to'),timezone:'Asia/Phnom_Penh',current:totals,days:[{date:'2026-11-05',guestRecordsCreated:2,latestRsvpRecords:1,attendingRecords:1,declinedRecords:0,maybeRecords:0,activeCheckInRecords:0}]});
    if (p==='/api/v1/invitations/101/ticket-design') return reply(route,appearance);
    if (p==='/api/v1/invitations/101/ticket') return reply(route,ticket);
    if (p==='/api/v1/invitations/101/qr') return reply(route,{...ticket,tokenType:'INVITATION'});
    if (p==='/api/v1/invitations/101/notifications') return reply(route,[]);
    if (p==='/api/v1/invitations/101/wishes') return reply(route,[{id:1201,guestName:'Review Guest 1',message:'Batch12 fixture wish',createdAt:'2026-11-05T08:00:00Z'}]);
    if (p==='/api/v1/invitations/101/gifts') return reply(route,[{id:601,name:'USD contributor',amount:25,currency:'USD',method:'Cash',date:'2026-11-05'},{id:602,name:'KHR contributor',amount:40000,currency:'KHR',method:'Cash',date:'2026-11-05'}]);
    if (p==='/api/v1/invitations/101/budget-items') return reply(route,[{id:801,itemName:'USD venue',category:'Venue & Transport',estimatedCost:100,actualCost:40,currency:'USD'},{id:802,itemName:'KHR flowers',category:'Decor & Flowers',estimatedCost:200000,actualCost:60000,currency:'KHR'}]);
    if (p==='/api/v1/invitations/101/budget') return reply(route,{items:[{id:801,itemName:'USD venue',estimatedCost:100,actualCost:40,currency:'USD'},{id:802,itemName:'KHR flowers',estimatedCost:200000,actualCost:60000,currency:'KHR'}]});
    if (p==='/api/v1/invitations/101/reports/guests') return reply(route,{totalGuests:2,sent:0,opened:0});
    if (p==='/api/v1/invitations/101/reports/rsvp') return reply(route,{yesCount:1,attendeeTotal:1,pendingCount:1});
    if (p==='/api/v1/invitations/101/check-in/summary') return reply(route,{totalGuests:2,checkedIn:0,attendingCheckedIn:0,remaining:2});
    if (p==='/api/v1/invitations/101/check-in/list') return reply(route,[]); // deliberate empty attendance
    if (p==='/api/v1/invitations/101/dashboard') return reply(route,{totalGuests:2,totalInvited:0,attending:1,pending:1,deliverySent:0});
    if (p==='/api/v1/dashboard/summary') return reply(route,{totalInvitations:2,totalGuests:2,attending:1});
    if (p==='/api/v1/templates' && contract.group==='checkout') return reply(route,[{...uxTemplates[0],price:15,premium:true,checkoutEligible:true,checkoutAmount:'15.00',checkoutCurrency:'USD'}]);
    if (p==='/api/v1/templates/30' && contract.group==='checkout') return reply(route,{...uxTemplates[0],price:15,premium:true,checkoutEligible:true,checkoutAmount:'15.00',checkoutCurrency:'USD'});
    if (p==='/api/v1/template-payments/AUDIT') return reply(route,pendingOrder);
    if (p==='/api/v1/admin/users') return reply(route,[admin]);
    if (p==='/api/v1/admin/users/1101/invitations') return reply(route,[invitation]);
    if (p==='/api/v1/admin/payments') return reply(route,[pendingOrder,paidOrder]);
    if (p==='/api/v1/admin/dashboard/summary') return reply(route,{totalUsers:1,activeUsers:1,totalTemplates:1,totalInvitations:2,totalGuests:2,totalPayments:2,totalRevenue:15,recentUsers:[admin],recentPayments:[pendingOrder,paidOrder],recentInvitations:[invitation]});
    if (/^\/api\/v1\/admin\/analytics\/(overview|revenue|templates|delivery|rsvp|check-in)$/.test(p)) return reply(route,{summary:{totalRsvps:1,attending:1,checkedIn:0,sent:0,opened:0,totalUsers:1},rows:[],series:[]});
    if (p==='/api/v1/admin/system-health') return reply(route,{summary:{status:'HEALTHY'},rows:[]});
    if (p==='/api/v1/admin/alerts' || p==='/api/v1/admin/audit-logs/recent') return reply(route,[]);
    if (p==='/api/v1/admin/reports/management/definitions') return reply(route,{definitions:[reportDefinition],metrics:[]});
    if (p==='/api/v1/admin/reports/management/executive') return reply(route,report);
    if (p==='/api/v1/admin/system-logs') return reply(route,[{id:1201,action:'BATCH12_FIXTURE_AUDIT',actorEmail:'batch12@example.test',description:'password=fictional-marker',metadataJson:'{"token":"fictional-marker"}',createdAt:'2026-11-05T08:00:00Z'}]);
    if (p==='/api/v1/admin/dev-monitor/events') return reply(route,[monitorEvent]);
    if (p==='/api/v1/admin/dev-monitor/stats') return reply(route,monitorStats);
    if (p==='/api/v1/admin/dev-monitor/stream') return route.fulfill({status:200,contentType:'text/event-stream',body:`event: init\ndata: ${JSON.stringify({events:[monitorEvent],stats:monitorStats})}\n\n`});
    // Existing helpers own these exact, inspected GET contracts. Any additional read fails.
    const baseKnown = isAdmin
      ? /^\/api\/v1\/admin\/(users\/1101|templates(?:\/30)?|packages|notifications)$/
      : /^\/api\/v1\/(templates(?:\/recommendations|\/event-essential|\/slug\/event-essential|\/30)?|public\/packages|packages|me\/subscriptions(?:\/current|\/orders\/[^/]+)?|me\/payments(?:\/AUDIT\/receipt)?|invitations\/my|invitations\/101(?:\/preview|\/guests(?:\/page|\/overview)?|\/rsvps(?:\/summary)?|\/media|\/seating(?:\/summary|\/layout)?|\/delivery\/(?:summary|events))?|public\/invitations\/audit-event(?:\/media|\/wishes|\/guest-view)?)$/;
    if (baseKnown.test(p)) return route.fallback();
    if (studio && /^\/api\/v1\/(templates(?:\/[^/]+|\/slug\/[^/]+)?|invitations\/101(?:\/preview|\/media)?|invitations\/my|public\/invitations\/review-celestial(?:\/media|\/wishes)?)$/.test(p)) return route.fallback();
    unexpected.push({method,path:p});
    return route.fulfill({status:501,json:{message:`Unspecified Batch12 fixture: ${method} ${p}`}});
  });
  page.addInitScript = addInit;
  return {base,unexpected,writes,errors,lang,eventTitle:studio?'Celestial celebration':'Dara & Sophea'};
}

/** Uses route-specific content/controls. Does not accept #admin-main or #event-module-content alone. */
export async function assertRouteContract(page, contract, state) {
  const copy = (en, km) => state.lang === 'km' ? km : en;
  await expect.poll(()=>new URL(page.url()).pathname).toBe(contract.expectedPathname);
  const visible = selector=>expect(page.locator(selector).first()).toBeVisible();
  const text = value=>expect(page.getByText(value,{exact:true}).first()).toBeVisible();
  const heading = name=>expect(page.getByRole('heading',{name,exact:true}).first()).toBeVisible();
  const button = name=>expect(page.getByRole('button',{name}).first()).toBeVisible();
  switch (contract.group) {
    case 'home': await visible('.kp-landing h1'); await visible('.kp-landing a[href="/templates"]'); break;
    case 'catalog': await text('Event Essential'); if(contract.expectedPathname==='/templates/browse') {await visible('.tb-card .tb-btn--preview'); await visible('.tb-card .tb-btn--primary');} else await visible('a[href*="/templates/event-essential"], a[href*="/templates/30"]'); break;
    case 'pricing': await visible('.kp-plans-page'); await text('Pro'); await visible('.kp-plan-price'); break;
    case 'contact': await expect(page.getByLabel(/^Full name/)).toBeVisible(); await expect(page.getByLabel(/^Message/)).toBeVisible(); await visible('form button[type="submit"]'); break;
    case 'venues': await visible('.venues-content .main-title'); await expect(page.locator('.venue-card')).toHaveCount(4); break;
    case 'venue-detail': await expect(page.getByRole('dialog')).toBeVisible(); await button('Close venue details'); await visible('#public-venue-title'); break;
    case 'auth-login': await visible('input[autocomplete="username"]'); await visible('input[autocomplete="current-password"]'); await visible('form button[type="submit"]'); break;
    case 'auth-register': await visible('input[type="tel"]'); await visible('input[autocomplete="new-password"]'); await visible('form button[type="submit"]'); break;
    case 'auth-forgot': await visible('input[type="email"]'); await visible('.auth-form button[type="submit"]'); break;
    case 'auth-reset': await expect(page.locator('input[autocomplete="new-password"]')).toHaveCount(2); await visible('form button[type="submit"]'); break;
    case 'checkout': {
      await heading(copy('Review your template order','ពិនិត្យមុនទូទាត់')); await visible('.checkout-template-name');
      await expect(page.getByRole('button',{name:copy('Create payment order','បង្កើតការបញ្ជាទិញ'),exact:true})).toBeEnabled();
      // Currency symbol placement follows the browser's locale data (Khmer differs by engine).
      const amount = await page.evaluate(lang => new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'km-KH', {style:'currency',currency:'USD'}).format(15), state.lang);
      await expect(page.locator('.checkout-summary-row dd').nth(1)).toHaveText(amount); break;
    }
    case 'template-demo': await visible('[data-template-renderer="event-essential"] h1'); await expect(page.getByText(/Template unavailable/)).toHaveCount(0); break;
    case 'public-invitation': await visible('[data-template-renderer="event-essential"] h1'); await text('Dara & Sophea'); break;
    case 'local-preview': await visible('[data-template-renderer="silk-heritage"] .sh-cover'); await expect(page.locator('[data-template-renderer="silk-heritage"]')).toContainText('Local Dara'); break;
    case 'payment-status': await text('AUDIT'); await text('Awaiting verification'); await heading('Review your payment'); break;
    case 'payment-return': await text('AUDIT'); await text('PENDING'); await heading('Payment is being verified. Please wait.'); break;
    case 'payment-cancel': await visible('.payment-page h1'); await visible('.payment-page a[href="/templates/browse"]'); break;
    case 'events': await visible('.event-card'); await text('Dara & Sophea'); await expect(page.locator('.events-create-btn')).toBeVisible(); await expect(page.locator('.events-create-btn')).toHaveAttribute('href','/app/events/new'); break;
    case 'create-event': {
      await heading(copy('Bring your event together','បង្កើតកម្មវិធីរបស់អ្នក'));
      const title = page.locator('#event-title').first();
      if (!await title.isVisible()) {
        const next = page.getByRole('button',{name:copy('Next','បន្ទាប់'),exact:true}).or(page.getByRole('button',{name:copy('Next: Event essentials','បន្ទាប់: ព័ត៌មានលម្អិត')})).first();
        if (await next.isVisible()) await next.click();
      }
      await visible('#event-title');
      const createBtn = page.getByRole('button',{name:copy('Create event','បង្កើតកម្មវិធី')}).first();
      if (await createBtn.isVisible()) {
        await expect(createBtn).toBeVisible();
      } else {
        await expect(page.getByRole('button',{name:copy('Next','បន្ទាប់')}).first()).toBeVisible();
      }
      break;
    }
    case 'dashboard': await heading('Event overview'); await visible('.overview-metrics'); await visible('.overview-actions a'); break;
    case 'invitation': await visible('.pe-editor-column input:not([type="checkbox"]):not([type="file"])'); await button(copy('Save','រក្សាទុក')); break;
    case 'settings': await expect(page.locator('#event-title')).toHaveValue(state.eventTitle); await visible('.event-settings button'); break;
    case 'ticket': {
      await heading('Ticket designer');
      const preview = page.getByRole('button',{name:'Preview & export',exact:true});
      if (await preview.isVisible()) await preview.click();
      await visible('.ticket-preview canvas[role="img"]');
      const edit = page.getByRole('button',{name:'Edit',exact:true});
      if (await edit.isVisible()) await edit.click();
      await visible('.ticket-studio select'); break;
    }
    case 'analytics': await heading('Attendance analytics'); await heading('Current event totals'); await visible('.analytics-table-scroll tbody tr'); break;
    case 'team': await heading('Event team'); await expect(page.getByRole('option',{name:'Batch12 owned team'})).toHaveCount(1); break;
    case 'preview': await visible('.inv-preview-workspace'); await visible('[data-template-renderer="event-essential"] h1'); break;
    case 'guests': await visible('.guest-page-header'); await text('Review Guest 1'); await visible('table tbody tr'); break;
    case 'rsvp': await text('Review Guest 1'); await text('See you soon.'); await visible('table'); break;
    case 'gifts': await visible('.wg-page'); await text('USD contributor'); await text('KHR contributor'); break;
    case 'budget': await visible('.exp-page'); await text('USD venue'); await text('KHR flowers'); break;
    case 'seating': {
      await visible('.seating-page');
      const assignment = page.getByRole('button',{name:'Assign guests',exact:true});
      if (await assignment.isVisible()) await assignment.click();
      await expect(page.locator('#seating-assignment-guest')).toBeVisible();
      await expect(page.locator('#seating-assignment-guest option')).toContainText(['Choose a guest','Review Guest 1','Review Guest 2']);
      break;
    }
    case 'check-in': await visible('[data-testid="guest-roster-table"]'); await expect(page.getByTestId('guest-roster-table')).toContainText('Review Guest 1'); await button('Check in'); break;
    case 'reports': await visible('.reports-content-container'); await visible('.owner-report-summary'); await visible('.reports-content-container button'); break;
    case 'delivery': await heading('Recipients'); await expect(page.getByRole('checkbox',{name:/Review Guest 1/})).toBeVisible(); break;
    case 'media': await heading('Invitation media'); await button('Upload file'); break;
    case 'qr': await heading('Event Invitation QR Code'); await visible('.qr-image'); await button(/Download/); break;
    case 'wishes': await heading('Wishes from your guests'); await text('Batch12 fixture wish'); break;
    case 'assistant': await heading('Invitation writing helper'); await visible('.pe-ai-panel'); await visible('.pe-ai-panel button[type="submit"]'); break;
    case 'profile': await visible('.profile-page'); await expect(page.locator('.profile-page input[type="text"]').first()).toHaveValue('Audit Host'); break;
    case 'password': await heading('Change password'); await expect(page.getByLabel('Current password',{exact:true})).toBeVisible(); await visible('form button[type="submit"]'); break;
    case 'notifications': await heading('Notifications'); await text('Batch12 unread notice'); await button('Mark all read'); break;
    case 'packages': await heading('A plan for your next celebration'); await text('Pro'); await visible('.pkg-page button'); break;
    case 'payments': await heading('Payment history'); await text('AUDIT'); await visible('a[href="/dashboard/payments/AUDIT"]'); break;
    case 'receipt': await heading('RECEIPT-AUDIT'); await text('Event Essential'); break;
    case 'organizations': await text('Batch12 owned team'); await visible('a[href="/app/organizations/11"],a[href="/dashboard/organizations/11"]'); break;
    case 'organization-detail': await expect(page.getByRole('heading',{name:/^Batch12 owned team/})).toBeVisible(); await text('audit@example.test'); break;
    case 'paid-templates': await text('Event Essential'); await visible('.paid-card-item'); break;
    case 'legacy-unsaved-editor': await heading('Invitation studio'); await visible('.pe-editor-column input:not([type="checkbox"]):not([type="file"])'); await button('Save'); break;
    case 'not-found': await heading('404'); await expect(page.getByRole('link',{name:'Back to home'})).toHaveAttribute('href','/'); break;
    case 'admin-dashboard': await text(copy('Stored attendance and operations','វត្តមាន និងប្រតិបត្តិការដែលបានកត់ត្រា')); await text('Dara & Sophea'); await text('batch11@example.test'); break;
    case 'admin-users': await text('Batch 11 fictional account'); await text('batch11@example.test'); await visible('a[href="/users/1101"]'); break;
    case 'admin-user-detail': await heading('Batch 11 fictional account'); await text('batch11@example.test'); await text('Dara & Sophea'); break;
    case 'admin-templates': await text('Batch 11 fixture template'); await expect(page.getByTitle(/\(Edit\)/)).toBeVisible(); await button('+ New Template'); break;
    case 'admin-template-create': await expect(page.getByRole('heading',{name:/Create New Template/})).toBeVisible(); await button('Save & Publish'); break;
    case 'admin-template-edit': await expect(page.getByRole('heading',{name:copy(/Edit: Batch 11 fixture template/,/កែសម្រួល: Batch 11 fixture template/)})).toBeVisible(); await button(copy('Save & Publish','រក្សាទុក & ផ្សាយ')); break;
    case 'admin-payments': await text('AUDIT'); await text('AUDIT-PAID'); await visible('table tbody tr'); break;
    case 'admin-packages': await heading('Pricing & Packages'); await text('Fixture Basic'); await button('Edit'); break;
    case 'admin-notifications': await expect(page.getByLabel(/Recipient User ID/)).toBeVisible(); await expect(page.getByLabel(/Action URL/)).toBeDisabled(); await button('Send Notification'); break;
    case 'admin-logs': await text('BATCH12_FIXTURE_AUDIT'); await expect(page.locator('#admin-main')).not.toContainText('fictional-marker'); break;
    case 'admin-reports': await heading('Executive Overview'); await text('Batch12 fixture metric'); await expect(page.locator('#admin-main')).toContainText('batch12-fictional-snapshot'); break;
    case 'admin-monitor': await expect(page.getByRole('heading',{name:/API Live Monitor/}).first()).toBeVisible(); await text('/api/v1/templates'); break;
    default: throw new Error(`No bounded readiness assertion for ${contract.group}`);
  }
  expect(state.errors,`${contract.pattern}: JavaScript errors`).toEqual([]);
  expect(state.unexpected,`${contract.pattern}: unspecified API contracts`).toEqual([]);
  expect(state.writes,`${contract.pattern}: read-only smoke mutations`).toEqual([]);
}

export const routeContracts = JSON.parse(readFileSync(new URL('../../../../../docs/qa/batch12/route-matrix.json', import.meta.url), 'utf8')).routes;
