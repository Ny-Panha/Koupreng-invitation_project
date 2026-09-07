package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.admin.AdminInvitationModerationRequest;
import com.koupreng.backend.dto.admin.AdminReportResponse;
import com.koupreng.backend.dto.admin.AdminTemplatePremiumRequest;
import com.koupreng.backend.dto.admin.AdminTemplateRequest;
import com.koupreng.backend.dto.admin.AdminTemplateResponse;
import com.koupreng.backend.dto.admin.AdminUpdateUserRoleRequest;
import com.koupreng.backend.dto.admin.AdminUserResponse;
import com.koupreng.backend.dto.admin.SystemAuditLogResponse;
import com.koupreng.backend.dto.invitation.InvitationResponse;
import com.koupreng.backend.dto.subscription.SubscriptionPackageResponse;
import com.koupreng.backend.dto.subscription.SubscriptionPackageRequest;
import com.koupreng.backend.dto.payments.PaymentHistoryResponse;
import com.koupreng.backend.service.SubscriptionService;
import com.koupreng.backend.service.PaymentHistoryService;
import com.koupreng.backend.service.AdminManagementService;
import com.koupreng.backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/v1/admin")
@Tag(name = "Administration", description = "ADMIN-only user, template, invitation, reporting, package, payment, and audit operations.")
@SecurityRequirement(name = "bearerAuth")
public class AdminManagementController {

    private final AdminManagementService adminManagementService;
    private final AuditLogService auditLogService;
    private final SubscriptionService subscriptionService;
    private final PaymentHistoryService paymentHistoryService;

