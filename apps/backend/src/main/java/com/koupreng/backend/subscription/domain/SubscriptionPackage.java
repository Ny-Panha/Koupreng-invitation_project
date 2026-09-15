package com.koupreng.backend.subscription.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Table(name = "packages")
public class SubscriptionPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_id")
    private Long id;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Column(name = "billing_interval", nullable = false, length = 30)
    private String billingInterval = "ONCE";

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "max_invitations")
    private Integer maxInvitations;

    @Column(name = "max_guests")
    private Integer maxGuests;

    @Column(name = "max_guests_per_invitation")
    private Integer maxGuestsPerInvitation;

    @Column(name = "max_team_members")
    private Integer maxTeamMembers;

    @Column(name = "features_json", columnDefinition = "JSON")
    private String featuresJson;

    @Column(length = 50)
    private String status;

    @Column(name = "premium_templates_enabled", nullable = false)
    private boolean premiumTemplatesEnabled = false;

    @Column(name = "qr_invitations_enabled", nullable = false)
    private boolean qrInvitationsEnabled = true;

    @Column(name = "qr_check_in_enabled", nullable = false)
    private boolean qrCheckInEnabled = false;

    @Column(name = "seating_enabled", nullable = false)
    private boolean seatingEnabled = false;

    @Column(name = "advanced_analytics_enabled", nullable = false)
    private boolean advancedAnalyticsEnabled = false;

    @Column(name = "custom_branding_enabled", nullable = false)
    private boolean customBrandingEnabled = false;

    @Column(name = "team_members_enabled", nullable = false)
    private boolean teamMembersEnabled = false;

    @Column(name = "ai_assistant_enabled", nullable = false)
    private boolean aiAssistantEnabled = false;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (currency == null || currency.isBlank()) {
            currency = "USD";
        }
        if (billingInterval == null || billingInterval.isBlank()) {
            billingInterval = "ONCE";
        }
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
