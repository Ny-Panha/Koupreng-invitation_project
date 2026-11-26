ALTER TABLE payment_evidence
    ADD COLUMN verification_method VARCHAR(30),
    ADD COLUMN verified_by VARCHAR(120),
    ADD COLUMN verified_at TIMESTAMP(6),
    ADD COLUMN verified_merchant VARCHAR(120),
    ADD COLUMN verification_notes VARCHAR(280);
