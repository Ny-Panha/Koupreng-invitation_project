package com.koupreng.backend.seating.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatingSummaryResponse {

    private Long invitationId;
    private long totalTables;
    private long totalCapacity;
    private long assignedSeats;
    private long remainingSeats;
}
