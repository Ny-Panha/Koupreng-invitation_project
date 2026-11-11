import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../../../..');
const base=path.join(root,'output/playwright/uxui-phase03-2026-11-11');
const lab=JSON.parse(await fs.readFile(path.join(import.meta.dirname,'lab-results.json'),'utf8'));
const median=values=>{const x=values.filter(Number.isFinite).sort((a,b)=>a-b);return x.length?{count:x.length,median:x[Math.floor(x.length/2)],min:x[0],max:x.at(-1)}:null;};
const routes=[];
for(const group of [...new Set(lab.samples.map(x=>x.group))])for(const condition of ['cold','warm'])for(const stage of ['before','after']){
  const trials=lab.samples.filter(x=>x.group===group&&x.condition===condition&&x.stage===stage);
  routes.push({group,condition,stage,load:median(trials.map(x=>x.load)),fcp:median(trials.map(x=>x.fcp)),lcp:median(trials.map(x=>x.lcp)),cls:median(trials.map(x=>x.cls))});
}
const entries=[];
for(const app of ['user','admin'])for(const stage of ['before','after']){
  const dir=path.join(base,stage,`${app}-build`);
  const html=await fs.readFile(path.join(dir,'index.html'),'utf8');
  const assets=[...new Set([...html.matchAll(/(?:src|href)="\/(assets\/[^\"]+\.(?:css|js))"/g)].map(x=>x[1]))];
  entries.push({app,stage,initialAssets:assets.map(file=>lab.bundles.find(b=>b.stage===stage&&b.app===app&&b.file===file)).filter(Boolean),
    allCssJs:{count:lab.bundles.filter(b=>b.stage===stage&&b.app===app).length,bytes:lab.bundles.filter(b=>b.stage===stage&&b.app===app).reduce((n,b)=>n+b.bytes,0),gzip:lab.bundles.filter(b=>b.stage===stage&&b.app===app).reduce((n,b)=>n+b.gzip,0)}});
}
const summary={browser:lab.browser,method:{viewport:lab.viewport,motion:lab.motion,network:lab.network,cpu:lab.cpu},routes,entries};
await fs.writeFile(path.join(import.meta.dirname,'lab-summary.json'),JSON.stringify(summary,null,2));
for(const entry of entries)console.log(entry.app,entry.stage,entry.initialAssets.map(x=>`${x.file}: ${x.bytes}/${x.gzip}/${x.brotli}`).join(' | '));
for(const row of routes)console.log(row.group,row.condition,row.stage,`load ${row.load?.median?.toFixed(1)} [${row.load?.min?.toFixed(1)}-${row.load?.max?.toFixed(1)}]`,`FCP ${row.fcp?.median??'n/a'} (${row.fcp?.count??0}/3)`,`LCP ${row.lcp?.median??'n/a'} (${row.lcp?.count??0}/3)`);
