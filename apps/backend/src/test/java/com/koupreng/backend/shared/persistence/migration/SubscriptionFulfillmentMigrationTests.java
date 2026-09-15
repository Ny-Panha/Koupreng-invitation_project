package com.koupreng.backend.shared.persistence.migration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

class SubscriptionFulfillmentMigrationTests {

    private static final Path MIGRATION = Path.of(
            "src/main/resources/db/migration/V18__complete_subscription_payment_fulfillment.sql"
    );

    @Test
    void evidenceAndSingleActiveInvariantAreAddedAtomically() throws IOException {
        String sql = Files.readString(MIGRATION);
        String normalized = sql.toUpperCase(java.util.Locale.ROOT);

        assertEquals(1, occurrences(normalized, "ALTER TABLE SUBSCRIPTIONS"));
        assertTrue(sql.contains("paid_amount"));
        assertTrue(sql.contains("paid_at"));
        assertTrue(sql.contains("confirm_source"));
        assertTrue(sql.contains("confirmed_by"));
        assertTrue(sql.contains("confirmed_at"));
        assertTrue(sql.contains("GENERATED ALWAYS AS (IF(is_active, user_id, NULL))"));
        assertTrue(sql.contains("uk_subscriptions_one_active_per_user"));
    }

    private int occurrences(String value, String needle) {
        int count = 0;
        int index = 0;
        while ((index = value.indexOf(needle, index)) >= 0) {
            count++;
            index += needle.length();
        }
        return count;
    }
}
