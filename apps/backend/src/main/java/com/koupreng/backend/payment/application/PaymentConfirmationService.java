package com.koupreng.backend.payment.application;

import java.util.Locale;

import com.koupreng.backend.dto.payment.ConfirmTemplatePaymentRequest;
import com.koupreng.backend.dto.payment.PaymentConfirmResponse;
import com.koupreng.backend.payment.api.dto.ConfirmPaymentRequest;
import com.koupreng.backend.subscription.application.SubscriptionService;
import com.koupreng.backend.service.TemplatePaymentService;
import com.koupreng.backend.shared.exception.ApiException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PaymentConfirmationService {

    private final TemplatePaymentService templatePaymentService;
    private final SubscriptionService subscriptionService;

    public PaymentConfirmationService(
            TemplatePaymentService templatePaymentService,
            SubscriptionService subscriptionService
    ) {
        this.templatePaymentService = templatePaymentService;
        this.subscriptionService = subscriptionService;
    }

    public PaymentConfirmResponse confirm(ConfirmPaymentRequest request) {
        return switch (request.itemType().trim().toUpperCase(Locale.ROOT)) {
            case "TEMPLATE" -> templatePaymentService.confirmManualPayment(templateRequest(request));
            case "SUBSCRIPTION" -> subscriptionService.confirmManualPayment(request);
            default -> throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "PAYMENT_ITEM_TYPE_INVALID",
                    "Item type must be TEMPLATE or SUBSCRIPTION"
            );
        };
    }

    private ConfirmTemplatePaymentRequest templateRequest(ConfirmPaymentRequest request) {
        ConfirmTemplatePaymentRequest mapped = new ConfirmTemplatePaymentRequest();
        mapped.setOrderCode(request.orderCode());
        mapped.setAmount(request.amount());
        mapped.setConfirmedBy(request.confirmedBy());
        return mapped;
    }
}
