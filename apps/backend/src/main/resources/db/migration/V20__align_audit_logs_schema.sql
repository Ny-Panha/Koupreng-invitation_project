ALTER TABLE audit_logs
    DROP FOREIGN KEY fk_audit_logs_user,
    DROP PRIMARY KEY,
    CHANGE COLUMN log_id id BIGINT NOT NULL AUTO_INCREMENT,
    CHANGE COLUMN user_id admin_id BIGINT NULL,
    CHANGE COLUMN target_type target_entity VARCHAR(120) NULL,
    CHANGE COLUMN details old_values TEXT NULL,
    ADD COLUMN new_values TEXT NULL AFTER old_values,
    ADD COLUMN ip_address VARCHAR(100) NULL AFTER new_values,
    MODIFY action VARCHAR(120) NOT NULL,
    MODIFY created_at DATETIME(6) NOT NULL,
    ADD PRIMARY KEY (id),
    ADD CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL;
