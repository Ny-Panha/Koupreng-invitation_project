package com.koupreng.backend.payment.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import com.koupreng.backend.payment.api.dto.ConfirmTemplatePaymentRequest;
import com.koupreng.backend.payment.api.dto.PaymentConfirmResponse;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.payment.api.dto.ConfirmPaymentRequest;
import com.koupreng.backend.subscription.application.SubscriptionService;
import com.koupreng.backend.payment.application.TemplatePaymentService;
import com.koupreng.backend.shared.exception.ApiException;

import org.junit.jupiter.api.Test;

class PaymentConfirmationServiceTests {

    private final TemplatePaymentService templatePaymentService = mock(TemplatePaymentService.class);
    private final SubscriptionService subscriptionService = mock(SubscriptionService.class);
    private final PaymentConfirmationService service = new PaymentConfirmationService(
            templatePaymentService,
            subscriptionService
    );

    @Test
    void routesSubscriptionConfirmationToSubscriptionFulfillment() {
        ConfirmPaymentRequest request = request("SUBSCRIPTION");
        PaymentConfirmResponse expected = response();
        when(subscriptionService.confirmManualPayment(request)).thenReturn(expected);

        assertEquals(expected, service.confirm(request));
        verify(subscriptionService).confirmManualPayment(request);
    }

    @Test
    void mapsTemplateConfirmationToExistingFulfillment() {
        ConfirmPaymentRequest request = request("template");
        when(templatePaymentService.confirmManualPayment(
                org.mockito.ArgumentMatchers.any(ConfirmTemplatePaymentRequest.class)))
                .thenReturn(response());

        service.confirm(request);

        verify(templatePaymentService).confirmManualPayment(
                org.mockito.ArgumentMatchers.argThat(mapped ->
                        mapped.getOrderCode().equals(request.orderCode())
                                && mapped.getAmount().equals(request.amount())
                                && mapped.getConfirmedBy().equals(request.confirmedBy()))
        );
    }

    @Test
    void rejectsUnknownPaymentItemType() {
        ApiException exception = assertThrows(ApiException.class, () -> service.confirm(request("GIFT")));

        assertEquals("PAYMENT_ITEM_TYPE_INVALID", exception.getCode());
    }

    private ConfirmPaymentRequest request(String itemType) {
        return new ConfirmPaymentRequest(
                "ORDER-1",
                new BigDecimal("19.00"),
                "admin",
                itemType
        );
    }

    private PaymentConfirmResponse response() {
        return PaymentConfirmResponse.builder()
                .orderCode("ORDER-1")
                .status(PaymentStatus.PAID)
                .build();
    }
}
