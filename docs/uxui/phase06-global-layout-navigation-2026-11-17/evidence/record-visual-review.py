import hashlib,json,subprocess
from datetime import datetime,timezone
from pathlib import Path
E=Path(__file__).resolve().parent;ROOT=E.parents[3]
base='output/playwright/uxui-phase06-2026-11-17/'
items=[
 ('after/auth-login-390-light.png','Core login labels, fields, language/theme controls and primary submit are painted and readable. Existing provider-unavailable fixture text/chat overlay is not full error-copy or native-linguistic certification.'),
 ('after/admin-template-edit-390-light.png','Five section names and Edit/Preview controls are painted in the retained authored Studio appearance; section tabs wrap without losing their labels.'),
 ('before/rsvp-390-light.png','Baseline RSVP cards and count-context paragraph are painted; used to compare the current breadcrumb-induced vertical placement.'),
 ('after/rsvp-390-light.png','New event breadcrumb is painted; existing RSVP cards, values and count-context paragraph remain visible. This static image does not certify LCP timing.'),
 ('renderer-review/silk-heritage-1440-no-preference-loaded-headed-ready.png','Cream copy, burgundy cover and Open invitation label are visibly painted. The cover scrolls and the action is near the lower edge; normal unforced scrolling/click activation is separately recorded. No claim that all content fits above the fold.'),
 ('renderer-review/emerald-canva-luxe-wedding-320-no-preference-loaded-headed-ready.png','Gold opening action, Khmer/OPEN label and emerald curtain are visibly painted at 320px; normal pointer/touch and settled stages are recorded separately.'),
]
rows=[]
for relative,verdict in items:
 p=ROOT/(base+relative)
 rows.append({'screenshot':base+relative,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'verdict':verdict,'evidenceLevel':'VISUALLY INSPECTED — bounded desktop capture'})
result={'recordedAt':datetime.now(timezone.utc).isoformat(),'sourceSha':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'baselineSha':'4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4','rows':rows,'limits':['Only these actually viewed images receive a manual image verdict','Before images use the baseline SHA; after/headed images use the final recorded app build','Not a native Khmer, physical-device, assistive-technology or universal artwork parity certificate']}
(E/'visual-review.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'visuallyInspectedImages':len(rows),'sourceSha':result['sourceSha']}))
