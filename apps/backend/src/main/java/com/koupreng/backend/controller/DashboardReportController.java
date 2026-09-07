package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.dashboard.AdminDashboardSummaryResponse;
import com.koupreng.backend.dto.dashboard.GuestStatusReportResponse;
import com.koupreng.backend.dto.dashboard.InvitationDashboardResponse;
import com.koupreng.backend.dto.dashboard.RsvpReportResponse;
import com.koupreng.backend.dto.dashboard.UserDashboardSummaryResponse;
import com.koupreng.backend.service.DashboardReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "Reports", description = "Authenticated dashboards, invitation-owner reports, and CSV exports.")
@SecurityRequirement(name = "bearerAuth")
public class DashboardReportController {

    private final DashboardReportService dashboardReportService;

    public DashboardReportController(DashboardReportService dashboardReportService) {
        this.dashboardReportService = dashboardReportService;
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<UserDashboardSummaryResponse>> myDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Dashboard summary fetched successfully",
                dashboardReportService.getMyDashboard(authentication)
        ));
    }

    @GetMapping("/invitations/{invitationId}/dashboard")
    public ResponseEntity<ApiResponse<InvitationDashboardResponse>> invitationDashboard(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation dashboard fetched successfully",
                dashboardReportService.getInvitationDashboard(authentication, invitationId)
        ));
    }

    @GetMapping("/invitations/{invitationId}/reports/rsvp")
    public ResponseEntity<ApiResponse<RsvpReportResponse>> rsvpReport(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "RSVP report fetched successfully",
                dashboardReportService.getRsvpReport(authentication, invitationId)
        ));
    }

    @GetMapping("/invitations/{invitationId}/reports/guests")
    public ResponseEntity<ApiResponse<GuestStatusReportResponse>> guestReport(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guest report fetched successfully",
                dashboardReportService.getGuestStatusReport(authentication, invitationId)
        ));
    }

    @GetMapping("/invitations/{invitationId}/reports/rsvp/export")
    public ResponseEntity<String> exportRsvpReport(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return csv("rsvp-report-" + invitationId + ".csv",
                dashboardReportService.exportRsvpReportCsv(authentication, invitationId));
    }

    @GetMapping("/invitations/{invitationId}/reports/guests/export")
    public ResponseEntity<String> exportGuestReport(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return csv("guest-report-" + invitationId + ".csv",
                dashboardReportService.exportGuestReportCsv(authentication, invitationId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Retrieve the administration dashboard",
            description = "Requires a bearer JWT for a user with the ADMIN role.")
    @GetMapping("/admin/dashboard/summary")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryResponse>> adminDashboard(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Admin dashboard summary fetched successfully",
                dashboardReportService.getAdminDashboard(authentication)
        ));
    }

    private ResponseEntity<String> csv(String filename, String content) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(new MediaType("text", "csv"))
                .body(content);
    }
}
