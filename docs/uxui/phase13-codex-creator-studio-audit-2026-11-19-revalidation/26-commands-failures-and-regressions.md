# Exact invocations and retained failures

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

test-runs.json records the command, repository-root cwd, start/finish UTC, duration, real exit code, log path and SHA-256 for each recorded execution. PowerShell read-only inspections also exposed the invalid initial ignored-files command, missing expected docs, and a quoted Unicode filename in an initial freeze script; these were corrected without editing unrelated source. Raw logs are retained outside the publication candidate.

The first new negatives failed before repair. Intermediate full-unit runs include a superseded 403 expectation and an overloaded real-form timeout; the isolated contract was moved to its own test file with a mocked preview, without extending timeouts. Browser failures and isolated reruns remain separate. Backend tests regenerate tracked synthetic reporting fixtures; those output changes are preserved and excluded rather than included in a Studio commit. No overlapping suite totals are added together.

Evidence:

- [test-runs.json](evidence/test-runs.json)
- [generated-test-output-exclusions.json](evidence/generated-test-output-exclusions.json)
- [ci-observed.json](evidence/ci-observed.json)

[Report index](README.md).
