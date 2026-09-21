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
    private String coverUrl;
    private String title;
    private String slug;
    private EventType eventType;
    private LocalDate eventDate;
    private String venueName;
    private InvitationStatus status;

    public static InvitationSummaryResponse from(UserInvitation invitation) {
        return from(invitation, null);
    }

    public static InvitationSummaryResponse from(UserInvitation invitation, String coverUrl) {
        return InvitationSummaryResponse.builder()
                .id(invitation.getId())
                .coverUrl(coverUrl)
                .title(invitation.getTitle())
                .slug(invitation.getSlug())
                .eventType(invitation.getEventType())
                .eventDate(invitation.getEventDate())
                .venueName(invitation.getVenueName())
                .status(invitation.getStatus())
                .build();
    }
}
