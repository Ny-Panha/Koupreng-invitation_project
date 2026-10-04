package com.koupreng.backend.gift.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WeddingGiftRequest {

    @NotBlank(message = "Gift giver name is required")
    private String name;

    @Positive(message = "Guest ID must be positive")
    private Long guestId;

    private BigDecimal amount;
    private String currency;
    private String method;
    private LocalDate date;
    private String note;
}
