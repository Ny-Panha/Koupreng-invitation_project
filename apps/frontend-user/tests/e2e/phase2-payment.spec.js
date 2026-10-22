import {expect,test} from '@playwright/test';
import {installOverhaulFixtures} from './support/overhaulFixtures.js';
import {phase2EvidencePath} from './support/phase2Evidence.js';
test('approved template offer creates one pending order and only server PAID unlocks the selected design',async({page},info)=>{
 await installOverhaulFixtures(page,'en');
 const design={id:2,code:'garden-royal-khmer-wedding',name:'Fixture approved design',premium:true,checkoutEligible:true,checkoutAmount:'37.50',checkoutCurrency:'USD',thumbnailUrl:'/templates/event-essential.svg'};
 const order={orderCode:'PHASE2-FIXTURE',templateId:2,templateName:design.name,packageName:'Fixture offer',amount:'37.50',currency:'USD',paymentLink:'https://pay.ababank.com/phase2-fixture',status:'PENDING',expiresAt:new Date(Date.now()+600000).toISOString()};
 let status='PENDING';const writes=[];
 await page.route('**/api/v1/templates',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({data:[design]})}));
 await page.route('**/api/v1/template-payments/**',route=>{
  const path=new URL(route.request().url()).pathname;
  if(route.request().method()==='POST')writes.push({path,payload:route.request().postDataJSON()});
  return route.fulfill({contentType:'application/json',body:JSON.stringify({data:{...order,status}})});
 });
 await page.route('**/*',r=>{
  const req=r.request(),path=new URL(req.url()).pathname;
  return ['GET','HEAD','OPTIONS'].includes(req.method())||path.startsWith('/api/v1/template-payments/')?r.fallback():r.abort('blockedbyclient');
 });
 await page.goto('/templates/garden-royal-khmer-wedding/checkout');
 await expect(page.getByText('$37.50',{exact:true})).toBeVisible();
 await expect(page.getByText(/Test Payment|VAT|100%|Unlimited/)).toHaveCount(0);
 await page.screenshot({path:phase2EvidencePath(info,`payments/approved-checkout-${info.project.name}.png`),fullPage:true});
 await page.getByRole('button',{name:'Create payment order',exact:true}).click();
 await expect(page).toHaveURL(/\/payments\/PHASE2-FIXTURE\/status$/);
 await expect(page.locator('.payment-status-badge')).toHaveText('Awaiting verification');
 expect(writes).toHaveLength(1);expect(writes[0].payload).toMatchObject({templateId:2,amount:'37.50',currency:'USD'});
 await page.getByRole('button',{name:'Request payment review',exact:true}).click();
 await expect(page.locator('.payment-status-badge')).toHaveText('Awaiting verification');
 await expect(page.getByRole('link',{name:/Use Template/i})).toHaveCount(0);
 await page.screenshot({path:phase2EvidencePath(info,`payments/verified-flow-pending-${info.project.name}.png`),fullPage:true});
 status='PAID';await page.getByRole('button',{name:'Check Status',exact:true}).click();
 await expect(page.locator('.payment-status-badge')).toHaveText('Payment verified');
 await expect(page.getByRole('link',{name:/Use Template/i})).toHaveAttribute('href','/app/events/new?template=2');
 await page.screenshot({path:phase2EvidencePath(info,`payments/verified-flow-paid-${info.project.name}.png`),fullPage:true});
 expect(writes.map(w=>w.path)).toEqual(['/api/v1/template-payments/static/create','/api/v1/template-payments/PHASE2-FIXTURE/claim']);
});
