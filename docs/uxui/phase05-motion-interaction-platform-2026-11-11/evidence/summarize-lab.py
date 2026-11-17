"""Summarize the ignored, isolated Phase 05 Chromium fixture lab."""

import json
from collections import defaultdict
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parents[4]
LAB = ROOT / "output/playwright/uxui-phase05-2026-11-11/lab-results.json"
OUT = Path(__file__).with_name("lab-summary.json")


def metric(rows, name):
    values = [row[name] for row in rows if isinstance(row.get(name), (int, float))]
    return {
        "valid": len(values),
        "status": "MEASURED" if len(values) >= 3 else "INSUFFICIENT DATA",
        "median": round(median(values), 2) if len(values) >= 3 else None,
        "min": round(min(values), 2) if len(values) >= 3 else None,
        "max": round(max(values), 2) if len(values) >= 3 else None,
    }


lab = json.loads(LAB.read_text(encoding="utf-8"))
groups = defaultdict(list)
for sample in lab["samples"]:
    key = tuple(sample[field] for field in ("stage", "name", "width", "motion", "cache"))
    groups[key].append(sample)

conditions = []
for key, rows in sorted(groups.items()):
    stage, name, width, motion, cache = key
    asset_bytes = []
    for row in rows:
        asset_bytes.append(sum(item.get("transferSize") or 0 for item in row.get("resources", [])))
    conditions.append({
        "stage": stage, "surface": name, "width": width, "motion": motion, "cache": cache,
        "observations": len(rows),
        "load_ms": metric(rows, "load"), "fcp_ms": metric(rows, "fcp"),
        "lcp_ms": metric(rows, "lcp"), "cls": metric(rows, "cls"),
        "long_task_count": metric(rows, "longTaskCount"),
        "long_task_total_ms": metric(rows, "longTaskTotal"),
        "asset_transfer_bytes": metric([{"value": value} for value in asset_bytes], "value"),
        "lcp_elements": sorted({row["lcpElement"] for row in rows if row.get("lcpElement")}),
    })

bundles = []
for stage in ("before", "after"):
    for app in ("user", "admin"):
        files = [row for row in lab["bundles"] if row["stage"] == stage and row["app"] == app]
        bundles.append({
            "stage": stage, "app": app, "asset_count": len(files),
            "all_assets_bytes": sum(row["bytes"] for row in files),
            "all_assets_gzip_bytes": sum(row["gzip"] for row in files),
            "all_assets_brotli_bytes": sum(row["brotli"] for row in files),
            "entry": [row for row in files if row["file"].startswith("assets/index-")],
        })

by_condition = defaultdict(dict)
for row in conditions:
    key = (row["surface"], row["width"], row["motion"], row["cache"])
    by_condition[key][row["stage"]] = row
comparisons = []
for (surface, width, motion, cache), pair in sorted(by_condition.items()):
    before, after = pair.get("before"), pair.get("after")
    if not before or not after:
        continue
    deltas = {}
    for name in ("load_ms", "fcp_ms", "lcp_ms", "cls", "long_task_total_ms", "asset_transfer_bytes"):
        old = before[name]["median"]
        new = after[name]["median"]
        deltas[name] = round(new - old, 2) if old is not None and new is not None else None
    comparisons.append({"surface": surface, "width": width, "motion": motion,
                        "cache": cache, "delta_after_minus_before": deltas})

summary = {
    "browser": lab["browser"], "fixture": lab["fixture"], "conditions": lab["conditions"],
    "sample_count": len(lab["samples"]), "error_count": len(lab["errors"]),
    "errors": lab["errors"], "bundle_totals_not_initial_payload": bundles,
    "navigation_condition_medians": conditions,
    "paired_median_deltas": comparisons,
    "limitations": [
        "Loopback Chromium fixture timing is not field Core Web Vitals or INP.",
        "Three observations are required for each condition and each metric separately.",
        "Long-task and resource transfer measurements are browser API approximations.",
        "The lab has no controlled interaction-latency, frame-jank, memory, or media-decode series.",
    ],
}
OUT.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"{len(lab['samples'])} samples, {len(lab['errors'])} errors, {len(conditions)} condition rows")
