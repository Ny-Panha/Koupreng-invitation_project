# 23 — github ci secret and guest test triage

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

Initial run [44479860498](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/44479860498) at ad02a263 had Secret Scan and Browser E2E failures. The securely redacted secret artifact identifies one generic-api-key finding at MASTER_SCOPE.md:121; inspected content is planning prose, not a credential. The scanner was not disabled and its failure remains a failure. The guest owner fixture expected zero Add guest buttons but received one; hiding that valid owner affordance just for a test is outside this phase.

The concurrent b18aae3 [run 44493698838](https://github.com/Ny-Panha/Koupreng-invitation_project/actions/runs/44493698838) additionally failed user/admin and repository-policy checks, and skipped browser. Logs identify the missing Node process import, deleted route matrices and missing docs/README. Those narrowly scoped repairs are recorded separately from the historical guest/secret issues. The new push, if performed, gets its own run/status and must not be called green while queued/running/red.

[CI triage](evidence/ci-triage.json) retains actual job IDs and redacted classification. The independently checksum-verified Gitleaks 8.30.1 scan of an exported tracked/reviewed tree found three matches: the same planning prose and two static synthetic JWT-signing test fixtures. All three are unchanged from ad02 after Git newline normalization. [Redacted classifications](evidence/secret-classifications.json) retain path/line/rule evidence without credential values. This scanner result is classified red, not green; no scanner was disabled. No external message, deployment or credential rotation was performed.

[Report index](README.md).
