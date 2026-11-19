"""Validate links, stable ID denominators, source preservation, artifacts and patch dry-run."""
import collections, hashlib, json, pathlib, re, subprocess
ROOT=pathlib.Path(__file__).resolve().parents[4]
E=pathlib.Path(__file__).resolve().parent
D=E.parent
def load(name):return json.loads((E/name).read_text(encoding='utf-8'))
failures=[]
links=0
for p in D.glob('*.md'):
    for target in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
        if re.match(r'\w+://',target):continue
        target=target.split('#')[0]
        if not target:continue
        links+=1
        if not(p.parent/target).resolve().exists():failures.append(f'Missing link {p.name}: {target}')
gates=load('acceptance-matrix.json')
assert [r['id']for r in gates['criteria']]==[f'F08.1-{i:02}'for i in range(1,27)]
assert sum(gates['counts'].values())==26
carry=load('57-carryover-updated.json')
prior=json.loads((ROOT/'docs/uxui/phase07-codex-marketing-audit-2026-11-18/evidence/carryover-updated.json').read_text(encoding='utf-8'))
assert len(carry['entries'])==57
assert [(r['id'],r['finalStatus'],r['owner'])for r in carry['entries']]==[(r['id'],r['finalStatus'],r['owner'])for r in prior['entries']]
assert len(carry['newPhase08Items'])==5
assert len(load('phase07-partial-gates.json'))==9
matrix=load('route-state-matrix.json')
assert matrix['stateCells']==sum(len(r['states'])for r in matrix['rows'])
assert matrix['surfaces']==len(matrix['rows'])
pres=load('preservation-diff.json')
assert not pres['protectedChanges'] and not pres['originalReportChanges'] and not pres['index']
assert pres['head']==load('git-worktree-baseline.json')['head']
for stage in ['before','after']:
    for row in load(stage+'-visual.json'):
        p=ROOT/row['file']
        if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']:failures.append('Capture missing/hash mismatch: '+row['file'])
for r in load('test-command-results.json'):
    assert all(key in r for key in ['id','command','exitCode','seconds','head','sourceFingerprint','log'])
    assert isinstance(r['exitCode'],int) and r['seconds']>=0
    assert re.fullmatch('[0-9a-f]{40}',r['head']) and re.fullmatch('[0-9a-f]{64}',r['sourceFingerprint'])
    if not(ROOT/r['log']).exists():failures.append('Missing log '+r['id'])
commands=load('test-command-results.json')
assert len({r['id']for r in commands})==len(commands)
finalSource=next(r['sourceFingerprint']for r in commands if r['id']=='final-user-delivery')
assert all(r['sourceFingerprint']==finalSource for r in commands if r['id'].startswith('delivery-'))
finalBuild=next(r['buildHTMLHashes']['user']for r in commands if r['id']=='delivery-user-build')
assert all(r['buildHash']==finalBuild for r in load('after-visual.json'))
assert len(load('before-visual.json'))==24 and len(load('after-visual.json'))==50
assert len(load('defect-register.json'))==13
for r in load('defect-register.json'):
    assert re.fullmatch('C08-[0-9]{3}',r['id'])
    assert all(key in r for key in ['title','source','fix','tests','disposition'])
    assert (ROOT/r['source']).exists()
assert collections.Counter(r['severity']for r in load('defect-register.json'))=={'P1':1,'P2':11,'P3':1}
assert len(load('responsive-a11y-results.json')['geometry'])==312
check=subprocess.run(['git','apply','--reverse','--check',str(E/'codex-only.patch')],cwd=ROOT,capture_output=True,text=True)
if check.returncode:failures.append('Reverse patch dry-run failed: '+check.stderr)
required=[f'{i:02}-'for i in range(1,21)]
assert all(any(p.name.startswith(prefix)for p in D.glob('*.md'))for prefix in required)
assert 'passwordUppercase' in (ROOT/'apps/frontend-user/src/features/auth/RegisterFeature.jsx').read_text(encoding='utf-8')
out=dict(status='PASS'if not failures else 'FAIL',markdownReports=len(list(D.glob('*.md'))),localLinksChecked=links,gateIDs=26,historicalIDs=57,separateAUTHIDs=5,phase07Partials=9,routeStateCells=matrix['stateCells'],protectedFiles=pres['protectedCount'],reversePatchCheck=dict(exitCode=check.returncode,stderr=check.stderr),failures=failures)
(E/'evidence-validation.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False))
raise SystemExit(bool(failures))
