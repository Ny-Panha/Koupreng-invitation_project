"""Phase 08 local evidence runner. Never stages, restores or contacts Git remotes."""
import datetime, hashlib, json, os, pathlib, re, shutil, subprocess, sys, threading, time

ROOT = pathlib.Path(__file__).resolve().parents[4]
HERE = pathlib.Path(__file__).resolve().parent
LOCAL = ROOT / 'output/phase08-codex-2026-11-18'
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT).decode('utf-8', errors='replace').rstrip('\r\n')
def dump(name, data):
    (HERE / name).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def fingerprint():
    paths = sorted(set(git('ls-files').splitlines() + git('ls-files','--others','--exclude-standard').splitlines()))
    return {p: sha(ROOT/p) for p in paths if (ROOT/p).is_file() and not p.startswith('docs/uxui/phase08-codex-')}
def redact(text):
    text = re.sub(r'\x1b\[[0-9;]*m', '', text)
    text = re.sub(r'(Bearer\s+)[A-Za-z0-9._-]+', r'\1[REDACTED]', text)
    text = re.sub(r'([?&]token=)[^\s&"<>]+', r'\1[REDACTED]', text)
    text = re.sub(r'(value=")[^"]*"', r'\1[REDACTED]"', text)
    text = re.sub(r'oldsecret123|newsecret123|fictional-reset|sample-token(?:-123)?|secret-token-xyz', '[SYNTHETIC REDACTED]', text)
    return text
if sys.argv[1] == 'baseline':
    assert not (HERE/'git-worktree-baseline.json').exists(), 'Immutable baseline already exists'
    status = git('status','--porcelain=v1','-uall')
    files = fingerprint()
    dirty = [line[3:] for line in status.splitlines()]
    for path in dirty:
        p = ROOT/path
        if p.is_file() and p.suffix in {'.jsx','.js','.css','.html','.md','.json','.py','.mjs','.cjs'}:
            target = LOCAL/'original'/path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(p, target)
    dump('git-worktree-baseline.json', dict(time=datetime.datetime.now(datetime.timezone.utc).isoformat(), branch=git('branch','--show-current'), head=git('rev-parse','HEAD'), origin=git('rev-parse','origin/main'), ahead=git('rev-list','--count','origin/main..HEAD'), status=status, log=git('log','-20','--format=%h %s'), trackedDiff=git('diff','--stat'), files=files))
    print(json.dumps(dict(files=len(files), dirty=len(dirty), head=git('rev-parse','HEAD'), ahead=git('rev-list','--count','origin/main..HEAD'))))
elif sys.argv[1] == 'run':
    label, command = sys.argv[2], sys.argv[3:]
    if '/' in command[0] and (ROOT/command[0]).is_file(): command[0] = str(ROOT/command[0])
    if command[0] in {'npm','npx'}: command[0] += '.cmd' if os.name == 'nt' else ''
    start = time.time()
    before = fingerprint()
    try:
        if 'default' in label:
            from types import SimpleNamespace
            metrics=[]
            finished=threading.Event()
            def sample_resources():
                while not finished.is_set():
                    sample={'time':datetime.datetime.now(datetime.timezone.utc).isoformat()}
                    try:
                        probe=subprocess.run(['powershell','-NoProfile','-Command',"$p=Get-Process -Name node,chrome,firefox,MiniBrowser -ErrorAction SilentlyContinue; @{processCount=@($p).Count; workingSetBytes=($p|Measure-Object WorkingSet64 -Sum).Sum; cpuSecondsCumulative=($p|Measure-Object CPU -Sum).Sum}|ConvertTo-Json -Compress"],capture_output=True,timeout=8)
                        sample.update(json.loads(probe.stdout.decode('utf-8-sig')))
                    except Exception as error: sample['probeError']=str(error)
                    metrics.append(sample)
                    finished.wait(8)
            sampler=threading.Thread(target=sample_resources,daemon=True)
            process=subprocess.Popen(command,cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
            sampler.start()
            output_bytes=process.communicate()[0]
            finished.set();sampler.join(timeout=10)
            dump(label+'-resources.json',{'scope':'Named Node/browser process aggregates while command is running; may include pre-existing processes; cumulative CPU is not utilization.','samples':metrics})
            result=SimpleNamespace(returncode=process.returncode,stdout=output_bytes)
        else:
            result = subprocess.run(command, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    except OSError as error:
        from types import SimpleNamespace
        result = SimpleNamespace(returncode=127, stdout=str(error).encode())
    output = redact(result.stdout.decode('utf-8', errors='replace'))
    LOCAL.mkdir(parents=True, exist_ok=True)
    log = LOCAL/(label+'.log')
    log.write_text(output, encoding='utf-8')
    if 'test:e2e' in command:
        artifacts = ROOT/'apps/frontend-user/test-results'
        if artifacts.exists(): shutil.copytree(artifacts, LOCAL/(label+'-artifacts'), dirs_exist_ok=True)
    records = json.loads((HERE/'test-command-results.json').read_text(encoding='utf-8')) if (HERE/'test-command-results.json').exists() else []
    record = dict(id=label, command=subprocess.list2cmdline(command), environment={key:os.environ[key] for key in ['VITE_PUBLIC_APP_URL','VITE_USER_APP_URL','BATCH11_UPDATE_ROUTES','CI'] if key in os.environ}, exitCode=result.returncode, seconds=round(time.time()-start,2), time=datetime.datetime.now(datetime.timezone.utc).isoformat(), head=git('rev-parse','HEAD'), sourceFingerprint=hashlib.sha256(json.dumps(before,sort_keys=True).encode()).hexdigest(), log=str(log.relative_to(ROOT)).replace('\\','/'), tail=output[-4500:])
    record['buildHTMLHashes']={app:sha(ROOT/f'apps/frontend-{app}/dist/index.html') for app in ['user','admin'] if (ROOT/f'apps/frontend-{app}/dist/index.html').exists()}
    (HERE/'runs').mkdir(exist_ok=True)
    (HERE/'runs'/(label+'.json')).write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    records.append(record)
    dump('test-command-results.json', records)
    print(json.dumps({**record, 'tail': output[-1200:]}, ensure_ascii=False))
    sys.exit(result.returncode)
