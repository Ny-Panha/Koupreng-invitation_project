package com.koupreng.backend.gift.api.dto;

import com.koupreng.backend.gift.domain.WeddingGift;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeddingGiftResponse {

    private Long id;
    private Long invitationId;
    private Long guestId;
    private String name;
    private BigDecimal amount;
    private String currency;
    private String method;
    private LocalDate date;
    private String note;

    public static WeddingGiftResponse from(WeddingGift gift) {
        Long invitationId = gift.getInvitation() == null ? null : gift.getInvitation().getId();
        return WeddingGiftResponse.builder()
                .id(gift.getId())
                .invitationId(invitationId)
                .guestId(gift.getGuestId())
                .name(gift.getGiverName())
                .amount(gift.getAmount())
                .currency(gift.getCurrency() == null ? "USD" : gift.getCurrency())
                .method(gift.getMethod())
                .date(gift.getReceivedDate())
                .note(gift.getNote())
                .build();
    }
}
