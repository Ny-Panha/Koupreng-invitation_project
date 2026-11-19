"""Create review-only patches. Never applies, restores or deletes any work."""
from pathlib import Path
import json, difflib, subprocess, hashlib, shutil
ROOT=Path(__file__).resolve().parents[4]
OUT=ROOT/'output/phase07-codex-2026-11-18'
EV=Path(__file__).resolve().parent

def git(args): return subprocess.check_output(['git',*args],cwd=ROOT)
for original,new in [('run-command.py','run-command.py'),('initial-git.txt','git-initial.txt'),('starting-inventory.json','starting-inventory.json')]:
    shutil.copyfile(OUT/original,EV/new)
gemini=(OUT/'gemini-starting.patch').read_text(encoding='utf-8')
for name in ['apps/frontend-user/src/features/marketing/VenuesFeature.css','apps/frontend-user/src/features/marketing/Phase07Marketing.test.jsx']:
    data=(OUT/'starting-files'/name).read_text(encoding='utf-8')
    gemini+='diff --git a/'+name+' b/'+name+'\nnew file mode 100644\n'+''.join(difflib.unified_diff([],data.splitlines(keepends=True),fromfile='/dev/null',tofile='b/'+name))
(EV/'gemini-starting-sanitized.patch').write_bytes(gemini.encode('utf-8'))
items=[];patch=''
paths=git(['diff','--name-only','-z']).decode().split('\0')+git(['ls-files','--others','--exclude-standard','-z','apps/frontend-user']).decode().split('\0')
for name in sorted(set(filter(None,paths))):
    p=ROOT/name
    if not name.startswith('apps/frontend-user/') or not p.is_file():continue
    now=p.read_bytes();start=OUT/'starting-files'/name
    if start.exists():before=start.read_bytes();owner='GEMINI START; CODEX MODIFIED' if before!=now else 'GEMINI PRESERVED'
    else:
        proc=subprocess.run(['git','show','HEAD:'+name],cwd=ROOT,capture_output=True)
        before=proc.stdout if proc.returncode==0 else b''
        owner='CODEX MODIFIED EXISTING' if proc.returncode==0 else 'CODEX NEW'
    items.append({'path':name,'owner':owner,'startingSha256':hashlib.sha256(before).hexdigest() if before else None,'currentSha256':hashlib.sha256(now).hexdigest(),'changedByCodex':before!=now})
    if before!=now:
        patch+='diff --git a/'+name+' b/'+name+'\n'
        if not before:patch+='new file mode 100644\n'
        patch+=''.join(difflib.unified_diff(before.decode('utf-8').replace('\r\n','\n').splitlines(keepends=True),now.decode('utf-8').replace('\r\n','\n').splitlines(keepends=True),fromfile='a/'+name if before else '/dev/null',tofile='b/'+name))
(EV/'codex-only.patch').write_bytes(patch.encode('utf-8'));(OUT/'codex-only.patch').write_bytes(patch.encode('utf-8'))
(EV/'attributed-changes.json').write_text(json.dumps({'sourceSha':git(['rev-parse','HEAD']).decode().strip(),'productionAndTests':items,'documentation':'Entire new phase07-codex-marketing-audit-2026-11-18 directory is Codex-authored; Gemini report byte hashes preserved.','localOnlyConfiguration':'.git/info/exclude adds only the owned output evidence subtree; no tracked ignore change.'},indent=2),encoding='utf-8')
print(json.dumps({'attributedAppPaths':len(items),'codexPatchBytes':len(patch.encode()),'geminiPatchBytes':len(gemini.encode())}))
