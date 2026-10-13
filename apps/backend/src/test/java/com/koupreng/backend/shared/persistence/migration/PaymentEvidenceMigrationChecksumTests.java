package com.koupreng.backend.shared.persistence.migration;

import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.CRC32;
import static org.junit.jupiter.api.Assertions.assertEquals;

class PaymentEvidenceMigrationChecksumTests {
    @Test
    void v33RetainsTheChecksumOfTheOriginallyAppliedMigration() throws Exception {
        CRC32 checksum = new CRC32();
        for (String line : Files.readAllLines(Path.of("src/main/resources/db/migration/V33__payment_evidence_and_notification_delivery.sql"),
                StandardCharsets.UTF_8)) {
            checksum.update(line.getBytes(StandardCharsets.UTF_8));
        }
        assertEquals(1422459132, (int) checksum.getValue(), "Add schema changes through V34+, never mutate applied V33");
    }
}
