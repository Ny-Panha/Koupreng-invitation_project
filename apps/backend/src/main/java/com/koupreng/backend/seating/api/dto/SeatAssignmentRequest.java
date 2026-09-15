package com.koupreng.backend.seating.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeatAssignmentRequest {

    @NotNull(message = "Guest ID is required")
    private Long guestId;

    @NotNull(message = "Table ID is required")
    private Long tableId;

    private String seatLabel;

    @Min(value = 1, message = "Seat count must be at least 1")
    private Integer seatCount;

    private String notes;
}
