# Backend OWASP Verification

Evidence date: 2026-09-20. Branch: `feat/week2-backend-security-owasp`.

## Outcome

- OWASP Dependency-Check 12.2.2 completed against the refreshed local NVD and CISA KEV data.
- 114 runtime/compile dependencies were analyzed with **0 unsuppressed known vulnerabilities**.
- The scan fails on CVSS 7.0 or higher, covering High and Critical findings.
- HTML and JSON reports are generated at `apps/backend/target/dependency-check-report.html` and `apps/backend/target/dependency-check-report.json`.

## Finding and remediation

The first scan found `CVE-2026-89044` in `io.netty:netty-transport:4.2.17.Final`, included through Spring Data Redis, Lettuce, and Netty. The issue permits HTTP request smuggling through incomplete validation of malformed `Transfer-Encoding` values (CVSS 3.1: 6.5, Medium).

Netty's [maintainer advisory](https://github.com/netty/netty/security/advisories/GHSA-hcvj-94mj-jp5c) identifies `4.2.18.Final` as the patched 4.2 release. The Netty BOM override was upgraded to that version, and Maven dependency resolution plus the packaged application now use `4.2.18.Final`.

## Reviewed exception

`CVE-2022-31691` remains suppressed only for `org.springframework.boot:spring-boot-devtools:4.0.8`. The CVE applies to Spring Tools 4 IDE/VS Code extensions, not the similarly named Spring Boot DevTools Maven artifact. The suppression is documented and exact-version scoped in `apps/backend/dependency-check-suppressions.xml`; a dependency upgrade requires review.

## Verification

```powershell
cd apps/backend
.\mvnw.cmd clean package
.\mvnw.cmd -Pdependency-security org.owasp:dependency-check-maven:check
.\mvnw.cmd dependency:tree "-Dincludes=io.netty:netty-transport"
```

- Package: **BUILD SUCCESS**.
- Tests: **246 run, 0 failures, 0 errors, 1 skipped**. The skip is the existing opt-in disposable MySQL migration test.
- API documentation/security integration tests: **14 run, 0 failures**. These cover public Scalar, Swagger UI, and OpenAPI access; strict CSP on normal API responses; protected API authentication; admin authorization; and disabled production-style documentation switches.
- Dependency scan: **BUILD SUCCESS**, 0 unsuppressed findings; Netty resolved to `4.2.18.Final`.

Dependency-Check is a best-effort scanner. Test-scope dependencies are intentionally excluded by the Maven profile. The Sonatype OSS Index analyzer was unavailable without credentials during this run; the NVD and CISA KEV updates completed successfully.
