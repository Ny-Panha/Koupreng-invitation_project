package com.koupreng.backend.budget.api.dto;

import com.koupreng.backend.budget.domain.BudgetItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetItemResponse {

    private Long id;
    private Long budgetId;
    private Long invitationId;
    private String name;
    private String category;
    private String itemName;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private BigDecimal budget;
    private BigDecimal amount;
    private LocalDate date;
    private String status;
    private String vendorName;
    private String notes;

    public static BudgetItemResponse from(BudgetItem item) {
        Long invitationId = item.getBudget() == null || item.getBudget().getInvitation() == null
                ? null
                : item.getBudget().getInvitation().getId();
        return BudgetItemResponse.builder()
                .id(item.getId())
                .budgetId(item.getBudget() == null ? null : item.getBudget().getId())
                .invitationId(invitationId)
                .name(item.getItemName())
                .category(item.getCategory())
                .itemName(item.getItemName())
                .estimatedCost(item.getEstimatedCost())
                .actualCost(item.getActualCost())
                .budget(item.getEstimatedCost())
                .amount(item.getActualCost())
                .date(item.getExpenseDate())
                .status(item.getStatus())
                .vendorName(item.getVendorName())
                .notes(item.getNotes())
                .build();
    }
}
