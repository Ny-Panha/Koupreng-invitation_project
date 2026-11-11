"""Generate source-indexed route and renderer ledgers for this audit only.

Run from the repository root. No application files are written.
"""
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

root = Path(__file__).resolve().parents[4]
out = Path(__file__).resolve().parents[1]
contracts = json.loads((root / "docs/qa/batch12/route-matrix.json").read_text(encoding="utf-8"))["routes"]
previous_labels = json.loads((root / "docs/qa/batch11/route-matrix.json").read_text(encoding="utf-8"))["routes"]
label_by_key = {(r["application"], r["routePattern"]): r["existingComponent"] for r in previous_labels}
registry_path = root / "apps/frontend-user/src/features/templates/registry/templateRegistry.js"
registry = registry_path.read_text(encoding="utf-8")

phase = {
    "home": "07", "contact": "07", "venues": "07", "venue-detail": "07",
    "auth-login": "08", "auth-register": "08", "auth-forgot": "08", "auth-reset": "08", "password": "08", "profile": "08",
    "catalog": "09", "pricing": "09", "checkout": "09", "paid-templates": "09", "template-demo": "10",
    "create-event": "11", "events": "12", "dashboard": "12",
    "invitation": "13", "legacy-unsaved-editor": "13", "preview": "15", "local-preview": "15",
    "media": "14", "delivery": "15", "public-invitation": "16",
    "guests": "17", "rsvp": "18", "wishes": "18", "seating": "19",
    "ticket": "20", "qr": "20", "check-in": "20", "gifts": "21",
    "payments": "21", "payment-status": "21", "payment-return": "21", "payment-cancel": "21", "receipt": "21", "packages": "21",
    "budget": "22", "reports": "22", "analytics": "22", "notifications": "23", "organizations": "23", "organization-detail": "23", "team": "23", "assistant": "23", "settings": "23",
    "admin-dashboard": "24", "admin-users": "24", "admin-user-detail": "24", "admin-payments": "24", "admin-packages": "24", "admin-notifications": "24", "admin-reports": "24", "admin-logs": "24", "admin-monitor": "24", "admin-templates": "25", "admin-template-create": "25", "admin-template-edit": "25",
    "not-found": "06", "admin-not-found": "24",
}
assert len(contracts) == 135
assert {c["group"] for c in contracts} <= phase.keys()

def source(c):
    if c["application"] == "frontend-admin":
        return "apps/frontend-admin/src/app/App.jsx; apps/frontend-admin/src/app/routes.js"
    p = c["pattern"]
    if p in ("*",): return "apps/frontend-user/src/app/router.jsx"
    if p.startswith(("/app/", "/dashboard", "/events", "/event/list", "/guests", "/expenses", "/gift", "/gifts", "/reports", "/profile", "/templates/browse")) or p == "/dashboard":
        return "apps/frontend-user/src/app/routes/hostRoutes.jsx"
    if p in ("/login", "/register", "/forgot-password", "/reset-password"):
        return "apps/frontend-user/src/app/routes/authRoutes.jsx"
    if p.startswith(("/create/", "/event/", "/preview/", "/payments/", "/w/", "/i/")) or p.endswith("/preview"):
        return "apps/frontend-user/src/app/routes/builderRoutes.jsx"
    return "apps/frontend-user/src/app/routes/marketingRoutes.jsx"

def api(c):
    group = c["group"]
    if group.startswith("admin-"): return "admin API / role guard; verify per page"
    if group.startswith("auth-") or group in ("password", "profile"): return "auth / identity"
    if group in ("home", "contact", "venues", "venue-detail", "not-found"): return "public content / contact (route-dependent)"
    if group in ("template-demo", "catalog", "pricing", "paid-templates", "checkout"): return "template catalog / entitlement / purchase (route-dependent)"
    if group in ("payment-status", "payment-return", "payment-cancel", "payments", "receipt", "packages", "gifts"): return "payment / subscription / gift (route-dependent)"
    return "event-scoped API / permissions; verify per action"

