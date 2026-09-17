package com.koupreng.backend.rsvp.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RsvpSummaryResponse {

    private long totalGuests;
    private long attending;
    private long notAttending;
    private long maybe;
    private long pending;
    private long totalAttendeeCount;
}
