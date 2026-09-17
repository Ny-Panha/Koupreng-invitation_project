package com.koupreng.backend.seating.api.dto;

import com.koupreng.backend.seating.domain.EventTable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventTableResponse {

    private Long id;
    private Long invitationId;
    private String tableName;
    private String tableLabel;
    private Integer capacity;
    private Integer assignedSeats;
    private Integer remainingSeats;
    private Integer sortOrder;
    private String notes;

    public static EventTableResponse from(EventTable table, int assignedSeats) {
        int capacity = table.getCapacity() == null ? 0 : table.getCapacity();
        return EventTableResponse.builder()
                .id(table.getId())
                .invitationId(table.getInvitation() == null ? null : table.getInvitation().getId())
                .tableName(table.getTableName())
                .tableLabel(table.getTableLabel())
                .capacity(table.getCapacity())
                .assignedSeats(assignedSeats)
                .remainingSeats(Math.max(0, capacity - assignedSeats))
                .sortOrder(table.getSortOrder())
                .notes(table.getNotes())
                .build();
    }
}
