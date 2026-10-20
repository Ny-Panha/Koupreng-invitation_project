package com.koupreng.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.io.TempDir;

/** Exercises real MySQL DDL and Flyway recovery in a schema created only by this test. */
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class TicketMigrationMySqlTests {

    @TempDir
    Path migrations;

    @Test
    void failedV39CanBeRepairedWithoutChangingAppliedHistoryOrTicketData() throws Exception {
        String serverUrl = required("FLYWAY_TEST_DB_URL");
        String username = required("FLYWAY_TEST_DB_USERNAME");
        String password = required("FLYWAY_TEST_DB_PASSWORD");
        String schema = "koupreng_ticket_" + UUID.randomUUID().toString().replace("-", "");
        if (!serverUrl.startsWith("jdbc:mysql://") || !schema.matches("koupreng_ticket_[a-f0-9]{32}")) {
            throw new IllegalStateException("Requires disposable MySQL integration configuration");
        }
        int databaseStart = serverUrl.indexOf('/', "jdbc:mysql://".length());
        int queryStart = serverUrl.indexOf('?');
        String schemaUrl = serverUrl.substring(0, databaseStart + 1) + schema
                + (queryStart < 0 ? "" : serverUrl.substring(queryStart));
        Path source = Path.of("src/main/resources/db/migration");
        try (var files = Files.list(source)) {
            for (Path file : files.toList()) Files.copy(file, migrations.resolve(file.getFileName()));
        }
        Path v39 = migrations.resolve("V39__cascade_invitation_ticket_design_cleanup.sql");
        String corrected = Files.readString(v39);
        Files.writeString(v39, """
                ALTER TABLE invitation_ticket_designs
                    DROP FOREIGN KEY fk_ticket_designs_invitation,
                    ADD CONSTRAINT fk_ticket_designs_invitation
                        FOREIGN KEY (invitation_id) REFERENCES invitations(invitation_id) ON DELETE CASCADE;
                """);
        try (var control = DriverManager.getConnection(serverUrl, username, password);
             var admin = control.createStatement()) {
            admin.execute("CREATE DATABASE `" + schema + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            try {
                Flyway.configure().dataSource(schemaUrl, username, password).target("38").load().migrate();
                try (var connection = DriverManager.getConnection(schemaUrl, username, password);
                     var sql = connection.createStatement()) {
                    Map<String, Integer> applied = checksums(sql);
                    sql.execute("""
                            INSERT INTO users(user_id,full_name,email,role,status,created_at,updated_at)
                            VALUES(900001,'Ticket owner','ticket-migration@example.test','USER','ACTIVE',NOW(),NOW())
                            """);
                    sql.execute("""
                            INSERT INTO invitations(invitation_id,user_id,title,slug,status)
                            VALUES(900001,900001,'Preserved ticket event','ticket-migration-fixture','DRAFT')
                            """);
                    sql.execute("""
                            INSERT INTO invitation_ticket_designs(invitation_id,design_json,version)
                            VALUES(900001,'{"layout":"GOLD","headerText":"Preserved design"}',7)
                            """);
                    Flyway flyway = Flyway.configure().dataSource(schemaUrl, username, password)
                            .locations("filesystem:" + migrations).load();
                    assertThrows(FlywayException.class, flyway::migrate);
                    assertEquals("1", scalar(sql, "SELECT COUNT(*) FROM flyway_schema_history WHERE version='39' AND success=false"));
                    assertEquals("NO ACTION", deleteRule(sql));
                    assertEquals(applied, checksums(sql));

                    Files.writeString(v39, corrected);
                    flyway.repair();
                    assertEquals(applied, checksums(sql));
                    assertEquals("0", scalar(sql, "SELECT COUNT(*) FROM flyway_schema_history WHERE success=false"));
                    flyway.migrate();
                    flyway.validate();
                    Map<String, Integer> after = checksums(sql);
                    applied.forEach((version, checksum) -> assertEquals(checksum, after.get(version)));
                    assertEquals("1", scalar(sql, "SELECT COUNT(*) FROM flyway_schema_history WHERE version='39' AND success=true"));
                    assertEquals("CASCADE", deleteRule(sql));
                    assertEquals("7", scalar(sql, "SELECT version FROM invitation_ticket_designs WHERE invitation_id=900001"));
                    assertEquals("Preserved design", scalar(sql, "SELECT JSON_UNQUOTE(JSON_EXTRACT(design_json,'$.headerText')) FROM invitation_ticket_designs WHERE invitation_id=900001"));
                    assertThrows(SQLException.class, () -> sql.execute("INSERT INTO invitation_ticket_designs(invitation_id,design_json) VALUES(900002,'{}')"));
                    sql.execute("DELETE FROM invitations WHERE invitation_id=900001");
                    assertEquals("0", scalar(sql, "SELECT COUNT(*) FROM invitation_ticket_designs"));
                    assertEquals("1", scalar(sql, "SELECT COUNT(*) FROM users WHERE user_id=900001"));
                }
            } finally {
                // This generated schema was created successfully above; configured app schemas are never dropped.
                admin.execute("DROP DATABASE `" + schema + "`");
            }
        }
    }

    private String deleteRule(Statement sql) throws Exception {
        return scalar(sql, "SELECT DELETE_RULE FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='invitation_ticket_designs'");
    }

    private Map<String, Integer> checksums(Statement sql) throws Exception {
        Map<String, Integer> result = new LinkedHashMap<>();
        try (var rows = sql.executeQuery("SELECT version,checksum FROM flyway_schema_history WHERE success=true AND version IS NOT NULL")) {
            while (rows.next()) result.put(rows.getString(1), rows.getInt(2));
        }
        return result;
    }

    private String scalar(Statement sql, String query) throws Exception {
        try (var rows = sql.executeQuery(query)) {
            assertTrue(rows.next());
            return rows.getString(1);
        }
    }

    private String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException(name + " is required");
        return value;
    }
}
