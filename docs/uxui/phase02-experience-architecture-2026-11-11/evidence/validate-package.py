"""Check Phase 02 package traceability and local Markdown links."""
import re
from pathlib import Path
from urllib.parse import unquote

root = Path(__file__).resolve().parent.parent
files = sorted(p for p in root.glob('*.md') if p.is_file())
assert len(files) == 17, f'Expected 17 top-level deliverables, got {len(files)}'
routes = (root / '04-all-routes-to-ia-mapping.md').read_text(encoding='utf-8')
rows = re.findall(r'^\| SCOPE-\d{3} \|', routes, re.M)
assert len(rows) == 135, len(rows)
assert len(set(rows)) == 135
assert '62/62' in routes
groups = (root / 'evidence/group-ledger.md').read_text(encoding='utf-8')
assert '**Total:** 62/62 groups, 135/135 leaves.' in groups
surfaces = (root / 'evidence/feature-surface-ledger.md').read_text(encoding='utf-8')
assert len(re.findall(r'^\| `[a-z][a-z-]+` \|', surfaces, re.M)) == 62
renderers = (root / '08-template-experience-tiers.md').read_text(encoding='utf-8')
assert len(re.findall(r'^\| `(?:\w+Layout|CanvaKhmerWeddingTemplate)` \|', renderers, re.M)) == 10
assert '38/38 static aliases' in renderers
journeys = (root / '05-ten-user-journey-blueprints.md').read_text(encoding='utf-8')
assert len(re.findall(r'^## J-\d{2} —', journeys, re.M)) == 10
assert journeys.count('```mermaid') == 11
bad = []
for p in [*files, *(root / 'evidence').glob('*.md')]:
    data = p.read_text(encoding='utf-8')
    for target in re.findall(r'\[[^\]]+\]\(([^)]+)\)', data):
        if target.startswith(('http:', 'https:', '#')): continue
        path = unquote(target.split('#', 1)[0])
        if path and not (p.parent / path).exists(): bad.append((p.name, target))
assert not bad, bad
print(f'PASS: {len(files)} deliverables, 135/135 routes, 62/62 groups, 10/10 families, 10/10 journeys, 11 Mermaid diagrams, all local links valid')
