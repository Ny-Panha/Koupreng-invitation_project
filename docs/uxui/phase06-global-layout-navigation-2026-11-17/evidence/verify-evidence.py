"""Check delivery completeness and relative links; no browser or live services."""
import json, re
from command_log import read_command_log
from pathlib import Path
E=Path(__file__).resolve().parent; OUT=E.parent; ROOT=E.parents[3]
read=lambda name:json.loads((E/name).read_text(encoding='utf-8-sig'))
errors=[]
required=['source-snapshot','route-shell-adoption','shell-consumer-graph','carryover-closure-ledger','responsive-focus-results','before-manifest','after-manifest','capture-diff','renderer-visibility-review','performance-comparison','performance-diagnostic-review','rsvp-paint-diagnosis','rsvp-paint-review','final-build-assets','qa-command-results','interaction-profile','visual-review','preservation-audit','verification-overlap-review']
for name in required:
 try:read(name+'.json')
 except Exception as ex:errors.append(f'{name}: {ex}')
reports=list(OUT.glob('*.md'))
numbered=[p for p in reports if re.match(r'^\d\d-',p.name)]
if len(numbered)!=19 or not (OUT/'README.md').exists():errors.append('Expected README + nineteen numbered reports')
for file in reports:
 if 'PENDING' in file.read_text(encoding='utf-8'):errors.append(f'{file.name}: unresolved PENDING result')
 for label,target in re.findall(r'\[([^\]]*)\]\(([^)]+)\)',file.read_text(encoding='utf-8')):
  if re.match(r'^(https?:|#|mailto:)',target):continue
  target=target.split('#')[0].strip('<>')
  if target and not (file.parent/target).exists():errors.append(f'{file.name}: broken {target}')
routes=read('route-shell-adoption.json')
if len(routes)!=len({(r['app'],r['pattern']) for r in routes}):errors.append('Duplicate routes')
for r in routes:
 if not all(r.get(k) for k in ['shell','primaryPhase','access','concreteUrl','relevantStates']):errors.append(f'Unassigned route {r["pattern"]}')
ledger=read('carryover-closure-ledger.json')['entries']
if len(ledger)!=len({r['id'] for r in ledger}):errors.append('Duplicate carryover entries')
allowed={'CLOSED — VERIFIED','CLOSED — NOT APPLICABLE','OPEN — REPRODUCED','REVIEW REQUIRED','BLOCKED — EXTERNAL','DEFERRED — DOMAIN OWNER'}
for r in ledger:
 if r['finalStatus'] not in allowed:errors.append(f'Unknown status {r["id"]}')
 if not r.get('owner') or not r.get('nextAction'):errors.append(f'No owner/action {r["id"]}')
 if not (ROOT/r['oldEvidence']).exists():errors.append(f'Historical source missing {r["id"]}')
if {r['originatingPhase'] for r in ledger}!={1,3,4,5}:errors.append('Missing originating phase')
for stage in ['before','after']:
 manifest=read(stage+'-manifest.json')
 if len(manifest['primary'])!=52:errors.append(f'{stage}: expected 52 primary captures')
 for row in manifest['primary']+manifest.get('shellCaptures',[])+manifest.get('actionCaptures',[]):
  if not (ROOT/row['screenshot']).exists():errors.append(f'Missing local capture {row["screenshot"]}')
for row in read('renderer-visibility-review.json')['rows']:
 for stage in row['stages']:
  if not (ROOT/stage['screenshot']).exists():errors.append(f'Missing renderer stage {stage["screenshot"]}')
 if row['status']!='FIXTURE VERIFIED':errors.append(f'Renderer review unresolved: {row["key"]}')
for row in read('special-mode-results.json')['rows']:
 if row['status']!='FIXTURE VERIFIED':errors.append(f'Special mode unresolved: {row["group"]} {row["kind"]}')
 if row.get('screenshot') and not (ROOT/row['screenshot']).exists():errors.append(f'Missing special screenshot {row["screenshot"]}')
for row in read('history-zero-results.json')['rows']:
 if row['status']!='CROSS-ENGINE VERIFIED' or row['catalogScroll']!=300 or row['restored']!=0:errors.append(f'Zero history regression: {row["engine"]} {row["motion"]}')
performance=read('performance-comparison.json')
if performance['errors'] or not performance['allMetricsHaveExpectedSamples']:errors.append('Incomplete final navigation measurements')
if performance['samples']!=624 or performance['matchedConditionGroups']!=104:errors.append('Final measurement denominator drift')
repeat=read('performance-diagnostic-review.json')
if repeat['errors'] or not repeat['allMetricsHaveExpectedSamples']:errors.append('Incomplete five-round diagnostic')
if read('preservation-audit.json')['verdict']!='SOURCE VERIFIED':errors.append('Protected source comparison failed')
qa={r['id']:r for r in read('qa-command-results.json')}
expected={'final-ready-post-final-user-units':1494,'final-ready-post-final-admin-units':202,'final-ready-cross-engine-content-ready':132,'final-ready-post-safearea-combined':68}
for ident,count in expected.items():
 row=qa.get(ident)
 if not row or row.get('exitCode')!=0:errors.append(f'Missing successful required command {ident}');continue
 log=read_command_log(ROOT,row);log=re.sub(r'\x1b\[[0-9;]*[A-Za-z]','',log)
 if not re.search(rf'\b{count}\s+passed\b',log):errors.append(f'Expected count not found {ident}: {count}')
for row in read('qa-command-results.json'):
 if row.get('log') and not (ROOT/row['log']).exists():errors.append(f'Missing command log {row["id"]}')
result={'reports':len(numbered)+1,'routes':len(routes),'appGroupPairs':len({(r['app'],r['group']) for r in routes}),'carryoverEntries':len(ledger),'checkedJson':required,'errors':errors,'limits':['Link checks are local existence checks, not semantic acceptance','Ignored images and command logs remain local; portable indexes identify their paths']}
(E/'evidence-validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
raise SystemExit(bool(errors))
