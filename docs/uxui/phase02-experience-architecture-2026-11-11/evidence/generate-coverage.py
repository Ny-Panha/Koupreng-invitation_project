"""Build Phase 02 route, group and renderer ledgers from the pinned source inventories.

Run from the repository root. This writes only the Phase 02 documentation package.
The two route factory tests must separately pass to validate the JSON against JSX.
"""
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

root = Path(__file__).resolve().parents[4]
out = Path(__file__).resolve().parent.parent
routes = json.loads((root / 'docs/qa/batch12/route-matrix.json').read_text(encoding='utf-8'))['routes']
historical = (root / 'docs/audits/ultimate-uxui-phase01-2026-11-11/03-complete-route-feature-state-matrix.md').read_text(encoding='utf-8')
previous = {}
for line in historical.splitlines():
    if not line.startswith('| SCOPE-'): continue
    cols = [v.strip() for v in line.strip('|').split('|')]
    previous[(cols[1], cols[2].strip('`'))] = {'id': cols[0], 'component': cols[5], 'declaration': cols[6], 'phase': cols[-1], 'historical_status': cols[-2]}
assert len(routes) == len(previous) == 135
assert {(r['application'].replace('frontend-', ''), r['pattern']) for r in routes} == set(previous)

def shell(row):
    group = row['group']
    if row['application'] == 'frontend-admin': return 'Administrator'
    if group == 'not-found': return 'System / exception'
    if group.startswith('auth-'): return 'Account / auth'
    if group in {'home', 'contact', 'venues', 'venue-detail', 'catalog', 'pricing', 'template-demo', 'checkout', 'paid-templates'}: return 'Public / discovery'
    if group in {'public-invitation'}: return 'Guest invitation'
    if group in {'payment-status', 'payment-return', 'payment-cancel'}: return 'System / payment return'
    return 'Owner / account'

def target(row):
    group = row['group']
    mapping = {
        'not-found': 'Explain missing route; preserve safe return',
        'admin-not-found': 'Admin-safe not found and return',
        'create-event': 'Guided event creation; preserve template intent and draft',
        'template-demo': 'Bespoke preview with honest ownership and usable opening',
        'public-invitation': 'Bespoke guest reading, consent and RSVP',
        'checkout': 'Price and entitlement from server; clear handoff',
        'payment-status': 'Server status with refresh and retry',
        'payment-return': 'Return to server status; no inferred success',
        'payment-cancel': 'Cancellation and safe resume',
        'admin-template-edit': 'Five-section Studio; editable and previewable at all widths',
    }
    return mapping.get(group, f'{group.replace("-", " ").title()} task; obvious primary action and recovery')

def exception(row):
    if row['group'] in {'payment-status', 'payment-return', 'payment-cancel', 'checkout', 'payments', 'admin-payments'}:
        return 'pending / review / failed / expired; server truth'
    if row['group'] in {'not-found', 'admin-not-found'}: return '404 / safe return'
    if row['group'].startswith('auth-'): return 'invalid / expired / locked / retry'
    if row['group'] == 'public-invitation': return 'private / invalid token / deadline / offline'
    if row['group'].startswith('admin-'): return 'loading / empty / 401 / 403 / 409 / 503'
    return 'loading / empty / denied / conflict / offline'

lines = [
    '# Current routes to target information architecture', '',
    'Generated from [`route-matrix.json`](../../qa/batch12/route-matrix.json) and the Phase 01 source ledger. The current user and admin route factory tests passed on the Phase 02 baseline; every current `(application, pattern)` matched the prior ledger. The target IA and state contracts here are **PROPOSALS**, while route patterns, access requirement, historical component labels and primary phase are source-mapped. Read-only fictional fixture smoke at 390px is historical Phase 01 evidence, not a new Phase 02 route sweep.', '',
    '| ID | App | Current leaf URL | Shell | Access | Feature group | Current owner / alias | Target task | Exception contract | Phase | Evidence |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
]
for row in routes:
    key = (row['application'].replace('frontend-', ''), row['pattern'])
    old = previous[key]
    alias = 'alias/redirect' if 'alias' in old['historical_status'] else 'leaf'
    owner = f"{old['component']} ({alias})"
    vals = [old['id'], key[0], f"`{row['pattern']}`", shell(row), row['accessRequirement'], row['group'], owner, target(row), exception(row), old['phase'], 'SOURCE-MAPPED; states unverified']
    lines.append('| ' + ' | '.join(str(v).replace('|', '/') for v in vals) + ' |')
