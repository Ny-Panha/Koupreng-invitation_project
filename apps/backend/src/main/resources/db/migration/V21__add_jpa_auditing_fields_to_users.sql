ALTER TABLE users
    ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE AFTER updated_at,
    ADD COLUMN created_by VARCHAR(100) NULL AFTER deleted,
    ADD COLUMN last_modified_by VARCHAR(100) NULL AFTER created_by;
