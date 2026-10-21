import { chromium } from "../../apps/frontend-user/node_modules/@playwright/test/index.mjs";
import { installIdentityFixtures } from "../../apps/frontend-user/tests/e2e/support/templateIdentityFixtures.js";
import fs from "node:fs/promises";
import process from "node:process";
const phase=process.env.REVIEW_PHASE||"after",dir=`output/playwright/template-studio-review/template-tests/${phase}`;
const base=process.env.REVIEW_BASE||"http://127.0.0.1:5173";
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:"reduce"});
  await installIdentityFixtures(page);
  await page.goto(`${base}/app/events/101/invitation`,{waitUntil:"networkidle"});
  await page.locator(".invitation-studio").waitFor();
  await page.waitForTimeout(1500);
  const iframe=page.locator('iframe[title="Live User Template Preview"]');
  await iframe.contentFrame().locator(".bliss-container,.kc-root,[data-template-renderer]").first().waitFor({state:"attached",timeout:15000});
  const identity={catalogId:4,catalogCode:"khmer-celestial",eventId:101,source:"Synthetic owner event with IDs from the real local catalog",iframePath:new URL(await iframe.getAttribute("src"),page.url()).pathname,editorTemplate:await page.locator(".pe-template-tag").innerText(),renderer:await iframe.contentFrame().locator("[data-variant]").first().getAttribute("data-variant").catch(()=>null)};
  if(!identity.renderer && await iframe.contentFrame().locator(".bliss-container").count()) identity.renderer="bliss-editorial-wedding (.bliss-container mounted)";
  await page.screenshot({path:`${dir}/khmer-celestial-editor.png`,fullPage:true});
  await page.locator(".pe-sim-gate-btn").nth(1).click();
  await page.screenshot({path:`${dir}/khmer-celestial-preview.png`,fullPage:true});
  await page.goto(`${base}/i/review-celestial`,{waitUntil:"networkidle"});
  identity.publicRenderer=await page.locator("[data-variant]").first().getAttribute("data-variant").catch(()=>null);
  await page.screenshot({path:`${dir}/khmer-celestial-public-preview.png`,fullPage:true});
  if(phase==="after") {
    await page.goto(`${base}/app/events/102/invitation`,{waitUntil:"networkidle"});
    await page.frameLocator('iframe[title="Live User Template Preview"]').locator('[data-template-renderer="garden-royal-khmer-wedding"] .tx-root').waitFor();
    await page.screenshot({path:`${dir}/garden-royal-editor.png`,fullPage:true});
    await page.goto(`${base}/templates/silk-heritage/preview`,{waitUntil:"networkidle"});
    await page.locator('[data-template-renderer="silk-heritage"]').waitFor({state:"attached"});
    await page.screenshot({path:`${dir}/silk-heritage-preview.png`,fullPage:true});
  }
  await fs.writeFile(`${dir}/identity.json`,JSON.stringify(identity,null,2));
  console.log(identity);
} finally {await browser.close();}
