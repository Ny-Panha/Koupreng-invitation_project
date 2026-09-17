package com.koupreng.backend.delivery.api.dto;

import com.koupreng.backend.delivery.domain.InvitationDeliveryEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryEventResponse {

    private Long id;
    private Long guestId;
    private String guestName;
    private String eventType;
    private String channel;
    private String status;
    private String message;
    private String errorMessage;
    private Instant createdAt;

    public static DeliveryEventResponse from(InvitationDeliveryEvent event) {
        return DeliveryEventResponse.builder()
                .id(event.getId())
                .guestId(event.getGuest() == null ? null : event.getGuest().getId())
                .guestName(event.getGuest() == null ? null : event.getGuest().getGuestName())
                .eventType(event.getEventType())
                .channel(event.getChannel())
                .status(event.getStatus())
                .message(event.getMessage())
                .errorMessage(event.getErrorMessage())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
