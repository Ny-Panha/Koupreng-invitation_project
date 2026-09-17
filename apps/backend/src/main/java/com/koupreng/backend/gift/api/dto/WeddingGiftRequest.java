package com.koupreng.backend.gift.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WeddingGiftRequest {

    @NotBlank(message = "Gift giver name is required")
    private String name;

    private BigDecimal amount;
    private String method;
    private LocalDate date;
    private String note;
}
