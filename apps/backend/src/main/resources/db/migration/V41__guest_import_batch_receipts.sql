-- Receipts contain counts and row diagnostics, never raw guest lists or QR credentials.
CREATE TABLE guest_import_batches (
    batch_id VARCHAR(36) NOT NULL,
    invitation_id BIGINT NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    result_json MEDIUMTEXT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (batch_id),
    INDEX idx_guest_import_batches_invitation (invitation_id),
    CONSTRAINT fk_guest_import_batches_invitation FOREIGN KEY (invitation_id)
        REFERENCES invitations(invitation_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
