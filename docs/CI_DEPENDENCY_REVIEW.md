# CI dependency and action review (2026-10-03)

This repair removes Depcheck from both frontends and retains both explicit Knip gates. npm audit keeps its HIGH threshold; Knip still checks files, dependencies, unlisted packages and binaries. No advisory, static-analysis or dependency-analysis exclusions are added.

## Frontend lockfiles

| Frontend | Removed lock entries | Added entries | Changed shared package versions |
| --- | ---: | ---: | ---: |
| frontend-user | 81 | 0 | 0 |
| frontend-admin | 81 | 0 | 0 |

All removed package entries are development dependencies. Root manifest entries reflect the Depcheck removal. Existing shared package versions and production dependencies are unchanged; npm refreshed metadata only where necessary. Both fresh npm ci installs and audit --audit-level=high return zero vulnerabilities.

The removed chain is depcheck 1.4.7 -> findup-sync -> micromatch -> braces 3.0.3. [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) reports an unpatched recursive-pattern denial of service in braces <=3.0.3.

## Actions

Official tag refs and action.yml at each release commit were checked before upgrading. All five use Node 24. Application toolchains remain Node 22, Java 25 and Python 3.13; ubuntu-latest uses a compatible hosted runner. Existing workflow gates, thresholds, permissions, triggers and job dependencies are unchanged.

Run #151 passed nine jobs and both npm audits, then failed the Java audit while refreshing the NVD API (HTTP 429). The owner confirmed that no NVD API key is available. Java auditing now uses NVD's official JSON 2.0 annual and modified feeds through Dependency-Check's [supported datafeed configuration](https://dependency-check.github.io/DependencyCheck/data/mirrornvd.html). No API key or private mirror is required.

`scripts/ci/check-nvd-feed.mjs` requires the official modified-feed timestamp to be at most four hours old before CI auditing. Missing, malformed, duplicate, excessively future-dated or stale timestamps, HTTP errors and network failures fail the job. The security profile sets `nvdValidForHours` to zero so every invocation checks the remote metadata and applies required updates, including when a Maven cache exists. Annual feeds initialize the complete database; the modified feed updates it. Existing CVSS 8, test-scope policy, suppressions and fail-on-error behavior are unchanged. Feed outages or stale publications remain a failing security gate.

