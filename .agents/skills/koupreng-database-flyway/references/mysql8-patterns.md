# MySQL 8 Patterns & Collation

## 1. Character Set & Collation

- Engine: `InnoDB`
- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

Khmer Unicode requires full 4-byte UTF-8 support for ligatures, symbols, and supplementary plane glyphs.

## 2. UUID Storage & Primary Keys

- Primary keys in Koupreng use either:
  - `VARCHAR(36)` containing canonical UUID strings (e.g. `c0a80101-...`)
  - `BIGINT AUTO_INCREMENT` for high-volume append-only audit/log rows.
- When using UUIDs as foreign keys, ensure both sides use identical types and lengths.

## 3. Date & Time Types

- Always use `DATETIME(6)` or `TIMESTAMP(6)` to retain microsecond precision.
- Store all timestamps in UTC or Asia/Phnom_Penh as configured in the JDBC connection string (`serverTimezone=Asia/Phnom_Penh`).

