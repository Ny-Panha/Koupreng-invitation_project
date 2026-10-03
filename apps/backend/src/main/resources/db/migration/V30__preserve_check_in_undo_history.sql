-- FE-007: Retain original state rows and all historical check-in information.
ALTER TABLE guest_check_ins
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN undone_at DATETIME(6) NULL,
    ADD COLUMN undone_by BIGINT NULL,
    ADD CONSTRAINT fk_check_in_undone_by FOREIGN KEY (undone_by)
        REFERENCES users (user_id) ON DELETE SET NULL;

CREATE TABLE guest_check_in_events (
    event_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    check_in_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    actor_user_id BIGINT NULL,
    occurred_at DATETIME(6) NOT NULL,
    source VARCHAR(50) NULL,
    note TEXT NULL,
    CONSTRAINT fk_check_in_event_state FOREIGN KEY (check_in_id)
        REFERENCES guest_check_ins (check_in_id) ON DELETE CASCADE,
    CONSTRAINT fk_check_in_event_actor FOREIGN KEY (actor_user_id)
        REFERENCES users (user_id) ON DELETE SET NULL,
    INDEX idx_check_in_events_history (check_in_id, occurred_at, event_id)
);

INSERT INTO guest_check_in_events (check_in_id, action, actor_user_id, occurred_at, source, note)
SELECT check_in_id, 'CHECKED_IN', checked_in_by, checked_in_at, source, note
FROM guest_check_ins;
