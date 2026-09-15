package com.koupreng.backend.dto.invitation;

import com.koupreng.backend.entity.invitation.EventType;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.entity.organization.Organization;
import com.koupreng.backend.enums.InvitationModerationStatus;
import com.koupreng.backend.enums.InvitationStatus;
import com.koupreng.backend.enums.InvitationVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {

    private Long id;
    private Long userId;
    private String ownerName;
    private Long templateId;
    private String templateName;
    private Long organizationId;
    private String organizationName;
    private String title;
    private String slug;
    private EventType eventType;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String venueName;
    private String venueAddress;
    private String googleMapUrl;
    private String hostName;
    private String partnerName;
    private String groomName;
    private String brideName;
    private String storyText;
    private String languageMode;
    private String designJson;
    private String contentJson;
    private String customColors;
    private String customFonts;
    private String enabledSections;
    private String layoutSettings;
    private InvitationVisibility visibility;
    private LocalDate rsvpDeadline;
    private InvitationStatus status;
    private InvitationModerationStatus moderationStatus;
    private boolean published;
    private boolean draft;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant publishedAt;

    public static InvitationResponse from(UserInvitation invitation) {
        InvitationTemplate template = invitation.getTemplate();
        Organization organization = invitation.getOrganization();
        return InvitationResponse.builder()
                .id(invitation.getId())
                .userId(invitation.getUser() == null ? null : invitation.getUser().getId())
                .ownerName(invitation.getUser() == null ? null : invitation.getUser().getFullName())
                .templateId(template == null ? null : template.getId())
                .templateName(template == null ? null : template.getName())
                .organizationId(organization == null ? null : organization.getId())
                .organizationName(organization == null ? null : organization.getName())
                .title(invitation.getTitle())
                .slug(invitation.getSlug())
                .eventType(invitation.getEventType())
                .eventDate(invitation.getEventDate())
                .eventTime(invitation.getEventTime())
                .venueName(invitation.getVenueName())
                .venueAddress(invitation.getVenueAddress())
                .googleMapUrl(invitation.getGoogleMapUrl())
                .hostName(invitation.getHostName())
                .partnerName(invitation.getPartnerName())
                .groomName(invitation.getGroomName())
                .brideName(invitation.getBrideName())
                .storyText(invitation.getStoryText())
                .languageMode(invitation.getLanguageMode())
                .designJson(invitation.getDesignJson())
                .contentJson(invitation.getContentJson())
                .customColors(invitation.getCustomColors())
                .customFonts(invitation.getCustomFonts())
                .enabledSections(invitation.getEnabledSections())
                .layoutSettings(invitation.getLayoutSettings())
                .visibility(invitation.getVisibility())
                .rsvpDeadline(invitation.getRsvpDeadline())
                .status(invitation.getStatus())
                .moderationStatus(invitation.getModerationStatus())
                .published(invitation.getStatus() == InvitationStatus.PUBLISHED)
                .draft(invitation.getStatus() == InvitationStatus.DRAFT)
                .createdAt(invitation.getCreatedAt())
                .updatedAt(invitation.getUpdatedAt())
                .publishedAt(invitation.getPublishedAt())
                .build();
    }
}
