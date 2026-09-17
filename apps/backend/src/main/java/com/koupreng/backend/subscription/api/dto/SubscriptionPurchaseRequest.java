package com.koupreng.backend.subscription.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubscriptionPurchaseRequest {

    @NotNull(message = "Package ID is required")
    private Long packageId;

    @NotBlank(message = "ABA account holder name is required")
    @Size(max = 120, message = "ABA account holder name must be at most 120 characters")
    private String payerName;

    @NotBlank(message = "Last 3 digits of ABA account are required")
    @Pattern(regexp = "^[0-9]{3}$", message = "Last 3 digits of ABA account must be exactly 3 numeric digits")
    private String payerAccountLast3;
}
