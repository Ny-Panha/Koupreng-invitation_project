package com.koupreng.backend.shared.persistence.migration;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertTrue;

class SubscriptionReconciliationMigrationTests {

    private static final Path MIGRATION = Path.of(
            "src/main/resources/db/migration/V19__add_static_subscription_payment_reconciliation.sql"
    );

    @Test
    void preservesPlansAndAddsPaymentMatchingInvariants() throws IOException {
        String sql = Files.readString(MIGRATION);
        String normalized = sql.toUpperCase(Locale.ROOT);

        assertTrue(normalized.contains("LEGACY.CODE = 'FREE'"));
        assertTrue(normalized.contains("LEGACY.CODE = 'ENTERPRISE'"));
        assertTrue(normalized.contains("PRICE = 0.01"));
        assertTrue(normalized.contains("PRICE = 199.00"));
        assertTrue(normalized.contains("PRICE = 499.00"));
        assertTrue(sql.contains("payer_account_last3"));
        assertTrue(sql.contains("payment_expires_at"));
        assertTrue(sql.contains("uk_subscriptions_payway_transaction_id"));
        assertTrue(sql.contains("idx_subscriptions_static_payment_match"));
    }
}