counts = Counter(r['application'] for r in routes)
groups = Counter(r['group'] for r in routes)
lines += ['', f"**Reconciliation:** {len(routes)}/{len(routes)} current leaves assigned to IA and phase ({counts['frontend-user']} user, {counts['frontend-admin']} admin); {len(groups)}/{len(groups)} feature groups assigned; 0 orphan URL or group. Aliases and wildcard 404 remain in place. No route has been removed. Dynamic backend catalog entries are outside this static route inventory.", '', '## Validation contract', '', 'Phase 06 and each owning feature phase must repeat route factory assertions, signed-in/out deep links, role denial, aliases, 404, keyboard/touch navigation, 320–1920 reflow, Khmer/English labels and server-backed states. Proposed nav grouping does not change current authorization. See [IA](03-complete-information-architecture.md) and [dependency map](13-full-product-improvement-dependency-map.md).', '']
(out / '04-all-routes-to-ia-mapping.md').write_text('\n'.join(lines), encoding='utf-8')

registry = (root / 'apps/frontend-user/src/features/templates/registry/templateRegistry.js').read_text(encoding='utf-8')
families = defaultdict(list)
for line in registry.splitlines():
    hit = re.match(r'^\s*(?:"([^"]+)"|\x27([^\x27]+)\x27|([A-Z_]+)):\s*(\w+),?\s*$', line)
    if hit:
        key = next(v for v in hit.groups()[:3] if v)
        component = hit.group(4)
        if component.endswith('Layout') or component == 'CanvaKhmerWeddingTemplate': families[component].append(key)
assert len(families) == 10 and sum(map(len, families.values())) == 38
directions = {
    'KhmerFloralGoldLayout': ('Khmer Ceremonial Heritage', 'floral framing, warm gold; quiet reveal'),
    'RoyalGardenCinematicLayout': ('Khmer Ceremonial Heritage + Cinematic', 'garden composition; controlled opening'),
    'SilkHeritageLayout': ('Khmer Ceremonial Heritage', 'silk texture and textile rhythm'),
    'TemplateBoilerplateLayout': ('Neutral authoring foundation', 'starter layout retains authored content'),
    'KhmerCelestialLayout': ('Khmer Ceremonial Heritage + Cinematic', 'celestial motif and optional scene'),
    'DigitalYesLayout': ('Cinematic Immersive', 'wax-seal scene with skip and static alternative'),
    'EmeraldLuxeLayout': ('Modern Editorial + Cinematic', 'emerald velvet composition and optional card reveal'),
    'WithJoyPortalLayout': ('Modern International Editorial', 'portal navigation and timeline'),
    'BlissEditorialLayout': ('Modern International Editorial', 'asymmetric editorial spread and RSVP'),
    'CanvaKhmerWeddingTemplate': ('Khmer Ceremonial Heritage', 'Kbach-inspired framing subject to rights/cultural review'),
}
renderer_lines = [
    '# Template experience tiers and renderer preservation', '',
    'The registry below is static source, not a complete live backend catalog. These art-direction assignments are **PROPOSALS**, not changes to shipped layouts or package entitlements. Keep slug/code/preset precedence over numeric legacy IDs and preserve unknown authored JSON in every editor/preview roundtrip.', '',
    '| Renderer family | All current static aliases | Art direction / identity contract | Guest essentials and recovery | Phase owner |',
    '|---|---|---|---|---|',
]
for family, aliases in families.items():
    direction, identity = directions[family]
    renderer_lines.append(f"| `{family}` | {', '.join('`'+a+'`' for a in aliases)} | {direction}: {identity} | readable cover/skip, program, map, RSVP, media consent, reduced motion, invalid/private link | 10 art / 16 guest |")
