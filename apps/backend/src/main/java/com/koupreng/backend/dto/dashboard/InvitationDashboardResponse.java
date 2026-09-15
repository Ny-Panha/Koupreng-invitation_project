package com.koupreng.backend.dto.dashboard;

import com.koupreng.backend.invitation.domain.InvitationStatus;
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
public class InvitationDashboardResponse {

    private Long invitationId;
    private String title;
    private String slug;
    private InvitationStatus status;
    private LocalDate eventDate;
    private long totalGuests;
    private long totalInvited;
    private long totalResponded;
    private long attending;
    private long declined;
    private long maybe;
    private long pending;
    private long totalWishes;
    private BigDecimal totalContributions;
    private long deliverySent;
    private long deliveryFailed;
    private long openedCount;
}
