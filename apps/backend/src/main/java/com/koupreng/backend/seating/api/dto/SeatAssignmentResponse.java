package com.koupreng.backend.seating.api.dto;

import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.seating.domain.GuestSeatAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatAssignmentResponse {

    private Long id;
    private Long invitationId;
    private Long tableId;
    private String tableName;
    private Long guestId;
    private String guestName;
    private String guestGroup;
    private String seatLabel;
    private Integer seatCount;
    private String notes;
    private Instant assignedAt;

    public static SeatAssignmentResponse from(GuestSeatAssignment assignment) {
        Guest guest = assignment.getGuest();
        return SeatAssignmentResponse.builder()
                .id(assignment.getId())
                .invitationId(assignment.getInvitation() == null ? null : assignment.getInvitation().getId())
                .tableId(assignment.getTable() == null ? null : assignment.getTable().getId())
                .tableName(assignment.getTable() == null ? null : assignment.getTable().getTableName())
                .guestId(guest == null ? null : guest.getId())
                .guestName(guest == null ? null : guest.getGuestName())
                .guestGroup(guest == null ? null : guest.getGuestGroup())
                .seatLabel(assignment.getSeatLabel())
                .seatCount(assignment.getSeatCount())
                .notes(assignment.getNotes())
                .assignedAt(assignment.getAssignedAt())
                .build();
    }
}
