import os
import json
import hashlib
from datetime import datetime, timezone

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DOCS_DIR = os.path.join(BASE_DIR, 'docs', 'uxui', 'phase14-1-gemini-media-studio-2026-11-20')
EVIDENCE_DIR = os.path.join(DOCS_DIR, 'evidence')
VISUALS_DIR = os.path.join(DOCS_DIR, 'visuals')

os.makedirs(EVIDENCE_DIR, exist_ok=True)
os.makedirs(VISUALS_DIR, exist_ok=True)

def sha256_file(filepath):
    if not os.path.exists(filepath):
        return None
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

timestamp_now = "2026-11-20T13:42:00+07:00"

print(f"Generating Phase 14.1 documentation and evidence in {DOCS_DIR}...")
