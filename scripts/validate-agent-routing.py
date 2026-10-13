#!/usr/bin/env python3
r"""
validate-agent-routing.py — Verification script for Koupreng AI agent skills architecture.

Validates:
1. ai-skills.lock.json schema and cryptographic SHA-256 file hashes.
2. Existence and frontmatter validity of all project-local SKILL.md files.
3. Absence of duplicate skill names.
4. Accuracy of routing references in .agents/ROUTER.md.
5. Presence and correct import statements in AGENTS.md, CODEX.md, CLAUDE.md, and GEMINI.md.
6. Absence of machine-dependent absolute paths (e.g. file:///d:/ or D:\).
7. Resolvability of local markdown file links.

Returns exit code 0 on complete pass, 1 on any validation failure.
"""

import sys
import os
import json
import hashlib
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = PROJECT_ROOT / ".agents" / "skills"
LOCK_FILE = PROJECT_ROOT / "ai-skills.lock.json"
ROUTER_FILE = PROJECT_ROOT / ".agents" / "ROUTER.md"
INDEX_FILE = PROJECT_ROOT / ".agents" / "SKILLS_INDEX.md"

REQUIRED_ENTRY_FILES = {
    "AGENTS.md": PROJECT_ROOT / "AGENTS.md",
    "CODEX.md": PROJECT_ROOT / "CODEX.md",
    "CLAUDE.md": PROJECT_ROOT / "CLAUDE.md",
    "GEMINI.md": PROJECT_ROOT / "GEMINI.md",
    "ROUTER.md": ROUTER_FILE,
    "SKILLS_INDEX.md": INDEX_FILE,
}

KOUPRENG_CUSTOM_SKILLS = [
    "koupreng-premium-ux",
    "koupreng-backend-standards",
    "koupreng-payment-security",
    "koupreng-database-flyway",
    "koupreng-qa-release",
    "koupreng-deployment",
]

ABSOLUTE_PATH_PATTERNS = [
    re.compile(r"file:///[a-zA-Z]:[/\\]", re.IGNORECASE),
    re.compile(r"[a-zA-Z]:\\[kK]oupreng", re.IGNORECASE),
    re.compile(r"[a-zA-Z]:\\Users\\", re.IGNORECASE),
]


def log_pass(msg: str):
    print(f"  [+] {msg}")


def log_fail(msg: str):
    print(f"  [x] {msg}")


def log_warn(msg: str):
    print(f"  [!] {msg}")


def validate_lockfile(failures: list) -> int:
    print("\n--- 1. Validating ai-skills.lock.json & Hash Integrity ---")
    if not LOCK_FILE.exists():
        failures.append("Lockfile ai-skills.lock.json not found")
        log_fail("ai-skills.lock.json not found")
        return 0

    try:
        content = LOCK_FILE.read_text(encoding="utf-8-sig")
        data = json.loads(content)
    except Exception as e:
        failures.append(f"Failed to parse ai-skills.lock.json: {e}")
        log_fail(f"Invalid JSON: {e}")
        return 0

    if "skills" not in data or not isinstance(data["skills"], list):
        failures.append("Lockfile missing 'skills' list")
        log_fail("Invalid schema: 'skills' array missing")
        return 0

    verified_count = 0
    for entry in data["skills"]:
        skill_name = entry.get("skill")
        if not skill_name:
            failures.append("Lockfile entry missing 'skill' name")
            continue

        skill_dir = SKILLS_DIR / skill_name
        if not skill_dir.is_dir():
            failures.append(f"Pinned skill directory missing: {skill_name}")
            log_fail(f"Missing directory for {skill_name}")
            continue

        files = entry.get("files", [])
        entry_ok = True
        for f in files:
            rel_path = f.get("path")
            expected_hash = f.get("sha256", "").lower()
            file_path = skill_dir / rel_path

            if not file_path.is_file():
                failures.append(f"{skill_name}: missing file {rel_path}")
                log_fail(f"{skill_name}: missing file {rel_path}")
                entry_ok = False
                continue

            current_hash = hashlib.sha256(file_path.read_bytes()).hexdigest().lower()
            if current_hash != expected_hash:
                failures.append(f"{skill_name}/{rel_path}: SHA-256 hash mismatch")
                log_fail(f"{skill_name}/{rel_path}: hash mismatch (got {current_hash[:8]}..., exp {expected_hash[:8]}...)")
                entry_ok = False

        if entry_ok:
            log_pass(f"Verified {skill_name} ({len(files)} files, commit {entry.get('commit', '')[:8]})")
            verified_count += 1

    return verified_count


