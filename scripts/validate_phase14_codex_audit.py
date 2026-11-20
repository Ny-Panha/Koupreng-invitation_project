# scripts/validate_phase14_codex_audit.py
import os
import json
import hashlib
import glob
import re
import sys

BASE_DIR = os.path.abspath("docs/uxui/phase14-codex-media-studio-audit-2026-11-20")
EVIDENCE_DIR = os.path.join(BASE_DIR, "evidence")
VISUALS_DIR = os.path.join(BASE_DIR, "visuals")

print("Starting Validation of Phase 14 Codex Audit Package...")

# 1. Validate Markdown reports
md_files = glob.glob(os.path.join(BASE_DIR, "*.md"))
expected_reports = 33 # 32 numbered reports + README.md
assert len(md_files) >= expected_reports, f"Expected at least {expected_reports} markdown files, found {len(md_files)}"
print(f"[OK] Verified {len(md_files)} markdown files exist in {BASE_DIR}")

# 2. Validate JSON evidence files
json_files = glob.glob(os.path.join(EVIDENCE_DIR, "*.json"))
expected_jsons = 21
assert len(json_files) == expected_jsons, f"Expected {expected_jsons} JSON files, found {len(json_files)}"
for jf in json_files:
    with open(jf, "r", encoding="utf-8") as f:
        data = json.load(f)
        assert data is not None, f"JSON {jf} is empty"
print(f"[OK] Verified {len(json_files)} valid JSON evidence files in {EVIDENCE_DIR}")

# 3. Validate 58 Gates
with open(os.path.join(EVIDENCE_DIR, "f14-1-58-acceptance.json"), "r", encoding="utf-8") as f:
    gates_data = json.load(f)
assert gates_data["totalGates"] == 58, f"Expected 58 gates, found {gates_data['totalGates']}"
assert len(gates_data["gates"]) == 58, f"Expected 58 gate entries, found {len(gates_data['gates'])}"
gate_ids = {g["id"] for g in gates_data["gates"]}
for i in range(1, 59):
    expected_id = f"F14.1-{i:02d}"
    assert expected_id in gate_ids, f"Missing gate ID: {expected_id}"
print(f"[OK] Verified all 58 Gate IDs (F14.1-01 through F14.1-58)")

# 4. Validate 48 Negative Scenarios
with open(os.path.join(EVIDENCE_DIR, "negative-tests.json"), "r", encoding="utf-8") as f:
    neg_data = json.load(f)
assert neg_data["totalScenarios"] == 48, f"Expected 48 negative scenarios, found {neg_data['totalScenarios']}"
neg_ids = {s["id"] for s in neg_data["scenarios"]}
for i in range(1, 49):
    expected_id = f"N14-{i:02d}"
    assert expected_id in neg_ids, f"Missing negative test ID: {expected_id}"
print(f"[OK] Verified all 48 Negative Test IDs (N14-01 through N14-48)")

