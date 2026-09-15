package com.koupreng.backend.invitation.domain;

import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.entity.organization.Organization;
import com.koupreng.backend.template.domain.InvitationTemplate;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "invitations")
public class UserInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invitation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private InvitationTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(nullable = false)
    private String title;

    @Column(unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", length = 50)
    private EventType eventType;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "event_time")
    private LocalTime eventTime;

    @Column(name = "venue_name")
    private String venueName;

    @Column(name = "venue_address", length = 1000)
    private String venueAddress;

    @Column(name = "google_map_url", length = 1000)
    private String googleMapUrl;

    @Column(name = "host_name")
    private String hostName;

    @Column(name = "partner_name")
    private String partnerName;

    @Column(name = "groom_name")
    private String groomName;

    @Column(name = "bride_name")
    private String brideName;

    @Column(name = "story_text", columnDefinition = "TEXT")
    private String storyText;

    @Column(name = "language_mode", length = 20)
    private String languageMode;

    @Column(name = "design_json", columnDefinition = "TEXT")
    private String designJson;

    @Column(name = "content_json", columnDefinition = "TEXT")
    private String contentJson;

    @Column(name = "custom_colors", columnDefinition = "TEXT")
    private String customColors;

    @Column(name = "custom_fonts", columnDefinition = "TEXT")
    private String customFonts;

    @Column(name = "enabled_sections", columnDefinition = "TEXT")
    private String enabledSections;

    @Column(name = "layout_settings", columnDefinition = "TEXT")
    private String layoutSettings;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private InvitationVisibility visibility = InvitationVisibility.PUBLIC;

    @Column(name = "access_password")
    private String accessPassword;

    @Column(name = "access_token", unique = true, length = 80)
    private String accessToken;

    @Column(name = "rsvp_deadline")
    private LocalDate rsvpDeadline;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private InvitationStatus status = InvitationStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", length = 30)
    private InvitationModerationStatus moderationStatus = InvitationModerationStatus.ACTIVE;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = InvitationStatus.DRAFT;
        }
        if (visibility == null) {
            visibility = InvitationVisibility.PUBLIC;
        }
        if (moderationStatus == null) {
            moderationStatus = InvitationModerationStatus.ACTIVE;
        }
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
