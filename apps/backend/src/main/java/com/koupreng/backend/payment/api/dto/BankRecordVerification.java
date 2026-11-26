package com.koupreng.backend.payment.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BankRecordVerification(
        @NotBlank @Pattern(regexp = "USD|KHR") String currency,
        @NotBlank @Size(max = 120) String merchant,
        @NotBlank @Size(max = 280) String notes,
        boolean successfulAndUnreversed
) {}
