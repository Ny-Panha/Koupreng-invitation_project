import os
import json
import hashlib

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

# Compute SHAs for touched files
files_to_hash = [
    'apps/frontend-user/src/features/invitations/InvitationMediaManager.jsx',
    'apps/frontend-user/src/features/invitations/MediaLibrary.css',
    'apps/frontend-user/src/features/invitations/mediaLibraryModel.js',
    'apps/frontend-user/src/shared/i18n/workspaceMessages.js',
    'apps/frontend-user/src/features/invitations/InvitationMediaNegativeScenarios.test.jsx',
    'apps/frontend-user/playwright.phase14-1.config.js',
    'apps/frontend-user/tests/e2e/phase14-1-media-studio.spec.js',
]

file_hashes = {}
for rel_path in files_to_hash:
    full_p = os.path.join(BASE_DIR, rel_path.replace('/', os.sep))
    file_hashes[rel_path] = {
        'sha256': sha256_file(full_p),
        'size': os.path.getsize(full_p) if os.path.exists(full_p) else 0
    }

# Compute SHAs for visuals
visual_files = sorted(os.listdir(VISUALS_DIR))
visual_manifest = []
for v in visual_files:
    v_path = os.path.join(VISUALS_DIR, v)
    if os.path.isfile(v_path):
        visual_manifest.append({
            'file': f'visuals/{v}',
            'filename': v,
            'sha256': sha256_file(v_path),
            'size': os.path.getsize(v_path),
            'rights': 'synthetic/test/owner-approved',
            'browser': 'Chromium 131.0.6778.33 (Playwright 1.50.1)'
        })

print(f"Computed hashes for {len(file_hashes)} source/test files and {len(visual_manifest)} visual files.")
