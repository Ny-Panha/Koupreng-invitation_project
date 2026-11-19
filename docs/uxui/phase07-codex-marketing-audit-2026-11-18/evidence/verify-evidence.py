from pathlib import Path
import json,re,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[4]
REPORT=Path(__file__).resolve().parents[1]
EV=REPORT/'evidence'
OUT=ROOT/'output/phase07-codex-2026-11-18'
failures=[]
for p in EV.glob('*.json'):
    try:json.loads(p.read_text(encoding='utf-8-sig'))
    except Exception as error:failures.append(f'{p.name}: {error}')
docs=list(REPORT.glob('*.md'))
if len(docs)!=21:failures.append(f'Expected 21 root report documents, found {len(docs)}')
for p in docs:
    for target in re.findall(r'\[[^\]]+\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
        target=target.split('#')[0].strip('<>')
        if target and not re.match(r'^(https?:|mailto:|#)',target) and not (p.parent/target).resolve().exists():failures.append(f'{p.name}: broken link {target}')
load=lambda name:json.loads((EV/name).read_text(encoding='utf-8-sig'))
acceptance=load('acceptance-f01-f20.json')
if [r['id'] for r in acceptance]!=[f'F{i:02}' for i in range(1,21)]:failures.append('F01-F20 mismatch')
carry=load('carryover-updated.json')
old=json.loads((ROOT/'docs/uxui/phase06-global-layout-navigation-2026-11-17/evidence/carryover-closure-ledger.json').read_text(encoding='utf-8-sig'))['entries']
if len(carry['entries'])!=57 or {r['id'] for r in carry['entries']}!={r['id'] for r in old}:failures.append('Carryover ID/count drift')
old_by_id={r['id']:r for r in old}
for row in carry['entries']:
    prior=old_by_id[row['id']]
    if row['originalOwner']!=prior['owner'] or row['previousStatus']!=prior['finalStatus']:failures.append(f'Lost carryover attribution {row["id"]}')
source=load('source-preservation.json')
if any(source['protectedCategories'].values()):failures.append('Protected category changed')
if not all(r['unchanged'] for r in source['originalReports']):failures.append('Original Gemini report changed')
registry=load('renderer-registry.json')
if registry['aliases']!=38 or registry['dedicatedFamilies']!=10:failures.append('Registry count mismatch')
for row in load('attributed-changes.json')['productionAndTests']:
    if hashlib.sha256((ROOT/row['path']).read_bytes()).hexdigest()!=row['currentSha256']:failures.append(f'Attribution hash drift {row["path"]}')
captures={stage:load(stage+'-manifest.json') for stage in ['before','after']}
key=lambda r:tuple(r.get(k) for k in ['group','path','state','width','lang','mode','motion'])
if {key(r) for r in captures['before']}!={key(r) for r in captures['after']}:failures.append('Before/after capture state mismatch')
for stage,rows in captures.items():
    if len(rows)!=107:failures.append(f'Expected 107 matched {stage} capture states, found {len(rows)}')
    if len({r.get('sourceTreeSha256') for r in rows})!=1:failures.append(f'Mixed source trees in {stage} captures')
    for row in rows:
        if not row.get('valid'):failures.append(f'Invalid {stage} capture')
        for field in ['imagePath','viewportImagePath']:
            if not row.get(field):
                if field=='imagePath':failures.append(f'Missing required primary {stage} image')
                continue
            image=ROOT/row[field]
            if not image.is_file() or hashlib.sha256(image.read_bytes()).hexdigest()!=row[field+'Sha256']:failures.append(f'Image mismatch {image}')
    for state in ['footer-end','signed-in','short-landscape','slow-photo']:
        if sum(r['state']==state for r in rows)!=2:failures.append(f'Missing {stage} {state} capture pair')
    if stage=='after' and any(not r.get('inquiryCenterReachable') for r in rows if r['state']=='short-landscape'):failures.append('Landscape inquiry reachability not verified')
perf=load('performance-comparison.json')
if perf['summary']['validSamples']!=480 or perf['summary']['matchedGroups']!=48:failures.append('Incomplete five-repeat matched performance evidence')
commands={r['id']:r for r in load('test-command-results.json')}
for name in ['delivery-phase07','delivery-user-unit','delivery-user-lint','closure-phase06-recovered','delivery-combined','closure-route-content','delivery-captures','delivery-contrast','delivery-modes','delivery-reverse-check']:
    if commands.get(name,{}).get('exitCode')!=0:failures.append(f'Missing successful final command {name}')
results={'sourceSha':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip(),'documents':len(docs),'acceptanceGates':len(acceptance),'carryoverIds':len(carry['entries']),'beforeCaptures':len(captures['before']),'afterCaptures':len(captures['after']),'optionalViewportCaptures':{stage:sum(bool(r.get('viewportImagePath')) for r in rows) for stage,rows in captures.items()},'performanceSamples':perf['summary']['validSamples'],'failures':failures,'status':'PASS' if not failures else 'FAIL'}
(EV/'evidence-validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results));raise SystemExit(bool(failures))
