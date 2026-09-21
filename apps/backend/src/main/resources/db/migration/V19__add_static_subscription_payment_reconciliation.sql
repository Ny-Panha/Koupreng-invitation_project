-- Preserve the original package primary keys and entitlements while publishing the
-- three fixed-price subscription plans used by the static ABA reconciliation flow.
UPDATE packages legacy
LEFT JOIN packages target
    ON target.code = 'BASIC' AND target.package_id <> legacy.package_id
SET legacy.code = 'BASIC',
    legacy.package_name = 'Basic',
    legacy.price = 0.01,
    legacy.currency = 'USD',
    legacy.active = TRUE,
    legacy.status = 'ACTIVE',
    legacy.sort_order = 10,
    legacy.updated_at = NOW(6)
WHERE legacy.code = 'FREE'
  AND target.package_id IS NULL;

UPDATE packages legacy
INNER JOIN packages target ON target.code = 'BASIC'
SET legacy.active = FALSE,
    legacy.status = 'RETIRED',
    legacy.updated_at = NOW(6)
WHERE legacy.code = 'FREE'
  AND legacy.package_id <> target.package_id;

UPDATE packages
SET package_name = 'Pro',
    price = 199.00,
    currency = 'USD',
    active = TRUE,
    status = 'ACTIVE',
    sort_order = 20,
    updated_at = NOW(6)
WHERE code = 'PRO';

UPDATE packages legacy
LEFT JOIN packages target
    ON target.code = 'PREMIUM' AND target.package_id <> legacy.package_id
SET legacy.code = 'PREMIUM',
    legacy.package_name = 'Premium',
    legacy.price = 499.00,
    legacy.currency = 'USD',
    legacy.active = TRUE,
    legacy.status = 'ACTIVE',
    legacy.sort_order = 30,
    legacy.updated_at = NOW(6)
WHERE legacy.code = 'ENTERPRISE'
  AND target.package_id IS NULL;

UPDATE packages legacy
INNER JOIN packages target ON target.code = 'PREMIUM'
SET legacy.active = FALSE,
    legacy.status = 'RETIRED',
    legacy.updated_at = NOW(6)
WHERE legacy.code = 'ENTERPRISE'
  AND legacy.package_id <> target.package_id;

UPDATE packages
SET package_name = 'Basic', price = 0.01, currency = 'USD', active = TRUE,
    status = 'ACTIVE', sort_order = 10, updated_at = NOW(6)
WHERE code = 'BASIC';

UPDATE packages
SET package_name = 'Premium', price = 499.00, currency = 'USD', active = TRUE,
    status = 'ACTIVE', sort_order = 30, updated_at = NOW(6)
WHERE code = 'PREMIUM';

ALTER TABLE subscriptions
    ADD COLUMN payer_name VARCHAR(120) NULL AFTER payment_note,
    ADD COLUMN payer_account_last3 CHAR(3) NULL AFTER payer_name,
    ADD COLUMN payment_expires_at DATETIME(6) NULL AFTER payer_account_last3,
    ADD COLUMN payway_transaction_id VARCHAR(100) NULL AFTER payment_expires_at,
    ADD COLUMN payway_approval_code VARCHAR(100) NULL AFTER payway_transaction_id,
    ADD COLUMN payway_payer_name VARCHAR(120) NULL AFTER payway_approval_code,
    ADD COLUMN payment_detected_at DATETIME(6) NULL AFTER payway_payer_name,
    ADD COLUMN payment_raw_source TEXT NULL AFTER payment_detected_at,
    ADD COLUMN payment_evidence_reference VARCHAR(255) NULL AFTER payment_raw_source,
    ADD COLUMN payment_remark VARCHAR(120) NULL AFTER payment_evidence_reference,
    ADD CONSTRAINT uk_subscriptions_payway_transaction_id UNIQUE (payway_transaction_id),
    ADD INDEX idx_subscriptions_static_payment_match (
        payment_status,
        status,
        amount,
        currency,
        payer_account_last3,
        payment_expires_at
    );
