"""Prepare the explicitly authorized development checkpoint; no Git push/delete.

Run from the repository root. Original Phase10 audit evidence is historical and
is never regenerated here. Filesystem cleanup uses separately reviewed native
PowerShell commands. No credentials or environment files enter the recovery zip.
"""
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import time
import zipfile

ROOT = Path(__file__).resolve().parents[3]
REPORT = Path(__file__).resolve().parent
EVIDENCE = REPORT / 'evidence'
RAW = ROOT / 'output/playwright/phase10-codex-2026-11-18'
TEMP = ROOT / 'output/ci-tools/phase10-publication-bundle-staging'
TOOLS = ROOT / 'output/ci-tools'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    (EVIDENCE/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def git(*args):
    return subprocess.check_output(['git',*args],cwd=ROOT).decode('utf-8').strip()

def prepare():
    if (EVIDENCE/'before-publication.json').exists():
        raise SystemExit('Publication baseline already exists; refusing overwrite')
    changed=set(git('diff','--name-only').splitlines())|set(git('ls-files','--others','--exclude-standard').splitlines())
    paths=[{'path':name,'bytes':(ROOT/name).stat().st_size,'sha256':sha(ROOT/name)}for name in sorted(changed)if(ROOT/name).is_file()]
    if any(not row['path'].startswith(('apps/frontend-user/','docs/uxui/'))for row in paths):
        raise SystemExit('Unexpected pending path outside reviewed frontend/docs scope')
    write('before-publication.json',{'time_utc':dt.datetime.now(dt.timezone.utc).isoformat(),'head':git('rev-parse','HEAD'),'origin':git('rev-parse','origin/main'),'status':git('status','--short','--untracked-files=all'),'files':paths,'authorization':'User explicitly requested temporary-data cleanup and push of important work to origin/main after the Phase10 audit. This supersedes the earlier no-stage/no-commit/no-push limitation for publication only.'})
    if TEMP.exists():
        raise SystemExit('Recovery staging already exists; refusing overwrite')
    selected=[]
    for name in ['baseline','codex-diffs','codex-new-files']:
        selected.extend(p for p in (RAW/name).rglob('*')if p.is_file())
    selected.extend(p for p in RAW.iterdir()if p.is_file()and p.suffix in ['.log','.json','.patch'])
    selected.extend(p for folder in RAW.iterdir()if folder.is_dir()and folder.name not in ['baseline','codex-diffs','codex-new-files']and not folder.name.endswith('traces')for p in folder.glob('*.json'))
    rows=[]
    for source in sorted(set(selected)):
        relative=source.relative_to(RAW)
        target=TEMP/relative
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(source,target)
        rows.append({'archive_path':relative.as_posix(),'bytes':source.stat().st_size,'sha256':sha(source)})
    write('recovery-file-manifest.json',{'restore_root':'output/playwright/phase10-codex-2026-11-18','files':rows,'excluded':'PNG/JPEG/video/traces remain in ignored local evidence; recovery zip includes baseline copies, Codex-only diffs, new-source snapshots, raw command logs and JSON records.'})
    edits=[]
    for name in ['apps/frontend-user/src/features/templates/components/templates.css','apps/frontend-user/src/features/templates/pages/BrowseTemplates.css']:
        path=ROOT/name
        before=path.read_bytes()
        ending=b'\r\n'if before.endswith(b'\r\n')else b'\n'
        after=before.rstrip(b'\r\n')+ending
        if after!=before:
            path.write_bytes(after)
            edits.append({'path':name,'before_sha256':hashlib.sha256(before).hexdigest(),'after_sha256':sha(path),'change':'Remove extra EOF blank lines only; all bytes before trailing line endings identical'})
    write('whitespace-only-cleanup.json',edits)
    print(json.dumps({'reviewed_paths':len(paths),'recovery_files':len(rows),'recovery_bytes':sum(row['bytes']for row in rows),'whitespace_only_files':len(edits)}))

def pack():
    scan=TOOLS/'phase10-recovery-secrets.json'
    if not scan.exists()or json.loads(scan.read_text(encoding='utf-8-sig')):
        raise SystemExit('A successful empty redacted recovery scan is required')
    rows=json.loads((EVIDENCE/'recovery-file-manifest.json').read_text(encoding='utf-8'))['files']
    archive=EVIDENCE/'phase10-text-recovery.zip'
    if archive.exists():
        raise SystemExit('Recovery archive already exists; refusing overwrite')
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6)as output:
        for row in rows:
            path=TEMP/row['archive_path']
            if sha(path)!=row['sha256']:raise RuntimeError('Recovery source drift: '+row['archive_path'])
            output.write(path,row['archive_path'])
    with zipfile.ZipFile(archive)as source:
        if source.testzip():raise RuntimeError('Recovery ZIP CRC failure')
        for row in rows:
            if hashlib.sha256(source.read(row['archive_path'])).hexdigest()!=row['sha256']:raise RuntimeError('Recovery ZIP hash mismatch')
    write('recovery-archive.json',{'path':archive.relative_to(ROOT).as_posix(),'sha256':sha(archive),'bytes':archive.stat().st_size,'files':len(rows),'all_entry_hashes_verified':True,'plaintext_gitleaks_report':'phase10-recovery-secrets.json: empty findings','audit_status':'PARTIALLY COMPLETE; this archive is continuity evidence, not production/native/legal certification'})
    print(json.dumps({'archive_bytes':archive.stat().st_size,'files_verified':len(rows),'sha256':sha(archive)}))

