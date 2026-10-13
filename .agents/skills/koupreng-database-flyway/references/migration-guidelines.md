# Flyway Migration Authoring Guidelines

## 1. File Naming & Numbering

1. Check current highest migration in `apps/backend/src/main/resources/db/migration/`:
   - Currently: `V33__payment_evidence_and_notification_delivery.sql`.
2. Next migration must strictly be: `V34__<descriptive_title>.sql`.
3. Use two underscores `__` between the version number and description.
4. Use lowercase snake_case for the description.

## 2. Migration Template

```sql
-- V34__add_sample_feature.sql
-- Purpose: Adds sample feature with backwards-compatible schema

CREATE TABLE IF NOT EXISTS sample_feature (
    id VARCHAR(36) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_sample_feature PRIMARY KEY (id),
    CONSTRAINT fk_sample_feature_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT uk_sample_feature_event_name UNIQUE (event_id, feature_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sample_feature_active ON sample_feature (event_id, is_active);
```

## 3. Testing Migrations

Before committing:
1. Validate SQL syntax against MySQL 8 parser.
2. Verify Spring Boot starts without migration errors:
   ```powershell
   mvn -f apps/backend/pom.xml test-compile
   ```
3. Ensure corresponding JPA entity contains exact matching column names and types.

