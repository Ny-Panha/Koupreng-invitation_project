package com.koupreng.backend.budget.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryResponse {

    private Long invitationId;
    private Long budgetId;
    private BigDecimal totalBudget;
    private BigDecimal totalEstimated;
    private BigDecimal totalActual;
    private BigDecimal remainingBudget;
    private boolean overBudget;
    private int itemCount;
    private Map<String, BigDecimal> estimatedByCategory;
    private Map<String, BigDecimal> actualByCategory;
}