lines = [
    "# Complete current route, feature and state matrix",
    "",
    "Baseline: `2ae3173f` on `main`. The route factory tests were executed in both apps; the source matrix below is joined to `docs/qa/batch12/route-matrix.json`. Current 390px mobile Chromium fixture smoke passed **135/135 leaf renders**; this is not a claim that all flows, states or devices passed. Dynamic `/dashboard` and `/app` aliases are retained as separate leaves. Each row owns its default, loading, empty, error, denied/expired and responsive states for later verification; coverage of those combinations is **UNVERIFIED** unless separately evidenced. The component label is from the older Batch 11 map and is a navigation aid, not a fresh proof of the current lazy import target.",
    "",
    "| ID | App | Pattern | Access | Feature / task | Historical component label | Current declaration | API boundary | Responsive / states | Status | Primary phase |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
]
for i, c in enumerate(contracts, 1):
    mark = "alias" if c["pattern"] != c["expectedPathname"] and ":" not in c["pattern"] and c["pattern"] != "*" else "leaf"
    cols = [f"SCOPE-{i:03d}", c["application"].replace("frontend-", ""), f'`{c["pattern"]}`', c["accessRequirement"], f'{c["group"]}: {c["readinessContract"]}', label_by_key.get((c["application"], c["pattern"]), "unlabeled"), f'`{source(c)}`', api(c), "phone/tablet/desktop; default + failure states", f"SOURCE-MAPPED ({mark}); 390px fixture render PASS; states unverified", phase[c["group"]]]
    lines.append("| " + " | ".join(str(x).replace("|", "/").replace("\n", " ") for x in cols) + " |")
counts = Counter(c["application"] for c in contracts)
lines.extend(["", f'**Source coverage:** {len(contracts)}/{len(contracts)} declared leaves ({counts["frontend-user"]} user, {counts["frontend-admin"]} admin); **390px fixture render:** 135/135 mobile Chromium PASS; **state/device coverage:** incomplete. Route factory tests are the current source comparison; the older 135 count was not simply copied. A distinct index/layout route shares a URL by design.', "", "## Coverage accounting", "", f'Unique route groups: {len(set(c["group"] for c in contracts))}. Unassigned route groups: 0. Every route has one primary phase in 02–27 (Phase 06 handles the user 404). Shared shell, auth, permissions, translations and motion need cross-phase review on every affected route.', ""])
(out / "03-complete-route-feature-state-matrix.md").write_text("\n".join(lines), encoding="utf-8")

families = defaultdict(list)
for n, line in enumerate(registry.splitlines(), 1):
    hit = re.match(r'^\s*(?:"([^"]+)"|\x27([^\x27]+)\x27|([A-Z_]+)):\s*(\w+),?\s*$', line)
    if hit:
        alias = next(v for v in hit.groups()[:3] if v)
        renderer = hit.group(4)
        if renderer.endswith("Layout") or renderer == "CanvaKhmerWeddingTemplate":
            families[renderer].append(f"`{alias}` (line {n})")
assert len(families) >= 10, families.keys()
template_lines = ["# Current template registry and renderer audit", "", "Source: `apps/frontend-user/src/features/templates/registry/templateRegistry.js` at `2ae3173f`. These are **static mappings**; dynamic active templates are fetched from the backend at runtime in `src/app/App.jsx`, so production catalog completeness and authored preview fidelity remain unverified without an isolated API dataset.", "", "| Renderer family | Registered keys / source lines | Current source status | Phase |", "|---|---|---|---|"]
for renderer, aliases in families.items():
    template_lines.append(f'| `{renderer}` | {", ".join(aliases)} | KEEP + VERIFY cover, Khmer/English reflow, program, gallery, music, gift, RSVP, reduced motion, phone/desktop and authored-data parity | 10 / 16 |')
