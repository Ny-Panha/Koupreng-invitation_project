-- Safe optional sample data for local development and demos.
-- This file is not a Flyway migration and is not executed automatically.
-- Run manually only against a local database after Flyway migrations complete.
--
-- Test credentials:
--   admin@example.com / admin123
--   host@example.com  / admin123

SET @sample_password_hash = '$2a$10$9BjWDgJ0z7nG1hIdVfs7J.gDvVG6pnLnT9QEwxoqiN29KB0Num5Uq';

INSERT INTO users (
    full_name, email, phone, password_hash, role, status, token_version, created_at, updated_at
)
SELECT 'Koupreng Admin', 'admin@example.com', '010000001', @sample_password_hash,
       'ADMIN', 'ACTIVE', 0, NOW(6), NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

INSERT INTO users (
    full_name, email, phone, password_hash, role, status, token_version, created_at, updated_at
)
SELECT 'Vireak Host', 'host@example.com', '010000002', @sample_password_hash,
       'USER', 'ACTIVE', 0, NOW(6), NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'host@example.com');

INSERT INTO templates (
    name, code, category, description, thumbnail_url, preview_url,
    is_premium, price, currency, status, sort_order, created_at, updated_at
)
SELECT 'Garden Royal Khmer Wedding', 'garden-royal-khmer-wedding', 'TRADITIONAL',
       'Local demo template with a valid TemplateCategory value.',
       '/facebook/all/03-card/cover-card.jpg', '/templates/garden-royal-khmer-wedding',
       FALSE, 0.00, 'USD', 'ACTIVE', 0, NOW(6), NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM templates WHERE code = 'garden-royal-khmer-wedding');

SET @sample_user_id = (
    SELECT user_id FROM users WHERE email = 'host@example.com' LIMIT 1
);
SET @sample_template_id = (
    SELECT template_id FROM templates WHERE code = 'garden-royal-khmer-wedding' LIMIT 1
);

INSERT INTO invitations (
    user_id, template_id, title, slug, event_type, event_date, event_time,
    venue_name, venue_address, host_name, groom_name, bride_name, story_text,
    language_mode, visibility, rsvp_deadline, status, moderation_status,
    deleted, published_at, created_at, updated_at
)
SELECT @sample_user_id, @sample_template_id, 'Vireak & Malyy Wedding',
       'vireak-malyy-wedding', 'WEDDING', '2026-12-12', '18:00:00',
       'Koupreng Grand Hall', 'Phnom Penh, Cambodia', 'Vireak & Malyy',
       'Vireak', 'Malyy', 'We are delighted to invite you to our wedding celebration.',
       'KM_EN', 'PUBLIC', '2026-12-01', 'PUBLISHED', 'ACTIVE',
       FALSE, NOW(6), NOW(6), NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM invitations WHERE slug = 'vireak-malyy-wedding');

SET @sample_invitation_id = (
    SELECT invitation_id FROM invitations WHERE slug = 'vireak-malyy-wedding' LIMIT 1
);

INSERT INTO guests (
    invitation_id, guest_name, phone, email, guest_group, side_type,
    table_number, invite_token, qr_code_url, send_status, seat_count,
    note, reminder_count, contribution_status, total_contributed, created_at
)
SELECT @sample_invitation_id, 'Sokha Chan', '012345678', 'sokha@example.com',
       'Family', 'Groom Side', 'A1', 'sample-sokha-token',
       '/i/vireak-malyy-wedding?token=sample-sokha-token', 'មិនទាន់ផ្ញើ',
       2, 'Close family guest', 0, 'PENDING', 0.00, NOW(6)
WHERE NOT EXISTS (
    SELECT 1 FROM guests
    WHERE invitation_id = @sample_invitation_id AND guest_name = 'Sokha Chan'
);

INSERT INTO guests (
    invitation_id, guest_name, phone, email, guest_group, side_type,
    table_number, invite_token, qr_code_url, send_status, seat_count,
    note, reminder_count, contribution_status, total_contributed, created_at
)
SELECT @sample_invitation_id, 'Dara Kim', '098765432', 'dara@example.com',
       'College Friend', 'Bride Side', 'B2', 'sample-dara-token',
       '/i/vireak-malyy-wedding?token=sample-dara-token', 'បានផ្ញើ',
       1, 'College friend', 0, 'PENDING', 0.00, NOW(6)
WHERE NOT EXISTS (
    SELECT 1 FROM guests
    WHERE invitation_id = @sample_invitation_id AND guest_name = 'Dara Kim'
);
