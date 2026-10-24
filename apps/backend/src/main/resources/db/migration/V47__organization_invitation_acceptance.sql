-- Existing active memberships remain intact. Pending legacy invitations need reissue.
ALTER TABLE organization_members
    ADD COLUMN invite_token_hash VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
    ADD COLUMN invite_expires_at DATETIME(6) NULL,
    ADD CONSTRAINT uk_organization_members_invite_token UNIQUE (invite_token_hash);
