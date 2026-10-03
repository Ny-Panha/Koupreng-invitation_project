package com.koupreng.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

/** Creates and removes only a randomly named schema on the explicitly disposable test server. */
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class MigrationUpgradeMySqlTests {

    @Test
    void appendOnlyUpgradePreservesUsersLegacyEventsAndCheckInHistory() throws Exception {
        String serverUrl = required("FLYWAY_TEST_DB_URL");
        String username = required("FLYWAY_TEST_DB_USERNAME");
        String password = required("FLYWAY_TEST_DB_PASSWORD");
        String schema = "koupreng_upgrade_" + UUID.randomUUID().toString().replace("-", "");
        if (!serverUrl.startsWith("jdbc:mysql://") || !schema.matches("koupreng_upgrade_[a-f0-9]{32}")) {
            throw new IllegalStateException("Requires disposable MySQL integration configuration");
        }
        int databaseStart = serverUrl.indexOf('/', "jdbc:mysql://".length());
        int queryStart = serverUrl.indexOf('?');
        String schemaUrl = serverUrl.substring(0, databaseStart + 1) + schema
                + (queryStart < 0 ? "" : serverUrl.substring(queryStart));
        try (Connection control = DriverManager.getConnection(serverUrl, username, password);
             Statement admin = control.createStatement()) {
            admin.execute("CREATE DATABASE `" + schema + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            try {
                Flyway.configure().dataSource(schemaUrl, username, password).target("27").load().migrate();
                try (Connection connection = DriverManager.getConnection(schemaUrl, username, password);
                     Statement sql = connection.createStatement()) {
                    Map<String, Integer> applied = checksums(sql);
                    sql.execute("""
                            INSERT INTO users(user_id,full_name,email,password_hash,role,status,created_at,updated_at)
                            VALUES(900001,'Preserved local owner','upgrade@example.test','fixture-hash','ADMIN','ACTIVE',NOW(),NOW())
                            """);
                    sql.execute("""
                            INSERT INTO events(id,event_name,template_type,event_date,status,deleted)
                            VALUES(900001,'Preserved legacy ceremony','WEDDING','2027-01-10','PUBLISHED',false)
                            """);
                    sql.execute("""
                            INSERT INTO invitations(invitation_id,user_id,title,slug,status)
                            VALUES(900001,900001,'Preserved invitation','upgrade-fixture','PUBLISHED')
                            """);
                    sql.execute("""
                            INSERT INTO guests(guest_id,invitation_id,guest_name,invite_token)
                            VALUES(900001,900001,'Preserved guest','upgrade-fixture-token')
                            """);
                    sql.execute("""
                            INSERT INTO guest_check_ins(check_in_id,invitation_id,guest_id,checked_in_by,checked_in_at,source,note)
                            VALUES(900001,900001,900001,900001,NOW(),'QR','Preserved attendance note')
                            """);
                    Flyway upgraded = Flyway.configure().dataSource(schemaUrl, username, password).load();
                    upgraded.migrate();
                    upgraded.validate();
                    Map<String, Integer> after = checksums(sql);
                    applied.forEach((version, checksum) -> assertEquals(checksum, after.get(version)));
                    assertTrue(after.size() > applied.size());
                    assertEquals("ADMIN", scalar(sql, "SELECT role FROM users WHERE user_id=900001"));
                    assertEquals("Preserved legacy ceremony", scalar(sql, "SELECT event_name FROM events WHERE id=900001"));
                    assertEquals("PUBLISHED", scalar(sql, "SELECT status FROM events WHERE id=900001"));
                    assertEquals("0", scalar(sql, "SELECT COUNT(*) FROM user_external_identities WHERE user_id=900001"));
                    assertEquals("1", scalar(sql, "SELECT is_active FROM guest_check_ins WHERE check_in_id=900001"));
                    assertEquals("Preserved attendance note", scalar(sql, "SELECT note FROM guest_check_ins WHERE check_in_id=900001"));
                    assertEquals("1", scalar(sql, "SELECT COUNT(*) FROM guest_check_in_events WHERE check_in_id=900001 AND action='CHECKED_IN'"));
                    assertEquals("1", scalar(sql, """
                            SELECT COUNT(*) FROM guest_check_in_events e JOIN guest_check_ins s ON e.check_in_id=s.check_in_id
                            WHERE s.check_in_id=900001 AND e.actor_user_id=s.checked_in_by
                              AND e.occurred_at=s.checked_in_at AND e.source=s.source AND e.note=s.note
                            """));
                    sql.execute("""
                            INSERT INTO users(user_id,full_name,email,role,status,created_at,updated_at)
                            VALUES(900002,'Staff fixture','staff-upgrade@example.test','STAFF','ACTIVE',NOW(),NOW())
                            """);
                    assertEquals("STAFF", scalar(sql, "SELECT role FROM users WHERE user_id=900002"));
                }
            } finally {
                // The name was generated and this CREATE succeeded in this test;
                // no existing or configured application schema is dropped.
                admin.execute("DROP DATABASE `" + schema + "`");
            }
        }
    }

    private Map<String, Integer> checksums(Statement sql) throws Exception {
        Map<String, Integer> checksums = new LinkedHashMap<>();
        try (var rows = sql.executeQuery("SELECT version,checksum FROM flyway_schema_history WHERE success=true AND version IS NOT NULL")) {
            while (rows.next()) checksums.put(rows.getString(1), rows.getInt(2));
        }
        return checksums;
    }

    private String scalar(Statement sql, String query) throws Exception {
        try (var rows = sql.executeQuery(query)) {
            assertTrue(rows.next());
            String value = rows.getString(1);
            assertFalse(rows.next());
            return value;
        }
    }

    private String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException(name + " is required");
        return value;
    }
}
