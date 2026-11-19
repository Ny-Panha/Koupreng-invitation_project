"""Validate Phase11's local evidence, source binding, links and immutable carryovers."""
from pathlib import Path
import collections
import datetime
import hashlib
import json
import re
import sys
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'docs/uxui/phase11-codex-event-creation-audit-2026-11-19'
EVIDENCE = REPORT / 'evidence'
OUT = ROOT / 'output/playwright/phase11-codex-2026-11-19'
EXPECTED = {
    'git-worktree-baseline.json', 'source-operations-and-sha.json', 'claim-register.json',
    'route-state-matrix.json', 'backend-contract-snapshot.json', 'event-type-compatibility.json',
    'draft-lifecycle-races.json', 'request-idempotency-matrix.json', 'upload-recovery-matrix.json',
    'template-intent-entitlement-matrix.json', 'negative-tests-register.json', 'defect-register.json',
    'exact-test-command-results.json', 'browser-coverage.json', 'visual-manifest.json',
    'axe-contrast-results.json', 'performance-compare.json', 'ten-library-canonical-matrix.json',
    'ux-pro-max-search-results.json', 'ux-law-traceability.json', 'github-actions-triage.json',
    'f11-independent-40-gates.json', 'historical-57-plus-new-ledger.json',
    'attributed-changes-rollback.json', 'evidence-validation.json',
}


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    errors = []
    files = list(EVIDENCE.glob('*.json'))
    expected_existing = EXPECTED - {'evidence-validation.json'}
    if not expected_existing.issubset({p.name for p in files}):
        errors.append('Missing required JSON: ' + str(expected_existing - {p.name for p in files}))
    if {p.name for p in files} - EXPECTED:
        errors.append('Unexpected JSON files')
    parsed = {}
    for path in files:
        try:
            value = read(path)
            if value.get('schemaVersion') != 1 or not re.fullmatch(r'[a-f0-9]{64}', value.get('sourceSHA', '')):
                errors.append(path.name + ': invalid common schema')
            parsed[path.name] = value
        except (ValueError, UnicodeError) as error:
            errors.append(path.name + ': ' + str(error))
    missing_links = []
    external_links = set()
    markdown = list(REPORT.glob('*.md'))
    if len(markdown) != 27:
        errors.append('Expected README plus 26 reports; found ' + str(len(markdown)))
    for path in markdown:
        for target in re.findall(r'!?\[[^\]]+\]\(([^)]+)\)', path.read_text(encoding='utf-8')):
            target = target.strip('<>')
            if target.startswith(('https://', 'http://')):
                external_links.add(target)
                continue
            if target.startswith('#'):
                continue
            target = urllib.parse.unquote(target.split('#')[0])
            if not (path.parent / target).resolve().exists():
                missing_links.append({'file':path.name,'target':target})
    if missing_links:
        errors.append('Broken local Markdown links: ' + str(missing_links))
    gate_data = parsed.get('f11-independent-40-gates.json', {})
    gates = gate_data.get('records', [])
    expected_ids = {f'F11.1-{n:02d}' for n in range(1, 41)}
    if len(gates) != 40 or {r['id'] for r in gates} != expected_ids:
        errors.append('Acceptance IDs must be exactly F11.1-01 through 40')
    required_fields = {'name','claimedVerdict','independentVerdict','sourceProof','testProof','visualProof','owner','blocker','severity','nextAction','sourceSHA','reproduction','notes'}
    if any(not required_fields.issubset(row) for row in gates):
        errors.append('Incomplete gate schema')
    counts = dict(collections.Counter(r['independentVerdict'] for r in gates))
    if counts != gate_data.get('counts') or sum(counts.values()) != 40:
        errors.append('Gate arithmetic mismatch')
    ledger = parsed.get('historical-57-plus-new-ledger.json', {})
    prior = read(ROOT/'docs/uxui/phase10-codex-renderer-art-audit-2026-11-18/evidence/cross-phase-carryover.json')
    history = ledger.get('historical_entries', [])
    if len(history) != 57 or {r['id'] for r in history} != {r['id'] for r in prior['historical_entries']}:
        errors.append('Original 57 immutable IDs changed')
    if ledger.get('historical_distribution') != prior['historical_distribution']:
        errors.append('Historical distribution changed')
    for key, count in [('auth_items',5),('phase07_partial_gates',9),('gemini_D10',6),('phase10_codex',11),('gemini_D11',5)]:
        if len(ledger.get(key, [])) != count:
            errors.append(key + ': wrong count')
    if {r['id'] for r in ledger.get('phase10_codex', [])} != {f'C10-{n:03d}' for n in range(1,12)}:
        errors.append('Full C10 set not preserved')
    protected = parsed.get('source-operations-and-sha.json', {})
    if protected.get('protectedChanged') or protected.get('otherChangedTracked'):
        errors.append('Protected/unattributed tracked source drift')
    frozen = protected.get('frozenSource', {})
    for row in frozen.get('source', []):
        path = ROOT / row['path']
        if not path.exists() or sha(path) != row['sha256']:
            errors.append('Frozen source drift: ' + row['path'])
    for row in frozen.get('build', []):
        path = ROOT/'apps/frontend-user/dist'/row['path']
        if not path.exists() or sha(path) != row['sha256']:
            errors.append('Frozen build drift: ' + row['path'])
    for row in parsed.get('attributed-changes-rollback.json', {}).get('records', []):
        path = ROOT/row['path']
        if not path.exists() or sha(path) != row['postSha256'] or not row['preimageVerified']:
            errors.append('Attribution hash/preimage mismatch: ' + row['path'])
    captures = parsed.get('visual-manifest.json', {}).get('captures', [])
    for row in captures:
        path = ROOT/row['file']
        if not path.exists() or sha(path) != row['sha256']:
            errors.append('Screenshot missing/hash mismatch: ' + row['file'])
    for row in parsed.get('exact-test-command-results.json', {}).get('records', []):
        path = ROOT/row['log']
        if not path.exists() or sha(path) != row['logSha256']:
            errors.append('Command log hash mismatch: ' + row['id'])
    data = {
        'schemaVersion':1, 'auditDate':'2026-11-19', 'sourceSHA':frozen.get('sourceSHA'),
        'validatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'passed':not errors, 'errors':errors, 'markdownCount':len(markdown),
        'jsonCountAfterWriting':25, 'gateCount':len(gates), 'gateCounts':counts,
        'historicalCount':len(history), 'capturesChecked':len(captures),
        'localMarkdownLinksValid':not missing_links,
        'externalLinks':sorted(external_links),
        'externalLinkScope':'GitHub run was retrieved using connected tools; external URLs are not represented as new HTTP probes by this validator.',
        'knownEvidenceLimits':['Original before-build hash absent','Physical/native/provider/RUM gates remain unverified','Historical and CI failures retained'],
        'jsonSha256ExcludingSelf':{p.name:sha(p) for p in files if p.name!='evidence-validation.json'},
    }
    (EVIDENCE/'evidence-validation.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    OUT.mkdir(parents=True,exist_ok=True)
    package = [{'path':str(p.relative_to(ROOT)).replace('\\','/'),'sha256':sha(p)} for p in sorted(REPORT.rglob('*')) if p.is_file()]
    (OUT/'report-package-sha256.json').write_text(json.dumps(package,indent=2),encoding='utf-8')
    print(json.dumps({'passed':not errors,'errors':errors,'markdown':len(markdown),'json':25,'gates':len(gates),'historical':len(history),'captures':len(captures)},ensure_ascii=False))
    return 0 if not errors else 1


if __name__ == '__main__':
    sys.exit(main())
