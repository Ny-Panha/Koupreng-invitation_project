package com.koupreng.backend.invitation.api.dto;

import com.koupreng.backend.dto.media.MediaListResponse;
import com.koupreng.backend.dto.rsvp.WishResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestInvitationViewResponse {
    private PublicInvitationResponse invitation;
    private String guestName;
    private String guestCategory;
    private Integer seatCount;
    private String tableName;
    private String seatNumber;
    private String rsvpStatus;
    private String invitationUrl;
    private String qrPayload;
    private Boolean canRsvp;
    private MediaListResponse media;
    private List<WishResponse> wishes;
}
