package com.koupreng.backend.subscription.application;

import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.payment.api.dto.ConfirmPaymentRequest;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.subscription.api.dto.SubscriptionPurchaseRequest;
import com.koupreng.backend.subscription.api.dto.TelegramDetectSubscriptionPaymentRequest;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.domain.SubscriptionPaymentDetectionStatus;
import com.koupreng.backend.subscription.infrastructure.payment.SubscriptionPaymentPlanResolver;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SubscriptionServiceTests {

    @ParameterizedTest
    @CsvSource({
            "BASIC,0.01,https://link.payway.com.kh/ABAPAYMu523385B",
            "PRO,199.00,https://link.payway.com.kh/ABAPAY9G523386h",
            "PREMIUM,499.00,https://link.payway.com.kh/ABAPAYBo5233877"
    })
    void purchaseUsesAuthoritativeServerPlan(String code, String amount, String paymentUrl) {
        Fixture fixture = fixture();
        SubscriptionPackage plan = plan(code, "9999.99", 365);
        when(fixture.packageRepository.findByIdAndActiveTrue(3L)).thenReturn(Optional.of(plan));

        var response = fixture.service.purchase(fixture.authentication, purchaseRequest("247"));

        assertEquals(new BigDecimal(amount), response.getAmount());
        assertEquals(paymentUrl, response.getPaymentUrl());
        assertEquals("PENDING", response.getPaymentStatus());
        assertEquals("PENDING_PAYMENT", response.getStatus());
        assertEquals("247", response.getPayerAccountLast3());
        assertEquals("KOEURNG VIREAK", response.getPayerName());
        assertNotNull(response.getExpiresAt());
        assertFalse(response.isActive());
    }

    @ParameterizedTest
    @CsvSource({"12", "1234", "abc"})
    void purchaseRejectsInvalidPayerSuffix(String last3) {
        Fixture fixture = fixture();
        when(fixture.packageRepository.findByIdAndActiveTrue(3L))
                .thenReturn(Optional.of(plan("BASIC", "0.01", 365)));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.purchase(fixture.authentication, purchaseRequest(last3))
        );

        assertEquals("PAYER_ACCOUNT_LAST3_INVALID", exception.getCode());
        verify(fixture.subscriptionRepository, never()).save(any());
    }

    @Test
    void exactTelegramEvidenceActivatesOnePendingSubscriptionAtomically() {
        Fixture fixture = fixture();
        Subscription pending = pendingSubscription(fixture.user, "PRO", "199.00", "247");
        when(fixture.subscriptionRepository.findPendingMatchesForUpdate(
                eq("USD"), eq(new BigDecimal("199.00")), eq("247"), any()))
                .thenReturn(List.of(pending));

        var response = fixture.service.detectTelegramPayment(detectionRequest("199.00", "247", "trx-1"));

        assertEquals(SubscriptionPaymentDetectionStatus.PAID, response.status());
        assertEquals("PAID", pending.getPaymentStatus());
        assertEquals("ACTIVE", pending.getStatus());
        assertEquals("trx-1", pending.getPaywayTransactionId());
        assertEquals("383331", pending.getPaywayApprovalCode());
        assertTrue(pending.isActive());
        assertNotNull(pending.getStartDate());
        assertNotNull(pending.getEndDate());
        verify(fixture.subscriptionRepository).save(pending);
    }

    @Test
    void wrongAmountDoesNotActivate() {
        Fixture fixture = fixture();
        Subscription pending = pendingSubscription(fixture.user, "PRO", "199.00", "247");

        var response = fixture.service.detectTelegramPayment(detectionRequest("198.00", "247", "trx-wrong"));

        assertEquals(SubscriptionPaymentDetectionStatus.UNMATCHED, response.status());
        assertFalse(pending.isActive());
        verify(fixture.subscriptionRepository, never()).save(pending);
    }

    @Test
    void wrongSuffixDoesNotActivate() {
        Fixture fixture = fixture();
        Subscription pending = pendingSubscription(fixture.user, "PRO", "199.00", "247");

        var response = fixture.service.detectTelegramPayment(detectionRequest("199.00", "999", "trx-wrong"));

        assertEquals(SubscriptionPaymentDetectionStatus.UNMATCHED, response.status());
        assertFalse(pending.isActive());
    }

    @Test
    void expiredOrderDoesNotActivate() {
        Fixture fixture = fixture();
        Subscription pending = pendingSubscription(fixture.user, "PRO", "199.00", "247");
        pending.setPaymentExpiresAt(Instant.now().minusSeconds(1));

        var response = fixture.service.detectTelegramPayment(detectionRequest("199.00", "247", "trx-expired"));

        assertEquals(SubscriptionPaymentDetectionStatus.UNMATCHED, response.status());
        assertFalse(pending.isActive());
    }

    @Test
    void duplicateTransactionIsIdempotentAndDoesNotExtendSubscription() {
        Fixture fixture = fixture();
        Subscription paid = pendingSubscription(fixture.user, "PRO", "199.00", "247");
        paid.setPaymentStatus("PAID");
        paid.setStatus("ACTIVE");
        paid.setActive(true);
        paid.setPaywayTransactionId("trx-duplicate");
        Instant originalEnd = Instant.now().plusSeconds(3600);
        paid.setEndDate(originalEnd);
        when(fixture.subscriptionRepository.findForUpdateByPaywayTransactionId("trx-duplicate"))
                .thenReturn(Optional.of(paid));

        var response = fixture.service.detectTelegramPayment(
                detectionRequest("199.00", "247", "trx-duplicate")
        );

        assertEquals(SubscriptionPaymentDetectionStatus.ALREADY_PROCESSED, response.status());
        assertEquals(originalEnd, paid.getEndDate());
        verify(fixture.subscriptionRepository, never()).save(paid);
    }

    @Test
    void transactionAlreadyUsedByTemplatePaymentIsRejected() {
        Fixture fixture = fixture();
        when(fixture.templatePaymentOrderRepository.existsByPaywayTransactionId("trx-template"))
                .thenReturn(true);

        var response = fixture.service.detectTelegramPayment(
                detectionRequest("199.00", "247", "trx-template")
        );

        assertEquals(SubscriptionPaymentDetectionStatus.ALREADY_PROCESSED, response.status());
        verify(fixture.subscriptionRepository, never()).findPendingMatchesForUpdate(any(), any(), any(), any());
    }

    @Test
    void multipleMatchesRequireReviewWithoutActivation() {
        Fixture fixture = fixture();
        Subscription first = pendingSubscription(fixture.user, "PRO", "199.00", "247");
        AppUser secondUser = user(8L);
        Subscription second = pendingSubscription(secondUser, "PRO", "199.00", "247");
        when(fixture.subscriptionRepository.findPendingMatchesForUpdate(any(), any(), any(), any()))
                .thenReturn(List.of(first, second));

        var response = fixture.service.detectTelegramPayment(detectionRequest("199.00", "247", "trx-review"));

        assertEquals(SubscriptionPaymentDetectionStatus.REVIEW_REQUIRED, response.status());
        assertEquals("REVIEW_REQUIRED", first.getStatus());
        assertEquals("REVIEW_REQUIRED", second.getStatus());
        assertFalse(first.isActive());
        assertFalse(second.isActive());
        assertEquals(null, first.getPaywayTransactionId());
        verify(fixture.subscriptionRepository).saveAll(List.of(first, second));
    }

    @Test
    void userCannotPollAnotherUsersOrder() {
        Fixture fixture = fixture();
        Subscription otherUsersOrder = pendingSubscription(user(99L), "BASIC", "0.01", "288");
        when(fixture.subscriptionRepository.findForUpdateByOrderCode("SUB2609151234"))
                .thenReturn(Optional.of(otherUsersOrder));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.getOrder(fixture.authentication, "SUB2609151234")
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void manualConfirmationStillActivatesAndReplacesCurrentSubscription() {
        Fixture fixture = fixture();
        Subscription pending = pendingSubscription(fixture.user, "PRO", "199.00", "247");
        Subscription previous = pendingSubscription(fixture.user, "BASIC", "0.01", "288");
        previous.setStatus("ACTIVE");
        previous.setActive(true);
        when(fixture.subscriptionRepository.findForUpdateByOrderCode("SUB2609151234"))
                .thenReturn(Optional.of(pending));
        when(fixture.subscriptionRepository.findActiveForUser(eq(7L), any())).thenReturn(List.of(previous));

        var response = fixture.service.confirmManualPayment(new ConfirmPaymentRequest(
                "SUB2609151234", new BigDecimal("199.00"), "operator@example.test", "SUBSCRIPTION"));

        assertEquals(PaymentStatus.PAID, response.getStatus());
        assertTrue(pending.isActive());
        assertFalse(previous.isActive());
        verify(fixture.subscriptionRepository).flush();
    }

    private Fixture fixture() {
        SubscriptionPackageRepository packageRepository = mock(SubscriptionPackageRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        TemplatePaymentOrderRepository templatePaymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        PaymentProperties paymentProperties = new PaymentProperties();
        paymentProperties.setOrderExpiryMinutes(30);
        AuditLogService auditLogService = mock(AuditLogService.class);
        Authentication authentication = mock(Authentication.class);
        AppUser user = user(7L);
        when(currentUserService.currentUser(authentication)).thenReturn(user);
        when(subscriptionRepository.existsByOrderCode(any())).thenReturn(false);
        when(subscriptionRepository.findForUpdateByPaywayTransactionId(any())).thenReturn(Optional.empty());
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> invocation.getArgument(0));
        return new Fixture(
                new SubscriptionService(
                        packageRepository,
                        subscriptionRepository,
                        currentUserService,
                        paymentProperties,
                        auditLogService,
                        new SubscriptionPaymentPlanResolver(paymentProperties),
                        templatePaymentOrderRepository
                ),
                packageRepository,
                subscriptionRepository,
                templatePaymentOrderRepository,
                authentication,
                user
        );
    }

    private SubscriptionPurchaseRequest purchaseRequest(String last3) {
        SubscriptionPurchaseRequest request = new SubscriptionPurchaseRequest();
        request.setPackageId(3L);
        request.setPayerName("  KOEURNG   VIREAK  ");
        request.setPayerAccountLast3(last3);
        return request;
    }

    private TelegramDetectSubscriptionPaymentRequest detectionRequest(String amount, String last3, String trxId) {
        TelegramDetectSubscriptionPaymentRequest request = new TelegramDetectSubscriptionPaymentRequest();
        request.setRawMessage("ABA merchant payment alert");
        request.setDetectedBy("telegram-admin-detect:999");
        request.setTelegramChatId("-1001");
        request.setTelegramMessageId("77");
        request.setDetectedAmount(new BigDecimal(amount));
        request.setDetectedCurrency("USD");
        request.setPayerName("KOEURNG VIREAK");
        request.setPayerAccountLast3(last3);
        request.setPaywayTransactionId(trxId);
        request.setPaywayApprovalCode("383331");
        return request;
    }

    private Subscription pendingSubscription(AppUser user, String code, String amount, String last3) {
        Subscription subscription = new Subscription();
        subscription.setId(9L);
        subscription.setUser(user);
        subscription.setSubscriptionPackage(plan(code, amount, 365));
        subscription.setOrderCode("SUB2609151234");
        subscription.setAmount(new BigDecimal(amount));
        subscription.setCurrency("USD");
        subscription.setPayerName("KOEURNG VIREAK");
        subscription.setPayerAccountLast3(last3);
        subscription.setPaymentExpiresAt(Instant.now().plusSeconds(1800));
        subscription.setPaymentStatus("PENDING");
        subscription.setStatus("PENDING_PAYMENT");
        subscription.setActive(false);
        return subscription;
    }

    private SubscriptionPackage plan(String code, String price, int durationDays) {
        SubscriptionPackage plan = new SubscriptionPackage();
        plan.setId(3L);
        plan.setCode(code);
        plan.setPackageName(code);
        plan.setPrice(new BigDecimal(price));
        plan.setCurrency("USD");
        plan.setDurationDays(durationDays);
        plan.setActive(true);
        return plan;
    }

    private AppUser user(Long id) {
        AppUser user = new AppUser();
        user.setId(id);
        user.setFullName("Subscriber " + id);
        return user;
    }

    private record Fixture(
            SubscriptionService service,
            SubscriptionPackageRepository packageRepository,
            SubscriptionRepository subscriptionRepository,
            TemplatePaymentOrderRepository templatePaymentOrderRepository,
            Authentication authentication,
            AppUser user
    ) {
    }
}