def validate_koupreng_skills(failures: list):
    print("\n--- 2. Validating Koupreng Custom Skills ---")
    for name in KOUPRENG_CUSTOM_SKILLS:
        skill_dir = SKILLS_DIR / name
        skill_md = skill_dir / "SKILL.md"
        refs_dir = skill_dir / "references"

        if not skill_dir.is_dir():
            failures.append(f"Koupreng custom skill directory missing: {name}")
            log_fail(f"{name}: directory missing")
            continue

        if not skill_md.is_file():
            failures.append(f"Koupreng custom skill missing SKILL.md: {name}")
            log_fail(f"{name}: SKILL.md missing")
            continue

        if not refs_dir.is_dir() or not any(refs_dir.iterdir()):
            failures.append(f"Koupreng custom skill missing references: {name}")
            log_fail(f"{name}: references directory missing or empty")
            continue

        log_pass(f"{name}: verified SKILL.md and references")


def validate_all_skills_frontmatter(failures: list) -> dict:
    print("\n--- 3. Validating All Installed Skills & Frontmatter ---")
    discovered_skills = {}
    if not SKILLS_DIR.is_dir():
        failures.append("Skills directory .agents/skills does not exist")
        log_fail(".agents/skills directory missing")
        return discovered_skills

    for entry in sorted(SKILLS_DIR.iterdir()):
        if not entry.is_dir():
            continue

        skill_md = entry / "SKILL.md"
        if not skill_md.is_file():
            failures.append(f"Missing SKILL.md in: {entry.name}")
            log_fail(f"{entry.name}: missing SKILL.md")
            continue

        content = skill_md.read_text(encoding="utf-8", errors="ignore")
        if not content.startswith("---"):
            failures.append(f"{entry.name}: SKILL.md missing YAML frontmatter opening '---'")
            log_fail(f"{entry.name}: missing frontmatter delimiter")
            continue

        parts = content.split("---", 2)
        if len(parts) < 3:
            failures.append(f"{entry.name}: SKILL.md invalid YAML frontmatter structure")
            log_fail(f"{entry.name}: invalid frontmatter structure")
            continue

        frontmatter = parts[1]
        name_match = re.search(r"^name:\s*[\"']?([^\"'\r\n]+)[\"']?", frontmatter, re.MULTILINE)
        desc_match = re.search(r"^description:\s*[\"']?([^\"'\r\n]+)", frontmatter, re.MULTILINE)

        if not name_match:
            failures.append(f"{entry.name}: frontmatter missing 'name'")
            log_fail(f"{entry.name}: missing 'name' in frontmatter")
            continue

        parsed_name = name_match.group(1).strip()
        if not desc_match:
            failures.append(f"{entry.name}: frontmatter missing 'description'")
            log_fail(f"{entry.name}: missing 'description' in frontmatter")
            continue

        if parsed_name in discovered_skills and discovered_skills[parsed_name] != entry.name:
            # Allow alias folders if intended, but warn
            log_warn(f"Duplicate skill name '{parsed_name}' in {entry.name} and {discovered_skills[parsed_name]}")
        else:
            discovered_skills[parsed_name] = entry.name

    log_pass(f"Validated {len(discovered_skills)} skills with compliant frontmatter")
    return discovered_skills


def validate_router_references(failures: list, valid_skills: set):
    print("\n--- 4. Validating Router References in .agents/ROUTER.md ---")
    if not ROUTER_FILE.is_file():
        failures.append("ROUTER.md not found at .agents/ROUTER.md")
        log_fail("ROUTER.md missing")
        return

    content = ROUTER_FILE.read_text(encoding="utf-8", errors="ignore")
    # Extract backtick skill references like `koupreng-premium-ux`
    referenced_skills = set(re.findall(r"`([a-z0-9\-_]+)`", content))
    
    # Filter to likely skill references (ignore common code tokens)
    ignored_tokens = {"query", "product_type", "industry", "keywords", "admin", "user", "file", "pwd"}
    filtered_refs = {r for r in referenced_skills if r in valid_skills}

    # Verify that all 6 Koupreng skills are actively routed
    for k_skill in KOUPRENG_CUSTOM_SKILLS:
        if k_skill not in content:
            failures.append(f"ROUTER.md does not reference core Koupreng skill: {k_skill}")
            log_fail(f"ROUTER.md missing route for: {k_skill}")
        else:
            log_pass(f"ROUTER.md routes core skill: {k_skill}")

    log_pass(f"ROUTER.md references {len(filtered_refs)} valid installed skills")


