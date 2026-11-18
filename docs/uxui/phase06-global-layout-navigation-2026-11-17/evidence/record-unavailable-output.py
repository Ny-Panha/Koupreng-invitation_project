"""Preserve an early failed command without inventing its absent stdout file."""
import json
from pathlib import Path
E=Path(__file__).resolve().parent;ROOT=E.parents[3]
p=E/'commands/final-after-capture.json';row=json.loads(p.read_text(encoding='utf-8-sig'))
name=row.get('log') or row.get('originalLogPath')
if name and not (ROOT/name).exists():
 row['originalLogPath']=name;row['log']=None
 row['outputAvailability']='NOT AVAILABLE — the early failed capture metadata survives, but the referenced stdout file is absent. No output reconstructed or successful result inferred.'
 row['evidenceOwner']='Frontend QA; retain this exit-1 gap and use the separate repaired/final capture records for delivered-source proof.'
p.write_text(json.dumps(row,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'id':row['id'],'exitCode':row['exitCode'],'outputAvailability':row.get('outputAvailability','AVAILABLE')}))
