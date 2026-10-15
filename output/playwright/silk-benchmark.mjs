import { chromium } from '../../apps/frontend-user/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const url of ['https://goevent.online/', 'https://goevent.online/partners/templates']) {
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(2000);
    console.log(JSON.stringify({ url, status: response.status(), title: await page.title(), text: (await page.locator('body').innerText()).slice(0, 2000), links: await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => ({ label: n.textContent.trim(), href: n.href })).filter(n => n.label || /template|event/.test(n.href)).slice(0, 20)) }));
  } catch (error) { console.log(JSON.stringify({ url, blocked: error.message })); }
}
await page.goto('https://goevent.online/partners/templates');
console.log(JSON.stringify({ buttons: await page.locator('button').evaluateAll(nodes => nodes.map(n => n.textContent.trim())), frames: page.frames().map(f => f.url()), inputs: await page.locator('select').evaluateAll(nodes => nodes.map(n => n.textContent.trim())) }));
await page.screenshot({path: 'output/playwright/silk-goevent-index.png'});
await browser.close();
