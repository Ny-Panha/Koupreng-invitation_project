-- One merchant transaction can fund at most one order across both product types.
CREATE TABLE payment_evidence (
    transaction_id VARCHAR(100) COLLATE utf8mb4_bin PRIMARY KEY,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    payer_name VARCHAR(120),
    payer_last3 VARCHAR(3),
    approval_code VARCHAR(100),
    remark VARCHAR(120),
    chat_id VARCHAR(100),
    message_id VARCHAR(100),
    sender_id VARCHAR(100),
    merchant_message_at DATETIME(6),
    transaction_date_text VARCHAR(120),
    received_at DATETIME(6) NOT NULL,
    trusted BOOLEAN NOT NULL DEFAULT FALSE,
    order_code VARCHAR(50),
    outcome VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    UNIQUE KEY uk_payment_evidence_message (chat_id, message_id),
    KEY idx_payment_evidence_order (order_code)
);

-- Preserve historical claims, including duplicate historical IDs, without changing orders.
INSERT INTO payment_evidence (transaction_id, amount, currency, received_at, order_code, outcome)
SELECT payway_transaction_id, COALESCE(paid_amount, amount), currency,
       COALESCE(paid_at, created_at, NOW(6)), order_code, 'PAID'
FROM template_payment_orders WHERE payway_transaction_id IS NOT NULL AND status = 'PAID'
ON DUPLICATE KEY UPDATE outcome = 'REVIEW_REQUIRED', order_code = NULL;
INSERT INTO payment_evidence (transaction_id, amount, currency, received_at, order_code, outcome)
SELECT payway_transaction_id, COALESCE(paid_amount, amount), currency,
       COALESCE(paid_at, created_at, NOW(6)), order_code, 'PAID'
FROM subscriptions WHERE payway_transaction_id IS NOT NULL AND payment_status = 'PAID'
ON DUPLICATE KEY UPDATE outcome = 'REVIEW_REQUIRED', order_code = NULL;

ALTER TABLE notifications
    ADD COLUMN payment_delivery_key VARCHAR(100) UNIQUE,
    ADD COLUMN delivery_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN next_delivery_at DATETIME(6);
CREATE INDEX idx_notifications_payment_delivery ON notifications (status, next_delivery_at);
