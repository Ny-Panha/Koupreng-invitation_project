package com.koupreng.backend.gift.application;

import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@EnabledIfEnvironmentVariable(named="RUN_FLYWAY_INTEGRATION",matches="true")
class ManualGiftMySqlTests extends ManualGiftPersistenceTests {
    @DynamicPropertySource static void database(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url",()->System.getenv("FLYWAY_TEST_DB_URL"));r.add("spring.datasource.username",()->System.getenv("FLYWAY_TEST_DB_USERNAME"));r.add("spring.datasource.password",()->System.getenv("FLYWAY_TEST_DB_PASSWORD"));
        r.add("spring.datasource.driver-class-name",()->"com.mysql.cj.jdbc.Driver");r.add("spring.flyway.enabled",()->true);r.add("spring.jpa.hibernate.ddl-auto",()->"validate");
        r.add("spring.jpa.database-platform",()->"org.hibernate.dialect.MySQLDialect");r.add("spring.jpa.properties.hibernate.dialect",()->"org.hibernate.dialect.MySQLDialect");r.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access",()->true);
    }
}
