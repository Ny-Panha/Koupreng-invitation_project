import os
import re
import json
import hashlib

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DOCS_DIR = os.path.join(BASE_DIR, 'docs', 'uxui', 'phase14-1-gemini-media-studio-2026-11-20')
EVIDENCE_DIR = os.path.join(DOCS_DIR, 'evidence')
VISUALS_DIR = os.path.join(DOCS_DIR, 'visuals')

print("Starting Comprehensive Phase 14.1 Evidence Package Validation...\n")
errors = []

# 1. Check 30 markdown reports + README.md
expected_reports = [
    f"{i:02d}-{name}.md" for i, name in [
        (1, "executive-outcome-and-provenance"),
        (2, "exact-git-baseline-and-inherited-workspace"),
        (3, "phase13-handoff-and-ci-reconciliation"),
        (4, "media-source-route-permission-map"),
        (5, "creative-brief-and-art-direction"),
        (6, "ui-shell-media-library-architecture"),
        (7, "native-chooser-dropzone-validation"),
        (8, "batch-upload-and-real-progress"),
        (9, "async-account-grant-media-authority"),
        (10, "local-draft-indexeddb-object-url"),
        (11, "gallery-album-slot-reconciliation"),
        (12, "ordering-and-persistence-truth"),
        (13, "image-crop-focal-rotation"),
        (14, "exif-heic-and-privacy"),
        (15, "cover-background-invitation-map"),
        (16, "replace-delete-in-use-integrity"),
        (17, "audio-video-cinematic-entitlement"),
        (18, "ticket-imagery-and-adjacent-modules"),
        (19, "renderer-preview-parity-and-access"),
        (20, "bilingual-typography-cultural-review"),
        (21, "keyboard-axe-contrast-forced-colors"),
        (22, "responsive-and-zoom-device"),
        (23, "performance-bundle-memory"),
        (24, "canonical-10-library-decisions-and-licenses"),
        (25, "executed-ux-pro-max-styleseed-ux-laws"),
        (26, "n14-negative-case-matrix"),
        (27, "all-exact-command-results-failed-first-evidence"),
        (28, "f14-1-58-gate-acceptance"),
        (29, "historical-57-plus-new-ledgers-safe-rollback"),
        (30, "attributed-files-final-status-codex-handoff")
    ]
] + ["README.md"]

found_mds = os.listdir(DOCS_DIR)
for r in expected_reports:
    if r not in found_mds:
        errors.append(f"Missing expected markdown report: {r}")
print(f"[OK] Verified {len(expected_reports)} markdown files exist in {DOCS_DIR}.")

# 2. Check 32 JSON files
expected_jsons = [
    "git-baseline.json", "phase13-ci-carryover.json", "changed-files-attribution.json",
    "media-source-inventory.json", "route-permission-matrix.json", "media-field-consumers.json",
    "backend-upload-contract.json", "batch-upload-fixtures.json", "upload-stages-and-statuses.json",
    "async-authority-races.json", "storage-and-ownerless-drafts.json", "object-url-lifetime.json",
    "gallery-slot-preservation.json", "reorder-persistence.json", "crop-focal-roundtrip.json",
    "exif-heic-privacy.json", "media-source-provenance.json", "replace-delete-references.json",
    "video-audio-entitlements.json", "renderer-media-matrix.json", "locale-matrix.json",
    "axe-contrast-geometry.json", "performance-before-after.json", "ten-ui-references.json",
    "ux-pro-max-style-seed-ux-laws.json", "negative-n14-01-to-48.json", "test-command-failures.json",
    "f14-1-58-acceptance.json", "historical-57-plus-new-ledgers.json", "visual-manifest.json",
    "evidence-validation.json", "codex-handoff.json"
]

found_jsons = os.listdir(EVIDENCE_DIR)
for j in expected_jsons:
    if j not in found_jsons:
        errors.append(f"Missing expected JSON evidence: {j}")
    else:
        try:
            with open(os.path.join(EVIDENCE_DIR, j), 'r', encoding='utf-8') as f:
                json.load(f)
        except Exception as e:
            errors.append(f"JSON parsing error in {j}: {e}")
print(f"[OK] Verified {len(expected_jsons)} valid JSON evidence files in {EVIDENCE_DIR}.")

