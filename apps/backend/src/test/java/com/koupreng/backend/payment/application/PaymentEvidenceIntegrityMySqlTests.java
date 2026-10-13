package com.koupreng.backend.payment.application;

import com.koupreng.backend.payment.infrastructure.persistence.PaymentEvidenceRepository;
import com.koupreng.backend.shared.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {"app.payment.telegram-group-ids=-1001", "app.payment.telegram-payment-bot-ids=42"})
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class PaymentEvidenceIntegrityMySqlTests {
    @Autowired private PaymentEvidenceService service;
    @Autowired private PaymentEvidenceRepository evidence;
    @Autowired private PlatformTransactionManager manager;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> System.getenv("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> System.getenv("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> System.getenv("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }

    @Test
    void concurrentTemplateAndSubscriptionClaimsHaveExactlyOneWinner() throws Exception {
        String id = id();
        CountDownLatch start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var template = pool.submit(() -> claimTogether(id, "EVT-QA", start));
            var subscription = pool.submit(() -> claimTogether(id, "SUB-QA", start));
            start.countDown();
            assertEquals(1, template.get(20, TimeUnit.SECONDS) + subscription.get(20, TimeUnit.SECONDS));
        }
        assertEquals("PAID", evidence.findById(id).orElseThrow().getOutcome());
    }

    private int claimTogether(String id, String order, CountDownLatch start) throws Exception {
        start.await(5, TimeUnit.SECONDS);
        try {
            new TransactionTemplate(manager).executeWithoutResult(status -> {
                var row = service.record(id, BigDecimal.ONE, "USD", "-1001", messageId(id), "42", true,
                        Instant.now(), "FIXTURE", "247", null, null);
                service.claim(row, order, BigDecimal.ONE, "USD");
            });
            return 1;
        } catch (ApiException conflict) {
            return 0;
        }
    }

    @Test
    void alteringTransactionIdOnTheSameOriginalMessageIsRejected() {
        String first = id();
        String message = messageId(first);
        new TransactionTemplate(manager).executeWithoutResult(status -> service.record(first, BigDecimal.ONE, "USD",
                "-1001", message, "42", true, Instant.now(), "FIXTURE", "247", null, null));
        String altered = id();
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class,
                () -> new TransactionTemplate(manager).executeWithoutResult(status -> service.record(altered,
                        BigDecimal.ONE, "USD", "-1001", message, "42", true, Instant.now(), "FIXTURE", "247", null, null)));
        assertTrue(evidence.findById(altered).isEmpty());
    }

    @Test
    void unmatchedEvidenceIsDurableButUntrustedEvidenceCannotSettle() {
        String id = id();
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            var row = service.record(id, BigDecimal.ONE, "USD", "-1001", messageId(id), "43", true,
                    Instant.now(), "FIXTURE", "247", null, null);
            row.setOutcome("UNMATCHED");
        });
        assertEquals("UNMATCHED", evidence.findById(id).orElseThrow().getOutcome());
        assertThrows(ApiException.class, () -> new TransactionTemplate(manager).executeWithoutResult(status -> {
            var row = service.manualEvidence(id, "SUB-QA");
            service.claim(row, "SUB-QA", BigDecimal.ONE, "USD");
        }));
        assertFalse(evidence.findById(id).orElseThrow().isTrusted());
    }

    @Test
    void settlementRollbackLeavesEvidenceAvailableAndUnclaimed() {
        String id = id();
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            var row = service.record(id, BigDecimal.ONE, "USD", "-1001", messageId(id), "42", true,
                    Instant.now(), "FIXTURE", "247", null, null);
            service.claim(row, "SUB-QA", BigDecimal.ONE, "USD");
            status.setRollbackOnly();
        });
        assertTrue(evidence.findById(id).isEmpty());
    }

    private String id() { return "SIM-" + UUID.randomUUID(); }
    private String messageId(String id) { return Long.toString(Integer.toUnsignedLong(id.hashCode())); }
}
