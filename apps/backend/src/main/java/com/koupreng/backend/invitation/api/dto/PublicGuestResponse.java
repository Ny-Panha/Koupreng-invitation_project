package com.koupreng.backend.invitation.api.dto;

import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.GuestSeatAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicGuestResponse {

    private String guestName;
    private String guestGroup;
    private String sideType;
    private String tableNumber;
    private String tableName;
    private String tableLabel;
    private String seatLabel;
    private Integer seatCount;

    public static PublicGuestResponse from(Guest guest) {
        return from(guest, null);
    }

    public static PublicGuestResponse from(Guest guest, GuestSeatAssignment assignment) {
        if (guest == null) {
            return null;
        }
        return PublicGuestResponse.builder()
                .guestName(guest.getGuestName())
                .guestGroup(guest.getGuestGroup())
                .sideType(guest.getSideType())
                .tableNumber(guest.getTableNumber())
                .tableName(assignment == null || assignment.getTable() == null
                        ? guest.getTableNumber()
                        : assignment.getTable().getTableName())
                .tableLabel(assignment == null || assignment.getTable() == null
                        ? null
                        : assignment.getTable().getTableLabel())
                .seatLabel(assignment == null ? null : assignment.getSeatLabel())
                .seatCount(assignment == null ? guest.getSeatCount() : assignment.getSeatCount())
                .build();
    }
}
