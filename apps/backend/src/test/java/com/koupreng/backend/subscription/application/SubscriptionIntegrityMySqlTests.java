package com.koupreng.backend.subscription.application;

import com.koupreng.backend.payment.api.dto.ConfirmPaymentRequest;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
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
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class SubscriptionIntegrityMySqlTests {
    @Autowired private SubscriptionService service;
    @Autowired private SubscriptionRepository subscriptions;
    @Autowired private SubscriptionPackageRepository packages;
    @Autowired private AppUserRepository users;
    @Autowired private PlatformTransactionManager transactions;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> required("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }

    @Test
    void expiredFlagIsClosedBeforeRenewalAndRepeatedConfirmationIsIdempotent() {
        AppUser user = user();
        Subscription previous = order(user, true, Instant.now().minusSeconds(60));
        Subscription replacement = order(user, false, null);
        confirm(replacement);
        Subscription closed = subscriptions.findById(previous.getId()).orElseThrow();
        assertFalse(closed.isActive());
        assertEquals("EXPIRED", closed.getStatus());
        assertEquals("PAID", closed.getPaymentStatus());
        Subscription active = subscriptions.findById(replacement.getId()).orElseThrow();
        assertTrue(active.isActive());
        Instant confirmedAt = active.getConfirmedAt();
        confirm(replacement);
        assertEquals(confirmedAt, subscriptions.findById(replacement.getId()).orElseThrow().getConfirmedAt());
        assertEquals(1, activeCount(user));
    }

    @Test
    void activeReplacementPreservesPaidHistory() {
        AppUser user = user();
        Subscription previous = order(user, true, Instant.now().plusSeconds(3600));
        Subscription replacement = order(user, false, null);
        confirm(replacement);
        Subscription closed = subscriptions.findById(previous.getId()).orElseThrow();
        assertEquals("REPLACED", closed.getStatus());
        assertEquals("PAID", closed.getPaymentStatus());
        assertFalse(closed.isActive());
        assertEquals(1, activeCount(user));
    }

    @Test
    void simultaneousActivationSerializesAndRetainsExactlyOneActiveSlot() throws Exception {
        AppUser user = user();
        Subscription first = order(user, false, null);
        Subscription second = order(user, false, null);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var one = executor.submit(() -> { confirmTogether(first, ready, start); return null; });
            var two = executor.submit(() -> { confirmTogether(second, ready, start); return null; });
            assertTrue(ready.await(5, TimeUnit.SECONDS));
            start.countDown();
            one.get(20, TimeUnit.SECONDS);
            two.get(20, TimeUnit.SECONDS);
        }
        assertEquals(1, activeCount(user));
        assertEquals("PAID", subscriptions.findById(first.getId()).orElseThrow().getPaymentStatus());
        assertEquals("PAID", subscriptions.findById(second.getId()).orElseThrow().getPaymentStatus());
    }

    @Test
    void rollbackRestoresPreviousActiveSlotAndLeavesReplacementPending() {
        AppUser user = user();
        Subscription previous = order(user, true, Instant.now().minusSeconds(60));
        Subscription replacement = order(user, false, null);
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            confirm(replacement);
            status.setRollbackOnly();
        });
        assertTrue(subscriptions.findById(previous.getId()).orElseThrow().isActive());
        Subscription pending = subscriptions.findById(replacement.getId()).orElseThrow();
        assertFalse(pending.isActive());
        assertEquals("PENDING", pending.getPaymentStatus());
        assertEquals(1, activeCount(user));
    }

    private void confirmTogether(Subscription order, CountDownLatch ready, CountDownLatch start) throws Exception {
        ready.countDown();
        if (!start.await(5, TimeUnit.SECONDS)) { throw new IllegalStateException("Activation start timed out"); }
        confirm(order);
    }

    private void confirm(Subscription order) {
        service.confirmManualPayment(new ConfirmPaymentRequest(order.getOrderCode(), BigDecimal.ONE,
                "integrity-fixture", "SUBSCRIPTION"));
    }

    private long activeCount(AppUser user) {
        return subscriptions.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().filter(Subscription::isActive).count();
    }

    private Subscription order(AppUser user, boolean active, Instant end) {
        SubscriptionPackage plan = packages.findAll().getFirst();
        Subscription order = new Subscription();
        order.setUser(user);
        order.setSubscriptionPackage(plan);
        order.setOrderCode("SUB" + UUID.randomUUID().toString().replace("-", "").toUpperCase(java.util.Locale.ROOT));
        order.setAmount(BigDecimal.ONE);
        order.setCurrency("USD");
        order.setActive(active);
        order.setStatus(active ? "ACTIVE" : "PENDING_PAYMENT");
        order.setPaymentStatus(active ? "PAID" : "PENDING");
        order.setEndDate(end);
        return subscriptions.saveAndFlush(order);
    }

    private AppUser user() {
        AppUser user = new AppUser();
        user.setFullName("Subscription integrity fixture");
        user.setEmail("subscription-" + UUID.randomUUID() + "@example.com");
        user.setRole(Role.USER);
        return users.saveAndFlush(user);
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) { throw new IllegalStateException(name + " is required"); }
        return value;
    }
}
