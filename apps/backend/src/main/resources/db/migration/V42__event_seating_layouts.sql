-- Geometry is separate from capacity, guest assignments and legacy table notes.
CREATE TABLE event_seating_layouts (
    invitation_id BIGINT NOT NULL,
    layout_json TEXT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (invitation_id),
    CONSTRAINT fk_event_seating_layouts_invitation FOREIGN KEY (invitation_id)
        REFERENCES invitations(invitation_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
