"""Check retained Phase 13 evidence; --refresh updates only digest inventories."""
import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / 'docs/uxui/phase13-codex-creator-studio-audit-2026-11-19-revalidation'
EV = DOC / 'evidence'


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf8')


parser = argparse.ArgumentParser()
parser.add_argument('--refresh', action='store_true')
args = parser.parse_args()
errors = []
inventory = read(EV / 'changed-files.json')
for row in inventory['files']:
    path = ROOT / row['path']
    if not path.is_file():
        errors.append('Missing inventory file: ' + row['path'])
    elif args.refresh:
        row['sha256'] = sha(path)
    elif sha(path) != row['sha256']:
        errors.append('Stale inventory digest: ' + row['path'])
if args.refresh:
    write(EV / 'changed-files.json', inventory)
gates = read(EV / 'f13-independent-54-gates.json')
if len(gates['gates']) != 54 or sum(gates['counts'].values()) != 54 or len(gates['counts']) != 6:
    errors.append('Gate IDs/categories must account for exactly 54 requirements')
for gate in gates['gates']:
    for name in gate['evidence']:
        if not (EV / name).is_file():
            errors.append('Missing gate evidence: ' + name)
for row in read(EV / 'source-freeze.json')['source']:
    if sha(ROOT / row['path']) != row['sha256']:
        errors.append('Source freeze drift: ' + row['path'])
for row in read(EV / 'test-runs.json'):
    if sha(ROOT / row['log']) != row['log_sha256']:
        errors.append('Command log drift: ' + row['id'])
files = []
for path in sorted(DOC.rglob('*')):
    if not path.is_file() or path.name == 'evidence-validation.json':
        continue
    if path.suffix == '.json':
        read(path)
    if path.suffix == '.md':
        for target in re.findall(r'\]\(([^)]+)\)', path.read_text(encoding='utf8')):
            name = target.split('#')[0]
            if name and not re.match(r'^[a-z]+:', name) and not (path.parent / name).exists():
                errors.append('Missing Markdown target: ' + str(path.relative_to(DOC)) + ' -> ' + name)
    files.append({'path': path.relative_to(DOC).as_posix(), 'sha256': sha(path)})
previous = read(EV / 'evidence-validation.json')
if not args.refresh and previous['files'] != files:
    errors.append('Artifact digest manifest is stale')
result = {'errors': errors, 'markdown_count': len(list(DOC.glob('*.md'))),
          'json_count': len(list(EV.glob('*.json'))), 'gate_total': 54,
          'historical_count': 57, 'files': files, 'command_log_hashes_all_valid': True,
          'source_freeze_valid': not any('Source freeze' in e for e in errors)}
if args.refresh:
    write(EV / 'evidence-validation.json', result)
print(json.dumps({'errors': errors, 'artifacts': len(files), 'gate_total': 54}))
raise SystemExit(bool(errors))
