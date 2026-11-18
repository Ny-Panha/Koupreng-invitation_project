import json, math, sys
from pathlib import Path
from statistics import median
from collections import defaultdict
E=Path(__file__).resolve().parent; ROOT=E.parents[3]
diagnostic='--diagnostics' in sys.argv
raw=json.loads((ROOT/f'output/playwright/uxui-phase06-2026-11-17/{"lab-diagnostic-results.json" if diagnostic else "lab-results.json"}').read_text(encoding='utf-8'))
groups=defaultdict(dict)
for row in raw['samples']:
 key=(row['name'],row['width'],row['motion'],row['cache'])
 groups[key].setdefault(row['stage'],[]).append(row)
metrics={'load':(100,.20),'fcp':(100,.20),'lcp':(100,.20),'initialRequestBytes':(20*1024,.10),'cls':(.02,None)}
rows=[];triggers=[]
def summary(samples,key):
 values=[r.get(key) for r in samples if isinstance(r.get(key),(int,float)) and math.isfinite(r[key])]
 return {'valid':len(values),'median':median(values) if len(values)>=3 else None,'min':min(values) if values else None,'max':max(values) if values else None}
historical={('cinematic-invitation',1440,'no-preference','warm'):['load','fcp'],('create-event',390,'no-preference','warm'):['lcp'],('create-event',390,'reduce','warm'):['lcp'],('create-event',1440,'no-preference','warm'):['lcp'],('create-event',1440,'reduce','cold'):['lcp'],('rsvp',390,'no-preference','warm'):['lcp']}
for key,pair in sorted(groups.items()):
 row={'surface':key[0],'width':key[1],'motion':key[2],'cache':key[3],'metrics':{},'historicalReviewMetrics':historical.get(key,[])}
 for name,(absolute,relative) in metrics.items():
  before=summary(pair.get('before',[]),name);after=summary(pair.get('after',[]),name)
  old,new=before['median'],after['median'];delta=new-old if old is not None and new is not None else None
  percent=delta/old*100 if delta is not None and old else None
  trigger=delta is not None and delta>absolute and (relative is None or old==0 or delta/old>relative)
  verdict='INSUFFICIENT DATA' if delta is None else 'REVIEW REQUIRED' if trigger else 'NO DIAGNOSTIC TRIGGER'
  row['metrics'][name]={'before':before,'after':after,'delta':delta,'percent':percent,'verdict':verdict}
  if trigger:triggers.append({**{k:row[k] for k in ('surface','width','motion','cache')},'metric':name,'delta':delta,'percent':percent,'beforeRange':[before['min'],before['max']],'afterRange':[after['min'],after['max']],'verdict':verdict})
 row['lcpElements']={stage:sorted({r.get('lcpElement') for r in samples if r.get('lcpElement')}) for stage,samples in pair.items()}
 row['cacheHits']={stage:[r.get('cacheHits') for r in samples] for stage,samples in pair.items()}
 rows.append(row)
result={'samples':len(raw['samples']),'errors':raw['errors'],'recoveredErrors':raw.get('recoveredErrors',[]),'retryArchive':raw.get('retryArchive'),'matchedConditionGroups':len(rows),'allMetricsHaveThreeValidSamples':all(m['before']['valid']>=3 and m['after']['valid']>=3 for r in rows for m in r['metrics'].values()),'allMetricsHaveExpectedSamples':all(m['before']['valid']>=raw['conditions']['repeats'] and m['after']['valid']>=raw['conditions']['repeats'] for r in rows for m in r['metrics'].values()),'method':raw['conditions'],'historicalConditionGroups':6,'historicalMetricTriggers':7,'historicalReview':[r for r in rows if r['historicalReviewMetrics']],'currentReviewTriggers':triggers,'comparisons':rows,'limits':['Actual per-navigation resource/HTML transfer is distinct from emitted bundle totals; nested cross-origin resources may require a separate network-session inventory','Medians and ranges do not establish causality or field p75','Cache-valid fixture HTTP server differs from historical routed lab warm navigation','No field INP, actual device GPU or production radio data measured']}
if not diagnostic:
 manifests={stage:json.loads((ROOT/f'output/playwright/uxui-phase06-2026-11-17/{stage}/manifest.json').read_text(encoding='utf-8')) for stage in ['before','after']}
 windows=[]
 for ident in ['post-auth-aligned-final-performance','post-auth-final-missing-pairs','post-zero-final-performance','post-zero-final-missing-pairs','final-ready-performance','final-ready-missing-pairs']:
  file=E/'commands'/(ident+'.json')
  if file.exists():
   command=json.loads(file.read_text(encoding='utf-8-sig'));windows.append({key:command.get(key) for key in ['id','startedAt','durationSeconds','sourceSha','exitCode']})
 result['provenance']={'builds':{stage:{'sourceSha':items[0]['sha'],'trackedProductionTreeSha256':items[0].get('sourceTreeSha256')} for stage,items in manifests.items()},'baselineReuse':raw.get('baselineReuse'),'observationWindows':windows,'qualification':'Navigation observations are bounded by actual command windows; per-navigation wall timestamps were not invented. Frozen browser Date is fictional content time, not execution time.'}
(E/('performance-diagnostic-review.json' if diagnostic else 'performance-comparison.json')).write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'samples':result['samples'],'groups':len(rows),'allValid':result['allMetricsHaveThreeValidSamples'],'triggers':triggers}))
