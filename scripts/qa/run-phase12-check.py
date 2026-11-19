"""Run a reviewed Phase 12 command with its real exit code and durable local evidence."""
import datetime
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time

root = Path(__file__).resolve().parents[2]
name, *command = sys.argv[1:]
if not name.replace('-', '').isalnum() or not command:
    raise SystemExit('Usage: run-phase12-check.py <id> <command> [args...]')
output = root / 'output/phase12-codex/checks'
output.mkdir(parents=True, exist_ok=True)
log = output / (name + '.log')
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
tick = time.monotonic()
with log.open('wb') as stream:
    result = subprocess.run(['cmd.exe', '/d', '/c', *command], cwd=root, stdout=stream, stderr=subprocess.STDOUT, check=False)
record = {'id': name, 'command': subprocess.list2cmdline(command), 'cwd': '.', 'started_utc': started,
          'seconds': round(time.monotonic()-tick, 3), 'exit_code': result.returncode,
          'log': log.relative_to(root).as_posix(), 'log_sha256': hashlib.sha256(log.read_bytes()).hexdigest()}
(output / (name+'.json')).write_text(json.dumps(record, indent=2)+'\n', encoding='utf8')
print(json.dumps(record))
print('\n'.join(log.read_text(encoding='utf8', errors='replace').splitlines()[-14:]))
raise SystemExit(result.returncode)