| Official release | Verified commit |
| --- | --- |
| [actions/checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| [actions/setup-node v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0) | `820762786026740c76f36085b0efc47a31fe5020` |
| [actions/setup-java v6.0.1](https://github.com/actions/setup-java/releases/tag/v6.0.1) | `de7274f081f381c8f8158605e0321c36c376e2e6` |
| [actions/setup-python v7.0.0](https://github.com/actions/setup-python/releases/tag/v7.0.0) | `5fda3b95a4ea91299a34e894583c3862153e4b97` |
| [actions/upload-artifact v7.0.1](https://github.com/actions/upload-artifact/releases/tag/v7.0.1) | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` |

## Maven: used undeclared

Reviewed against dependency:analyze -Dverbose and source imports. Five independently consumed library APIs are now direct dependencies. Other rows belong to deliberate Boot/Springdoc/test aggregates and remain visible informational warnings rather than new exclusions. These aggregates provide coordinated APIs, auto-configuration and runtime providers; redeclaring every implementation dependency would duplicate their contract.

| Dependency | Representative bytecode usage | Decision |
| --- | --- | --- |
| `com.tngtech.archunit:archunit:jar:1.5.0:test` | `com.tngtech.archunit.lang.syntax.elements.GivenClassesConjunction` | Retain through archunit-junit5, the intentional test engine/API aggregate. |
| `org.junit.jupiter:junit-jupiter-params:jar:6.0.3:test` | `org.junit.jupiter.params.provider.ValueSource` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `jakarta.persistence:jakarta.persistence-api:jar:3.2.0:compile` | `jakarta.persistence.ForeignKey` | Retain through data-jpa starter; entity annotations and EntityManager are the JPA contract. |
| `org.springframework.security:spring-security-test:jar:7.0.7:test` | `org.springframework.security.test.context.support.WithMockUser` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `org.springframework.data:spring-data-jpa:jar:4.0.7:compile` | `org.springframework.data.jpa.repository.Modifying` | Retain through data-jpa starter; repositories, transactions and auditing use its coordinated APIs. |
| `org.springframework:spring-tx:jar:7.0.9:compile` | `org.springframework.transaction.TransactionDefinition` | Retain through data-jpa starter; repositories, transactions and auditing use its coordinated APIs. |
| `org.hamcrest:hamcrest:jar:3.0:test` | `org.hamcrest.Matcher` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `org.springframework.boot:spring-boot-autoconfigure:jar:4.0.8:compile` | `org.springframework.boot.autoconfigure.SpringBootApplication` | Retain through Boot starters; configuration, dependency injection and application startup use the Boot platform contract. |
| `io.swagger.core.v3:swagger-annotations-jakarta:jar:2.2.55:compile` | `io.swagger.v3.oas.annotations.media.Schema` | Retain through Springdoc starters; controller OpenAPI annotations match the Springdoc implementation. |
| `org.springframework.data:spring-data-redis:jar:4.0.7:compile` | `org.springframework.data.redis.core.StringRedisTemplate` | Retain through data-redis starter; session/cache adapters use its coordinated Redis API. |
| `org.mockito:mockito-core:jar:5.20.0:test` | `org.mockito.verification.VerificationMode` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `org.springframework:spring-beans:jar:7.0.9:compile` | `org.springframework.beans.factory.annotation.Value` | Retain through Boot starters; configuration, dependency injection and application startup use the Boot platform contract. |
| `org.springframework:spring-core:jar:7.0.9:compile` | `org.springframework.core.convert.converter.Converter` | Retain through Boot starters; configuration, dependency injection and application startup use the Boot platform contract. |
| `org.springframework.security:spring-security-config:jar:7.0.7:compile` | `org.springframework.security.config.annotation.web.configurers.HttpBasicConfigurer` | Retain through security/resource-server starters; authorization, password and JWT contracts use their coordinated APIs. |
| `org.springframework.security:spring-security-oauth2-core:jar:7.0.7:compile` | `org.springframework.security.oauth2.core.OAuth2AuthenticationException` | Retain through security/resource-server starters; authorization, password and JWT contracts use their coordinated APIs. |
| `org.springframework.security:spring-security-web:jar:7.0.7:compile` | `org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler` | Retain through security/resource-server starters; authorization, password and JWT contracts use their coordinated APIs. |
| `com.fasterxml.jackson.core:jackson-annotations:jar:2.21:compile` | `com.fasterxml.jackson.annotation.JsonProperty` | Declare directly; authentication/user DTOs import JsonAlias and JsonProperty. Boot-managed version unchanged. |
| `org.aspectj:aspectjweaver:jar:1.9.25.1:compile` | `org.aspectj.lang.annotation.Aspect` | Retain through data-jpa starter AOP aggregate; AuditActivityAspect uses advice/join point APIs. |
| `io.swagger.core.v3:swagger-models-jakarta:jar:2.2.55:compile` | `io.swagger.v3.oas.models.security.SecurityScheme` | Retain through Springdoc starters; OpenApiConfig constructs the matching OpenAPI model. |
| `io.micrometer:micrometer-core:jar:1.16.7:compile` | `io.micrometer.core.instrument.Counter` | Retain through actuator starter; UserAuthCacheService records meters. |
| `org.assertj:assertj-core:jar:3.27.7:test` | `org.assertj.core.api.ThrowableAssert` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `org.springframework.boot:spring-boot-test:jar:4.0.8:test` | `org.springframework.boot.test.context.runner.AbstractApplicationContextRunner` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `org.springframework.boot:spring-boot-webmvc-test:jar:4.0.8:test` | `org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `org.apache.tomcat.embed:tomcat-embed-core:jar:11.0.25:compile` | `jakarta.servlet.ServletInputStream` | Retain through WebMVC starter; Jakarta servlet request/response/filter contracts match its embedded server. |
| `org.springframework:spring-web:jar:7.0.9:compile` | `org.springframework.web.bind.annotation.PathVariable` | Retain through WebMVC starter; controller, HTTP client and MVC APIs match its runtime stack. |
| `org.springframework.security:spring-security-core:jar:7.0.7:compile` | `org.springframework.security.authentication.BadCredentialsException` | Retain through security/resource-server starters; authorization, password and JWT contracts use their coordinated APIs. |
| `org.hibernate.orm:hibernate-core:jar:7.2.24.Final:compile` | `org.hibernate.annotations.CreationTimestamp` | Retain through data-jpa starter; entity SQLDelete/Immutable/timestamp annotations match its Hibernate provider. |
| `com.fasterxml.jackson.core:jackson-databind:jar:2.21.5:compile` | `com.fasterxml.jackson.databind.ObjectMapper` | Declare directly; JsonConfig, audit/payment adapters and CloudinaryStorageService import ObjectMapper/JsonNode. Boot-managed version unchanged. |
| `org.springframework.security:spring-security-oauth2-resource-server:jar:7.0.7:compile` | `org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken` | Retain through security/resource-server starters; authorization, password and JWT contracts use their coordinated APIs. |
| `org.springframework:spring-test:jar:7.0.9:test` | `org.springframework.test.context.DynamicPropertySource` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `com.tngtech.archunit:archunit-junit5-api:jar:1.5.0:test` | `com.tngtech.archunit.junit.AnalyzeClasses` | Retain through archunit-junit5, the intentional JUnit extension/API aggregate. |
| `org.springframework:spring-context:jar:7.0.9:compile` | `org.springframework.context.i18n.LocaleContextHolder` | Retain through Boot starters; configuration, dependency injection and application startup use the Boot platform contract. |
| `org.junit.jupiter:junit-jupiter-api:jar:6.0.3:test` | `org.junit.jupiter.api.Test` | Retain through the explicit Boot test starters; this is their supported test API/provider aggregate, with test scope. |
| `org.apache.poi:poi:jar:5.4.1:compile` | `org.apache.poi.ss.usermodel.Sheet` | Declare directly; GuestService imports workbook/row/sheet/data formatter APIs. Same 5.4.1 version as poi-ooxml. |
| `org.flywaydb:flyway-core:jar:11.14.1:compile` | `org.flywaydb.core.api.configuration.FluentConfiguration` | Retain through Flyway starter; direct API is used by opt-in migration tests, runtime migration is enabled by configuration. |
| `com.nimbusds:nimbus-jose-jwt:jar:10.4:compile` | `com.nimbusds.jose.jwk.source.JWKSource` | Declare directly; SecurityConfig constructs ImmutableSecret. Same 10.4 version supplied by Spring Security. |
| `org.springframework.security:spring-security-oauth2-jose:jar:7.0.7:compile` | `org.springframework.security.oauth2.jwt.JwtValidators` | Retain through security/resource-server starters; authorization, password and JWT contracts use their coordinated APIs. |
| `com.fasterxml.jackson.core:jackson-core:jar:2.21.5:compile` | `com.fasterxml.jackson.core.JsonFactory` | Declare directly; audit/payment adapters import JsonProcessingException and TypeReference. Boot-managed version unchanged. |
| `org.slf4j:slf4j-api:jar:2.0.18:compile` | `org.slf4j.Logger` | Retain through Boot starter logging aggregate; logging API and provider stay aligned. |
| `org.springframework:spring-context-support:jar:7.0.9:compile` | `org.springframework.mail.MailSendException` | Retain through mail starter; mail adapter uses JavaMailSender and the configured mail provider. |
| `org.springframework.boot:spring-boot:jar:4.0.8:compile` | `org.springframework.boot.SpringApplication` | Retain through Boot starters; configuration, dependency injection and application startup use the Boot platform contract. |
| `org.springframework.data:spring-data-commons:jar:4.0.7:compile` | `org.springframework.data.repository.query.Param` | Retain through data-jpa starter; repositories, transactions and auditing use its coordinated APIs. |
| `org.springframework:spring-webmvc:jar:7.0.9:compile` | `org.springframework.web.servlet.resource.NoResourceFoundException` | Retain through WebMVC starter; controller, HTTP client and MVC APIs match its runtime stack. |
| `org.springframework.security:spring-security-crypto:jar:7.0.7:compile` | `org.springframework.security.crypto.password.PasswordEncoder` | Retain through security/resource-server starters; authorization, password and JWT contracts use their coordinated APIs. |
| `org.springdoc:springdoc-openapi-starter-common:jar:3.1.1:compile` | `org.springdoc.core.customizers.OperationCustomizer` | Retain through Springdoc WebMVC starters; OpenApiConfig imports their customizer contract. |
| `jakarta.validation:jakarta.validation-api:jar:3.1.1:compile` | `jakarta.validation.ConstraintViolation` | Retain through validation starter; DTO validation requires the provider and API together. |

## Maven: unused declared

These are bytecode-analysis limitations for configuration, annotation processing and service discovery, not evidence that their runtime functionality is unused.

| Dependency | Decision |
| --- | --- |
| `org.springframework.boot:spring-boot-starter-actuator:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for actuator. |
| `io.micrometer:micrometer-registry-prometheus:jar:1.16.7:compile` | Runtime registry discovered by Actuator auto-configuration; /actuator/prometheus and Prometheus scraping require it. |
| `org.springframework.boot:spring-boot-starter-data-jpa:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for data-jpa. |
| `org.springframework.boot:spring-boot-starter-data-redis:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for data-redis. |
| `org.springframework.boot:spring-boot-starter-flyway:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for flyway. |
| `org.springframework.boot:spring-boot-starter-security:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for security. |
| `org.springframework.boot:spring-boot-starter-security-oauth2-resource-server:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for security-oauth2-resource-server. |
| `org.springframework.boot:spring-boot-starter-mail:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for mail. |
| `org.springframework.boot:spring-boot-starter-validation:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for validation. |
| `org.springframework.boot:spring-boot-configuration-processor:jar:4.0.8:compile` | Compile annotation processor explicitly configured in maven-compiler-plugin; application bytecode does not call it. |
| `org.springframework.boot:spring-boot-starter-webmvc:jar:4.0.8:compile` | Intentional Boot runtime/API/auto-configuration aggregate for webmvc. |
| `org.springdoc:springdoc-openapi-starter-webmvc-scalar:jar:3.1.1:compile` | Runtime Scalar documentation endpoint/asset auto-configuration. |
| `org.springdoc:springdoc-openapi-starter-webmvc-ui:jar:3.1.1:compile` | Runtime Swagger UI and OpenAPI endpoint/asset auto-configuration; endpoint integration tests cover it. |
| `org.flywaydb:flyway-database-postgresql:jar:11.14.1:compile` | Runtime database-specific migration support for the retained PostgreSQL deployment option. |
| `org.flywaydb:flyway-mysql:jar:11.14.1:compile` | Runtime MySQL migration support, exercised by the eight MySQL integration test classes. |
| `org.springframework.boot:spring-boot-devtools:jar:4.0.8:runtime` | Optional development runtime restart support; deliberate runtime scope. |
| `com.mysql:mysql-connector-j:jar:9.7.0:runtime` | JDBC driver loaded at runtime; used by CI MySQL migration/integrity tests and MySQL deployment. |
| `org.postgresql:postgresql:jar:42.7.13:runtime` | JDBC driver loaded at runtime; retained PostgreSQL deployment option. |
| `org.springframework.boot:spring-boot-starter-actuator-test:jar:4.0.8:test` | Intentional Boot test API/engine/auto-configuration aggregate; test scope. |
| `org.springframework.boot:spring-boot-starter-data-jpa-test:jar:4.0.8:test` | Intentional Boot test API/engine/auto-configuration aggregate; test scope. |
| `org.springframework.boot:spring-boot-starter-flyway-test:jar:4.0.8:test` | Intentional Boot test API/engine/auto-configuration aggregate; test scope. |
| `org.springframework.boot:spring-boot-starter-security-oauth2-resource-server-test:jar:4.0.8:test` | Intentional Boot test API/engine/auto-configuration aggregate; test scope. |
| `org.springframework.boot:spring-boot-starter-security-test:jar:4.0.8:test` | Intentional Boot test API/engine/auto-configuration aggregate; test scope. |
| `org.springframework.boot:spring-boot-starter-validation-test:jar:4.0.8:test` | Intentional Boot test API/engine/auto-configuration aggregate; test scope. |
| `org.springframework.boot:spring-boot-starter-webmvc-test:jar:4.0.8:test` | Intentional Boot test API/engine/auto-configuration aggregate; test scope. |
| `com.h2database:h2:jar:2.4.240:test` | Test JDBC driver loaded by Spring test datasource configuration. |
| `com.tngtech.archunit:archunit-junit5:jar:1.5.0:test` | Intentional test aggregate with JUnit engine service discovery; architecture tests depend on it. |

## Maven: compile-scoped APIs observed only in tests

| Dependency | Decision |
| --- | --- |
| `com.fasterxml.jackson.dataformat:jackson-dataformat-yaml` | OpenApiIntegrationTests parse the checked-in YAML contract; Springdoc also exposes runtime YAML OpenAPI serialization. Keep compile scope with the documentation stack. |
| `org.flywaydb:flyway-core` | MigrationUpgradeMySqlTests invoke Flyway directly; production migration uses starter auto-configuration and database plugins. Keep the starter-managed compile/runtime stack. |

No Spring Boot starter or runtime database/provider dependency was removed. dependency:analyze remains an explicit CI step and its warnings remain visible. SpotBugs, PMD, the OWASP CVSS threshold and fail-on-error behavior are preserved.

## Local CI-equivalent verification

All requested local commands exited 0 after the migration. Windows used mvnw.cmd and the installed Node/Python versions; GitHub #151 independently passed the Node 22/Python 3.13 application jobs.

| Area | Result |
| --- | --- |
| Both frontends | Fresh npm ci, npm audit --audit-level=high, lint, tests, both explicit Knip gates and production builds pass. User: 370 tests; admin: 49 tests; both audits: zero vulnerabilities. |
| Backend | Final clean verify, dependency:analyze, SpotBugs and PMD pass. 432 tests discovered: 413 pass in regular verify and 19 opt-in MySQL tests execute separately with zero skips/failures. |
| Java security | The final dependency-security profile passes with an initially empty database and no API key, downloading all 25 annual official feeds (2002–2026) plus the modified feed. Full verify completed in 3 minutes 8 seconds. failBuildOnCVSS remains 8; skipTestScope and existing suppression files are unchanged. Existing findings below the threshold remain reported. |
| Telegram | Ruff, 61 pytest tests, Bandit, compileall and pip-audit pass. |
| Deployment | Eleven repository QA tests (including five NVD metadata/network regression tests), all four YAML files, tracked shell-script syntax, Node script syntax, required assets, Compose config and all four Docker builds pass. The backend image was rebuilt with the final application dependency declarations. |
| Browser | critical-routes.spec.js and route-smoke.spec.js: 56 tests pass with one local worker and retries disabled. An earlier concurrent run hit two page-load timeouts; serial execution removed local build contention without changing assertions or adding retries. |
| Secrets/skills | Gitleaks: zero findings in 1,951 files. Pinned skill integrity verification passes. |

### Remaining security findings

The fresh local Dependency-Check report flags these existing dependencies below the unchanged CVSS 8 failure threshold. No new suppressions were added, and these findings should remain visible for security maintenance.

| Dependency | Finding | Reported severity/score |
| --- | --- | --- |
| MySQL Connector/J 9.7.0 | [CVE-2026-60586](https://nvd.nist.gov/vuln/detail/CVE-2026-60586) | HIGH, CVSS 3.1: 7.7 |
| MySQL Connector/J 9.7.0 | [CVE-2026-60623](https://nvd.nist.gov/vuln/detail/CVE-2026-60623) | HIGH, CVSS 3.1: 7.1 |
| MySQL Connector/J 9.7.0 | [CVE-2026-60624](https://nvd.nist.gov/vuln/detail/CVE-2026-60624) | MEDIUM, CVSS 3.1: 6.5 |
| MySQL Connector/J 9.7.0 | [CVE-2026-61082](https://nvd.nist.gov/vuln/detail/CVE-2026-61082) | MEDIUM, CVSS 3.1: 6.5 |
| Netty transport 4.2.17.Final | [CVE-2026-89044](https://nvd.nist.gov/vuln/detail/CVE-2026-89044) | MEDIUM, CVSS 4.0: 6.9; CVSS 3.1: 6.5 |
| Swagger UI 5.32.14, bundled DOMPurify 3.4.13 | [GHSA-p98j-92pf-mc4p](https://github.com/advisories/GHSA-p98j-92pf-mc4p) | LOW, unscored RetireJS finding; repeated for the two bundled JavaScript variants. |

Dependency-Check also reports that its OSS Index analyzer is unavailable without Sonatype credentials, reflecting the provider's [authentication requirement](https://dependency-check.github.io/DependencyCheck/analyzers/oss-index-analyzer.html). No analyzer-disable option was introduced. NVD and RetireJS analysis completed; OSS Index coverage was not available in this local run.

Other retained informational warnings include Maven's documented starter/runtime aggregation findings, the PMD parent-project URL, Lombok/Mockito/JVM agent deprecations, Vite chunk-size warnings, Python TestClient deprecations and expected backend-proxy errors in controlled browser journeys. GitHub's Node 20 action-runtime warning is gone.
