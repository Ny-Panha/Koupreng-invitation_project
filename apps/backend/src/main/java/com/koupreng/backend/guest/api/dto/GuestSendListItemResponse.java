package com.koupreng.backend.guest.api.dto;

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
public class GuestSendListItemResponse {

    private Long id;
    private String guestName;
    private String phone;
    private String email;
    private String guestGroup;
    private String sideType;
    private String tableNumber;
    private String inviteToken;
    private String invitationUrl;
    private String qrCodeUrl;
    private String sendStatus;
    private boolean sendable;
    private Instant invitationViewedAt;

    public static GuestSendListItemResponse from(Guest guest, String invitationUrl) {
        return GuestSendListItemResponse.builder()
                .id(guest.getId())
                .guestName(guest.getGuestName())
                .phone(guest.getPhone())
                .email(guest.getEmail())
                .guestGroup(guest.getGuestGroup())
                .sideType(guest.getSideType())
                .tableNumber(guest.getTableNumber())
                .inviteToken(guest.getInviteToken())
                .invitationUrl(invitationUrl)
                .qrCodeUrl(guest.getQrCodeUrl())
                .sendStatus(guest.getSendStatus())
                .sendable(hasText(guest.getPhone()) || hasText(guest.getEmail()))
                .invitationViewedAt(guest.getInvitationViewedAt())
                .build();
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
