# Dependency and Static Analysis Audit

Audit refreshed: 2026-09-15. Backend OWASP evidence refreshed: 2026-09-20.

## User frontend

- `npm ci --no-audit` reproduces the lockfile (385 packages on the local platform).
- `npm audit --audit-level=high` reports 0 vulnerabilities after lockfile remediation of the earlier Vitest/Browserslist/js-yaml advisory chain.
- ESLint, 124 Vitest tests, Knip file/dependency/unlisted/binary analysis, depcheck, and Vite 8.2.1 build pass.
- The 1,509.16 kB JavaScript and 569.37 kB CSS outputs remain performance warnings, not hidden failures.

## Admin frontend

- `npm ci --no-audit` reproduces the lockfile (331 packages on the local platform).
- `npm audit --audit-level=high` reports 0 vulnerabilities.
- ESLint, 10 Vitest tests, Knip, depcheck, and the Vite 8.2.1 build pass.
- The 515.36 kB JavaScript output remains slightly above the configured warning threshold.

## Telegram bot

- Runtime and development requirements are exactly pinned.
- Ruff, 26 pytest tests, Bandit against `main.py`/`start.py`, and compileall pass.
- `pip-audit -r requirements.txt` reports no known vulnerabilities in declared runtime requirements.

## Backend

- `mvnw.cmd verify` passes with 246 tests discovered (245 passed, 1 disposable-MySQL skip), SpotBugs 4.10.3.0 at High threshold reporting no findings/errors, and PMD 7.17.0 reporting no violations.
- JaCoCo 0.8.15 reports 50.20% line and 34.91% branch coverage; no minimum is configured.
- `mvnw.cmd dependency:analyze` succeeds but emits standard Spring Boot starter aggregation warnings. Those warnings are not evidence for replacing starters with every transitive module, so no blind dependency rewrite was made. The direct YAML parser is test-used by the semantic OpenAPI drift test.
- OWASP Dependency-Check 12.2.2 is wired through the opt-in `dependency-security` profile, fails the build at CVSS 7 or higher, and emits HTML plus JSON reports.

## Java advisory result

The 2026-09-20 local Dependency-Check run completed its NVD and CISA KEV updates without an `NVD_API_KEY` and analyzed 114 dependencies. An initial scan found Netty `4.2.17.Final` affected by `CVE-2026-89044`; the BOM override was upgraded to patched `4.2.18.Final`. The final scan reports **0 unsuppressed known vulnerabilities**.

The single suppression is an exact-version, documented false positive for `CVE-2022-31691`, which affects Spring Tools IDE extensions rather than the Spring Boot DevTools Maven artifact. See `backend-owasp-verification.md`. The Sonatype OSS Index analyzer was unavailable without credentials; NVD and CISA KEV completed. A successful CI report for the exact release commit remains required before release.

## Secret tooling provenance

Local Gitleaks 8.30.1 was downloaded from its pinned release, verified against the release checksum list, and run with redaction. The exported tracked tree reports zero findings. Full history reports 32 findings across 15 file/rule groups; see the incident register rather than treating test-placeholder matches as either automatically safe or automatically exploitable.
