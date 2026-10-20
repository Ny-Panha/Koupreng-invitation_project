CREATE TABLE invitation_ticket_designs (
    invitation_id BIGINT NOT NULL,
    design_json TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (invitation_id),
    CONSTRAINT fk_ticket_designs_invitation FOREIGN KEY (invitation_id) REFERENCES invitations(invitation_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
