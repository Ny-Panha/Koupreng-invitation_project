package com.koupreng.backend.budget.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateBudgetItemRequest {

    private String category;

    @NotBlank(message = "Item name is required")
    private String itemName;

    @DecimalMin(value = "0.00", message = "Estimated cost must be zero or greater")
    private BigDecimal estimatedCost;

    @DecimalMin(value = "0.00", message = "Actual cost must be zero or greater")
    private BigDecimal actualCost;

    private String vendorName;
    private String notes;
}
