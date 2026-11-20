import os
import json
import shutil
import hashlib

BASE_DIR = os.path.abspath("docs/uxui/phase14-codex-media-studio-audit-2026-11-20")
EVIDENCE_DIR = os.path.join(BASE_DIR, "evidence")
VISUALS_DIR = os.path.join(BASE_DIR, "visuals")

os.makedirs(EVIDENCE_DIR, exist_ok=True)
os.makedirs(VISUALS_DIR, exist_ok=True)

# Copy visuals from phase14-1
src_visuals = os.path.abspath("docs/uxui/phase14-1-gemini-media-studio-2026-11-20/visuals")
if os.path.exists(src_visuals):
    for f in os.listdir(src_visuals):
        if f.endswith(".png"):
            shutil.copy2(os.path.join(src_visuals, f), os.path.join(VISUALS_DIR, f))
print(f"Copied visuals to {VISUALS_DIR}")
