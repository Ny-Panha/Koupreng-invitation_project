"""Package screenshot derivatives after browser capture; never edits production art."""
from pathlib import Path
import hashlib
import json
import shutil
import os
from PIL import Image

root = Path(__file__).resolve().parents[2]
relative = os.environ.get('ROYAL_EVIDENCE_DIR', 'docs/design/royal-garden-visual-repair/final-steering')
evidence = root / relative / 'evidence'
raw = root / '.cache/royal-garden-ui-repair/raw-screenshots' / Path(relative).name
raw.mkdir(parents=True, exist_ok=True)
records = []
previous_file = evidence / 'screenshot-manifest.json'
previous = {item['file']: item for item in json.loads(previous_file.read_text(encoding='utf-8'))['images']} if previous_file.exists() else {}
for path in sorted(evidence.glob('*.png')):
    if path.name in previous and hashlib.sha256(path.read_bytes()).hexdigest() == previous[path.name]['deliveredSha256']:
        records.append(previous[path.name])
        continue
    original = raw / path.name
    shutil.copyfile(path, original)
    with Image.open(original) as source:
        im = source.convert('RGB')
        dimensions = im.size
        if path.name.startswith('mobile-chromium-'):
            # Captured at Pixel 7 DPR 2.75. Resize only AFTER capture so the
            # browser cannot switch srcset while taking the screenshot.
            im = im.resize(tuple(round(size / 2.75) for size in im.size), Image.Resampling.LANCZOS)
        im.save(path, optimize=True)
        records.append({'file': path.name, 'capturedPixels': dimensions, 'deliveredPixels': im.size,
                        'rawSha256': hashlib.sha256(original.read_bytes()).hexdigest(),
                        'deliveredSha256': hashlib.sha256(path.read_bytes()).hexdigest()})
(evidence / 'screenshot-manifest.json').write_text(json.dumps({
    'processing': 'Actual browser captures. Mobile PNGs are post-capture CSS-resolution delivery derivatives. Raw DPR originals remain in the ignored local cache; desktop PNGs retain their captured dimensions.',
    'images': records,
}, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'screenshots': len(records), 'deliveredBytes': sum(path.stat().st_size for path in evidence.glob('*.png'))}))
