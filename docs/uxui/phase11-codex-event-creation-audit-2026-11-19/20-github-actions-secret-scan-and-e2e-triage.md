# 20 — github actions secret scan and e2e triage

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

GitHub run [44439374315](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/44439374315), SHA `0cf4755b`, was independently retrieved through the connected read-only GitHub tools. **Secret Scan** and **Browser E2E & Route Smoke** are completed failures; other listed jobs succeeded. This is the historical run's actual status, not a claim that every current CI execution is broken.

The securely redacted artifact has one generic-api-key finding at `docs/uxui/MASTER_SCOPE.md:121`. Local inspection shows ordinary scope prose; no credential is identified. No matched secret string is copied to this package. DevOps/security scanning owns a narrow reviewed rule/prose remediation and rerun. The failed job is not green merely because the finding was classified.

The guest test was reproduced on desktop/mobile: expected zero Add guest buttons, found one. The actual header button focuses the existing inline guest form; the owner-capable fixture and unchanged source do not demonstrate an access grant. Guest product/QA must decide the intended affordance and reconcile behavior/assertion in that domain. Neither button nor assertion was changed just to pass.

[Job metadata, redacted finding and owner actions](evidence/github-actions-triage.json). No workflow was rerun, protection disabled, credential rotated or external message sent.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
