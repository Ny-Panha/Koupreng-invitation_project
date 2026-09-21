package com.koupreng.backend.payment.api.dto;

import jakarta.validation.constraints.Size;

public record TemplatePaymentClaimRequest(
        @Size(max = 255)
        String reference
) {
}