def canary():
    fixture=TOOLS/('phase10-secret-scan-boundaries-'+dt.datetime.now(dt.timezone.utc).strftime('%Y%m%d-%H%M%S-%f'))
    if fixture.exists():raise SystemExit('Canary directory exists; refusing overwrite')
    metadata=fixture/'docs/uxui/canary/evidence/hashes.json'
    metadata.parent.mkdir(parents=True,exist_ok=True)
    value=hashlib.sha256(b'fictional-gitleaks-boundary-canary-not-a-real-credential').hexdigest()
    metadata.write_text(json.dumps({'apps/frontend-user/src/auth/apiToken.js':value},indent=2)+'\n',encoding='utf-8')
    default=TOOLS/'phase10-gitleaks-default.toml'
    default.write_text('[extend]\nuseDefault = true\n',encoding='utf-8')
    scanner=str((TOOLS/'gitleaks.exe').resolve())
    def scan(name,config):
        report=TOOLS/(name+'.json')
        result=subprocess.run([scanner,'dir',str(fixture),'--config',str(config),'--redact','--no-banner','--no-color','--log-level','error','--report-format','json','--report-path',str(report)],cwd=ROOT,capture_output=True)
        if result.returncode not in [0,1]:raise RuntimeError('Canary scanner startup/config failure')
        findings=json.loads(report.read_text(encoding='utf-8-sig'))
        return result.returncode,findings
    control_code,control=scan('phase10-canary-default',default)
    metadata_code,allowed=scan('phase10-canary-metadata',ROOT/'.gitleaks.toml')
    # A credential key inside the same evidence path must still be detected.
    metadata.write_text(metadata.read_text(encoding='utf-8').rstrip()[:-1]+',\n  "api_key": "'+value+'"\n}\n',encoding='utf-8')
    app=fixture/'src/api.js';app.parent.mkdir(parents=True)
    app.write_text('const api_key = "'+value+'";\n',encoding='utf-8')
    secret_code,positive=scan('phase10-canary-positive',ROOT/'.gitleaks.toml')
    result={'default_metadata_findings':len(control),'configured_metadata_findings':len(allowed),'planted_fictional_credential_findings':len(positive),'positive_locations':[Path(row['File']).relative_to(fixture).as_posix()for row in positive],'all_default_detectors_retained':True,'passed':control_code==1 and len(control)==1 and metadata_code==0 and not allowed and secret_code==1 and len(positive)==2}
    write('secret-scan-boundaries.json',result)
    print(json.dumps(result))
    if not result['passed']:raise SystemExit('Secret scanner boundary verification failed')

def run(label,command):
    TOOLS.mkdir(exist_ok=True,parents=True)
    log=TOOLS/(label+'.log')
    if log.exists():raise SystemExit('Refusing log overwrite: '+label)
    started=dt.datetime.now(dt.timezone.utc).isoformat();clock=time.monotonic()
    resolved=list(command)
    if (ROOT/command[0]).is_file():resolved[0]=str((ROOT/command[0]).resolve())
    with log.open('wb')as output:
        result=subprocess.run(resolved,cwd=ROOT,stdout=output,stderr=subprocess.STDOUT)
    row={'id':label,'command':subprocess.list2cmdline(command),'started_utc':started,'finished_utc':dt.datetime.now(dt.timezone.utc).isoformat(),'seconds':round(time.monotonic()-clock,2),'exit_code':result.returncode,'local_log':log.relative_to(ROOT).as_posix(),'log_sha256':sha(log)}
    manifest=EVIDENCE/'publication-checks.json'
    old=json.loads(manifest.read_text(encoding='utf-8'))if manifest.exists()else[]
    write(manifest.name,old+[row])
    print(json.dumps(row))
    print(log.read_text(encoding='utf-8',errors='replace')[-1600:])
    return result.returncode

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('action',choices=['prepare','pack','canary','run']);parser.add_argument('label',nargs='?');parser.add_argument('command',nargs=argparse.REMAINDER)
    args=parser.parse_args()
    if args.action=='prepare':prepare()
    elif args.action=='pack':pack()
    elif args.action=='canary':canary()
    else:raise SystemExit(run(args.label,args.command))
