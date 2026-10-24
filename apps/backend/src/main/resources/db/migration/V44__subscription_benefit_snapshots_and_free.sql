-- Restore the original V13 Free policy without altering any paid plan or user.
INSERT INTO packages (code, package_name, description, price, currency, duration_days,
 max_invitations, max_guests, max_guests_per_invitation, max_team_members, features_json,
 status, billing_interval, premium_templates_enabled, qr_invitations_enabled,
 qr_check_in_enabled, seating_enabled, advanced_analytics_enabled, custom_branding_enabled,
 team_members_enabled, ai_assistant_enabled, active, public_visible, sort_order, created_at, updated_at)
SELECT 'FREE', 'Free', 'Starter plan for small invitations.', 0.00, 'USD', 365,
 1, 40, 40, 1, JSON_OBJECT('qrInvitations', TRUE, 'guestImport', TRUE),
 'ACTIVE', 'YEARLY', FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, 0, NOW(6), NOW(6)
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE code = 'FREE');

ALTER TABLE packages ADD COLUMN revision BIGINT NOT NULL DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN benefits_snapshot JSON NULL;

-- Snapshot every existing order at the boundary of the new version policy.
-- No payment status, active flag, expiry, role or account record is changed.
UPDATE subscriptions s JOIN packages p ON s.package_id = p.package_id
SET s.benefits_snapshot = JSON_OBJECT(
 'id',p.package_id,'code',p.code,'packageName',p.package_name,'description',p.description,
 'price',p.price,'currency',p.currency,'billingInterval',p.billing_interval,'durationDays',p.duration_days,
 'revision',p.revision,'maxInvitations',p.max_invitations,'maxGuests',p.max_guests,
 'maxGuestsPerInvitation',p.max_guests_per_invitation,'maxTeamMembers',p.max_team_members,
 'premiumTemplatesEnabled',IF(p.premium_templates_enabled,CAST('true' AS JSON),CAST('false' AS JSON)),
 'qrInvitationsEnabled',IF(p.qr_invitations_enabled,CAST('true' AS JSON),CAST('false' AS JSON)),
 'qrCheckInEnabled',IF(p.qr_check_in_enabled,CAST('true' AS JSON),CAST('false' AS JSON)),
 'seatingEnabled',IF(p.seating_enabled,CAST('true' AS JSON),CAST('false' AS JSON)),
 'advancedAnalyticsEnabled',IF(p.advanced_analytics_enabled,CAST('true' AS JSON),CAST('false' AS JSON)),
 'customBrandingEnabled',IF(p.custom_branding_enabled,CAST('true' AS JSON),CAST('false' AS JSON)),
 'teamMembersEnabled',IF(p.team_members_enabled,CAST('true' AS JSON),CAST('false' AS JSON)),
 'aiAssistantEnabled',IF(p.ai_assistant_enabled,CAST('true' AS JSON),CAST('false' AS JSON)))
WHERE s.benefits_snapshot IS NULL;
