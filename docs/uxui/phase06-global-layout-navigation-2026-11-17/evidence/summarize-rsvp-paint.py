import json
from pathlib import Path
from statistics import median
E=Path(__file__).resolve().parent
raw=json.loads((E/'rsvp-paint-diagnosis.json').read_text(encoding='utf-8'))
rows=[]
for mode in ['primary-snapshot','consume-ready-frames']:
 for cache in ['cold','warm']:
  pair={stage:[r for r in raw['rows'] if r['mode']==mode and r['cache']==cache and r['stage']==stage] for stage in ['before','after']}
  values={stage:[r['lcpEntries'][-1]['at'] for r in items] for stage,items in pair.items()}
  a,b=median(values['before']),median(values['after']);delta=b-a
  rows.append({'mode':mode,'cache':cache,'before':{'values':values['before'],'median':a},'after':{'values':values['after'],'median':b},'delta':delta,'percent':delta/a*100,'trigger':delta>100 and delta/a>.2,'fontReadyAfterContentMs':{stage:[r['fontsReady']-r['ready'] for r in items] for stage,items in pair.items()}})
result={'sourceSha':raw['sourceSha'],'samples':len(raw['rows']),'comparisons':rows,'verdict':'REVIEW REQUIRED — no LCP change-budget flag in this supplemental cohort; the earlier five-round RSVP flag remains recorded. Paint variability exists in both stages, so a causal production regression is not established.','nextAction':'Performance QA: review trace/filmstrip and real-browser font/API readiness on an isolated adequately resourced runner before accepting the timing gate. Preserve all three cohorts and the exact capture method.','limits':raw['limits']}
(E/'rsvp-paint-review.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'samples':result['samples'],'comparisons':[{k:r[k] for k in ['mode','cache','delta','percent','trigger']} for r in rows]}))
