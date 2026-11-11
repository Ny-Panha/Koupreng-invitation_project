"""Reconcile the current Batch 12 leaf contracts with the Phase 02 ownership table.

Run from the repository root: python docs/uxui/phase04-reusable-component-system-2026-11-11/evidence/generate-inventory.py
This is source/contract inventory, not proof that every route state was browser tested.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
routes = json.loads((ROOT / "docs/qa/batch12/route-matrix.json").read_text(encoding="utf-8"))["routes"]
mapping = (ROOT / "docs/uxui/phase02-experience-architecture-2026-11-11/04-all-routes-to-ia-mapping.md").read_text(encoding="utf-8")

owners = {}
for line in mapping.splitlines():
    if not line.startswith("| SCOPE-"):
        continue
    fields = [cell.strip() for cell in line.strip("|").split("|")]
    if len(fields) < 11:
        raise ValueError(f"Malformed ownership row: {line}")
    route_id, app, pattern, shell, access, group, owner, _, _, phase, _ = fields[:11]
    key = ("frontend-" + app, pattern.strip("`"))
    if key in owners:
        raise ValueError(f"Duplicate owner: {key}")
    owners[key] = {"routeId": route_id, "sourceOwner": owner, "shell": shell, "phase": phase}

# These are source-verified direct consumer families, not a claim about all transitive imports.
adopters = {
    ("frontend-user", "organizations"): ("form-field", "loading-button"),
    ("frontend-user", "organization-detail"): ("responsive-table", "status-badge"),
    ("frontend-user", "payments"): ("status-badge",),
    ("frontend-user", "rsvp"): ("search-input", "status-badge"),
    ("frontend-user", "guests"): ("responsive-table", "search-input", "status-badge"),
    ("frontend-user", "delivery"): ("responsive-table", "status-badge"),
    ("frontend-user", "qr"): ("loading-button",),
    ("frontend-user", "assistant"): ("form-field", "loading-button"),
    ("frontend-admin", "admin-dashboard"): ("action-button", "status-badge"),
    ("frontend-admin", "admin-templates"): ("action-button", "status-badge", "stat-card", "toast"),
    ("frontend-admin", "admin-reports"): ("action-button",),
    ("frontend-admin", "admin-packages"): ("stat-card", "toast"),
    ("frontend-admin", "admin-payments"): ("toast",),
    ("frontend-admin", "admin-notifications"): ("toast",),
    ("frontend-admin", "admin-users"): ("toast",),
    ("frontend-admin", "admin-template-edit"): ("toast",),
}

ledger = []
for row in routes:
    key = (row["application"], row["pattern"])
    if key not in owners:
        raise ValueError(f"Unowned route: {key}")
    info = owners[key]
    adopted = list(adopters.get((row["application"], row["group"]), ()))
    ledger.append({
        "routeId": info["routeId"], "app": row["application"], "pattern": row["pattern"],
        "featureGroup": row["group"], "primaryPhase": info["phase"],
        "sourceOwnerOrAlias": info["sourceOwner"], "componentFamiliesPresent": adopted if adopted else ["NOT VERIFIED - route-specific inventory remains"],
        "adoptedHere": adopted, "coveredStates": "focused primitive unit" if adopted else "NOT TESTED in Phase 04",
        "testedViewportLocaleMode": "fixture capture if in before/after manifest; otherwise NOT TESTED",
        "status": "PARTIAL" if adopted else "DEFERRED", "deferredWork": "full source import graph and all states in primary phase",
    })

if len(ledger) != 135 or len({r["featureGroup"] for r in ledger}) != 62:
    raise ValueError("Unexpected leaf/group count; inspect current route factory")
if len(owners) != len(ledger):
    raise ValueError(f"Ownership mismatch: {len(owners)} mapping rows, {len(ledger)} contracts")

family_names = {
    "ActionButton": "actions", "LoadingButton": "actions", "SearchInput": "fields/search",
    "FormField": "fields", "Modal": "overlays", "ConfirmDialog": "overlays",
    "StatusBadge": "status", "Toast": "feedback", "ToastContainer": "feedback",
    "ResponsiveTable": "data", "AdminUI": "actions/data/navigation/status",
    "DatePicker": "fields", "TimePicker": "fields", "StudioPanelResize": "studio chrome",
    "LoadingState": "feedback", "EmptyState": "feedback", "ErrorState": "feedback",
    "MediaImage": "media", "PhoneFrame": "preview chrome", "RouteErrorBoundary": "feedback",
    "RouteLoadingSkeleton": "feedback", "Skeleton": "feedback", "AdminSkeleton": "feedback",
    "Accordion": "selection", "AnimatedTabs": "navigation", "States": "feedback",
    "AnimatedNumber": "metrics", "NumberTicker": "metrics", "ScrollReveal": "motion",
}
register = []
for app in ("frontend-user", "frontend-admin"):
    base = ROOT / "apps" / app / "src" / "shared" / "ui"
    for path in sorted(base.rglob("*.jsx")):
        if path.name.endswith(".test.jsx"):
            continue
        name = path.stem
        changed = name in ({"FormField", "LoadingButton", "ResponsiveTable", "SearchInput", "StatusBadge"} if app == "frontend-user" else {"Toast"})
        rel = path.relative_to(ROOT).as_posix()
        consumers = []
        # Exact named references still need manual review for barrel imports and aliases.
        for candidate in (ROOT / "apps" / app / "src").rglob("*.jsx"):
            if candidate == path or candidate.name.endswith(".test.jsx"):
                continue
            body = candidate.read_text(encoding="utf-8")
            if re.search(r"\b" + re.escape(name) + r"\b", body):
                consumers.append(candidate.relative_to(ROOT).as_posix())
        register.append({
            "id": rel, "family": family_names.get(name, "specialized / review"),
            "source": rel, "api": "See exported component signature in source", "app": app,
            "textualImportOrUseCandidates": consumers, "importingRoutesGroups": "See route-adoption.json; candidates need manual graph review",
            "currentVariants": "See source", "targetStates": "loading, error, disabled, focus, responsive as applicable",
            "decision": "ADOPT" if changed else "KEEP / DEFER pending family audit",
            "implemented": changed,
            "evidence": "Phase 04 focused unit + fixture capture for changed families" if changed else "source inventory only",
            "riskOwner": "Primary route phase owner; source candidates are textual, not exhaustive",
        })

admin_ui = "apps/frontend-admin/src/shared/ui/AdminUI.jsx"
for symbol in ("AdminPageHeader", "StatCard", "StatusBadge", "ActionButton", "SearchInput", "FilterTabs", "DataTable", "LoadingState", "ErrorStateView", "EmptyState"):
    register.append({
        "id": f"{admin_ui}#{symbol}", "family": family_names.get(symbol, "data/navigation"),
        "source": admin_ui, "api": f"export function {symbol}; see signature in source", "app": "frontend-admin",
        "textualImportOrUseCandidates": [], "importingRoutesGroups": "See source and route-adoption.json; barrel import requires graph review",
        "currentVariants": "See source", "targetStates": "focus, disabled, busy, responsive, light/dark as applicable",
        "decision": "ADOPT" if symbol in {"StatCard", "StatusBadge", "ActionButton"} else "KEEP / DEFER pending family audit",
        "implemented": symbol in {"StatCard", "StatusBadge", "ActionButton"},
        "evidence": "Phase 04 focused unit" if symbol in {"StatCard", "StatusBadge", "ActionButton"} else "source inventory only",
        "riskOwner": "Admin primary route phase owner",
    })

(OUT / "route-adoption.json").write_text(json.dumps(ledger, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
(OUT / "component-register.json").write_text(json.dumps(register, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
def cell(value):
    if isinstance(value, list):
        value = ", ".join(value)
    return str(value).replace("|", "\\|").replace("\n", " ")

component_headers = ("ID", "family", "source", "API", "app", "importing routes/groups", "current variants", "target states", "decision", "implemented", "evidence", "risk/owner")
component_keys = ("id", "family", "source", "api", "app", "importingRoutesGroups", "currentVariants", "targetStates", "decision", "implemented", "evidence", "riskOwner")
lines = ["# Component register", "", "Generated by `generate-inventory.py`. Import candidates in JSON are textual references, so this is an inventory and disposition ledger, not an exhaustive resolved import graph.", "", "| " + " | ".join(component_headers) + " |", "| " + " | ".join("---" for _ in component_headers) + " |"]
for item in register:
    lines.append("| " + " | ".join(cell(item[key]) for key in component_keys) + " |")
(OUT / "component-register.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

route_headers = ("route ID", "app", "feature group", "primary phase", "component families present", "adopted here", "covered states", "tested viewport/locale/mode", "status", "deferred work")
route_keys = ("routeId", "app", "featureGroup", "primaryPhase", "componentFamiliesPresent", "adoptedHere", "coveredStates", "testedViewportLocaleMode", "status", "deferredWork")
lines = ["# Route adoption ledger", "", "Generated from 135 current Batch 12 route contracts and Phase 02 ownership mapping. `PARTIAL` means the route group references a changed primitive; it does not claim that the leaf or every state was browser tested. A shared `auth-login` name occurs in both apps (62 named groups, 63 app/group pairs).", "", "| " + " | ".join(route_headers) + " |", "| " + " | ".join("---" for _ in route_headers) + " |"]
for item in ledger:
    lines.append("| " + " | ".join(cell(item[key]) for key in route_keys) + " |")
(OUT / "route-adoption.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(json.dumps({"leaves": len(ledger), "groups": len({r['featureGroup'] for r in ledger}),
                  "appGroupPairs": len({(r['app'], r['featureGroup']) for r in ledger}),
                  "directAdoptionLeaves": sum(bool(r["adoptedHere"]) for r in ledger),
                  "registeredComponentRows": len(register), "byApp": dict(Counter(r["app"] for r in ledger))}))
