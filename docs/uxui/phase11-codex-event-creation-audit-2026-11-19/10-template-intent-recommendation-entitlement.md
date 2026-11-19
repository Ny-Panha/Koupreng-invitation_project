# 10 — template intent recommendation entitlement

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

Existing intent accepts `template`, `templateCode`, `templateId`, `tpl`; keys are normalized, two-hour session TTL is checked, and stable code/slug identity protects static renderer collisions. `templateUsePath` bounds next destinations to supported same-origin creation/browse routes. No pricing, checkout or USD/KHR behavior changed.

Premium selection requires literal true access. False offers the existing purchase path. Loading/unknown cannot unlock; rejected/malformed access now has an explicit retry. Account remount and recommendation/retry generation prevent old grants from becoming current. Verified free designs remain selectable while paid verification fails.

Source/unit intent tests and loaded error/denied/free browser states are linked in the [intent/entitlement matrix](evidence/template-intent-entitlement-matrix.json). Provider responses are intercepted. Exhaustive live login/session-expiry/filter permutations and dynamic provider availability remain unverified, and server creation still rechecks paid access.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
