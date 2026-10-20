-- Only for the disposable loopback benchmark database after Flyway has migrated it.
-- This script intentionally fails on a duplicate fixture; never clear customer data.
USE koupreng_perf_http;
START TRANSACTION;
INSERT INTO users (full_name, email, role, status, created_at, updated_at)
VALUES ('HTTP performance fixture', 'http-performance@example.test', 'USER', 'ACTIVE', NOW(6), NOW(6));
SET @perf_owner_id = LAST_INSERT_ID();
INSERT INTO invitations (user_id, title, slug, status, visibility, moderation_status, deleted, created_at, updated_at)
VALUES (@perf_owner_id, 'HTTP performance fixture', 'performance-http-fixture', 'PUBLISHED', 'PUBLIC', 'ACTIVE', FALSE, NOW(6), NOW(6));
SET @perf_invitation_id = LAST_INSERT_ID();
SET SESSION cte_max_recursion_depth = 10001;
INSERT INTO guests (invitation_id, guest_name, invite_token, created_at)
WITH RECURSIVE numbers AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM numbers WHERE n < 10000)
SELECT @perf_invitation_id, CONCAT('HTTP fixture guest ', n), CONCAT('http-fixture-', n), NOW(6) FROM numbers;
INSERT INTO rsvps (invitation_id, guest_id, response_status, attendee_count, responded_at)
SELECT invitation_id, guest_id,
    CASE MOD(guest_id, 4) WHEN 0 THEN 'ATTENDING' WHEN 1 THEN 'NOT_ATTENDING' ELSE 'MAYBE' END,
    CASE MOD(guest_id, 4) WHEN 0 THEN 2 ELSE 0 END, NOW(6)
FROM guests WHERE invitation_id = @perf_invitation_id AND MOD(guest_id, 4) <> 3;
COMMIT;
