CREATE TABLE telegram_owner_links (
    user_id BIGINT NOT NULL PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE,
    challenge_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin UNIQUE,
    challenge_expires_at DATETIME(6),
    CONSTRAINT fk_telegram_notification_owner FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);
