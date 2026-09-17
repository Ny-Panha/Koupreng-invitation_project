package com.koupreng.backend.guest.api.dto;

import com.koupreng.backend.guest.domain.Guest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestResponse {

    private Long id;
    private Long invitationId;
    private String guestName;
    private String phone;
    private String email;
    private String guestGroup;
    private String sideType;
    private String tableNumber;
    private String inviteToken;
    private String qrCodeUrl;
    private String sendStatus;
    private Integer seatCount;
    private String note;
    private Instant lastSentAt;
    private Instant invitationViewedAt;
    private String contributionStatus;
    private BigDecimal totalContributed;
    private Instant createdAt;

    public static GuestResponse from(Guest guest) {
        return GuestResponse.builder()
                .id(guest.getId())
                .invitationId(guest.getInvitation() == null ? null : guest.getInvitation().getId())
                .guestName(guest.getGuestName())
                .phone(guest.getPhone())
                .email(guest.getEmail())
                .guestGroup(guest.getGuestGroup())
                .sideType(guest.getSideType())
                .tableNumber(guest.getTableNumber())
                .inviteToken(guest.getInviteToken())
                .qrCodeUrl(guest.getQrCodeUrl())
                .sendStatus(guest.getSendStatus())
                .seatCount(guest.getSeatCount())
                .note(guest.getNote())
                .lastSentAt(guest.getLastSentAt())
                .invitationViewedAt(guest.getInvitationViewedAt())
                .contributionStatus(guest.getContributionStatus())
                .totalContributed(guest.getTotalContributed())
                .createdAt(guest.getCreatedAt())
                .build();
    }
}
