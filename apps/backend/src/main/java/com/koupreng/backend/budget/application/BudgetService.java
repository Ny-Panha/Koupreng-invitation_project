package com.koupreng.backend.budget.application;

import com.koupreng.backend.invitation.application.InvitationService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.budget.api.dto.BudgetItemRequest;
import com.koupreng.backend.budget.api.dto.BudgetItemResponse;
import com.koupreng.backend.budget.api.dto.BudgetResponse;
import com.koupreng.backend.budget.api.dto.BudgetSummaryResponse;
import com.koupreng.backend.budget.api.dto.CreateBudgetItemRequest;
import com.koupreng.backend.budget.api.dto.UpdateBudgetItemRequest;
import com.koupreng.backend.budget.api.dto.UpdateBudgetRequest;
import com.koupreng.backend.budget.domain.Budget;
import com.koupreng.backend.budget.domain.BudgetItem;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.budget.infrastructure.persistence.BudgetItemRepository;
import com.koupreng.backend.budget.infrastructure.persistence.BudgetRepository;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.shared.export.CsvExportUtils;

@Service
public class BudgetService {

    private static final String DEFAULT_CATEGORY = "OTHER";

    private final BudgetRepository budgetRepository;
    private final BudgetItemRepository budgetItemRepository;
    private final UserInvitationRepository invitationRepository;
    private final InvitationService invitationService;
    private final AuditLogService auditLogService;

    @org.springframework.beans.factory.annotation.Autowired
    public BudgetService(
            BudgetRepository budgetRepository,
            BudgetItemRepository budgetItemRepository,
            UserInvitationRepository invitationRepository,
            InvitationService invitationService,
            AuditLogService auditLogService
    ) {
        this.budgetRepository = budgetRepository;
        this.budgetItemRepository = budgetItemRepository;
        this.invitationRepository = invitationRepository;
        this.invitationService = invitationService;
        this.auditLogService = auditLogService;
    }

    public BudgetService(
            BudgetRepository budgetRepository,
            BudgetItemRepository budgetItemRepository,
            UserInvitationRepository invitationRepository,
            InvitationService invitationService
    ) {
        this(budgetRepository, budgetItemRepository, invitationRepository, invitationService, null);
    }

    @Transactional
    public BudgetResponse getOrCreateBudget(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Budget budget = findOrCreateBudget(invitation);
        return toResponse(budget);
    }

