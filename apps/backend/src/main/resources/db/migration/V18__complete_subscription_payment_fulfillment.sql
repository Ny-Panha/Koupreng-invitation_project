-- Persist trusted subscription-payment evidence and prevent concurrent double activation.
-- The generated key is NULL for inactive rows, so history remains unlimited per user.
ALTER TABLE subscriptions
    ADD COLUMN paid_amount DECIMAL(10,2) NULL AFTER amount,
    ADD COLUMN paid_at DATETIME(6) NULL AFTER payment_status,
    ADD COLUMN confirm_source VARCHAR(50) NULL AFTER paid_at,
    ADD COLUMN confirmed_by VARCHAR(120) NULL AFTER confirm_source,
    ADD COLUMN confirmed_at DATETIME(6) NULL AFTER confirmed_by,
    ADD COLUMN active_user_id BIGINT
        GENERATED ALWAYS AS (IF(is_active, user_id, NULL)) STORED,
    ADD CONSTRAINT uk_subscriptions_one_active_per_user UNIQUE (active_user_id);