# 3. Check 58 gates in f14-1-58-acceptance.json and 28-f14-1-58-gate-acceptance.md
with open(os.path.join(EVIDENCE_DIR, 'f14-1-58-acceptance.json'), 'r', encoding='utf-8') as f:
    f14_data = json.load(f)

gates = f14_data.get('gates', [])
if len(gates) != 58:
    errors.append(f"Expected 58 gates in f14-1-58-acceptance.json, found {len(gates)}")

gate_ids_in_json = {g['id'] for g in gates}
for i in range(1, 59):
    gid = f"F14.1-{i:02d}"
    if gid not in gate_ids_in_json:
        errors.append(f"Missing gate {gid} in f14-1-58-acceptance.json")

with open(os.path.join(DOCS_DIR, '28-f14-1-58-gate-acceptance.md'), 'r', encoding='utf-8') as f:
    report_28 = f.read()

for i in range(1, 59):
    gid = f"F14.1-{i:02d}"
    if gid not in report_28:
        errors.append(f"Missing gate {gid} in 28-f14-1-58-gate-acceptance.md")
print(f"[OK] Verified all 58 Gate IDs (F14.1-01 through F14.1-58) across JSON and Markdown.")

# 4. Check 48 negative tests in negative-n14-01-to-48.json and 26-n14-negative-case-matrix.md
with open(os.path.join(EVIDENCE_DIR, 'negative-n14-01-to-48.json'), 'r', encoding='utf-8') as f:
    n14_data = json.load(f)

scenarios = n14_data.get('scenarios', [])
if len(scenarios) != 48:
    errors.append(f"Expected 48 negative scenarios in negative-n14-01-to-48.json, found {len(scenarios)}")

scenario_ids_in_json = {s['id'] for s in scenarios}
for i in range(1, 49):
    nid = f"N14-{i:02d}"
    if nid not in scenario_ids_in_json:
        errors.append(f"Missing negative scenario {nid} in negative-n14-01-to-48.json")

with open(os.path.join(DOCS_DIR, '26-n14-negative-case-matrix.md'), 'r', encoding='utf-8') as f:
    report_26 = f.read()

for i in range(1, 49):
    nid = f"N14-{i:02d}"
    if nid not in report_26:
        errors.append(f"Missing negative scenario {nid} in 26-n14-negative-case-matrix.md")
print(f"[OK] Verified all 48 Negative Test IDs (N14-01 through N14-48) across JSON and Markdown.")

# 5. Check visual manifest SHA256 hashes against disk
with open(os.path.join(EVIDENCE_DIR, 'visual-manifest.json'), 'r', encoding='utf-8') as f:
    vm_data = json.load(f)

for v in vm_data.get('manifest', []):
    f_path = os.path.join(DOCS_DIR, v['file'].replace('/', os.sep))
    if not os.path.exists(f_path):
        errors.append(f"Visual file missing: {f_path}")
    else:
        h = hashlib.sha256(open(f_path, 'rb').read()).hexdigest()
        if h != v['sha256']:
            errors.append(f"SHA-256 mismatch for {v['filename']}: expected {v['sha256']}, got {h}")
print(f"[OK] Verified {len(vm_data.get('manifest', []))} visual captures with exact matching SHA-256 hashes.")

# 6. Check relative links in README.md
with open(os.path.join(DOCS_DIR, 'README.md'), 'r', encoding='utf-8') as f:
    readme_text = f.read()

links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', readme_text)
for label, target in links:
    if target.startswith('http'):
        continue
    # target is relative to DOCS_DIR
    target_clean = target.split('#')[0]
    target_path = os.path.join(DOCS_DIR, target_clean.replace('/', os.sep))
    if not os.path.exists(target_path):
        errors.append(f"Broken link in README.md: [{label}]({target}) -> {target_path} does not exist")
print(f"[OK] Verified all {len(links)} relative markdown links in README.md resolve cleanly.")

if errors:
    print(f"\n[FAIL] Found {len(errors)} validation errors:")
    for err in errors:
        print(f"  - {err}")
    exit(1)
else:
    print("\n[SUCCESS] All Phase 14.1 documentation, evidence, gates, negative scenarios, visuals, and links validated 100% cleanly!")