    @Transactional
    public BudgetResponse updateBudget(
            Authentication authentication,
            Long invitationId,
            UpdateBudgetRequest request
    ) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Budget budget = findOrCreateBudget(invitation);
        if (request.getTotalBudget() != null) {
            budget.setTotalBudget(nonNegativeOrZero(request.getTotalBudget(), "Total budget"));
        }
        if (request.getNotes() != null) {
            budget.setNotes(trimToNull(request.getNotes()));
        }
        Budget saved = budgetRepository.save(budget);
        if (auditLogService != null) {
            auditLogService.logSystemEvent(
                    "BUDGET_UPDATED",
                    "BUDGET",
                    saved.getId(),
                    "Budget updated for invitation: " + invitationId + ", total budget: " + saved.getTotalBudget(),
                    Map.of("invitationId", invitationId, "totalBudget", saved.getTotalBudget())
            );
        }
        return toResponse(saved);
    }

    @Transactional
    public BudgetResponse addBudgetItem(
            Authentication authentication,
            Long invitationId,
            CreateBudgetItemRequest request
    ) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Budget budget = findOrCreateBudget(invitation);
        BudgetItem item = new BudgetItem();
        item.setBudget(budget);
        item.setCategory(normalizeCategory(request.getCategory()));
        item.setItemName(requiredText(request.getItemName(), "Item name"));
        item.setEstimatedCost(nonNegativeOrZero(request.getEstimatedCost(), "Estimated cost"));
        item.setActualCost(nonNegativeOrZero(request.getActualCost(), "Actual cost"));
        item.setVendorName(trimToNull(request.getVendorName()));
        item.setNotes(trimToNull(request.getNotes()));
        BudgetItem saved = budgetItemRepository.save(item);
        if (auditLogService != null) {
            auditLogService.logSystemEvent(
                    "BUDGET_ITEM_ADDED",
                    "BUDGET_ITEM",
                    saved.getId(),
                    "Budget item added: " + saved.getItemName() + " to category: " + saved.getCategory()
                            + " with cost: " + saved.getEstimatedCost(),
                    Map.of("invitationId", invitationId, "category", saved.getCategory(), "itemName", saved.getItemName())
            );
        }
        return toResponse(budget);
    }

    @Transactional
    public BudgetResponse updateBudgetItem(
            Authentication authentication,
            Long invitationId,
            Long itemId,
            UpdateBudgetItemRequest request
    ) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Budget budget = findOrCreateBudget(invitation);
        BudgetItem item = requireItem(budget.getId(), itemId);
        if (request.getCategory() != null) {
            item.setCategory(normalizeCategory(request.getCategory()));
        }
        if (request.getItemName() != null) {
            item.setItemName(requiredText(request.getItemName(), "Item name"));
        }
        if (request.getEstimatedCost() != null) {
            item.setEstimatedCost(nonNegativeOrZero(request.getEstimatedCost(), "Estimated cost"));
        }
        if (request.getActualCost() != null) {
            item.setActualCost(nonNegativeOrZero(request.getActualCost(), "Actual cost"));
        }
        if (request.getVendorName() != null) {
            item.setVendorName(trimToNull(request.getVendorName()));
        }
        if (request.getNotes() != null) {
            item.setNotes(trimToNull(request.getNotes()));
        }
        BudgetItem saved = budgetItemRepository.save(item);
        if (auditLogService != null) {
            auditLogService.logSystemEvent(
                    "BUDGET_ITEM_UPDATED",
                    "BUDGET_ITEM",
                    saved.getId(),
                    "Budget item updated: " + saved.getItemName() + " in category: " + saved.getCategory()
                            + " with cost: " + saved.getEstimatedCost(),
                    Map.of("invitationId", invitationId, "category", saved.getCategory(), "itemName", saved.getItemName())
            );
        }
        return toResponse(budget);
    }

    @Transactional
    public void deleteBudgetItem(Authentication authentication, Long invitationId, Long itemId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Budget budget = findOrCreateBudget(invitation);
        BudgetItem item = requireItem(budget.getId(), itemId);
        budgetItemRepository.delete(item);
        if (auditLogService != null) {
            auditLogService.logSystemEvent(
                    "BUDGET_ITEM_DELETED",
                    "BUDGET_ITEM",
                    itemId,
                    "Budget item deleted: " + item.getItemName() + " from category: " + item.getCategory(),
                    Map.of("invitationId", invitationId, "itemId", itemId)
            );
        }
    }

    @Transactional(readOnly = true)
    public BudgetSummaryResponse getBudgetSummary(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Budget budget = requireBudget(invitationId);
        return toSummary(budget, budgetItemRepository.findByBudgetIdOrderByIdDesc(budget.getId()));
    }

    @Transactional(readOnly = true)
    public String exportBudgetCsv(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Budget budget = requireBudget(invitationId);
        List<BudgetItem> items = budgetItemRepository.findByBudgetIdOrderByIdDesc(budget.getId());
        StringBuilder csv = new StringBuilder();
        csv.append("itemId,category,itemName,estimatedCost,actualCost,date,status,vendorName,notes\n");
        for (BudgetItem item : items) {
            csv.append(CsvExportUtils.row(
                    item.getId(), item.getCategory(), item.getItemName(), item.getEstimatedCost(),
                    item.getActualCost(), item.getExpenseDate(), item.getStatus(), item.getVendorName(), item.getNotes()
            )).append('\n');
        }
        return csv.toString();
    }

    @Transactional(readOnly = true)
    public BudgetResponse getBudgetForAdmin(Authentication authentication, Long invitationId) {
        requireAdmin(authentication);
        invitationRepository.findByIdAndDeletedFalse(invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
        Budget budget = requireBudget(invitationId);
        return toResponse(budget);
    }

    @Transactional(readOnly = true)
    public List<BudgetItemResponse> list(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return budgetItemRepository.findAllByInvitationId(invitationId).stream()
                .map(BudgetItemResponse::from)
                .toList();
    }

    @Transactional
    public BudgetItemResponse create(Authentication authentication, Long invitationId, BudgetItemRequest request) {
        Budget budget = requireBudget(authentication, invitationId);
        BudgetItem item = new BudgetItem();
        item.setBudget(budget);
        applyRequest(item, request);
        BudgetItem saved = budgetItemRepository.save(item);
        updateBudgetTotal(budget);
        return BudgetItemResponse.from(saved);
    }

    @Transactional
    public BudgetItemResponse update(
            Authentication authentication,
            Long invitationId,
            Long itemId,
            BudgetItemRequest request
    ) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        BudgetItem item = requireItemByInvitation(invitationId, itemId);
        applyRequest(item, request);
        BudgetItem saved = budgetItemRepository.save(item);
        updateBudgetTotal(item.getBudget());
        return BudgetItemResponse.from(saved);
    }

    @Transactional
    public void delete(Authentication authentication, Long invitationId, Long itemId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        BudgetItem item = requireItemByInvitation(invitationId, itemId);
        Budget budget = item.getBudget();
        budgetItemRepository.delete(item);
        updateBudgetTotal(budget);
    }

    private Budget findOrCreateBudget(UserInvitation invitation) {
        return budgetRepository.findByInvitationId(invitation.getId())
                .orElseGet(() -> {
                    Budget budget = new Budget();
                    budget.setInvitation(invitation);
                    budget.setTotalBudget(BigDecimal.ZERO);
                    return budgetRepository.save(budget);
                });
    }

    private Budget requireBudget(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return findOrCreateBudget(invitation);
    }

    private Budget requireBudget(Long invitationId) {
        return budgetRepository.findByInvitationId(invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Budget not found"));
    }

    private BudgetItem requireItem(Long budgetId, Long itemId) {
        return budgetItemRepository.findByIdAndBudgetId(itemId, budgetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Budget item not found"));
    }

    private BudgetItem requireItemByInvitation(Long invitationId, Long itemId) {
        return budgetItemRepository.findByIdAndInvitationId(itemId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Budget item not found"));
    }

    private void applyRequest(BudgetItem item, BudgetItemRequest request) {
        item.setItemName(requiredText(request.getName(), "Budget item name"));
        item.setCategory(normalizeCategory(request.getCategory()));
        item.setEstimatedCost(nonNegativeOrZero(request.getBudget(), "Estimated cost"));
        item.setActualCost(nonNegativeOrZero(request.getAmount(), "Actual cost"));
        item.setExpenseDate(request.getDate() == null ? LocalDate.now() : request.getDate());
        item.setStatus(trimToNull(request.getStatus()));
        item.setVendorName(trimToNull(request.getVendorName()));
        item.setNotes(trimToNull(request.getNotes()));
    }

    private void updateBudgetTotal(Budget budget) {
        if (budget == null || budget.getInvitation() == null) {
            return;
        }
        BigDecimal total = budgetItemRepository.findAllByInvitationId(budget.getInvitation().getId()).stream()
                .map(BudgetItem::getEstimatedCost)
                .map(this::valueOrZero)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        budget.setTotalBudget(total);
        budgetRepository.save(budget);
    }

    private BudgetResponse toResponse(Budget budget) {
        return BudgetResponse.from(budget, budgetItemRepository.findByBudgetIdOrderByIdDesc(budget.getId()));
    }

    private BudgetSummaryResponse toSummary(Budget budget, List<BudgetItem> items) {
        BigDecimal totalBudget = valueOrZero(budget.getTotalBudget());
        BigDecimal totalEstimated = sum(items, true);
        BigDecimal totalActual = sum(items, false);
        return BudgetSummaryResponse.builder()
                .invitationId(budget.getInvitation() == null ? null : budget.getInvitation().getId())
                .budgetId(budget.getId())
                .totalBudget(totalBudget)
                .totalEstimated(totalEstimated)
                .totalActual(totalActual)
                .remainingBudget(totalBudget.subtract(totalActual))
                .overBudget(totalActual.compareTo(totalBudget) > 0)
                .itemCount(items.size())
                .estimatedByCategory(sumByCategory(items, true))
                .actualByCategory(sumByCategory(items, false))
                .build();
    }

    private Map<String, BigDecimal> sumByCategory(List<BudgetItem> items, boolean estimated) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        for (BudgetItem item : items) {
            String category = normalizeCategory(item.getCategory());
            BigDecimal value = valueOrZero(estimated ? item.getEstimatedCost() : item.getActualCost());
            totals.merge(category, value, BigDecimal::add);
        }
        return totals;
    }

    private BigDecimal sum(List<BudgetItem> items, boolean estimated) {
        return items.stream()
                .map(item -> estimated ? item.getEstimatedCost() : item.getActualCost())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal nonNegativeOrZero(BigDecimal value, String field) {
        BigDecimal normalized = valueOrZero(value);
        if (normalized.signum() < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, field + " must be zero or greater");
        }
        return normalized;
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String normalizeCategory(String category) {
        String trimmed = trimToNull(category);
        return trimmed == null ? DEFAULT_CATEGORY : trimmed.toUpperCase(Locale.ROOT);
    }

    private String requiredText(String value, String field) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, field + " is required");
        }
        return trimmed;
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || !isAdmin(authentication)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }


    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
