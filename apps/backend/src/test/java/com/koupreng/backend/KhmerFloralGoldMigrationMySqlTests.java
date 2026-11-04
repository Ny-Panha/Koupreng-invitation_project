package com.koupreng.backend;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.sql.DriverManager;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class KhmerFloralGoldMigrationMySqlTests {

    @Test
    void addsTheCatalogEntryAndPreservesExistingCommercialSettings() throws Exception {
        String serverUrl = required("FLYWAY_TEST_DB_URL");
        String username = required("FLYWAY_TEST_DB_USERNAME");
        String password = required("FLYWAY_TEST_DB_PASSWORD");
        String schema = "koupreng_floral_" + UUID.randomUUID().toString().replace("-", "");
        if (!serverUrl.startsWith("jdbc:mysql://") || !schema.matches("koupreng_floral_[a-f0-9]{32}")) {
            throw new IllegalStateException("Requires disposable MySQL integration configuration");
        }
        int databaseStart = serverUrl.indexOf('/', "jdbc:mysql://".length());
        int queryStart = serverUrl.indexOf('?');
        String schemaUrl = serverUrl.substring(0, databaseStart + 1) + schema
                + (queryStart < 0 ? "" : serverUrl.substring(queryStart));
        try (var control = DriverManager.getConnection(serverUrl, username, password);
             var admin = control.createStatement()) {
            admin.execute("CREATE DATABASE `" + schema + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            try {
                Flyway.configure().dataSource(schemaUrl, username, password).target("50").load().migrate();
                long originalId;
                try (var connection = DriverManager.getConnection(schemaUrl, username, password);
                     var sql = connection.createStatement()) {
                    sql.execute("UPDATE templates SET price=42.00,is_premium=TRUE,status='INACTIVE',sort_order=88 WHERE code='garden-royal-khmer-wedding'");
                    try (var rows = sql.executeQuery("SELECT template_id FROM templates WHERE code='garden-royal-khmer-wedding'")) {
                        assertTrue(rows.next());
                        originalId = rows.getLong(1);
                    }
                }
                Flyway.configure().dataSource(schemaUrl, username, password).load().migrate();
                try (var connection = DriverManager.getConnection(schemaUrl, username, password);
                     var sql = connection.createStatement()) {
                    try (var rows = sql.executeQuery("SELECT template_id,price,is_premium,status,sort_order FROM templates WHERE code='garden-royal-khmer-wedding'")) {
                        assertTrue(rows.next());
                        assertEquals(originalId, rows.getLong("template_id"));
                        assertEquals("42.00", rows.getBigDecimal("price").toPlainString());
                        assertTrue(rows.getBoolean("is_premium"));
                        assertEquals("INACTIVE", rows.getString("status"));
                        assertEquals(88, rows.getInt("sort_order"));
                    }
                    try (var rows = sql.executeQuery("SELECT template_id,price,is_premium,currency,status,thumbnail_url,JSON_UNQUOTE(JSON_EXTRACT(description,'$.presetId')) AS preset FROM templates WHERE code='khmer-floral-gold'")) {
                        assertTrue(rows.next());
                        assertTrue(rows.getLong("template_id") > 0);
                        assertEquals("USD", rows.getString("currency"));
                        assertEquals(0, rows.getBigDecimal("price").signum());
                        assertTrue(!rows.getBoolean("is_premium"));
                        assertEquals("ACTIVE", rows.getString("status"));
                        assertEquals("KHMER_FLORAL_GOLD", rows.getString("preset"));
                        assertEquals("/templates/khmer-floral-gold/preview.svg", rows.getString("thumbnail_url"));
                        assertTrue(!rows.next(), "The stable code must have exactly one catalog entry");
                    }
                    try (var rows = sql.executeQuery("SELECT COUNT(*) FROM template_languages l JOIN templates t ON t.template_id=l.template_id WHERE t.code='khmer-floral-gold'")) { rows.next(); assertEquals(3, rows.getInt(1)); }
                    try (var rows = sql.executeQuery("SELECT event_type FROM template_event_types e JOIN templates t ON t.template_id=e.template_id WHERE t.code='khmer-floral-gold'")) { assertTrue(rows.next()); assertEquals("WEDDING", rows.getString(1)); assertTrue(!rows.next()); }
                    sql.execute("UPDATE templates SET price=12.00,status='INACTIVE' WHERE code='khmer-floral-gold'");
                    String migration = java.nio.file.Files.readString(java.nio.file.Path.of("src/main/resources/db/migration/V51__register_khmer_floral_gold_template.sql"));
                    for (String statement : migration.split(";")) if (!statement.isBlank()) sql.execute(statement);
                    try (var rows = sql.executeQuery("SELECT price,status FROM templates WHERE code='khmer-floral-gold'")) { assertTrue(rows.next()); assertEquals("12.00", rows.getBigDecimal(1).toPlainString()); assertEquals("INACTIVE", rows.getString(2)); assertTrue(!rows.next()); }
                }
            } finally {
                admin.execute("DROP DATABASE `" + schema + "`");
            }
        }
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException(name + " is required");
        return value;
    }
}
