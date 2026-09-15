package com.koupreng.backend.subscription.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscriptionPurchaseRequest {

    @NotNull(message = "Package ID is required")
    private Long packageId;
}
