import json
from datetime import datetime,timedelta
from pathlib import Path
E=Path(__file__).resolve().parent
ids=['final-ready-cross-engine-content-ready','final-ready-cross-engine-content-ready-resumed','final-ready-post-safearea-combined']
rows=[json.loads((E/'commands'/(key+'.json')).read_text(encoding='utf-8-sig')) for key in ids]
windows=[]
for r in rows:
 start=datetime.fromisoformat(r['startedAt']);end=start+timedelta(seconds=r['durationSeconds'])
 windows.append({'id':r['id'],'start':start.isoformat(),'end':end.isoformat(),'exitCode':r['exitCode'],'sourceSha':r['sourceSha']})
overlaps=[]
for i,a in enumerate(windows):
 for b in windows[i+1:]:
  seconds=(min(datetime.fromisoformat(a['end']),datetime.fromisoformat(b['end']))-max(datetime.fromisoformat(a['start']),datetime.fromisoformat(b['start']))).total_seconds()
  if seconds>0:overlaps.append({'first':a['id'],'second':b['id'],'seconds':seconds})
result={'windows':windows,'overlaps':overlaps,'verdict':'REVIEW REQUIRED — duplicate verification shared preview ports; unsuitable as an isolated stability comparison','observedResults':{'originalMatrix':'132/132 passed','combined':'68/68 passed','duplicateMatrix':'129/132 passed: mobile WebKit Silk hit-test timeout, Firefox connection refusal and teardown timeout'},'classification':{'connectionRefusal':'Shared server lifecycle changed during overlapping suites; fixture orchestration failure','teardown':'Timeout retained; scheduling/lifecycle causality not conclusively isolated','silkHitTest':'Five normal-click geometry observations are separate in renderer-hit-diagnosis.json; no universal paint-cause conclusion'},'correction':'One serial final collector follows suite completion. Do not run another suite on its ports during capture, benchmark or probes.'}
(E/'verification-overlap-review.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'overlaps':overlaps,'verdict':result['verdict']}))
