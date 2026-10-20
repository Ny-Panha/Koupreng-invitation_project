-- Ticket appearance belongs to the event lifecycle. Preserve existing event deletion.
-- MySQL's table-copy ALTER cannot reuse the dropped constraint's name (error 1826).
-- A distinct name keeps this replacement in one atomic DDL statement with FK checks enabled.
ALTER TABLE invitation_ticket_designs
    DROP FOREIGN KEY fk_ticket_designs_invitation,
    ADD CONSTRAINT fk_ticket_designs_invitation_cascade
        FOREIGN KEY (invitation_id) REFERENCES invitations(invitation_id) ON DELETE CASCADE;
