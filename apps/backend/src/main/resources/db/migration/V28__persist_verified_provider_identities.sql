-- SEC-001: Do not backfill provider subjects from email addresses. Existing
-- accounts may explicitly link after authenticating or verified recovery.
CREATE TABLE user_external_identities (
    identity_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    provider_subject VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (identity_id),
    UNIQUE KEY uk_external_provider_subject (provider, provider_subject),
    UNIQUE KEY uk_external_user_provider (user_id, provider),
    CONSTRAINT fk_external_identity_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);