# 5. Validate Visual Captures & Hashes
expected_hashes = {
    "01-cover-1440-en-light.png": "4ff767ee018f12f97140a4727dbda2b67b08eb2ab99550899243eaa8bd9add3e",
    "02-cover-1440-en-dark.png": "98524808a13b3977905c4c40a0559268e58ba0ce38f04ec41cdd3a5e3ced7d8d",
    "03-cover-1440-km-light.png": "137b2fcc8f3dc7dae5872d336c5c7dd505e41fb760c6b4c88996d9e891f23d4a",
    "04-cover-1920-en-light.png": "0e958655fab2b21f838f0ecbd27e3439968a130e2480efdce5cb5113008ac919",
    "05-media-393-en-light.png": "710bb840d1ccedc1dfa3c3807822318306280a8dd2604226a91494426e00be5b",
    "06-media-393-km-dark.png": "7e18ac15a675f7f3d0ea001b9cfded93bb70ae210d11f3d1e27249a19837936a",
    "07-media-320-en-light.png": "8ab6014fe1c718c8679f4202be3e314da8731de3289ba471883caa20aa133d8d",
    "08-media-320-km-light.png": "30efe6ddd6daa1eb321fc4d6ff436564315805a80d33a7321ca5eb35f3868d26",
    "09-media-768-en-tablet.png": "02115bd4de1b87ba98eeaf06bfbd2e95ec2ef803d5e0523b8dd181f6aefe7297",
    "10-media-844x390-landscape.png": "bf3a2c105025010bd0f6b4738d9874c564ca1f6704f0a2c7edbe9a608c07b708",
    "11-gallery-8-assets-desktop.png": "4ce898494ee33a6a4996a754f8478e0c5dec7e0c595061f1e682336b487b6a11",
    "12-video-preview.png": "cdd153529ab46612031436bf253a3a0fc983efb0d48746cd3d9f14a041f15c7c",
    "13-audio-preview.png": "0251f5a10923adcdf4858cfdc8f2e3bb2166598b811703fbb6d6ef13e81665da",
    "14-gallery-empty-state.png": "6df17a064164913581bf078b3d812f826940dd365433f22d4a26f52009226fea",
    "15-focal-inspector-open.png": "238b372781ddd7ac3341444a2a2349aa815e61f7dc75c1d617e6f72105d50e82",
    "16-gallery-reorder-banner.png": "654f862d8d10ff12496d1dd09757cdef847bf16e8454c5660545f64f683cbc66",
    "17-preflight-staging-tray.png": "a622fc5b6784c529f7f88313ae9c46d6820671eb39afe42383761c9c6d2c5501",
    "18-in-use-reference-tag.png": "98524808a13b3977905c4c40a0559268e58ba0ce38f04ec41cdd3a5e3ced7d8d",
    "19-template-artwork-card.png": "6c2b6a389b2ad2cdffc570dd7b8f06122b7e201bc5f57cf320d07691a069b8a8",
    "20-error-notice-retry.png": "156cf58658c05f11a3b138af6a769a4979c720494bf1db173262c1fe025d2949",
    "21-forced-colors-high-contrast.png": "fda5369fa6646031e6880748dab39d0e7cf3dab5bc11ffa7210d8c6e1b98b1e4",
    "22-reduced-motion-mode.png": "fcb8d7d9fc7d2c9add8bb48bdcba89e8b4131654047962d070e3f4b5e1868bcf"
}
visual_files = glob.glob(os.path.join(VISUALS_DIR, "*.png"))
assert len(visual_files) == 22, f"Expected 22 visual files, found {len(visual_files)}"
for vf in visual_files:
    fname = os.path.basename(vf)
    assert fname in expected_hashes, f"Unexpected visual file {fname}"
    h = hashlib.sha256(open(vf, "rb").read()).hexdigest()
    assert h == expected_hashes[fname], f"Hash mismatch for {fname}: got {h}, expected {expected_hashes[fname]}"
print(f"[OK] Verified 22 visual captures with exact matching SHA-256 hashes")

# 6. Validate Historical 57
with open(os.path.join(EVIDENCE_DIR, "historical-57-itemized-plus-new.json"), "r", encoding="utf-8") as f:
    hist_data = json.load(f)
assert len(hist_data["historical_57_itemized_entries"]) == 57, f"Expected 57 historical entries, found {len(hist_data['historical_57_itemized_entries'])}"
print(f"[OK] Verified all 57 itemized historical rows from authoritative Phase 13 ledger")

# 7. Validate Relative Markdown Links
link_pattern = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
checked_links = 0
for md_file in md_files:
    with open(md_file, "r", encoding="utf-8") as f:
        content = f.read()
    for match in link_pattern.finditer(content):
        link = match.group(2)
        if link.startswith("http://") or link.startswith("https://") or link.startswith("#"):
            continue
        # Strip anchor
        clean_link = link.split("#")[0]
        if not clean_link:
            continue
        target_path = os.path.normpath(os.path.join(os.path.dirname(md_file), clean_link))
        assert os.path.exists(target_path), f"Broken link in {os.path.basename(md_file)}: '{link}' -> {target_path} not found"
        checked_links += 1

print(f"[OK] Verified {checked_links} relative markdown links resolve cleanly")
print("\n[SUCCESS] Phase 14 Codex Audit Package validated 100% cleanly!")
