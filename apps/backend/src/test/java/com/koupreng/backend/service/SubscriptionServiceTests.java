package com.koupreng.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.koupreng.backend.config.PaymentProperties;
import com.koupreng.backend.dto.payment.PaymentConfirmResponse;
import com.koupreng.backend.entity.subscription.Subscription;
import com.koupreng.backend.entity.subscription.SubscriptionPackage;
import com.koupreng.backend.enums.PaymentStatus;
import com.koupreng.backend.payment.api.dto.ConfirmPaymentRequest;
import com.koupreng.backend.repository.SubscriptionPackageRepository;
import com.koupreng.backend.repository.SubscriptionRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

class SubscriptionServiceTests {

    @Test
    void paidPurchaseCreatesInactiveServerPricedOrder() {
        Fixture fixture = fixture();
        SubscriptionPackage plan = plan("19.00", 30);
        when(fixture.packageRepository.findByIdAndActiveTrue(3L)).thenReturn(Optional.of(plan));
        when(fixture.subscriptionRepository.existsByOrderCode(org.mockito.ArgumentMatchers.any()))
                .thenReturn(false);
        when(fixture.subscriptionRepository.save(org.mockito.ArgumentMatchers.any(Subscription.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = fixture.service.purchase(fixture.authentication, 3L);

        assertEquals(new BigDecimal("19.00"), response.getAmount());
        assertEquals("PENDING", response.getPaymentStatus());
        assertEquals("PENDING_PAYMENT", response.getStatus());
        assertFalse(response.isActive());
    }

    @Test
    void manualConfirmationActivatesPaidOrderAndReplacesCurrentSubscription() {
        Fixture fixture = fixture();
        Subscription pending = pendingSubscription(fixture.user);
        Subscription previous = pendingSubscription(fixture.user);
        previous.setId(8L);
        previous.setStatus("ACTIVE");
        previous.setActive(true);
        when(fixture.subscriptionRepository.findForUpdateByOrderCode("SUB2609151234"))
                .thenReturn(Optional.of(pending));
        when(fixture.subscriptionRepository.findActiveForUser(
                org.mockito.ArgumentMatchers.eq(7L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(previous));

        PaymentConfirmResponse response = fixture.service.confirmManualPayment(confirmRequest("19.00"));

        assertEquals(PaymentStatus.PAID, response.getStatus());
        assertEquals("PAID", pending.getPaymentStatus());
        assertEquals(new BigDecimal("19.00"), pending.getPaidAmount());
        assertEquals("MANUAL_ADMIN", pending.getConfirmSource());
        assertEquals("operator@example.test", pending.getConfirmedBy());
        assertTrue(pending.isActive());
        assertFalse(previous.isActive());
        assertEquals("REPLACED", previous.getStatus());
        verify(fixture.subscriptionRepository).flush();
        verify(fixture.subscriptionRepository).save(pending);
    }

    @Test
    void repeatedConfirmationIsIdempotent() {
        Fixture fixture = fixture();
        Subscription paid = pendingSubscription(fixture.user);
        paid.setPaymentStatus("PAID");
        paid.setStatus("ACTIVE");
        paid.setActive(true);
        when(fixture.subscriptionRepository.findForUpdateByOrderCode("SUB2609151234"))
                .thenReturn(Optional.of(paid));

        PaymentConfirmResponse response = fixture.service.confirmManualPayment(confirmRequest("19.00"));

        assertEquals(PaymentStatus.PAID, response.getStatus());
        verify(fixture.subscriptionRepository, never()).save(paid);
        verify(fixture.subscriptionRepository, never()).findActiveForUser(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void amountMismatchDoesNotActivateOrder() {
        Fixture fixture = fixture();
        Subscription pending = pendingSubscription(fixture.user);
        when(fixture.subscriptionRepository.findForUpdateByOrderCode("SUB2609151234"))
                .thenReturn(Optional.of(pending));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.confirmManualPayment(confirmRequest("18.00"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("PAYMENT_AMOUNT_MISMATCH", exception.getCode());
        assertFalse(pending.isActive());
        verify(fixture.subscriptionRepository, never()).save(pending);
    }

    private Fixture fixture() {
        SubscriptionPackageRepository packageRepository = mock(SubscriptionPackageRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        PaymentProperties paymentProperties = new PaymentProperties();
        paymentProperties.getAba().setStaticLink("https://pay.example.test/qr");
        AuditLogService auditLogService = mock(AuditLogService.class);
        Authentication authentication = mock(Authentication.class);
        AppUser user = new AppUser();
        user.setId(7L);
        user.setFullName("Subscriber");
        when(currentUserService.currentUser(authentication)).thenReturn(user);
        return new Fixture(
                new SubscriptionService(
                        packageRepository,
                        subscriptionRepository,
                        currentUserService,
                        paymentProperties,
                        auditLogService
                ),
                packageRepository,
                subscriptionRepository,
                authentication,
                user
        );
    }

    private Subscription pendingSubscription(AppUser user) {
        Subscription subscription = new Subscription();
        subscription.setId(9L);
        subscription.setUser(user);
        subscription.setSubscriptionPackage(plan("19.00", 30));
        subscription.setOrderCode("SUB2609151234");
        subscription.setAmount(new BigDecimal("19.00"));
        subscription.setCurrency("USD");
        subscription.setPaymentStatus("PENDING");
        subscription.setStatus("PENDING_PAYMENT");
        subscription.setActive(false);
        return subscription;
    }

    private SubscriptionPackage plan(String price, int durationDays) {
        SubscriptionPackage plan = new SubscriptionPackage();
        plan.setId(3L);
        plan.setPackageName("Gold");
        plan.setPrice(new BigDecimal(price));
        plan.setCurrency("USD");
        plan.setDurationDays(durationDays);
        plan.setActive(true);
        return plan;
    }

    private ConfirmPaymentRequest confirmRequest(String amount) {
        return new ConfirmPaymentRequest(
                " sub2609151234 ",
                new BigDecimal(amount),
                " operator@example.test ",
                "SUBSCRIPTION"
        );
    }

    private record Fixture(
            SubscriptionService service,
            SubscriptionPackageRepository packageRepository,
            SubscriptionRepository subscriptionRepository,
            Authentication authentication,
            AppUser user
    ) {
    }
}