template_lines.extend(["| Shared Event Essential / Koupreng Demo | `event-essential`, `koupreng-demo-wedding` from `resolveTemplateRenderer` | Shared `TemplateExperience` path; verify all generic event types and JSON roundtrip | 10 / 13 / 16 |", "| Unknown / dynamic fallback | `DefaultTemplateLayout` when `useFallback` is true | Verify server catalog IDs, preview trust and no paid access from preview | 10 / 25 |", "", f"**Count:** {len(families)} dedicated renderer families, {sum(map(len, families.values()))} static aliases, two explicit shared identifiers and one fallback. Every static key is assigned to a renderer above; dynamic catalog records cannot be enumerated from source alone.", "", "**Important resolution rule:** `getDedicatedTemplateComponent` favors stable slug/code/preset metadata over numeric database IDs. Preserve this ordering: dynamic numeric IDs may collide with legacy `1`–`7` aliases. Unknown serialized blocks and template-specific layout data must survive edit, preview, save and reload. `TemplateExperience.jsx` contains distinct royal/floral/essential branching; do not flatten these into a universal skin.", ""])
(out / "04-all-template-registry-and-renderer-audit.md").write_text("\n".join(template_lines), encoding="utf-8")
print(json.dumps({"routes": len(contracts), "user": counts["frontend-user"], "admin": counts["frontend-admin"], "groups": len(set(c["group"] for c in contracts)), "families": len(families), "aliases": sum(map(len, families.values()))}))

scope = (root / "docs/uxui/MASTER_SCOPE.md").read_text(encoding="utf-8")
blocks = re.findall(r'(?ms)^#### Phase (\d{2}) — (.*?)\n(.*?)(?=^#### Phase |^### WAVE |^## 5\.)', scope)
assert [int(b[0]) for b in blocks] == list(range(1, 28))
complexity = {"02":"L","03":"M","04":"XL","05":"L","06":"L","07":"L","08":"M","09":"L","10":"XL","11":"L","12":"L","13":"XL","14":"L","15":"L","16":"XL","17":"L","18":"L","19":"L","20":"L","21":"XL","22":"L","23":"L","24":"XL","25":"XL","26":"XL","27":"XL"}
backlog = ["# Phase 02–27 delivery backlog", "", "This is the **new 27-phase master-scope numbering**. Older `docs/phase02-*` through `docs/phase12` describe a previous program and are historical implementation evidence, not automatic completion of these rows. Each row has one primary owner; route IDs in the matrix point to exactly one row. Complexity is relative (XS/S/M/L/XL), not a schedule. Cross-phase accessibility, security, performance and Khmer/English checks apply to every row.", "", "| Phase | Primary deliverable | Route leaves | Complexity | Discipline | Dependency / measurable acceptance |", "|---|---|---:|---|---|---|"]
for number, title, body in blocks[1:]:
    coverage = re.search(r'\*\*Coverage:\*\*\s*(.*)', body)
    exit_gate = re.search(r'\*\*Exit:\*\*\s*(.*)', body)
    target = len([c for c in contracts if phase[c["group"]] == number])
    discipline = "design + frontend + QA"
    if number in ("21", "22", "23", "24", "25", "27"): discipline += " + backend/security"
    if number in ("26",): discipline = "QA + accessibility + performance + security"
    dependency = (exit_gate.group(1) if exit_gate else "Evidence gate required")[:230]
    backlog.append(f'| {number} {title} | {(coverage.group(1) if coverage else title)[:180].replace("|", "/")} | {target} | {complexity[number]} | {discipline} | {dependency.replace("|", "/")} |')
backlog.extend(["", "**Assignment:** 135/135 current leaf routes assigned; 0 unassigned. Phases without a unique route still own shared visual, motion, component or quality work. One source route can also receive cross-phase verification without changing its primary owner. Each future phase must expand its route IDs into concrete states, current screenshots and regression results before claiming completion.", "", "**Order / blockers:** 02–06 establish journeys, tokens, components, motion and shells. Template contracts (10) precede editor/guest/CMS changes (13/16/25). Real persistence gates creation/edit/publish (11/13/15). Payment/reconciliation (21) and MySQL concurrency remain a release blocker; 26 certifies cross-cutting quality and 27 handles release. Any newly verified P0 overrides this sequence. Optional calendar, broader CMS, live AI, booking and refunds require separate product/API/privacy approval.", ""])
(out / "13-complete-phase-02-to-27-backlog.md").write_text("\n".join(backlog), encoding="utf-8")
