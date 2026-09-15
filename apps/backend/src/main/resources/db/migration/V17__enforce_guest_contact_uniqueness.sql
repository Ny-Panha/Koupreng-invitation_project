-- Enforce the invitation-scoped uniqueness already required by GuestService.
-- NULL normalized values intentionally allow multiple guests without an email or phone.
-- This is one atomic ALTER so a duplicate-data failure cannot leave a half-applied schema.
ALTER TABLE guests
    ADD COLUMN email_normalized VARCHAR(255)
        GENERATED ALWAYS AS (NULLIF(LOWER(TRIM(email)), '')) STORED,
    ADD COLUMN phone_normalized VARCHAR(255)
        GENERATED ALWAYS AS (NULLIF(TRIM(phone), '')) STORED,
    ADD CONSTRAINT uk_guests_invitation_email_normalized
        UNIQUE (invitation_id, email_normalized),
    ADD CONSTRAINT uk_guests_invitation_phone_normalized
        UNIQUE (invitation_id, phone_normalized);
