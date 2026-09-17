package com.koupreng.backend.budget.api.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateBudgetItemRequest {

    private String category;
    private String itemName;

    @DecimalMin(value = "0.00", message = "Estimated cost must be zero or greater")
    private BigDecimal estimatedCost;

    @DecimalMin(value = "0.00", message = "Actual cost must be zero or greater")
    private BigDecimal actualCost;

    private String vendorName;
    private String notes;
}
