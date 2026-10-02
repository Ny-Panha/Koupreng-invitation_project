package com.koupreng.backend.payment.api.dto;

import jakarta.validation.constraints.Size;

public record ClaimTemplatePaymentRequest(
        @Size(max = 120, message = "Reference must be at most 120 characters")
        String reference
) {
}