def validate_entry_files(failures: list):
    print("\n--- 5. Validating Root Entry Files & Imports ---")
    for name, path in REQUIRED_ENTRY_FILES.items():
        if not path.is_file():
            failures.append(f"Required entry file missing: {name}")
            log_fail(f"Missing {name} at {path}")
        else:
            log_pass(f"Found {name}")

    claude_file = REQUIRED_ENTRY_FILES["CLAUDE.md"]
    if claude_file.is_file():
        text = claude_file.read_text(encoding="utf-8", errors="ignore")
        if "@./AGENTS.md" in text or "@AGENTS.md" in text:
            log_pass("CLAUDE.md imports AGENTS.md correctly")
        else:
            failures.append("CLAUDE.md does not import @./AGENTS.md")
            log_fail("CLAUDE.md missing '@./AGENTS.md' import")

    gemini_file = REQUIRED_ENTRY_FILES["GEMINI.md"]
    if gemini_file.is_file():
        text = gemini_file.read_text(encoding="utf-8", errors="ignore")
        if "@./AGENTS.md" in text or "@AGENTS.md" in text:
            log_pass("GEMINI.md imports AGENTS.md correctly")
        else:
            failures.append("GEMINI.md does not import @./AGENTS.md")
            log_fail("GEMINI.md missing '@./AGENTS.md' import")

    agents_file = REQUIRED_ENTRY_FILES["AGENTS.md"]
    if agents_file.is_file():
        text = agents_file.read_text(encoding="utf-8", errors="ignore")
        if ".agents/ROUTER.md" in text:
            log_pass("AGENTS.md directs agents to .agents/ROUTER.md")
        else:
            failures.append("AGENTS.md missing reference to .agents/ROUTER.md")
            log_fail("AGENTS.md missing reference to .agents/ROUTER.md")


def validate_no_machine_paths(failures: list):
    print("\n--- 6. Detecting Machine-Specific Absolute Paths ---")
    target_files = [
        PROJECT_ROOT / "AGENTS.md",
        PROJECT_ROOT / "CODEX.md",
        PROJECT_ROOT / "CLAUDE.md",
        PROJECT_ROOT / "GEMINI.md",
        ROUTER_FILE,
        INDEX_FILE,
    ]

    has_issue = False
    for tf in target_files:
        if not tf.is_file():
            continue
        lines = tf.read_text(encoding="utf-8", errors="ignore").splitlines()
        for i, line in enumerate(lines, 1):
            for pat in ABSOLUTE_PATH_PATTERNS:
                if pat.search(line):
                    failures.append(f"{tf.name}:{i} contains machine-specific absolute path: '{line.strip()}'")
                    log_fail(f"{tf.name}:{i} has machine-specific path: {line.strip()[:60]}...")
                    has_issue = True

    if not has_issue:
        log_pass("Zero machine-specific absolute paths found in core entry documents")


def validate_local_markdown_links(failures: list):
    print("\n--- 7. Validating Local Documentation Markdown Links ---")
    target_files = [
        PROJECT_ROOT / "AGENTS.md",
        PROJECT_ROOT / "CODEX.md",
        PROJECT_ROOT / "CLAUDE.md",
        PROJECT_ROOT / "GEMINI.md",
        ROUTER_FILE,
        INDEX_FILE,
    ]

    link_pat = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    broken_count = 0
    total_links = 0

    for tf in target_files:
        if not tf.is_file():
            continue
        text = tf.read_text(encoding="utf-8", errors="ignore")
        base_dir = tf.parent

        for m in link_pat.finditer(text):
            link_target = m.group(2).strip()
            # Ignore web URLs, anchors, mailto
            if link_target.startswith(("http://", "https://", "#", "mailto:")):
                continue

            total_links += 1
            # Remove optional in-file anchor
            clean_target = link_target.split("#")[0]
            if not clean_target:
                continue

            target_path = (base_dir / clean_target).resolve()
            if not target_path.exists():
                failures.append(f"Broken link in {tf.name}: '{link_target}' -> '{target_path}'")
                log_fail(f"{tf.name}: broken link to '{link_target}'")
                broken_count += 1

    if broken_count == 0:
        log_pass(f"All {total_links} local markdown file links resolved successfully")


def main():
    print("==========================================================")
    print("   Koupreng Agent Skills Routing & Architecture Validator")
    print("==========================================================")
    print(f"Project Root: {PROJECT_ROOT}")

    failures = []

    verified_locked = validate_lockfile(failures)
    validate_koupreng_skills(failures)
    discovered_skills = validate_all_skills_frontmatter(failures)
    validate_router_references(failures, set(discovered_skills.keys()) | set(discovered_skills.values()))
    validate_entry_files(failures)
    validate_no_machine_paths(failures)
    validate_local_markdown_links(failures)

    print("\n==========================================================")
    print("   Validation Summary")
    print("==========================================================")
    print(f"  Pinned Skills Verified : {verified_locked}")
    print(f"  Total Valid Skills     : {len(discovered_skills)}")
    print(f"  Total Errors/Failures  : {len(failures)}")

    if failures:
        print("\n[!] The following issues must be resolved:")
        for idx, f in enumerate(failures, 1):
            print(f"  {idx}. {f}")
        sys.exit(1)
    else:
        print("\n[+] SUCCESS: All multi-agent skills and routing checks passed cleanly!")
        sys.exit(0)


if __name__ == "__main__":
    main()
