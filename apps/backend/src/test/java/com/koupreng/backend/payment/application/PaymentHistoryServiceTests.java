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
    private final PaymentHistoryService service = new PaymentHistoryService(
            orders, subscriptions, mock(CurrentUserService.class), confirmations
    );

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
