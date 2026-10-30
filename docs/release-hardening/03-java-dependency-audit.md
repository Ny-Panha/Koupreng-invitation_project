# Java dependency remediation

The reference audit was a completed vulnerability scan, not an NVD outage. It failed on **CVE-2022-31691 (reported CVSS 9.8)** incorrectly associated with `org.springframework.boot:spring-boot-devtools:4.1.1`. The previous exact exception covered 4.0.8 only. [Spring's advisory](https://spring.io/security/cve-2022-31691/) identifies YAML editors in Spring Tools for Eclipse and VS Code; it does not identify the Maven runtime devtools artifact. Revalidated and scoped the existing exception to **4.1.1 and that single CVE**, expiring **29 January 2027**. Added an executable policy regression to reject version drift, broad package matches, missing expiry, and an expired exception.

Other reported advisories were below the existing CVSS 8 gate, but were remediated rather than hidden:

| Dependency | Path / exposure assessment | Change / primary evidence |
| --- | --- | --- |
| Netty transport 4.2.17.Final | Redis starter → Lettuce → Netty. This app uses servlet HTTP, so Netty HTTP request-smuggling reachability is not demonstrated; transport's CPE still reports CVE-2026-89044. | Netty BOM override to **4.2.18.Final**, retaining one coherent Netty release. [Upstream release](https://github.com/netty/netty/releases/tag/netty-4.2.18.Final). |
| MySQL Connector/J 9.7.0 | Runtime JDBC driver; reports CVE-2026-60586, CVE-2026-60623, CVE-2026-60624, CVE-2026-61082. Some components concern X Protocol; no assertion that every path is reachable. | Managed `mysql.version` to **26.7.0**, the vendor's new release numbering, without changing server schema or Spring Boot. [Oracle release notes](https://dev.mysql.com/doc/relnotes/connector-j/en/news-26-7-0.html), [July advisory](https://dev.mysql.com/community/security/advisories/2026-07-21/). |

Spring Boot remains 4.1.1 and Java remains 25. No application authorization/payment code was modified. No new CVE suppression for MySQL or Netty was added. CVSS threshold remains **8**; `nvdValidForHours=0` and official source validation remain enforced. Node lockfiles and Python requirements are unchanged; both Node audits and Python pip-audit returned zero known vulnerabilities locally.

## Embedded Swagger UI finding and removal

The current-main CI audit additionally reports **DOMPurify 3.4.16 compiled inside Swagger UI 5.34.0**, CVE-2026-116802, CVE-2026-116803 and CVE-2026-116804 (the latter two exceed the unchanged CVSS 8 gate). Path: `springdoc-openapi-starter-webmvc-ui:3.2.0 ? org.webjars:swagger-ui:5.34.0 ? bundled JavaScript`. [DOMPurify 3.4.17](https://github.com/cure53/DOMPurify/releases/tag/3.4.17) addresses these issues. A top-level dependency override cannot replace compiled WebJar contents.

The project already has Scalar at `/docs`. Removed the redundant Swagger UI starter and retained `springdoc-openapi-starter-webmvc-scalar:3.2.0`, which supplies OpenAPI generation. Legacy `/swagger-ui.html` and `/swagger-ui/index.html` bookmarks redirect to `/docs` when documentation switches are enabled. Production documentation defaults remain disabled. Tests verify OpenAPI schemas/security, Scalar CSP, both redirects, absence of the vulnerable WebJar URL, disabled documentation, and architecture boundaries: **20 focused tests passed**. An executable policy test prevents the Swagger starter from being reintroduced.

The completed remediated audit, `./mvnw.cmd --batch-mode --update-snapshots -Pdependency-security -DskipTests verify`, returned **BUILD SUCCESS / exit 0**, 30 October 2026, **514.32 seconds** wall time (8:17 Maven time). Source selection used the current official NVD feed (`2026-10-30T01:00:10-04:00`); no CVE exception was added for DOMPurify. Earlier failed audits are retained as diagnostic evidence, not counted as passing. The final pushed-commit CI audit is reported separately.
