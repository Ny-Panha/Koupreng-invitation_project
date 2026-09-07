package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.budget.BudgetItemRequest;
import com.koupreng.backend.dto.budget.BudgetItemResponse;
import com.koupreng.backend.dto.budget.BudgetResponse;
import com.koupreng.backend.dto.budget.BudgetSummaryResponse;
import com.koupreng.backend.dto.budget.CreateBudgetItemRequest;
import com.koupreng.backend.dto.budget.UpdateBudgetItemRequest;
import com.koupreng.backend.dto.budget.UpdateBudgetRequest;
import com.koupreng.backend.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "Budget", description = "Invitation-owner budget planning, line items, summaries, and exports.")
@SecurityRequirement(name = "bearerAuth")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping("/invitations/{invitationId}/budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudget(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Budget fetched successfully",
                budgetService.getOrCreateBudget(authentication, invitationId)
        ));
    }

    @PutMapping("/invitations/{invitationId}/budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody UpdateBudgetRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Budget updated successfully",
                budgetService.updateBudget(authentication, invitationId, request)
        ));
    }

    @GetMapping("/invitations/{invitationId}/budget/summary")
    public ResponseEntity<ApiResponse<BudgetSummaryResponse>> getBudgetSummary(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Budget summary fetched successfully",
                budgetService.getBudgetSummary(authentication, invitationId)
        ));
    }

    @PostMapping("/invitations/{invitationId}/budget/items")
    public ResponseEntity<ApiResponse<BudgetResponse>> addBudgetItem(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody CreateBudgetItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Budget item added successfully",
                budgetService.addBudgetItem(authentication, invitationId, request)
        ));
    }

    @PutMapping("/invitations/{invitationId}/budget/items/{itemId}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudgetItem(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateBudgetItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Budget item updated successfully",
                budgetService.updateBudgetItem(authentication, invitationId, itemId, request)
        ));
    }

    @DeleteMapping("/invitations/{invitationId}/budget/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteBudgetItem(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long itemId
    ) {
        budgetService.deleteBudgetItem(authentication, invitationId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Budget item deleted successfully", null));
    }

    @GetMapping("/invitations/{invitationId}/budget/export")
    public ResponseEntity<String> exportBudget(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return csv("budget-" + invitationId + ".csv", budgetService.exportBudgetCsv(authentication, invitationId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Retrieve any invitation budget as an administrator",
            description = "Requires a bearer JWT for a user with the ADMIN role.")
    @GetMapping("/admin/invitations/{invitationId}/budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> adminBudget(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Budget fetched successfully",
                budgetService.getBudgetForAdmin(authentication, invitationId)
        ));
    }

    @GetMapping("/invitations/{invitationId}/budget-items")
    public ResponseEntity<ApiResponse<List<BudgetItemResponse>>> listBudgetItems(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Budget items fetched successfully",
                budgetService.list(authentication, invitationId)
        ));
    }

    @PostMapping("/invitations/{invitationId}/budget-items")
    public ResponseEntity<ApiResponse<BudgetItemResponse>> createBudgetItem(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody BudgetItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Budget item created successfully",
                        budgetService.create(authentication, invitationId, request)
                ));
    }

    @PutMapping("/invitations/{invitationId}/budget-items/{itemId}")
    public ResponseEntity<ApiResponse<BudgetItemResponse>> updatePlanningBudgetItem(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long itemId,
            @Valid @RequestBody BudgetItemRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Budget item updated successfully",
                budgetService.update(authentication, invitationId, itemId, request)
        ));
    }

    @DeleteMapping("/invitations/{invitationId}/budget-items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deletePlanningBudgetItem(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long itemId
    ) {
        budgetService.delete(authentication, invitationId, itemId);
        return ResponseEntity.ok(ApiResponse.success("Budget item deleted successfully", null));
    }

    private ResponseEntity<String> csv(String filename, String content) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(new MediaType("text", "csv"))
                .body(content);
    }
}
