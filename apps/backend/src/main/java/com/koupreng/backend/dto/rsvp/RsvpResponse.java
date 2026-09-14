package com.koupreng.backend.dto.rsvp;

import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.Rsvp;
import com.koupreng.backend.enums.RsvpStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RsvpResponse {

    private Long id;
    private Long invitationId;
    private Long guestId;
    private String guestName;
    private String inviteToken;
    private String qrCodeUrl;
    private RsvpStatus responseStatus;
    private Integer attendeeCount;
    private String message;
    private Instant respondedAt;

    public static RsvpResponse from(Rsvp rsvp) {
        Guest guest = rsvp.getGuest();
        return RsvpResponse.builder()
                .id(rsvp.getId())
                .invitationId(rsvp.getInvitation() == null ? null : rsvp.getInvitation().getId())
                .guestId(guest == null ? null : guest.getId())
                .guestName(guest == null ? null : guest.getGuestName())
                .inviteToken(guest == null ? null : guest.getInviteToken())
                .qrCodeUrl(guest == null ? null : guest.getQrCodeUrl())
                .responseStatus(rsvp.getResponseStatus())
                .attendeeCount(rsvp.getAttendeeCount())
                .message(rsvp.getMessage())
                .respondedAt(rsvp.getRespondedAt())
                .build();
    }
}
