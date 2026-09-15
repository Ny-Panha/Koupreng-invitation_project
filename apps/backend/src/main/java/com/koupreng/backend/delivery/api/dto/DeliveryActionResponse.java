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
public class DeliveryActionResponse {

    private Long invitationId;
    private int totalTargets;
    private int successCount;
    private int failedCount;
    private List<DeliveryGuestResponse> guests;
}
