package com.koupreng.backend.budget.api.dto;

import com.koupreng.backend.budget.domain.Budget;
import com.koupreng.backend.budget.domain.BudgetItem;
import com.koupreng.backend.budget.domain.BudgetTotals;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {

    private Long id;
    private Long invitationId;
    private BigDecimal totalBudget;
    private BigDecimal totalEstimated;
    private BigDecimal totalActual;
    private BigDecimal remainingBudget;
    private String currency;
    private boolean totalsComparable;
    private Map<String, BigDecimal> estimatedByCurrency;
    private Map<String, BigDecimal> actualByCurrency;
    private boolean overBudget;
    private String notes;
    private List<BudgetItemResponse> items;
    private Instant createdAt;
    private Instant updatedAt;

    public static BudgetResponse from(Budget budget, List<BudgetItem> items) {
        BigDecimal totalBudget = valueOrZero(budget.getTotalBudget());
        BudgetTotals totals = BudgetTotals.of(items);
        BigDecimal totalEstimated = totals.estimated();
        BigDecimal totalActual = totals.actual();
        return BudgetResponse.builder()
                .id(budget.getId())
                .invitationId(budget.getInvitation() == null ? null : budget.getInvitation().getId())
                .totalBudget(totalBudget)
                .totalEstimated(totalEstimated)
                .totalActual(totalActual)
                .remainingBudget(totals.comparable() ? totalBudget.subtract(totalActual) : null)
                .overBudget(totals.comparable() && totalActual.compareTo(totalBudget) > 0)
                .currency(totals.currency())
                .totalsComparable(totals.comparable())
                .estimatedByCurrency(totals.estimatedByCurrency())
                .actualByCurrency(totals.actualByCurrency())
                .notes(budget.getNotes())
                .items(items.stream().map(BudgetItemResponse::from).toList())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }

    private static BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
