package com.koupreng.backend.reporting.api.dto;

import com.koupreng.backend.dto.admin.AdminUserResponse;
import com.koupreng.backend.invitation.api.dto.InvitationResponse;
import com.koupreng.backend.dto.payment.TemplatePaymentStatusResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardSummaryResponse {

    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long totalTemplates;
    private long activeTemplates;
    private long premiumTemplates;
    private long totalInvitations;
    private long publishedInvitations;
    private long totalGuests;
    private long totalRsvps;
    private long totalPayments;
    private BigDecimal totalRevenue;
    private long failedPayments;
    private List<AdminUserResponse> recentUsers;
    private List<InvitationResponse> recentInvitations;
    private List<TemplatePaymentStatusResponse> recentPayments;
    private String systemHealthSummary;
}
