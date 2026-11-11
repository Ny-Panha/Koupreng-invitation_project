"""Compare the deterministic Phase 03 viewport captures without rewriting images."""
import json
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[4]
BASE = ROOT / "output/playwright/uxui-phase03-2026-11-11"
before = json.loads((BASE / "before/manifest.json").read_text(encoding="utf-8"))
after = json.loads((BASE / "after/manifest.json").read_text(encoding="utf-8"))
rows = []
for item in after:
    name = f"{item.get('key') or item['group']}-{item['width']}-{item['mode']}.png"
    with Image.open(BASE / "before" / name) as b, Image.open(BASE / "after" / name) as a:
        b, a = b.convert("RGB"), a.convert("RGB")
        diff = ImageChops.difference(a, b)
        changed = sum(1 for pixel in diff.get_flattened_data() if pixel != (0, 0, 0))
        rows.append({"name": name, "changedPixels": changed,
                     "totalPixels": a.width * a.height,
                     "changedPercent": round(changed * 100 / (a.width * a.height), 3),
                     "bounds": diff.getbbox()})
assert len(before) == len(after) == len(rows) == 52
result = {"count": len(rows), "screens": rows}
(Path(__file__).parent / "capture-diff.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
for row in rows:
    if row["name"].startswith(("khmer-", "royal-", "silk-", "template-", "the-digital-", "emerald-", "withjoy-", "bliss-", "event-", "koupreng-")):
        print(f"{row['name']}: {row['changedPercent']}% {row['bounds']}")
