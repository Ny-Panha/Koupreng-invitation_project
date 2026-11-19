// Run route inventory tests with BATCH11_UPDATE_ROUTES=1 before this read-only collector.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../../../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const write=(name,data)=>fs.writeFileSync(path.join(import.meta.dirname,name),JSON.stringify(data,null,2)+'\n');
const git=args=>execFileSync('git',args,{cwd:root}).toString();
const contracts=read('docs/qa/batch12/route-matrix.json').routes;
const routes=['user','admin'].flatMap(app=>read(`.cache/batch11/${app}-routes.json`).map(row=>({app:`frontend-${app}`,...row})));
const bindings=['user','admin'].flatMap(app=>read(`.cache/phase06/${app}-shells.json`));
const joined=routes.map(row=>({...row,contract:contracts.find(c=>c.application===row.app&&c.pattern===row.pattern),binding:bindings.find(c=>c.app===row.app&&c.pattern===row.pattern),proof:'CURRENT SOURCE MAPPED; browser proof belongs to explicit command/case'}));
if(joined.some(row=>!row.contract||!row.binding)) throw Error('Unmapped route');
write('route-shell-inventory.json',joined);
const src=fs.readFileSync(path.join(root,'apps/frontend-user/src/features/templates/registry/templateRegistry.js'),'utf8');
const body=src.split('export const templateRegistry = {')[1].split('\n};')[0];
const registry=[...body.matchAll(/^\s*(?:["']([^"']+)["']|(\w+))\s*:\s*(\w+)/gm)].map(m=>({key:m[1]||m[2],family:m[3]}));
write('renderer-registry.json',{aliases:registry.length,dedicatedFamilies:new Set(registry.map(r=>r.family)).size,entries:registry,sharedIds:['koupreng-demo-wedding','event-essential'],fallback:'DefaultTemplateLayout; resolver tests in full unit suite',proof:'SOURCE + unit contracts; two representative browser families only'});
const tracked=git(['ls-files','-z']).split('\0').filter(Boolean);
const changes=git(['diff','--name-only','-z']).split('\0').filter(Boolean);
const untracked=git(['ls-files','--others','--exclude-standard','-z']).split('\0').filter(Boolean);
const protectedCategories={backendAndTelegram:changes.filter(f=>/^apps\/(backend|telegram)/.test(f)),manifests:changes.filter(f=>/(package(-lock)?\.json|pom.xml)$/.test(f)),migrations:changes.filter(f=>/db\/migration/.test(f)),templateArtAndRegistry:changes.filter(f=>/features\/templates\/|public\/templates\/|public\/fonts\//.test(f)),originalBrowserTests:changes.filter(f=>/phase0[2456].*\.spec/.test(f))};
const initial=read('output/phase07-codex-2026-11-18/starting-inventory.json');
const originalReports=initial.filter(f=>f.path.startsWith('docs/uxui/phase07-1-')).map(f=>({path:f.path,unchanged:f.sha256===crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f.path))).digest('hex')}));
write('source-preservation.json',{sourceSha:git(['rev-parse','HEAD']).trim(),branch:git(['branch','--show-current']).trim(),originSha:git(['rev-parse','origin/main']).trim(),ahead:git(['rev-list','--count','origin/main..HEAD']).trim(),routes:routes.length,groups:new Set(contracts.map(c=>c.group)).size,appGroupPairs:new Set(contracts.map(c=>`${c.application}/${c.group}`)).size,trackedSql:tracked.filter(f=>f.endsWith('.sql')).length,flywayPaths:tracked.filter(f=>f.includes('/db/migration/')&&f.endsWith('.sql')).length,protectedCategories,originalReports,changedTracked:changes,untracked});
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const builds={};
for(const [stage,dir] of [['before','output/phase07-codex-2026-11-18/before-build'],['after','apps/frontend-user/dist']]) {
  const files=walk(path.join(root,dir)).filter(f=>/\.(js|css|html)$/.test(f));
  const assets=files.map(file=>{const b=fs.readFileSync(file);return{file:path.relative(path.join(root,dir),file).replaceAll('\\','/'),raw:b.length,gzip:zlib.gzipSync(b).length,brotli:zlib.brotliCompressSync(b).length,sha256:crypto.createHash('sha256').update(b).digest('hex')};});
  builds[stage]={assets,totals:Object.fromEntries(['raw','gzip','brotli'].map(key=>[key,assets.reduce((s,a)=>s+a[key],0)])),note:'Emitted HTML/JS/CSS artifact bytes. Not page-load transferred bytes; public media excluded from these totals.'};
}
write('build-assets.json',builds);
console.log(JSON.stringify({routes:routes.length,groups:new Set(contracts.map(c=>c.group)).size,registryAliases:registry.length,families:new Set(registry.map(r=>r.family)).size,protectedCategories,builds:Object.fromEntries(Object.entries(builds).map(([k,v])=>[k,v.totals]))}));
