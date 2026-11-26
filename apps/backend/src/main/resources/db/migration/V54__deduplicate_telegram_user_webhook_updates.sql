CREATE TABLE telegram_user_updates (
    bot_id VARCHAR(32) CHARACTER SET ascii NOT NULL,
    update_id BIGINT NOT NULL,
    received_at DATETIME(6) NOT NULL,
    PRIMARY KEY (bot_id, update_id),
    KEY idx_telegram_updates_received_at (received_at)
);
