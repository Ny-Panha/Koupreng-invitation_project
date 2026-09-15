package com.koupreng.backend.dto.dashboard;

import com.koupreng.backend.invitation.api.dto.InvitationSummaryResponse;
import com.koupreng.backend.dto.notification.NotificationResponse;
import com.koupreng.backend.rsvp.api.dto.RsvpResponse;
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
public class UserDashboardSummaryResponse {

    private long totalInvitations;
    private long publishedInvitations;
    private long draftInvitations;
    private long totalGuests;
    private long totalInvited;
    private long totalResponded;
    private long totalAttending;
    private long totalDeclined;
    private long totalMaybe;
    private long totalPendingRsvp;
    private long totalPayments;
    private BigDecimal totalRevenue;
    private List<InvitationSummaryResponse> recentInvitations;
    private List<RsvpResponse> recentRsvps;
    private List<NotificationResponse> recentNotifications;
}
