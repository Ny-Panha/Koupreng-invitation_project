package com.koupreng.backend.budget.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BudgetItemRequest {

    @NotBlank(message = "Budget item name is required")
    private String name;

    private String category;

    @DecimalMin(value = "0.00", message = "Estimated cost must be zero or greater")
    private BigDecimal budget;

    @DecimalMin(value = "0.00", message = "Actual cost must be zero or greater")
    private BigDecimal amount;

    private LocalDate date;
    private String status;
    private String vendorName;
    private String notes;
}
