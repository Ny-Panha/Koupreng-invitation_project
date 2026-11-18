"""Compare completion-window media observations without confusing them with emitted code size."""
import json, hashlib
from pathlib import Path
from urllib.parse import unquote
E=Path(__file__).resolve().parent;ROOT=E.parents[3];BASE=ROOT/'output/playwright/uxui-phase06-2026-11-17'
raw=json.loads((BASE/'lab-results.json').read_text(encoding='utf-8'))
comparison=json.loads((E/'performance-comparison.json').read_text(encoding='utf-8'))
rows=[]
for flag in comparison['currentReviewTriggers']:
 if flag['metric']!='initialRequestBytes':continue
 selected=[r for r in raw['samples'] if (r['name'],r['width'],r['motion'],r['cache'])==(flag['surface'],flag['width'],flag['motion'],flag['cache'])]
 urls=sorted({r['url'] for s in selected for r in s['resources'] if Path(r['url']).suffix.lower() in {'.webp','.jpg','.jpeg','.png','.woff2','.m4a','.mp3','.svg'}})
 media=[]
 for url in urls:
  entry={'url':url,'observations':{stage:[{'trial':s['trial'],'transfer':next((r['transferSize'] for r in s['resources'] if r['url']==url),None)} for s in selected if s['stage']==stage] for stage in ['before','after']},'files':{}}
  for stage in ['before','after']:
   build=(BASE/stage/'user-build').resolve();file=(build/unquote(url).lstrip('/')).resolve()
   if file.is_relative_to(build) and file.is_file():entry['files'][stage]={'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
  entry['unchangedStaticAsset']=len(entry['files'])==2 and entry['files']['before']['sha256']==entry['files']['after']['sha256']
  entry['seenInOtherBaselineObservations']=sum(any(r['url']==url for r in s['resources']) for s in raw['samples'] if s['stage']=='before')
  media.append(entry)
 rows.append({'condition':{k:flag[k] for k in ['surface','width','motion','cache']},'flag':flag,'navigationSnapshots':[{'stage':s['stage'],'trial':s['trial'],'bytes':s['initialRequestBytes'],'cacheHits':s['cacheHits']} for s in selected],'media':media,'verdict':'REVIEW REQUIRED — completed-resource timing and cache state vary. Unchanged asset hashes distinguish existing media completion from new emitted assets; this is not a field wire-payload claim.'})
result={'rows':rows,'method':'Primary snapshot follows load + ready content/fonts + 400ms + consumed paint. Resource Timing lists completed resources; lazy/late media can move between the cold and warm snapshots.','limits':['Parent document timings can omit nested/cross-origin resources','A different three-sample transfer median does not by itself prove source asset growth','Hash equality proves static file identity, not that every request completed before the same snapshot']}
(E/'resource-window-diagnosis.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'transferFlags':len(rows),'mediaRows':sum(len(r['media']) for r in rows),'allMatchedStaticAssetsUnchanged':all(m['unchangedStaticAsset'] for r in rows for m in r['media'] if m['files'])}))
