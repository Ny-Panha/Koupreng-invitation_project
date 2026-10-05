ALTER TABLE wedding_gifts
    ADD COLUMN guest_id BIGINT NULL AFTER invitation_id,
    ADD INDEX idx_wedding_gifts_guest_id (guest_id),
    ADD CONSTRAINT fk_wedding_gifts_guest
        FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE SET NULL;
