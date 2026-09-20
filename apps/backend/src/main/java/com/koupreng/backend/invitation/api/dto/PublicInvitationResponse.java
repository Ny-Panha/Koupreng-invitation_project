package com.koupreng.backend.invitation.api.dto;

import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.seating.domain.GuestSeatAssignment;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.invitation.domain.UserInvitation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicInvitationResponse {

    private Long templateId;
    private String templateCode;
    private String templateThumbnailUrl;
    private String templateName;
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
    private LocalDate rsvpDeadline;
    private PublicGuestResponse guest;

    public static PublicInvitationResponse from(UserInvitation invitation) {
        return from(invitation, null, null);
    }

    public static PublicInvitationResponse from(
            UserInvitation invitation,
            Guest guest,
            GuestSeatAssignment assignment
    ) {
        InvitationTemplate template = invitation.getTemplate();
        return PublicInvitationResponse.builder()
                .templateId(template == null ? null : template.getId())
                .templateCode(template == null ? null : template.getCode())
                .templateThumbnailUrl(template == null ? null : template.getThumbnailUrl())
                .templateName(template == null ? null : template.getName())
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
                .rsvpDeadline(invitation.getRsvpDeadline())
                .guest(PublicGuestResponse.from(guest, assignment))
                .build();
    }
}
