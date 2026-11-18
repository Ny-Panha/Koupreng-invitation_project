// Owned, isolated headed browser for native Windows zoom keys. No user profile.
// JSON stdin commands: {"group":"home"}, {"capture":"200"}, {"close":true}.
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {startFixtureServers} from './fixture-http-server.mjs';
const root=path.resolve(import.meta.dirname,'../../../..');
const require=createRequire(path.join(root,'apps/frontend-user/package.json'));
const {chromium}=require('@playwright/test');
const {openPhase06Fixture:open}=await import(pathToFileURL(path.join(root,'apps/frontend-user/tests/e2e/support/phase06Fixtures.js')));
const server=await startFixtureServers(root,'after');
const browser=await chromium.launch({headless:false,args:['--window-size=1440,1000']});
const context=await browser.newContext({viewport:null,reducedMotion:'reduce'});
const page=await context.newPage();let group='home';const rows=[];
const output=path.join(root,'output/playwright/uxui-phase06-2026-11-17/native-zoom');await fs.mkdir(output,{recursive:true});
const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim();
async function show(next){group=next;server.bind(page);await open(page,group,{app:group.startsWith('admin-')?'frontend-admin':'frontend-user',lang:'en'});await page.locator('h1:visible,main h2:visible').first().waitFor();await page.evaluate(()=>document.title='Phase 06 local zoom verification');}
async function capture(label){const row={group,label,sha,at:new Date().toISOString(),...await page.evaluate(()=>({dpr:devicePixelRatio,width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,focused:document.activeElement?.outerHTML.slice(0,200),headings:[...document.querySelectorAll('h1,h2')].filter(el=>el.getClientRects().length).map(el=>el.textContent.trim()).slice(0,5)}))};const file=path.join(output,`${group}-${label}.png`);await page.screenshot({path:file});row.screenshot=path.relative(root,file).replaceAll('\\','/');rows.push(row);await fs.writeFile(path.join(import.meta.dirname,'native-zoom-results.json'),JSON.stringify({sha,method:'Native Windows key injection to an owned Playwright Chromium window; DPR and CSS viewport measured independently',rows},null,2)+'\n');console.log(JSON.stringify(row));}
await show('home');await capture('100');console.log('READY FOR NATIVE ZOOM');
try{for await(const line of readline.createInterface({input:process.stdin})){const command=JSON.parse(line);if(command.close)break;if(command.group)await show(command.group);if(command.capture)await capture(command.capture);}}
finally{await browser.close();await server.close();}
