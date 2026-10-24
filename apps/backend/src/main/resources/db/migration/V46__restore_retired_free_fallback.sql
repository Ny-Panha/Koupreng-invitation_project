-- V19 could retire a separate Free row when Basic already existed. Restore only
-- that historical zero-price fallback, preserving every configured benefit.
UPDATE packages
SET active = TRUE, status = 'ACTIVE', public_visible = TRUE, updated_at = NOW(6)
WHERE code = 'FREE' AND price = 0 AND active = FALSE AND status = 'RETIRED';
