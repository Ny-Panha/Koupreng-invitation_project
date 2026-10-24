-- Optional retry identity preserves legacy records and manual bookkeeping semantics.
ALTER TABLE wedding_gifts ADD COLUMN client_request_id VARCHAR(36) NULL;
CREATE UNIQUE INDEX uk_wedding_gifts_invitation_request ON wedding_gifts(invitation_id, client_request_id);
