package com.koupreng.backend.budget.api.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateBudgetRequest {

    @DecimalMin(value = "0.00", message = "Total budget must be zero or greater")
    private BigDecimal totalBudget;

    private String notes;
}
