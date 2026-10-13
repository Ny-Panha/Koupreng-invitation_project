# Schema Invariants & Entity Mappings

## 1. Soft Delete vs Hard Delete

- Entities representing guest data, gifts, and transactions use soft deletion (`deleted_at DATETIME(6) NULL`) or status flags (`status = 'CANCELLED'`).
- Hard deletion (`DELETE FROM`) is reserved for ephemeral sessions, cache tables, or dev sample data.

## 2. Foreign Key Cascades

- Use `ON DELETE RESTRICT` for financial transactions, orders, and payment records to prevent accidental loss of audit history.
- Use `ON DELETE CASCADE` for tightly bound child value objects (e.g. `event_schedule_items` tied to an `event`).

## 3. Financial Separation Invariant

Tables handling money must maintain:
- `amount DECIMAL(12,2)`
- `currency VARCHAR(3)`
Never store currency-ambiguous numeric amounts.

