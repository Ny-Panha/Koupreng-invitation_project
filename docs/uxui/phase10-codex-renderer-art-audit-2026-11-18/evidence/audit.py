"""Reproducible, non-destructive Phase 10 evidence collector. Run from repo root."""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import time

ROOT = Path(__file__).resolve().parents[4]
EVIDENCE = Path(__file__).resolve().parent
RAW = ROOT / 'output/playwright/phase10-codex-2026-11-18'

def write(name, value):
    (EVIDENCE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT).decode('utf-8', errors='replace').strip()

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def baseline():
    target = EVIDENCE / 'git-baseline-and-attribution.json'
    if target.exists():
        raise SystemExit('Baseline already exists; refusing overwrite')
    RAW.mkdir(parents=True, exist_ok=True)
    paths = set(git('diff', '--name-only').splitlines()) | set(git('diff', '--cached', '--name-only').splitlines()) | set(git('ls-files', '--others', '--exclude-standard').splitlines())
    rows = []
    for name in sorted(paths):
        path = ROOT / name
        if not path.is_file() or name.startswith(str(EVIDENCE.relative_to(ROOT)).replace('\\', '/')):
            continue
        dest = RAW / 'baseline' / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, dest)
        rows.append({'path': name, 'sha256': sha(path), 'bytes': path.stat().st_size, 'snapshot': dest.relative_to(ROOT).as_posix(), 'attribution': 'inherited; see source-phase ledger, not solely attributable from Git'})
    commands = [['status', '--short', '--untracked-files=all'], ['branch', '--show-current'], ['rev-parse', 'HEAD'], ['rev-parse', 'origin/main'], ['log', '--oneline', 'origin/main..HEAD'], ['diff', '--name-status'], ['diff', '--stat'], ['diff', '--check']]
    outputs = []
    for args in commands:
        run = subprocess.run(['git', *args], cwd=ROOT, capture_output=True)
        outputs.append({'command': 'git ' + ' '.join(args), 'exit_code': run.returncode, 'stdout': run.stdout.decode('utf-8', errors='replace'), 'stderr': run.stderr.decode('utf-8', errors='replace')})
    (RAW / 'baseline-working-tree.patch').write_bytes(subprocess.check_output(['git', 'diff', '--binary'], cwd=ROOT))
    write('git-baseline-and-attribution.json', {'created': dt.datetime.now(dt.timezone.utc).isoformat(), 'branch': git('branch', '--show-current'), 'head': git('rev-parse', 'HEAD'), 'origin': git('rev-parse', 'origin/main'), 'ahead': int(git('rev-list', '--count', 'origin/main..HEAD')), 'commands': outputs, 'files': rows, 'fingerprint': hashlib.sha256(json.dumps(rows, sort_keys=True).encode()).hexdigest()})
    write('source-preservation-hashes.json', {'phase': 'before', 'files': rows})
    print(f'Preserved {len(rows)} dirty/untracked files in {RAW}')

def run_command(label, command):
    RAW.mkdir(parents=True, exist_ok=True)
    start = dt.datetime.now(dt.timezone.utc).isoformat()
    t = time.monotonic()
    log = RAW / (label + '.log')
    build_manifest = None
    if command[-2:] == ['run', 'build']:
        app = command[command.index('--prefix') + 1]
        sources = {p.relative_to(ROOT).as_posix(): sha(p) for p in (ROOT/app/'src').rglob('*') if p.is_file()}
        sources[app+'/package.json'] = sha(ROOT/app/'package.json')
        build_manifest = {'command_id':label,'head':git('rev-parse','HEAD'),'source_hashes':sources,'source_fingerprint':hashlib.sha256(json.dumps(sources,sort_keys=True).encode()).hexdigest()}
    with log.open('wb') as output:
        proc = subprocess.run(command, cwd=ROOT, stdout=output, stderr=subprocess.STDOUT, shell=False)
    if build_manifest and proc.returncode == 0:
        app = command[command.index('--prefix') + 1]
        build_manifest['emitted_hashes'] = {p.relative_to(ROOT).as_posix():sha(p) for p in (ROOT/app/'dist').rglob('*') if p.is_file()}
        (RAW/(label+'-source-manifest.json')).write_text(json.dumps(build_manifest,indent=2),encoding='utf-8')
        if app.endswith('frontend-user'):
            (RAW/'current-build-source.json').write_text(json.dumps(build_manifest,indent=2),encoding='utf-8')
    row = {'id': label, 'command': subprocess.list2cmdline(command), 'started_utc': start, 'finished_utc': dt.datetime.now(dt.timezone.utc).isoformat(), 'seconds': round(time.monotonic() - t, 2), 'exit_code': proc.returncode, 'log': log.relative_to(ROOT).as_posix(), 'head': git('rev-parse', 'HEAD'), 'log_sha256': sha(log)}
    record = EVIDENCE / 'test-command-results.json'
    existing = json.loads(record.read_text(encoding='utf-8')) if record.exists() else []
    existing.append(row)
    write(record.name, existing)
    print(json.dumps(row))
    print(log.read_text(encoding='utf-8', errors='replace')[-4500:])
    return proc.returncode

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['baseline', 'run'])
    parser.add_argument('label', nargs='?')
    parser.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if args.action == 'baseline':
        baseline()
    else:
        raise SystemExit(run_command(args.label, args.command))
