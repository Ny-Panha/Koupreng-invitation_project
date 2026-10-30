# CI failure triage

GitHub connector logs were retrieved for reference run `40804326803` and jobs inspected for current-main run `40880792891`. Reference run has seven successful jobs and three failed jobs. Current-main secret and reporting browser failures recur; dependency audit initially remained in progress.

| Job | Verified evidence | Reproduction / success condition |
| --- | --- | --- |
| Secret Scan | Pinned Gitleaks 8.30.1 checksum succeeds; directory scan finds one leak and exits 1. Default logs omit finding locations. | Same version, `dir` scan of tracked source, redacted JSON; zero findings required. |
| Dependency Vulnerability Audit | Reference audit completes NVD refresh and fails CVSS >=8 on CVE-2022-31691 mapped to `spring-boot-devtools:4.1.1`. Existing suppression only covers 4.0.8. Also reports MySQL 9.7.0 and Netty 4.2.17 advisories below the existing failure threshold; investigate rather than dismiss. | Current NVD source plus `mvnw -Pdependency-security -DskipTests verify`; retain threshold and mandatory refresh. |
| Browser E2E & Route Smoke | Critical routes and all-route smoke succeed; reporting script times out clicking `.report-export-menu summary`. | Build admin, generate backend fixtures, preview on 4184, run both exact reporting scripts and validate exports/PDF. |
| Backend build/static | Current-main jobs succeed, including clean verify, coverage, SpotBugs, PMD and dependency usage. | Repeat locally; CI coverage artifact `backend-jacoco-report`. |
| User/admin frontend | Current-main lint, Vitest, Knip, dependency analysis and production bundles succeed. | Repeat clean install and all scripts; artifacts `frontend-user-dist`, `frontend-admin-dist`. |
| Worker | Current-main lint, pytest, Bandit and compile succeed. | Repeat in worker virtual environment. |
| Fresh MySQL | Current-main selected nine migration/integrity classes succeed. | Repeat in disposable MySQL and inspect additional environment-gated HTTP coverage. |
| Deployment configuration | Current-main repository-policy, YAML, script, Compose and Docker checks succeed. | Repeat applicable local checks; no production changes. |

Browser evidence artifacts: `admin-reports-workspace-evidence`, `playwright-diagnostics`. Frontend/browser jobs install via lockfiles; Maven jobs use setup-java's Maven cache. No vulnerability database cache is initially configured. Findings and fixes are expanded in reports 02–07; final results supersede this initial snapshot.

Final baseline run `40880792891`: **7 successful jobs, 3 failed jobs**. Retrieved current-main dependency logs after completion: alongside the older devtools mapping, Swagger UI's embedded DOMPurify has newly published CVEs that also fail the threshold. See report 03; this is an actual additional finding, not a feed/provider failure.
