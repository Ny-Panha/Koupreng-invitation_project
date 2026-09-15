package com.koupreng.backend.dto.rsvp;

import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.entity.invitation.Rsvp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishResponse {

    private Long rsvpId;
    private Long guestId;
    private String guestName;
    private String message;
    private Instant respondedAt;

    public static WishResponse from(Rsvp rsvp) {
        Guest guest = rsvp.getGuest();
        return WishResponse.builder()
                .rsvpId(rsvp.getId())
                .guestId(guest == null ? null : guest.getId())
                .guestName(guest == null ? null : guest.getGuestName())
                .message(rsvp.getMessage())
                .respondedAt(rsvp.getRespondedAt())
                .build();
    }
}
