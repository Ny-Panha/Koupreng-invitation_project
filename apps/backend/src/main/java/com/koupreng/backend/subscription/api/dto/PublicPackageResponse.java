package com.koupreng.backend.subscription.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicPackageResponse {

    private Long id;
    private String code;
    private String packageName;
    private String description;
    private BigDecimal price;
    private String currency;
    private String billingInterval;
    private Integer durationDays;
    private Integer maxInvitations;
    private Integer maxGuests;
    private Integer maxGuestsPerInvitation;
    private Integer maxTeamMembers;
    private boolean premiumTemplatesEnabled;
    private boolean qrInvitationsEnabled;
    private boolean qrCheckInEnabled;
    private boolean seatingEnabled;
    private boolean advancedAnalyticsEnabled;
    private boolean customBrandingEnabled;
    private boolean teamMembersEnabled;
    private boolean aiAssistantEnabled;
    private boolean purchasable;
    private java.util.Set<String> eligibleFeatures;
    private Integer sortOrder;
}

