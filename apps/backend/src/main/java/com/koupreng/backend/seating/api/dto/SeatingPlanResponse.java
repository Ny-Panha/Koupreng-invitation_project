package com.koupreng.backend.seating.api.dto;

import com.koupreng.backend.guest.api.dto.GuestResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatingPlanResponse {

    private Long invitationId;
    private List<EventTableResponse> tables;
    private List<SeatAssignmentResponse> assignments;
    private List<GuestResponse> unassignedGuests;
}
