package com.koupreng.backend.delivery.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliverySummaryResponse {

    private Long invitationId;
    private String invitationSlug;
    private int totalGuests;
    private int notReady;
    private int ready;
    private int linkGenerated;
    private int sent;
    private int failed;
    private int reminderSent;
    private int opened;
    private int responded;
    private List<DeliveryGuestResponse> guests;
}
