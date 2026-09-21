package com.koupreng.backend.payment.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

/**
 * Compatibility request for the order-code-in-path administration endpoint.
 * The path remains the authoritative order identifier.
 */
public record AdminPaymentConfirmRequest(
        @Size(max = 50)
        String orderCode,

        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        @Size(max = 120)
        String confirmedBy,

        @Size(max = 30)
        String itemType
) {
}
