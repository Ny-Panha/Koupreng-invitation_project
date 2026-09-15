package com.koupreng.backend.subscription.api.dto;

import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPackageResponse {

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
    private String featuresJson;
    private boolean premiumTemplatesEnabled;
    private boolean qrInvitationsEnabled;
    private boolean qrCheckInEnabled;
    private boolean seatingEnabled;
    private boolean advancedAnalyticsEnabled;
    private boolean customBrandingEnabled;
    private boolean teamMembersEnabled;
    private boolean aiAssistantEnabled;
    private boolean active;
    private String status;
    private Integer sortOrder;

    public static SubscriptionPackageResponse from(SubscriptionPackage plan) {
        return SubscriptionPackageResponse.builder()
                .id(plan.getId())
                .code(plan.getCode())
                .packageName(plan.getPackageName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .currency(plan.getCurrency())
                .billingInterval(plan.getBillingInterval())
                .durationDays(plan.getDurationDays())
                .maxInvitations(plan.getMaxInvitations())
                .maxGuests(plan.getMaxGuests())
                .maxGuestsPerInvitation(plan.getMaxGuestsPerInvitation())
                .maxTeamMembers(plan.getMaxTeamMembers())
                .featuresJson(plan.getFeaturesJson())
                .premiumTemplatesEnabled(plan.isPremiumTemplatesEnabled())
                .qrInvitationsEnabled(plan.isQrInvitationsEnabled())
                .qrCheckInEnabled(plan.isQrCheckInEnabled())
                .seatingEnabled(plan.isSeatingEnabled())
                .advancedAnalyticsEnabled(plan.isAdvancedAnalyticsEnabled())
                .customBrandingEnabled(plan.isCustomBrandingEnabled())
                .teamMembersEnabled(plan.isTeamMembersEnabled())
                .aiAssistantEnabled(plan.isAiAssistantEnabled())
                .active(plan.isActive())
                .status(plan.getStatus())
                .sortOrder(plan.getSortOrder())
                .build();
    }
}
