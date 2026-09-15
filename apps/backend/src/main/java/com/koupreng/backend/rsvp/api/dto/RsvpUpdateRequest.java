package com.koupreng.backend.rsvp.api.dto;

import com.koupreng.backend.rsvp.domain.RsvpStatus;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class RsvpUpdateRequest {

    private RsvpStatus responseStatus;

    @Min(value = 0, message = "Attendee count must be zero or greater")
    private Integer attendeeCount;

    private String message;
}
