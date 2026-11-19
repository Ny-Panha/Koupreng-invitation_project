"""Read-only final Git snapshot; does not stage, commit, restore or fetch."""
from pathlib import Path
import subprocess, json

ROOT = Path(__file__).resolve().parents[4]
EV = Path(__file__).resolve().parent
commands = [
    ['git','branch','--show-current'], ['git','rev-parse','HEAD'],
    ['git','rev-parse','origin/main'], ['git','rev-list','--count','origin/main..HEAD'],
    ['git','status','--porcelain=v1','-uall'], ['git','status','-sb'],
    ['git','diff','--stat'], ['git','diff','--name-status'],
    ['git','diff','--cached','--stat'], ['git','ls-files','--others','--exclude-standard'],
]
rows=[]
for command in commands:
    result=subprocess.run(command,cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace')
    rows.append({'command':subprocess.list2cmdline(command),'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
(EV/'git-final.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(EV/'git-final.txt').write_text('\n'.join('$ '+row['command']+'\n'+row['stdout']+row['stderr'] for row in rows),encoding='utf-8')
status=rows[4]['stdout'].splitlines()
print(json.dumps({'branch':rows[0]['stdout'].strip(),'HEAD':rows[1]['stdout'].strip(),'origin':rows[2]['stdout'].strip(),'ahead':rows[3]['stdout'].strip(),'trackedModified':sum(row.startswith(' M') for row in status),'untrackedAppPaths':sum(row.startswith('?? apps/frontend-user/') for row in status),'untrackedDocumentationPaths':sum(row.startswith('?? docs/') for row in status),'stagedDiff':rows[8]['stdout'].strip()},ensure_ascii=False))
raise SystemExit(any(row['exitCode'] for row in rows))
