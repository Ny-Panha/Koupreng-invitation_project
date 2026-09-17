package com.koupreng.backend.checkin.api.dto;

import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.checkin.domain.GuestCheckIn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInResponse {

    private Long id;
    private Long invitationId;
    private Long guestId;
    private String guestName;
    private Instant checkedInAt;
    private Long checkedInByUserId;
    private String source;
    private String note;
    private boolean alreadyCheckedIn;
    private String result;

    public static CheckInResponse from(GuestCheckIn checkIn, boolean alreadyCheckedIn) {
        Guest guest = checkIn.getGuest();
        return CheckInResponse.builder()
                .id(checkIn.getId())
                .invitationId(checkIn.getInvitation() == null ? null : checkIn.getInvitation().getId())
                .guestId(guest == null ? null : guest.getId())
                .guestName(guest == null ? null : guest.getGuestName())
                .checkedInAt(checkIn.getCheckedInAt())
                .checkedInByUserId(checkIn.getCheckedInBy() == null ? null : checkIn.getCheckedInBy().getId())
                .source(checkIn.getSource())
                .note(checkIn.getNote())
                .alreadyCheckedIn(alreadyCheckedIn)
                .result(alreadyCheckedIn ? "ALREADY_CHECKED_IN" : "CHECKED_IN")
                .build();
    }
}
