---
name: koupreng-backend-standards
description: "Backend engineering standards, clean architecture boundaries, and modern Spring Boot compatibility overlay for Koupreng. Use when designing, building, refactoring, or testing Java Spring Boot services, REST controllers, DTO contracts, JPA persistence, Spring Security authorization, and Maven verification."
---

# Koupreng Backend Engineering Standards

## 1. Verified Runtime Stack & Compatibility Overlay

The Koupreng backend runs on a verified modern stack specified in `apps/backend/pom.xml`:
- **Java:** `25` (using modern records, pattern matching, sealed interfaces, virtual threads)
- **Spring Boot:** `4.0.8` (starter parent `spring-boot-starter-parent:4.0.8`)
- **Web MVC:** `spring-boot-starter-webmvc`
- **Security:** Spring Security with OAuth2 Resource Server & Nimbus Jose JWT
- **Persistence:** Spring Data JPA with Hibernate, MySQL 8 dialect, Flyway database migrations
- **Documentation:** `springdoc-openapi-starter-webmvc-ui:3.1.1` and `springdoc-openapi-starter-webmvc-scalar:3.1.1`
- **Architecture Validation:** ArchUnit 1.5.0 (`ArchitectureRulesTests.java`)

> **Notice on `spring-boot-engineer`:** Generic skills often provide outdated Spring Boot 3 / Spring Security 6 examples. Always use this skill as the authoritative compatibility overlay for the project's Java 25 and Spring Boot 4 runtime.

---

## 2. Clean Architecture & Bounded Contexts

The codebase enforces strict layered boundaries validated at compile/test time by ArchUnit:

```text
com.koupreng.backend.<module>/
  ├── api/              # HTTP adapters, REST controllers, public DTOs
  │    └── dto/         # Immutable request/response DTOs with validation
  ├── application/      # Use cases, application services, orchestration
  │    └── port/        # Outbound interfaces for external systems
  ├── domain/           # Pure business models, domain invariants, aggregate roots
  └── infrastructure/   # Persistence entities, Spring Data repositories, external clients
```

### Invariant Rules (Enforced by ArchUnit)
1. **Controllers Never Access Persistence Directly:** REST controllers must call application services, never Spring Data repositories or persistence DAOs.
2. **Controllers Never Expose Domain or JPA Entities:** Always map to dedicated request/response DTOs. Never return a JPA entity directly from an endpoint.
3. **Domain Packages Are Pure:** Domain packages (`auth.domain`, `payment.domain`, etc.) must not depend on outer application or infrastructure layers.
4. **Controllers Do Not Call Infrastructure Ports Directly:** Infrastructure adapters must be invoked through application service boundaries.

---

## 3. REST Controller & DTO Standards

### DTO Design
- Request DTOs must use strict Jakarta Validation (`@NotBlank`, `@NotNull`, `@Size`, `@DecimalMin`, `@Pattern`).
- Prefer immutable data structures (Java records or Lombok `@Data` / `@Value`).
- Separate request models from response models. Never reuse a single class for both.

### Controller Pattern
```java
@RestController
@RequestMapping("/api/v1/invitations")
@RequiredArgsConstructor
@Validated
public class InvitationController {

    private final InvitationApplicationService invitationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<InvitationResponse>> create(
            @Valid @RequestBody CreateInvitationRequest request,
            @AuthenticationPrincipal JwtPrincipal principal) {
        
        InvitationResponse response = invitationService.createInvitation(request, principal.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
}
```

### Standard API Response Envelope
All REST endpoints return a consistent response envelope (`ApiResponse<T>`):
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2026-10-13T14:30:00Z"
}
```
Errors return structured details:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ARGUMENT",
    "message": "Validation failed for request fields",
    "details": [
      { "field": "amount", "issue": "Amount must be greater than zero" }
    ]
  },
  "timestamp": "2026-10-13T14:30:00Z"
}
```

---

## 4. Transaction Management & JPA Rules

- **Query Read-Only:** Annotate read methods with `@Transactional(readOnly = true)` to avoid unnecessary Hibernate dirty checking.
- **Explicit Write Boundaries:** Place `@Transactional` on application use-case methods, never on private helpers or controller methods.
- **N+1 Prevention:** Use `JOIN FETCH`, `@EntityGraph`, or projection interfaces for multi-entity relationship loading. Never iterate lazy collections outside transaction scope.
- **Optimistic Locking:** Use `@Version` on entities subject to concurrent edits (e.g. guest counts, budget tracking).

---

## 5. Security & Authorization

- Stateless JWT authentication parsed into `JwtAuthenticationToken`.
- Role-based authorization using `@PreAuthorize("hasRole('ADMIN')")` or `@PreAuthorize("hasAnyRole('USER', 'ADMIN')")`.
- Public endpoints (e.g. RSVP submission, template preview, public invitation view) must be explicitly permitted in `SecurityConfig` without leaking sensitive organizer data.
- Tenant / User isolation: Always scope queries by the authenticated user's ID (`principal.getUserId()`) to prevent IDOR vulnerabilities.

---

## 6. Verification Commands

Run Maven checks directly from repository root:
```powershell
# Run ArchUnit architecture tests
mvn -f apps/backend/pom.xml test -Dtest=ArchitectureRulesTests

# Run full backend test suite
mvn -f apps/backend/pom.xml test
```

---

## 7. Detailed References

- [Architecture Rules & ArchUnit](references/architecture-rules.md)
- [Spring Boot 4 & Java 25 Overlay](references/spring-boot-4-overlay.md)
- [API Contracts & OpenAPI](references/api-contracts.md)

