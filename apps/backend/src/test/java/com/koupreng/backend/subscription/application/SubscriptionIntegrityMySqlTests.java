package com.koupreng.backend.subscription.application;

import com.koupreng.backend.payment.api.dto.ConfirmPaymentRequest;
import com.koupreng.backend.subscription.api.dto.TelegramDetectSubscriptionPaymentRequest;
import com.koupreng.backend.subscription.domain.SubscriptionPaymentDetectionStatus;
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
    void merchantAlertRequiresBankRecordAndSettlementIsIdempotent() {
        Subscription pending = order(user(), false, null);
        pending.setAmount(new BigDecimal("27.13"));
        pending.setPayerName("FIXTURE USER");
        pending.setPayerAccountLast3("982");
        subscriptions.saveAndFlush(pending);
        var request = new TelegramDetectSubscriptionPaymentRequest();
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
        assertEquals(SubscriptionPaymentDetectionStatus.REVIEW_REQUIRED,
                service.detectTelegramPayment(request).status());
        assertFalse(subscriptions.findById(pending.getId()).orElseThrow().isActive());
        var verification = new ConfirmPaymentRequest(pending.getOrderCode(), pending.getAmount(),
                "integrity-fixture", "SUBSCRIPTION", request.getPaywayTransactionId(), verifiedBankRecord());
        service.confirmManualPayment(verification);
        Instant end = subscriptions.findById(pending.getId()).orElseThrow().getEndDate();
        service.confirmManualPayment(verification);
        assertEquals(end, subscriptions.findById(pending.getId()).orElseThrow().getEndDate());
        assertEquals("MANUAL_ADMIN", subscriptions.findById(pending.getId()).orElseThrow().getConfirmSource());
    }

    @Test
    void directOriginalAlertAutoSettlesExactNameOnceAmongSameAmountAndSuffix() {
        enableDirectAlertSettlement();
        Subscription winner = alertsOrder("DEMO   PAYER", "831");
        Subscription other = alertsOrder("ANOTHER PAYER", "831");
        var alert = directAlert(winner);
        alert.setPayerName("demo payer");
        assertEquals(SubscriptionPaymentDetectionStatus.PAID, service.reconcileDirectPayWayAlert(alert).status());
        assertEquals(SubscriptionPaymentDetectionStatus.ALREADY_PROCESSED, service.reconcileDirectPayWayAlert(alert).status());
        var paid = subscriptions.findById(winner.getId()).orElseThrow();
        assertEquals("PAID", paid.getPaymentStatus());
        assertTrue(paid.isActive());
        assertEquals("PAYWAY_TELEGRAM", paid.getConfirmSource());
        assertFalse(subscriptions.findById(other.getId()).orElseThrow().isActive());
        var evidence = evidenceRepository.findById(alert.getPaywayTransactionId()).orElseThrow();
        assertEquals(paid.getOrderCode(), evidence.getOrderCode());
        assertEquals("PAYWAY_TELEGRAM", evidence.getVerificationMethod());
        assertEquals("telegram-bot:42", evidence.getVerifiedBy());
    }

    @Test
    void anExistingReviewCandidateWithTheSamePayerPreventsAutomaticSettlement() {
        enableDirectAlertSettlement();
        Subscription pending = alertsOrder("DEMO PAYER", "832");
        Subscription competing = alertsOrder("Demo Payer", "832");
        competing.setStatus("REVIEW_REQUIRED");
        subscriptions.saveAndFlush(competing);
        var alert = directAlert(pending);
        assertEquals(SubscriptionPaymentDetectionStatus.REVIEW_REQUIRED, service.reconcileDirectPayWayAlert(alert).status());
        assertFalse(subscriptions.findById(pending.getId()).orElseThrow().isActive());
        assertFalse(subscriptions.findById(competing.getId()).orElseThrow().isActive());
        assertNull(evidenceRepository.findById(alert.getPaywayTransactionId()).orElseThrow().getVerificationMethod());
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {"merchant", "group", "sender", "amount", "name", "opt-out"})
    void directAlertWithAConfirmationGuardFailureRemainsUnpaid(String failure) {
        enableDirectAlertSettlement();
        Subscription pending = alertsOrder("DEMO PAYER", "833");
        var alert = directAlert(pending);
        switch (failure) {
            case "merchant" -> alert.setRawMessage(alert.getRawMessage().replace("KOEURNG VIREAK", "OTHER MERCHANT"));
            case "group" -> alert.setTelegramChatId("-1002");
            case "sender" -> alert.setTelegramSenderId("999");
            case "amount" -> alert.setRawMessage(alert.getRawMessage().replace("$0.01", "$0.02"));
            case "name" -> alert.setPayerName("Someone Else");
            case "opt-out" -> paymentProperties.setSubscriptionPayWayTelegramAutoSettleEnabled(false);
            default -> throw new AssertionError(failure);
        }
        assertEquals(SubscriptionPaymentDetectionStatus.REVIEW_REQUIRED, service.reconcileDirectPayWayAlert(alert).status());
        assertFalse(subscriptions.findById(pending.getId()).orElseThrow().isActive());
    }

    @Test
    void legacyIngestRemainsReviewOnlyWhenAutomaticSettlementIsEnabled() {
        enableDirectAlertSettlement();
        Subscription order = alertsOrder("DEMO PAYER", "834");
        assertEquals(SubscriptionPaymentDetectionStatus.REVIEW_REQUIRED, service.detectTelegramPayment(directAlert(order)).status());
    }

    @org.junit.jupiter.api.AfterEach
    void resetDirectAlertSettlement() {
        paymentProperties.setSubscriptionPayWayTelegramAutoSettleEnabled(false);
        paymentProperties.setAdminSecret("change-me-local-only");
    }

    private void enableDirectAlertSettlement() {
        paymentProperties.setSubscriptionPayWayTelegramAutoSettleEnabled(true);
        paymentProperties.setAdminSecret("test-administrator-key-".repeat(2));
    }

    private Subscription alertsOrder(String name, String suffix) {
        var pending = order(user(), false, null);
        pending.setProvider("ABA_PAYWAY_STATIC_TELEGRAM");
        pending.setAmount(new BigDecimal("0.01"));
        pending.setPayerName(name);
        pending.setPayerAccountLast3(suffix);
        return subscriptions.saveAndFlush(pending);
    }

    private TelegramDetectSubscriptionPaymentRequest directAlert(Subscription order) {
        Instant posted = Instant.now();
        String time = java.time.format.DateTimeFormatter.ofPattern("MMM d, hh:mm a", java.util.Locale.ENGLISH)
                .withZone(java.time.ZoneId.of("Asia/Phnom_Penh")).format(posted);
        String id = "990" + order.getId();
        var alert = new TelegramDetectSubscriptionPaymentRequest();
        alert.setRawMessage("$0.01 paid by DEMO PAYER (*" + order.getPayerAccountLast3()
                + ") on " + time + " via ABA PAY at KOEURNG VIREAK. Trx. ID: " + id + ", APV: 123456.");
        alert.setDetectedBy("telegram-payway-bot");
        alert.setDetectedAmount(order.getAmount());
        alert.setDetectedCurrency(order.getCurrency());
        alert.setPayerName("DEMO PAYER");
        alert.setPayerAccountLast3(order.getPayerAccountLast3());
        alert.setPaywayTransactionId(id);
        alert.setPaywayApprovalCode("123456");
        alert.setTransactionDateText(time);
        alert.setTelegramChatId("-1001");
        alert.setTelegramSenderId("42");
        alert.setTelegramMessageId(id);
        alert.setMerchantMessageAt(posted);
        alert.setTrustedMerchantAlert(true);
        return alert;
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
                "integrity-fixture", "SUBSCRIPTION", transactionId, verifiedBankRecord()));
    }

    private com.koupreng.backend.payment.api.dto.BankRecordVerification verifiedBankRecord() {
        return new com.koupreng.backend.payment.api.dto.BankRecordVerification(
                "USD", "KOEURNG VIREAK", "Verified sandbox merchant record", true);
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
