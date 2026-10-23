package com.koupreng.backend.guest.application;

import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/** Runs the same HTTP/JPA and atomic retry cases against an explicitly disposable MySQL schema. */
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class GuestBatchMySqlTests extends GuestBatchIntegrationTests {
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> System.getenv("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> System.getenv("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> System.getenv("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }
}
