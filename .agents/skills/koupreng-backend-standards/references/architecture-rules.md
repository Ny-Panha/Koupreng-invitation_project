# Backend Architecture Rules & ArchUnit Invariants

## 1. ArchUnit Test Rules

Architecture rules are defined in `apps/backend/src/test/java/com/koupreng/backend/architecture/ArchitectureRulesTests.java`.

### Rule 1: No Direct Persistence Access from Controllers
```java
noClasses()
    .that().areAnnotatedWith(RestController.class)
    .should().dependOnClassesThat().resideInAnyPackage(
            "com.koupreng.backend.repository..",
            "com.koupreng.backend..infrastructure.persistence.."
    )
    .because("HTTP adapters must delegate persistence work to application use cases");
```
**Fix:** Move database calls into an `@Service` class in the `application` layer.

### Rule 2: No Domain or Entity Leakage in API Layer
```java
noClasses()
    .that().areAnnotatedWith(RestController.class)
    .should().dependOnClassesThat().resideInAnyPackage(
            "com.koupreng.backend.entity..",
            "com.koupreng.backend..domain.."
    )
    .because("HTTP contracts must use DTOs instead of persistence or domain objects");
```
**Fix:** Map entities to response DTOs (`*Response`) before returning from the controller or application service.

### Rule 3: Domain Package Isolation
```java
noClasses()
    .that().resideInAnyPackage("com.koupreng.backend..domain..")
    .should().dependOnClassesThat().resideInAnyPackage(
            "com.koupreng.backend..application..",
            "com.koupreng.backend..infrastructure..",
            "com.koupreng.backend..api.."
    )
    .because("Domain models must remain pure and free from outer layer dependencies");
```
**Fix:** Keep business rules and domain aggregates self-contained. Pass necessary external data into domain methods as arguments.

