package com.koupreng.backend.dto.payment;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ConfirmPaymentRequest(
        @NotBlank(message = "Order code is required")
        @Size(max = 50)
        String orderCode,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotBlank(message = "Confirmed by is required")
        @Size(max = 120)
        String confirmedBy,

        @NotBlank(message = "Item type is required")
        @Size(max = 30)
        String itemType
) {
}
