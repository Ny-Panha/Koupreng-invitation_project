package com.koupreng.backend;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.sql.DriverManager;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class SilkHeritageMigrationMySqlTests {

    @Test
    void addsTheCatalogEntryAndPreservesExistingCommercialSettings() throws Exception {
        String serverUrl = required("FLYWAY_TEST_DB_URL");
        String username = required("FLYWAY_TEST_DB_USERNAME");
        String password = required("FLYWAY_TEST_DB_PASSWORD");
        String schema = "koupreng_silk_" + UUID.randomUUID().toString().replace("-", "");
        if (!serverUrl.startsWith("jdbc:mysql://") || !schema.matches("koupreng_silk_[a-f0-9]{32}")) {
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
                Flyway.configure().dataSource(schemaUrl, username, password).target("34").load().migrate();
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
                    try (var rows = sql.executeQuery("SELECT template_id,currency,status,thumbnail_url,JSON_UNQUOTE(JSON_EXTRACT(description,'$.presetId')) AS preset FROM templates WHERE code='silk-heritage'")) {
                        assertTrue(rows.next());
                        assertTrue(rows.getLong("template_id") > 0);
                        assertEquals("USD", rows.getString("currency"));
                        assertEquals("ACTIVE", rows.getString("status"));
                        assertEquals("SILK_HERITAGE", rows.getString("preset"));
                        assertEquals("/templates/silk-heritage/preview.svg", rows.getString("thumbnail_url"));
                        assertTrue(!rows.next(), "The stable code must have exactly one catalog entry");
                    }
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
