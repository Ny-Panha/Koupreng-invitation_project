---
name: koupreng-database-flyway
description: "Database engineering, schema design, and Flyway migration standards for MySQL 8 in Koupreng. Use when creating database tables, writing versioned Flyway migrations (V<N>__*.sql), optimizing indexes, managing transactions and isolation levels, or enforcing USD/KHR currency separation."
---

# Koupreng Database & Flyway Migration Standards

## 1. Database Environment & Conventions

- **Engine:** MySQL 8.0
- **Default Character Set:** `utf8mb4`
- **Default Collation:** `utf8mb4_unicode_ci` (critical for accurate Khmer text sorting and search)
- **Migration Tool:** Flyway (managed via `spring-boot-starter-flyway` and `flyway-mysql`)
- **Location of Migrations:** `apps/backend/src/main/resources/db/migration/`
- **Naming Pattern:** `V<version>__<short_description>.sql` (e.g. `V34__add_table_feature.sql`)
- **Hibernate Verification:** `spring.jpa.hibernate.ddl-auto=validate` in production/staging to ensure Java JPA entity definitions strictly match the database schema.

---

## 2. Inviolable Migration Rules

1. **Forward-Only Migrations:**
   NEVER edit, rename, or delete an existing, previously applied migration file (e.g., `V1__...` through `V33__...`). Any alteration to historical migrations causes Flyway checksum validation failures and breaks production deployment.
2. **Always Create a New Increment:**
   To alter a table, add a column, or drop an index, create a new forward migration with the next sequential version number (`V34__...`).
3. **Never Reset or Drop Production Databases:**
   Do not execute `DROP DATABASE`, `FLUSH TABLES`, or `TRUNCATE` operations on persistent environments.
4. **Idempotent and Non-Locking:**
   On large tables, design migrations to avoid exclusive metadata locks:
   - Provide default values or allow `NULL` on newly added columns.
   - Separate large index creations from table alterations if needed.

---

## 3. Financial & Currency Invariants (USD / KHR)

Cambodia is a dual-currency economy. Koupreng transactions, gift tracking, and budget items operate in either USD or KHR:

- **Explicit Currency Columns:** Every monetary entity must have an explicit 3-letter ISO currency column (`currency VARCHAR(3) NOT NULL DEFAULT 'USD'`).
- **Precision:**
  - USD amounts: `DECIMAL(12, 2)` (e.g., `5.00`)
  - KHR amounts: `DECIMAL(14, 2)` or `BIGINT` (e.g., `20000.00`)
- **Never Conflate:** Aggregations, gift reporting, and budgets must group by currency (`GROUP BY currency`). Never sum USD and KHR together into a single scalar value without conversion metadata.

---

## 4. Constraint & Index Design Standards

### Explicit Constraint Naming
Always give constraints and indexes deterministic names to ensure reproducible migrations across environments:
- Foreign Keys: `fk_<source_table>_<target_table>_<column>`
- Unique Constraints: `uk_<table_name>_<columns>`
- Indexes: `idx_<table_name>_<columns>`

### Query Optimization & Composite Indexes
Create composite indexes aligned with application query access paths:
```sql
-- Fast guest lookup by event and attendance status
CREATE INDEX idx_guests_event_status ON guests(event_id, rsvp_status);

-- Order lookup for payment reconciliation
CREATE INDEX idx_orders_amount_curr_status ON template_payment_orders(amount, currency, status);
```

---

## 5. Transactions, Concurrency & Locking

- **Default Isolation Level:** `READ_COMMITTED` in Spring Boot MySQL pool.
- **Pessimistic Locks:** Use `SELECT ... FOR UPDATE` (`LockModeType.PESSIMISTIC_WRITE`) for high-concurrency payment reconciliation, ticket issuance, and inventory decrements.
- **Audit Columns:** Tables should include `created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)` and `updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`.

---

## 6. Detailed References

- [Flyway Migration Authoring Guidelines](references/migration-guidelines.md)
- [MySQL 8 Performance & Collation Patterns](references/mysql8-patterns.md)
- [Schema Invariants & Entity Mappings](references/schema-invariants.md)

