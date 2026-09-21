package com.koupreng.backend.subscription.api.dto;

import com.koupreng.backend.subscription.domain.SubscriptionPaymentDetectionStatus;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record SubscriptionPaymentDetectionResponse(
        SubscriptionPaymentDetectionStatus status,
        String message,
        String orderCode,
        String packageCode,
        BigDecimal amount,
        String currency,
        String payerAccountLast3,
        String paywayTransactionId,
        String paywayApprovalCode,
        boolean active
) {
}
