package com.koupreng.backend.payment.infrastructure.aba;

import com.koupreng.backend.payment.domain.PaymentStatus;

import java.math.BigDecimal;

public record PayWayTransactionVerification(
        boolean approved,
        PaymentStatus mappedStatus,
        BigDecimal paidAmount,
        String currency,
        String paywayStatus,
        String paywayTransactionId,
        String rawResponseJson
) {
}
