"""Summarize actual captures and five-repeat lab data; reject incomplete groups."""
from pathlib import Path
import json, statistics, collections, hashlib, subprocess
ROOT=Path(__file__).resolve().parents[4]
EV=Path(__file__).resolve().parent
OUT=ROOT/'output/phase07-codex-2026-11-18'

def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(name,data):(EV/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def capture_key(row):return tuple(row.get(k) for k in ['group','path','state','width','lang','mode','motion'])

attempts=[]
for stage in ['before','after']:
    merged={}
    for name in ['captures.json','captures-supplemental.json','captures-walked.json','captures-footer-end.json','captures-extra-states.json']:
        p=OUT/stage/name
        if not p.exists():continue
        rows=read(p)
        attempts.append({'stage':stage,'source':str(p.relative_to(ROOT)),'count':len(rows),'invalid':[{'path':r['path'],'state':r['state'],'failure':r.get('failure')} for r in rows if not r.get('valid')]})
        for row in rows:
            key=capture_key(row)
            if row.get('valid') or key not in merged:merged[key]=row
    values=list(merged.values())
    for row in values:
        if not row.get('valid'):raise RuntimeError(f'Unresolved {stage} capture: {row}')
        for key in ['imagePath','viewportImagePath']:
            if row.get(key):
                image=ROOT/row[key]
                if not image.is_file():raise RuntimeError(f'Missing {image}')
                row[key+'Sha256']=hashlib.sha256(image.read_bytes()).hexdigest()
    write(stage+'-manifest.json',values)
write('capture-attempts.json',attempts)

def sample_key(row):return tuple(row[k] for k in ['group','width','mode','motion','cache'])
stages={stage:read(OUT/stage/'lab.json') for stage in ['before','after']}
groups={}
invalid=[]
for stage,rows in stages.items():
    for row in rows:
        valid=row.get('valid') and row.get('fcp',0)>0 and row.get('paint',{}).get('lcp',0)>0 and not any(e.get('type')=='pageerror' for e in row.get('errors',[]))
        if not valid:invalid.append({'stage':stage,'case':sample_key(row),'reason':row.get('failure','missing positive FCP/LCP or page exception')});continue
        groups.setdefault(sample_key(row),{}).setdefault(stage,[]).append(row)
if invalid:raise RuntimeError(f'Invalid lab samples: {invalid}')
if any(len(g.get('before',[]))!=5 or len(g.get('after',[]))!=5 for g in groups.values()):raise RuntimeError('Every matched group requires five valid repetitions per stage')

def fields(row):
    requests=row.get('requests',[])
    nav=row.get('navigation',{})
    return {'fcpMs':row['fcp'],'lcpMs':row['paint']['lcp'],'cls':row['paint']['cls'],
        'observedLoadEndMs':nav.get('loadEventEnd',0),
        'resourceTimingTransferBytes':sum(r.get('transferSize',0) for r in row.get('resources',[]))+nav.get('transferSize',0),
        'decodedResponseBytes':sum(r.get('decodedBytes',0) for r in requests),
        'decodedHtmlJsCssBytes':sum(r.get('decodedBytes',0) for r in requests if r.get('type') in ['document','script','stylesheet']),
        'decodedFontBytes':sum(r.get('decodedBytes',0) for r in requests if r.get('type')=='font'),
        'decodedImageBytes':sum(r.get('decodedBytes',0) for r in requests if r.get('type')=='image'),
        'observedLongTaskCount':len(row['paint'].get('longTasks',[])),
        'observedLongTaskMs':sum(row['paint'].get('longTasks',[]))}

comparisons=[];triggers=[]
for key,pair in sorted(groups.items()):
    result={'group':key[0],'width':key[1],'mode':key[2],'motion':key[3],'cache':key[4],'repeatsPerStage':5,'metrics':{}}
    samples={stage:[fields(r) for r in pair[stage]] for stage in ['before','after']}
    for metric in samples['before'][0]:
        item={}
        for stage in ['before','after']:
            values=[r[metric] for r in samples[stage]]
            median=statistics.median(values)
            mad=statistics.median(abs(v-median) for v in values)
            item[stage]={'median':median,'min':min(values),'max':max(values),'samples':values,'outlierIndices':[i for i,v in enumerate(values) if mad and abs(v-median)>3*mad]}
        old=item['before']['median'];new=item['after']['median'];delta=new-old;percent=100*delta/old if old else None
        item.update(delta=delta,percent=percent)
        trigger=(metric in ['fcpMs','lcpMs','observedLoadEndMs'] and delta>100 and percent is not None and percent>20) or (metric=='resourceTimingTransferBytes' and delta>20*1024 and percent is not None and percent>10) or (metric=='cls' and delta>.02)
        if trigger:triggers.append({**{k:v for k,v in result.items() if k!='metrics'},'metric':metric,'delta':delta,'percent':percent,'before':item['before'],'after':item['after'],'status':'REVIEW REQUIRED; compare ranges/fixture/device evidence before attributing cause'})
        result['metrics'][metric]=item
    result['lcpElements']={stage:list(dict.fromkeys(r['paint'].get('lcpElement') for r in pair[stage])) for stage in ['before','after']}
    comparisons.append(result)

write('performance-comparison.json',{'sourceSha':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip(),
    'method':{'repetitions':5,'groups':len(groups),'browser':stages['after'][0]['version'],'viewportWidths':[390,1440],
      'network':'unthrottled loopback, bounded API fixture responses, external images/SDK blocked',
      'cache':'Playwright routing disables normal HTTP caching; routed-cold and routed-revisit are distinct protocols, not a native warm-cache certificate',
      'observation':'700ms after DOM/font readiness; native performance clock; not field INP or late-interaction performance',
      'sourceTrees':{stage:list(set(r['sourceTreeSha256'] for r in rows)) for stage,rows in stages.items()},
      'rawEvidence':{stage:str((OUT/stage/'lab.json').relative_to(ROOT)) for stage in stages},
      'outliers':'3× median absolute deviation flagged; every observation retained; no trimming'},
    'summary':{'beforeSamples':len(stages['before']),'afterSamples':len(stages['after']),'validSamples':sum(map(len,stages.values())),'matchedGroups':len(groups),'reviewTriggers':len(triggers),'fieldCertification':'NOT AVAILABLE'},
    'reviewTriggers':triggers,'groups':comparisons})

# Keep portable compact raw paint/byte values, without duplicating every request URL.
write('performance-samples.json',[{'stage':stage,**{k:r[k] for k in ['group','width','mode','motion','cache','repeat','sourceTreeSha256']},**fields(r),'lcpElement':r['paint'].get('lcpElement')} for stage,rows in stages.items() for r in rows])
print(json.dumps({'captureRows':{stage:len(read(EV/(stage+'-manifest.json'))) for stage in ['before','after']},'samples':sum(map(len,stages.values())),'matchedGroups':len(groups),'reviewTriggers':len(triggers)}))
