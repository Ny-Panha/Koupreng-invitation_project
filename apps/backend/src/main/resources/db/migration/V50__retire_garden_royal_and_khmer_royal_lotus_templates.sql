-- Retire Garden Royal Khmer Wedding and Khmer Royal Lotus from active catalog.
UPDATE templates
SET status = 'INACTIVE',
    updated_at = NOW(6)
WHERE code IN ('garden-royal-khmer-wedding', 'khmer-royal-lotus')
   OR name IN ('Garden Royal Khmer Wedding', 'Khmer Royal Lotus');
