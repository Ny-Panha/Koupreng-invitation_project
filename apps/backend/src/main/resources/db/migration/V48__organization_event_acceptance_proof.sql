-- Preserve existing memberships without silently granting new event-management rights.
-- Only a newly accepted one-time invitation supplies this consent timestamp.
ALTER TABLE organization_members ADD COLUMN invite_accepted_at DATETIME(6) NULL;
