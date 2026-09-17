package com.koupreng.backend.delivery.api.dto;

import com.koupreng.backend.guest.domain.Guest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryGuestResponse {

    private Long guestId;
    private String guestName;
    private String phone;
    private String email;
    private String inviteToken;
    private String invitationUrl;
    private String sendStatus;
    private boolean sendable;
    private Instant lastSentAt;
    private Instant lastReminderAt;
    private Integer reminderCount;
    private String lastSendChannel;
    private String lastSendError;
    private Instant invitationViewedAt;
    private boolean responded;

    public static DeliveryGuestResponse from(Guest guest, String invitationUrl, boolean sendable, boolean responded) {
        return DeliveryGuestResponse.builder()
                .guestId(guest.getId())
                .guestName(guest.getGuestName())
                .phone(guest.getPhone())
                .email(guest.getEmail())
                .inviteToken(guest.getInviteToken())
                .invitationUrl(invitationUrl)
                .sendStatus(guest.getSendStatus())
                .sendable(sendable)
                .lastSentAt(guest.getLastSentAt())
                .lastReminderAt(guest.getLastReminderAt())
                .reminderCount(guest.getReminderCount())
                .lastSendChannel(guest.getLastSendChannel())
                .lastSendError(guest.getLastSendError())
                .invitationViewedAt(guest.getInvitationViewedAt())
                .responded(responded)
                .build();
    }
}
