import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import os from 'node:os';
const root=path.resolve(import.meta.dirname,'../../../..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
const write=(name,value)=>fs.writeFileSync(path.join(import.meta.dirname,name),JSON.stringify(value,null,2)+'\n');
const contracts=read('docs/qa/batch12/route-matrix.json').routes;
const routes=['user','admin'].flatMap(app=>read(`.cache/batch11/${app}-routes.json`).map(row=>({application:`frontend-${app}`,...row,contract:contracts.find(c=>c.application===`frontend-${app}`&&c.pattern===row.pattern)})));
write('route-inventory.json',{count:routes.length,groups:new Set(contracts.map(c=>c.group)).size,pairs:new Set(contracts.map(c=>`${c.application}/${c.group}`)).size,routes});
const registrySource=fs.readFileSync(path.join(root,'apps/frontend-user/src/features/templates/registry/templateRegistry.js'),'utf8');
const body=registrySource.split('export const templateRegistry = {')[1].split('\n};')[0];
const registry=[...body.matchAll(/^\s*(?:["']([^"']+)["']|(\w+))\s*:\s*(\w+)/gm)].map(m=>({key:m[1]||m[2],family:m[3]}));
const shared=registrySource.match(/const shared = \[([^\]]+)\]/)?.[1].match(/["']([^"']+)["']/g)?.map(s=>s.slice(1,-1))||[];
write('renderer-registry.json',{aliases:registry.length,dedicatedFamilies:new Set(registry.map(r=>r.family)).size,entries:registry,sharedIds:shared,fallback:registrySource.includes('return useFallback ? DefaultTemplateLayout : null')?'DefaultTemplateLayout':'REVIEW SOURCE',scope:'Current source registry and full unit contracts; no every-family media/pixel certification.'});
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const assets={};
for(const app of ['user','admin']) {
  const dir=path.join(root,`apps/frontend-${app}/dist`);
  const rows=walk(dir).filter(p=>/\.(js|css|html)$/.test(p)).map(p=>{const data=fs.readFileSync(p);return{file:path.relative(dir,p).replaceAll('\\','/'),raw:data.length,gzip:zlib.gzipSync(data).length,brotli:zlib.brotliCompressSync(data).length,sha256:crypto.createHash('sha256').update(data).digest('hex')};});
  assets[app]={assets:rows,totals:Object.fromEntries(['raw','gzip','brotli'].map(k=>[k,rows.reduce((s,row)=>s+row[k],0)]))};
}
write('build-assets.json',{scope:'All emitted HTML/JS/CSS, not route initial transfer; public media excluded. Exact pre-repair Brotli inventory unavailable; before build log retains rounded raw/gzip.',...assets});
write('environment.json',{node:process.version,platform:process.platform,arch:process.arch,cpus:os.cpus().length,memory:os.totalmem(),playwright:read('apps/frontend-user/node_modules/@playwright/test/package.json').version,vitest:read('apps/frontend-user/node_modules/vitest/package.json').version,browserManifest:read('apps/frontend-user/node_modules/playwright-core/browsers.json'),origin:'http://127.0.0.1:4173',adminOrigin:'http://127.0.0.1:4174',buildOverrides:{user:{VITE_PUBLIC_APP_URL:'http://127.0.0.1:4173'},admin:{VITE_USER_APP_URL:'http://127.0.0.1:4173'}},defaultWorkers:'Playwright default; observed per-run count in logs',nativeDevice:false});
console.log(JSON.stringify({routes:routes.length,groups:new Set(contracts.map(c=>c.group)).size,pairs:new Set(contracts.map(c=>`${c.application}/${c.group}`)).size,builds:Object.fromEntries(Object.entries(assets).map(([k,v])=>[k,v.totals]))}));
