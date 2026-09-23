package com.koupreng.backend.invitation.api.dto;

import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.domain.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationSummaryResponse {

    private Long id;
    private Long templateId;
    private String templateCode;
    private String templateName;
    private String coverUrl;
    private String title;
    private String slug;
    private EventType eventType;
    private LocalDate eventDate;
    private String venueName;
    private InvitationStatus status;
    private String designJson;

    public static InvitationSummaryResponse from(UserInvitation invitation) {
        return from(invitation, null);
    }

    public static InvitationSummaryResponse from(UserInvitation invitation, String coverUrl) {
        Long templateId = null;
        String templateCode = null;
        String templateName = null;
        String resolvedCoverUrl = coverUrl;

        if (invitation.getTemplate() != null) {
            templateId = invitation.getTemplate().getId();
            templateCode = invitation.getTemplate().getCode();
            templateName = invitation.getTemplate().getName();
            if (resolvedCoverUrl == null || resolvedCoverUrl.isBlank()) {
                resolvedCoverUrl = invitation.getTemplate().getThumbnailUrl();
            }
        }

        return InvitationSummaryResponse.builder()
                .id(invitation.getId())
                .templateId(templateId)
                .templateCode(templateCode)
                .templateName(templateName)
                .coverUrl(resolvedCoverUrl)
                .title(invitation.getTitle())
                .slug(invitation.getSlug())
                .eventType(invitation.getEventType())
                .eventDate(invitation.getEventDate())
                .venueName(invitation.getVenueName())
                .status(invitation.getStatus())
                .designJson(invitation.getDesignJson())
                .build();
    }
}
