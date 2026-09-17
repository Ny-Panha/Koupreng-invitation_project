package com.koupreng.backend.rsvp.api.dto;

import com.koupreng.backend.rsvp.domain.RsvpStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RsvpRequest {

    private String guestName;
    private String phone;
    private String email;

    @NotNull(message = "RSVP status is required")
    private RsvpStatus responseStatus;

    @Min(value = 0, message = "Attendee count must be zero or greater")
    private Integer attendeeCount;

    private String message;
}
