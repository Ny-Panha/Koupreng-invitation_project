package com.koupreng.backend.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

class GuestContactMigrationTests {

    private static final Path MIGRATION = Path.of(
            "src/main/resources/db/migration/V17__enforce_guest_contact_uniqueness.sql"
    );

    @Test
    void guestContactConstraintsAreAddedByOneAtomicAlter() throws IOException {
        String sql = Files.readString(MIGRATION);

        assertEquals(1, occurrences(sql.toUpperCase(java.util.Locale.ROOT), "ALTER TABLE GUESTS"));
        assertTrue(sql.contains("uk_guests_invitation_email_normalized"));
        assertTrue(sql.contains("UNIQUE (invitation_id, email_normalized)"));
        assertTrue(sql.contains("uk_guests_invitation_phone_normalized"));
        assertTrue(sql.contains("UNIQUE (invitation_id, phone_normalized)"));
        assertTrue(sql.contains("NULLIF(LOWER(TRIM(email)), '')"));
        assertTrue(sql.contains("NULLIF(TRIM(phone), '')"));
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
