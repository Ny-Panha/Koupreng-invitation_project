-- Keep V33 identical to its originally applied form (checksum 1422459132).
-- Some development schemas already contain this additive column; preserve its data.
SET @payment_evidence_date_exists = (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'payment_evidence'
      AND column_name = 'transaction_date_text'
);
SET @payment_evidence_date_sql = IF(
    @payment_evidence_date_exists = 0,
    'ALTER TABLE payment_evidence ADD COLUMN transaction_date_text VARCHAR(120) NULL AFTER merchant_message_at',
    'SELECT 1'
);
PREPARE payment_evidence_date_statement FROM @payment_evidence_date_sql;
EXECUTE payment_evidence_date_statement;
DEALLOCATE PREPARE payment_evidence_date_statement;
