"""Check local Markdown links in the Phase 05 report directory."""

import re
from pathlib import Path
from urllib.parse import unquote

BASE = Path(__file__).resolve().parent.parent
missing = []
checked = 0
for report in BASE.glob("*.md"):
    text = report.read_text(encoding="utf-8")
    for raw in re.findall(r"(?<!!)\[[^]]+\]\(([^)]+)\)", text):
        target = unquote(raw.split("#", 1)[0].strip())
        if not target or "://" in target or target.startswith("mailto:"):
            continue
        checked += 1
        if not (report.parent / target).exists():
            missing.append(f"{report.name}: {raw}")
print(f"Checked {checked} local report links; {len(missing)} missing")
for row in missing:
    print(row)
raise SystemExit(bool(missing))
