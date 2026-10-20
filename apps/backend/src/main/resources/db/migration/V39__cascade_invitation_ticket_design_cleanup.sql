-- Ticket appearance belongs to the event lifecycle. Preserve existing event deletion.
ALTER TABLE invitation_ticket_designs
    DROP FOREIGN KEY fk_ticket_designs_invitation,
    ADD CONSTRAINT fk_ticket_designs_invitation
        FOREIGN KEY (invitation_id) REFERENCES invitations(invitation_id) ON DELETE CASCADE;
