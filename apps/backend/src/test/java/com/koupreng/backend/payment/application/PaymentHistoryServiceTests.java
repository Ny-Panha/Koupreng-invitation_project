package com.koupreng.backend.payment.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import com.koupreng.backend.payment.api.dto.ConfirmPaymentRequest;
import com.koupreng.backend.payment.api.dto.PaymentHistoryResponse;
import com.koupreng.backend.payment.api.dto.PaymentReceiptResponse;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.application.PackageSnapshot;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import org.springframework.http.HttpStatus;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.user.application.CurrentUserService;
import org.junit.jupiter.api.Test;

class PaymentHistoryServiceTests {

    private final TemplatePaymentOrderRepository orders = mock(TemplatePaymentOrderRepository.class);
    private final SubscriptionRepository subscriptions = mock(SubscriptionRepository.class);
    private final PaymentConfirmationService confirmations = mock(PaymentConfirmationService.class);
    private final CurrentUserService currentUsers = mock(CurrentUserService.class);
    private final PaymentHistoryService service = new PaymentHistoryService(
            orders, subscriptions, currentUsers, confirmations
    );

    @Test
    void paidHistorySurvivesLifecycleChangesWithoutFabricatingSettlementForActiveGrants() {
        Subscription sub = new Subscription();
        sub.setPaymentStatus("PAID");
        for (String lifecycle : java.util.List.of("EXPIRED", "REPLACED")) {
            sub.setStatus(lifecycle);
            assertEquals(PaymentStatus.PAID, PaymentHistoryResponse.from(sub).getStatus());
            assertEquals(PaymentStatus.PAID, PaymentReceiptResponse.from(sub).getStatus());
        }
        sub.setStatus("ACTIVE"); sub.setActive(true); sub.setPaymentStatus("NOT_REQUIRED");
        assertEquals(PaymentStatus.PENDING, PaymentHistoryResponse.from(sub).getStatus());
        sub.setPaymentStatus("PENDING"); sub.setStatus("REVIEW_REQUIRED");
        assertEquals(PaymentStatus.PAID_PENDING_REVIEW, PaymentHistoryResponse.from(sub).getStatus());
        sub.setPaymentStatus("EXPIRED");
        assertEquals(PaymentStatus.EXPIRED, PaymentHistoryResponse.from(sub).getStatus());
        sub.setPaymentStatus(" paid ");
        assertEquals(PaymentStatus.PAID, PaymentHistoryResponse.from(sub).getStatus());
        org.junit.jupiter.api.Assertions.assertNull(PaymentHistoryResponse.from(sub).getPaidAmount());
        sub.setPaidAmount(BigDecimal.ZERO);
        assertEquals(BigDecimal.ZERO, PaymentHistoryResponse.from(sub).getPaidAmount());
        TemplatePaymentOrder pending = new TemplatePaymentOrder(); pending.setAmount(BigDecimal.TEN);
        org.junit.jupiter.api.Assertions.assertNull(PaymentReceiptResponse.from(pending).getPaidAmount());
        pending.setStatus(PaymentStatus.PAID);
        assertEquals(BigDecimal.TEN, PaymentReceiptResponse.from(pending).getPaidAmount());
        pending.setPaidAmount(BigDecimal.ZERO);
        assertEquals(BigDecimal.ZERO, PaymentReceiptResponse.from(pending).getPaidAmount());
    }

    @Test
    void receiptChecksOwnershipThenPaidStateAndUsesPurchasedPackageName() {
        AppUser owner = new AppUser(); owner.setId(1L); owner.setRole(Role.USER);
        when(currentUsers.currentUser(null)).thenReturn(owner);
        Subscription sub = new Subscription(); sub.setUser(owner); sub.setOrderCode("SUB1");
        SubscriptionPackage plan = new SubscriptionPackage(); plan.setPackageName("Purchased name");
        sub.setSubscriptionPackage(plan); sub.setBenefitsSnapshot(PackageSnapshot.capture(plan));
        plan.setPackageName("Renamed catalog entry");
        when(orders.findByOrderCode("SUB1")).thenReturn(Optional.empty());
        when(subscriptions.findByOrderCode("SUB1")).thenReturn(Optional.of(sub));
        sub.setPaymentStatus("PENDING");
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class, () -> service.receipt(null, "SUB1")).getStatus());
        sub.setPaymentStatus("NOT_REQUIRED");
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class, () -> service.receipt(null, "SUB1")).getStatus());
        sub.setPaymentStatus("PAID"); sub.setStatus("EXPIRED");
        assertEquals("Purchased name", service.receipt(null, "SUB1").getItemName());
        assertEquals("Purchased name", service.get(null, "SUB1").getPackageName());
        AppUser stranger = new AppUser(); stranger.setId(2L); stranger.setRole(Role.USER);
        when(currentUsers.currentUser(null)).thenReturn(stranger);
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> service.receipt(null, "SUB1")).getStatus());
    }

    @Test
    void legacyTemplateConfirmationUsesCanonicalFulfillmentAndStoredPriceWhenOmitted() {
        TemplatePaymentOrder order = new TemplatePaymentOrder();
        order.setAmount(new BigDecimal("19.00"));
        when(orders.findByOrderCode("ORDER1")).thenReturn(Optional.of(order));

        service.confirmPayment(" order1 ", null, null);

        verify(confirmations).confirm(new ConfirmPaymentRequest(
                "ORDER1", new BigDecimal("19.00"), "admin", "TEMPLATE"
        ));
        verifyNoInteractions(subscriptions);
    }

    @Test
    void legacySubscriptionConfirmationForwardsReportedAmountForCanonicalValidation() {
        Subscription subscription = new Subscription();
        subscription.setAmount(new BigDecimal("19.00"));
        when(orders.findByOrderCode("SUB1")).thenReturn(Optional.empty());
        when(subscriptions.findByOrderCode("SUB1")).thenReturn(Optional.of(subscription));

        service.confirmPayment("SUB1", new BigDecimal("1.00"), "reviewer");

        verify(confirmations).confirm(new ConfirmPaymentRequest(
                "SUB1", new BigDecimal("1.00"), "reviewer", "SUBSCRIPTION"
        ));
    }

    @Test
    void missingOrderDoesNotInvokeFulfillment() {
        when(orders.findByOrderCode("MISSING")).thenReturn(Optional.empty());
        when(subscriptions.findByOrderCode("MISSING")).thenReturn(Optional.empty());

        ApiException error = assertThrows(ApiException.class,
                () -> service.confirmPayment("MISSING", BigDecimal.ONE, "admin"));

        assertEquals("Payment order not found", error.getMessage());
        verifyNoInteractions(confirmations);
    }
}
