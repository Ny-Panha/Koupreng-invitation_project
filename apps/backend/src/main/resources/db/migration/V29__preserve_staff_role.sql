-- DB-001: Preserve existing Java/API STAFF semantics. Authorization continues
-- to map STAFF to ROLE_ADMIN; changing its powers requires a product decision.
-- Append the ENUM value so the original ADMIN/USER ordinals are unchanged.
ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'USER', 'STAFF') NOT NULL;