renderer_lines += [
    '| `TemplateExperience` shared | `event-essential`, `koupreng-demo-wedding` | One shared engine with distinct authored/event type styling | same essential guest contract; preserve structured data | 10 / 13 / 16 |',
    '| `DefaultTemplateLayout` fallback | unknown/dynamic key when `useFallback` | honest fallback, no fake premium identity | readable essential content; report unknown catalog mapping | 10 / 25 |', '',
    '**Count:** 10/10 dedicated families, 38/38 static aliases, 2/2 named shared IDs and 1/1 fallback assigned. Dynamic server catalog count is **NOT TESTED** without an isolated API dataset.', '',
    '## Capability tiers (design only)', '',
    '| Tier | Required behavior | Permission and performance gate |', '|---|---|---|',
    '| Essential | readable cover/title, event facts, map/directions and RSVP when enabled; actions work without motion | lowest capability baseline; no pricing implication |',
    '| Enhanced | brief reveal, gallery and media controls with static alternative | only after media consent and performance check |',
    '| Cinematic | optional opening, depth, 2.5D/3D and controlled sound | explicit user action, skip/pause, reduced-motion/static path, rights and low-end budget |', '',
    'A renderer may offer an Enhanced or Cinematic presentation while every guest still gets Essential access. Tier does not confer ownership or purchase rights. Phase 10 must compare current artwork and asset licenses family by family; Phase 16 must validate guest outcomes; Phase 25 must verify admin-authored preview/publish parity. A backend catalog entry without a static alias can use a shared/fallback path only after its published design and entitlement behavior are checked.', '',
    '## Renderer verification matrix', '',
    'For each row above, record fixture and real authored data at 320/390/768/1440 and short landscape, Khmer/English content, long names, opening skip/replay, focus order, motion reduction, audio/video consent, media failure, map/calendar, RSVP enabled/disabled/deadline, private/expired token, visual regressions and LCP/CLS. One dedicated renderer passing does not certify the other nine.', ''
]
(out / '08-template-experience-tiers.md').write_text('\n'.join(renderer_lines), encoding='utf-8')

phase_groups = defaultdict(list)
for group in sorted(groups):
    representative = next(r for r in routes if r['group'] == group)
    phase_groups[previous[(representative['application'].replace('frontend-', ''), representative['pattern'])]['phase']].append(group)
group_lines = ['## Complete feature-group ownership', '', '| Primary phase | Current feature groups (all aliases included) | Group count | Route leaves |', '|---|---|---:|---:|']
for phase, owned in sorted(phase_groups.items()):
    leaf_count = sum(groups[g] for g in owned)
    group_lines.append(f"| {phase} | {', '.join('`'+g+'`' for g in owned)} | {len(owned)} | {leaf_count} |")
group_lines += ['', f"**Total:** {sum(len(v) for v in phase_groups.values())}/{len(groups)} groups, {sum(groups.values())}/{len(routes)} leaves. Source labels are from the current route matrix; phase ownership was reconciled against the Phase 01 ledger and current factories. Shared Phases 03–05/26–27 apply to all relevant groups without claiming a second primary owner.", '']
(out / 'evidence/group-ledger.md').write_text('\n'.join(group_lines), encoding='utf-8')
surface_lines = [
    '# All current feature surfaces: role, entry and state', '',
    'This is a source-mapped inventory of **62/62 current route feature groups**, generated from the current Batch 12 route contracts and checked against both route factory tests. The “current fixture task” is an existing test expectation, not proof of live backend behavior. Every target action and state is a later-phase acceptance proposal. Read the full [route matrix](../04-all-routes-to-ia-mapping.md) for aliases and every leaf URL.', '',
    '| Group | Entry URL / shell and role | Current fixture task / key decision | Target primary action | Required exception and interaction checks | Phase |',
    '|---|---|---|---|---|---|',
]
for group in sorted(groups):
    rep = next(r for r in routes if r['group'] == group)
    old = previous[(rep['application'].replace('frontend-', ''), rep['pattern'])]
    entry = f"`{rep['pattern']}` / {shell(rep)} / {rep['accessRequirement']}"
    fixture = rep['readinessContract']
    target_action = target(rep)
    checks = exception(rep) + '; phone/tablet/desktop, Khmer/English, keyboard/touch, reduced motion'
    vals = [f'`{group}`', entry, fixture, target_action, checks, old['phase']]
    surface_lines.append('| ' + ' | '.join(str(v).replace('|', '/') for v in vals) + ' |')
surface_lines += ['', f'**Reconciled:** {len(groups)}/{len(groups)} groups, {len(routes)}/{len(routes)} leaves, zero unassigned. Each group also inherits shell, auth, focus, feedback and performance contracts in Phases 03–06/26. Real service status and persistence remain unverified unless cited separately in the Phase 02 evidence index.', '']
(out / 'evidence/feature-surface-ledger.md').write_text('\n'.join(surface_lines), encoding='utf-8')
print(json.dumps({'routes': len(routes), 'user': counts['frontend-user'], 'admin': counts['frontend-admin'], 'groups': len(groups), 'families': len(families), 'aliases': sum(map(len, families.values())), 'phase_counts': dict(Counter(previous[(r['application'].replace('frontend-', ''),r['pattern'])]['phase'] for r in routes))}))