    public AdminManagementController(
            AdminManagementService adminManagementService,
            AuditLogService auditLogService,
            SubscriptionService subscriptionService,
            PaymentHistoryService paymentHistoryService
    ) {
        this.adminManagementService = adminManagementService;
        this.auditLogService = auditLogService;
        this.subscriptionService = subscriptionService;
        this.paymentHistoryService = paymentHistoryService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", adminManagementService.listUsers()));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User fetched successfully", adminManagementService.getUser(userId)));
    }

    @PatchMapping("/users/{userId}/activate")
    public ResponseEntity<ApiResponse<AdminUserResponse>> activateUser(
            Authentication authentication,
            @PathVariable Long userId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "User activated successfully",
                adminManagementService.activateUser(authentication, userId, request)
        ));
    }

    @PatchMapping("/users/{userId}/deactivate")
    public ResponseEntity<ApiResponse<AdminUserResponse>> deactivateUser(
            Authentication authentication,
            @PathVariable Long userId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "User deactivated successfully",
                adminManagementService.deactivateUser(authentication, userId, request)
        ));
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserRole(
            Authentication authentication,
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRoleRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "User role updated successfully",
                adminManagementService.updateUserRole(authentication, userId, requestBody.getRole(), request)
        ));
    }

    @GetMapping("/users/{userId}/invitations")
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> listUserInvitations(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                "User invitations fetched successfully",
                adminManagementService.listUserInvitations(userId)
        ));
    }

    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<AdminTemplateResponse>>> listTemplates() {
        return ResponseEntity.ok(ApiResponse.success("Templates fetched successfully", adminManagementService.listTemplates()));
    }

    @PostMapping("/templates")
    public ResponseEntity<ApiResponse<AdminTemplateResponse>> createTemplate(
            Authentication authentication,
            @Valid @RequestBody AdminTemplateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Template created successfully",
                adminManagementService.createTemplate(authentication, requestBody, request)
        ));
    }

    @GetMapping("/templates/{templateId}")
    public ResponseEntity<ApiResponse<AdminTemplateResponse>> getTemplate(@PathVariable Long templateId) {
        return ResponseEntity.ok(ApiResponse.success("Template fetched successfully", adminManagementService.getTemplate(templateId)));
    }

    @PutMapping("/templates/{templateId}")
    public ResponseEntity<ApiResponse<AdminTemplateResponse>> updateTemplate(
            Authentication authentication,
            @PathVariable Long templateId,
            @Valid @RequestBody AdminTemplateRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Template updated successfully",
                adminManagementService.updateTemplate(authentication, templateId, requestBody, request)
        ));
    }

    @PatchMapping("/templates/{templateId}/activate")
    public ResponseEntity<ApiResponse<AdminTemplateResponse>> activateTemplate(
            Authentication authentication,
            @PathVariable Long templateId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Template activated successfully",
                adminManagementService.activateTemplate(authentication, templateId, request)
        ));
    }

    @PatchMapping("/templates/{templateId}/deactivate")
    public ResponseEntity<ApiResponse<AdminTemplateResponse>> deactivateTemplate(
            Authentication authentication,
            @PathVariable Long templateId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Template deactivated successfully",
                adminManagementService.deactivateTemplate(authentication, templateId, request)
        ));
    }

    @PatchMapping("/templates/{templateId}/premium")
    public ResponseEntity<ApiResponse<AdminTemplateResponse>> updateTemplatePremium(
            Authentication authentication,
            @PathVariable Long templateId,
            @RequestBody(required = false) AdminTemplatePremiumRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Template premium flag updated successfully",
                adminManagementService.updateTemplatePremium(authentication, templateId, requestBody, request)
        ));
    }

    @DeleteMapping("/templates/{templateId}")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(
            Authentication authentication,
            @PathVariable Long templateId,
            HttpServletRequest request
    ) {
        adminManagementService.deleteTemplate(authentication, templateId, request);
        return ResponseEntity.ok(ApiResponse.success("Template deleted or deactivated successfully", null));
    }

    @GetMapping("/invitations")
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> listInvitations() {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitations fetched successfully",
                adminManagementService.listInvitations()
        ));
    }

    @GetMapping("/invitations/{invitationId}")
    public ResponseEntity<ApiResponse<InvitationResponse>> getInvitation(@PathVariable Long invitationId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation fetched successfully",
                adminManagementService.getInvitation(invitationId)
        ));
    }

    @PatchMapping("/invitations/{invitationId}/moderate")
    public ResponseEntity<ApiResponse<InvitationResponse>> moderateInvitation(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody AdminInvitationModerationRequest requestBody,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation moderated successfully",
                adminManagementService.moderateInvitation(authentication, invitationId, requestBody, request)
        ));
    }

    @PatchMapping("/invitations/{invitationId}/activate")
    public ResponseEntity<ApiResponse<InvitationResponse>> activateInvitation(
            Authentication authentication,
            @PathVariable Long invitationId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation activated successfully",
                adminManagementService.activateInvitation(authentication, invitationId, request)
        ));
    }

    @PatchMapping("/invitations/{invitationId}/deactivate")
    public ResponseEntity<ApiResponse<InvitationResponse>> deactivateInvitation(
            Authentication authentication,
            @PathVariable Long invitationId,
            HttpServletRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation deactivated successfully",
                adminManagementService.deactivateInvitation(authentication, invitationId, request)
        ));
    }

    @GetMapping("/reports/users")
    public ResponseEntity<ApiResponse<AdminReportResponse>> usersReport() {
        return ResponseEntity.ok(ApiResponse.success("User report fetched successfully", adminManagementService.usersReport()));
    }

    @GetMapping("/reports/invitations")
    public ResponseEntity<ApiResponse<AdminReportResponse>> invitationsReport() {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation report fetched successfully",
                adminManagementService.invitationsReport()
        ));
    }

    @GetMapping("/reports/payments")
    public ResponseEntity<ApiResponse<AdminReportResponse>> paymentsReport() {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment report fetched successfully",
                adminManagementService.paymentsReport()
        ));
    }

    @GetMapping("/reports/rsvp")
    public ResponseEntity<ApiResponse<AdminReportResponse>> rsvpReport() {
        return ResponseEntity.ok(ApiResponse.success("RSVP report fetched successfully", adminManagementService.rsvpReport()));
    }

    @GetMapping("/reports/system")
    public ResponseEntity<ApiResponse<AdminReportResponse>> systemReport() {
        return ResponseEntity.ok(ApiResponse.success(
                "System report fetched successfully",
                adminManagementService.systemReport()
        ));
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<ApiResponse<AdminReportResponse>> analyticsOverview() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin analytics overview fetched successfully",
                adminManagementService.analyticsOverview()
        ));
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<ApiResponse<AdminReportResponse>> analyticsRevenue() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin revenue analytics fetched successfully",
                adminManagementService.analyticsRevenue()
        ));
    }

    @GetMapping("/analytics/templates")
    public ResponseEntity<ApiResponse<AdminReportResponse>> analyticsTemplates() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin template analytics fetched successfully",
                adminManagementService.analyticsTemplates()
        ));
    }

    @GetMapping("/analytics/delivery")
    public ResponseEntity<ApiResponse<AdminReportResponse>> analyticsDelivery() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin delivery analytics fetched successfully",
                adminManagementService.analyticsDelivery()
        ));
    }

    @GetMapping("/analytics/rsvp")
    public ResponseEntity<ApiResponse<AdminReportResponse>> analyticsRsvp() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin RSVP analytics fetched successfully",
                adminManagementService.analyticsRsvp()
        ));
    }

    @GetMapping("/analytics/check-in")
    public ResponseEntity<ApiResponse<AdminReportResponse>> analyticsCheckIn() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin check-in analytics fetched successfully",
                adminManagementService.analyticsCheckIn()
        ));
    }

    @GetMapping("/system-health")
    public ResponseEntity<ApiResponse<AdminReportResponse>> systemHealth() {
        return ResponseEntity.ok(ApiResponse.success(
                "System health fetched successfully",
                adminManagementService.systemHealth()
        ));
    }

    @GetMapping("/audit-logs/recent")
    public ResponseEntity<ApiResponse<List<SystemAuditLogResponse>>> recentAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(
                "Recent audit logs fetched successfully",
                adminManagementService.recentAuditLogs()
        ));
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<AdminReportResponse>> alerts() {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin alerts fetched successfully",
                adminManagementService.alerts()
        ));
    }

    @GetMapping("/system-logs")
    public ResponseEntity<ApiResponse<List<SystemAuditLogResponse>>> systemLogs() {
        return ResponseEntity.ok(ApiResponse.success("System logs fetched successfully", auditLogService.listLogs()));
    }

    @GetMapping("/packages")
    public ResponseEntity<ApiResponse<List<SubscriptionPackageResponse>>> listPackages() {
        return ResponseEntity.ok(ApiResponse.success(
                "Subscription packages fetched successfully",
                subscriptionService.listAllPackages()
        ));
    }

    @PostMapping("/packages")
    public ResponseEntity<ApiResponse<SubscriptionPackageResponse>> createPackage(
            @Valid @RequestBody SubscriptionPackageRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Subscription package created successfully",
                subscriptionService.createPackage(request)
        ));
    }

    @PutMapping("/packages/{packageId}")
    public ResponseEntity<ApiResponse<SubscriptionPackageResponse>> updatePackage(
            @PathVariable Long packageId,
            @Valid @RequestBody SubscriptionPackageRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Subscription package updated successfully",
                subscriptionService.updatePackage(packageId, request)
        ));
    }

    @PatchMapping("/packages/{packageId}/activate")
    public ResponseEntity<ApiResponse<SubscriptionPackageResponse>> activatePackage(
            @PathVariable Long packageId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Subscription package activated successfully",
                subscriptionService.activatePackage(packageId)
        ));
    }

    @PatchMapping("/packages/{packageId}/deactivate")
    public ResponseEntity<ApiResponse<SubscriptionPackageResponse>> deactivatePackage(
            @PathVariable Long packageId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Subscription package deactivated successfully",
                subscriptionService.deactivatePackage(packageId)
        ));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentHistoryResponse>>> listAllPayments() {
        return ResponseEntity.ok(ApiResponse.success(
                "All payments fetched successfully",
                paymentHistoryService.listAll()
        ));
    }

    @GetMapping("/payments/{orderCode}")
    public ResponseEntity<ApiResponse<PaymentHistoryResponse>> getPayment(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment order fetched successfully",
                paymentHistoryService.get(authentication, orderCode)
        ));
    }
}
