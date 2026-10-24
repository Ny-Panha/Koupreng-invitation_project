package com.koupreng.backend.gift.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WeddingGiftRequest {

    @NotBlank(message = "Gift giver name is required")
    @Size(max = 255)
    private String name;

    @Positive(message = "Guest ID must be positive")
    private Long guestId;

    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal amount;
    private String currency;
    @Size(max = 100)
    private String method;
    private LocalDate date;
    @Size(max = 2000)
    private String note;
    private java.util.UUID clientRequestId;
}
