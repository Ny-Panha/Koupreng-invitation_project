package com.koupreng.backend.payment.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateTemplatePaymentRequest {

    @NotNull(message = "Template ID is required")
    @Positive(message = "Template ID must be positive")
    private Long templateId;

    @NotBlank(message = "Template name is required")
    private String templateName;

    @NotBlank(message = "Package name is required")
    private String packageName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private String currency = "USD";
    private String buyerName;
    private String buyerEmail;
    private String buyerPhone;
}
