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

@SpringBootTest(properties = {"app.payment.telegram-group-ids=-1001", "app.payment.telegram-payment-bot-ids=42"})
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class SubscriptionIntegrityMySqlTests {
    @Autowired private SubscriptionService service;
    @Autowired private SubscriptionRepository subscriptions;
    @Autowired private SubscriptionPackageRepository packages;
    @Autowired private AppUserRepository users;
    @Autowired private PlatformTransactionManager transactions;
    @Autowired private com.koupreng.backend.payment.application.PaymentEvidenceService evidenceService;
    @Autowired private com.koupreng.backend.payment.infrastructure.persistence.PaymentEvidenceRepository evidenceRepository;
    @Autowired private com.koupreng.backend.payment.infrastructure.config.PaymentProperties paymentProperties;
    @Autowired private com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository notifications;

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

    @Test
    void strictOptInMerchantEvidenceActivatesOnlyOnceUsingTheRealPersistencePath() {
        Subscription pending = order(user(), false, null);
        pending.setAmount(new BigDecimal("27.13"));
        pending.setPayerName("FIXTURE USER");
        pending.setPayerAccountLast3("982");
        subscriptions.saveAndFlush(pending);
        var request = new com.koupreng.backend.subscription.api.dto.TelegramDetectSubscriptionPaymentRequest();
        request.setPaywayTransactionId("SIM-" + UUID.randomUUID());
        request.setRawMessage("USD 27.13 paid by FIXTURE USER (*982). Trx. ID: " + request.getPaywayTransactionId());
        request.setDetectedAmount(pending.getAmount());
        request.setDetectedCurrency("USD");
        request.setPayerName(" fixture   user ");
        request.setPayerAccountLast3("982");
        request.setDetectedBy("telegram-payway-bot:42");
        request.setTelegramChatId("-1001");
        request.setTelegramSenderId("42");
        request.setTelegramMessageId("900000" + pending.getId());
        request.setTrustedMerchantAlert(true);
        request.setMerchantMessageAt(Instant.now());
        paymentProperties.setAutoConfirmTelegramDetected(true);
        try {
            assertEquals(com.koupreng.backend.subscription.domain.SubscriptionPaymentDetectionStatus.PAID,
                    service.detectTelegramPayment(request).status());
            Instant end = subscriptions.findById(pending.getId()).orElseThrow().getEndDate();
            assertEquals(com.koupreng.backend.subscription.domain.SubscriptionPaymentDetectionStatus.ALREADY_PROCESSED,
                    service.detectTelegramPayment(request).status());
            assertEquals(end, subscriptions.findById(pending.getId()).orElseThrow().getEndDate());
            assertEquals("TRUSTED_TELEGRAM_MERCHANT_ALERT",
                    subscriptions.findById(pending.getId()).orElseThrow().getConfirmSource());
        } finally {
            paymentProperties.setAutoConfirmTelegramDetected(false);
        }
    }

    @Test
    void rolledBackActivationDoesNotLeaveADeliverableSuccessNotification() {
        Subscription pending = order(user(), false, null);
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            confirm(pending);
            status.setRollbackOnly();
        });
        assertTrue(notifications.findAll().stream().noneMatch(n ->
                ("subscription-paid:" + pending.getOrderCode()).equals(n.getPaymentDeliveryKey())));
        assertFalse(subscriptions.findById(pending.getId()).orElseThrow().isActive());
    }

    private void confirm(Subscription order) {
        String transactionId = "QA-" + order.getId();
        if (evidenceRepository.findById(transactionId).isEmpty()) {
            new TransactionTemplate(transactions).executeWithoutResult(status -> evidenceService.record(transactionId,
                    BigDecimal.ONE, "USD", "-1001", String.valueOf(order.getId()), "42", true, Instant.now(),
                    "FIXTURE", "247", null, order.getOrderCode()));
        }
        service.confirmManualPayment(new ConfirmPaymentRequest(order.getOrderCode(), BigDecimal.ONE,
                "integrity-fixture", "SUBSCRIPTION", transactionId));
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
        order.setPaymentExpiresAt(Instant.now().plusSeconds(1800));
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
