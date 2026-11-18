import json
from pathlib import Path
base = Path(__file__).resolve().parent
ledger = base / 'qa-command-results.json'
def records(value):
    if isinstance(value, list):
        for item in value:
            yield from records(item)
    elif isinstance(value, dict):
        if 'command' in value and 'id' in value:
            yield value
        elif 'value' in value:
            yield from records(value['value'])
        elif 'Value' in value:
            yield from records(value['Value'])
all_records = list(records(json.loads(ledger.read_text(encoding='utf-8-sig')))) if ledger.exists() else []
for file in (base / 'commands').glob('*.json'):
    all_records.extend(records(json.loads(file.read_text(encoding='utf-8-sig'))))
unique = {row['id']: row for row in all_records}
ledger.write_text(json.dumps(sorted(unique.values(), key=lambda r: r.get('startedAt') or r.get('logLastWriteAt') or r['id']), indent=2) + '\n', encoding='utf-8')
