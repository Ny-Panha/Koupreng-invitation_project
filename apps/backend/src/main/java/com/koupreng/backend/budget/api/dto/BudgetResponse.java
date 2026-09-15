package com.koupreng.backend.budget.api.dto;

import com.koupreng.backend.budget.domain.Budget;
import com.koupreng.backend.budget.domain.BudgetItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

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
    private boolean overBudget;
    private String notes;
    private List<BudgetItemResponse> items;
    private Instant createdAt;
    private Instant updatedAt;

    public static BudgetResponse from(Budget budget, List<BudgetItem> items) {
        BigDecimal totalBudget = valueOrZero(budget.getTotalBudget());
        BigDecimal totalEstimated = sum(items, true);
        BigDecimal totalActual = sum(items, false);
        return BudgetResponse.builder()
                .id(budget.getId())
                .invitationId(budget.getInvitation() == null ? null : budget.getInvitation().getId())
                .totalBudget(totalBudget)
                .totalEstimated(totalEstimated)
                .totalActual(totalActual)
                .remainingBudget(totalBudget.subtract(totalActual))
                .overBudget(totalActual.compareTo(totalBudget) > 0)
                .notes(budget.getNotes())
                .items(items.stream().map(BudgetItemResponse::from).toList())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }

    private static BigDecimal sum(List<BudgetItem> items, boolean estimated) {
        return items.stream()
                .map(item -> estimated ? item.getEstimatedCost() : item.getActualCost())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
