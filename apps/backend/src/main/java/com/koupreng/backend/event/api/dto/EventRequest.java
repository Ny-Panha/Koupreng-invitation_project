package com.koupreng.backend.event.api.dto;

import com.koupreng.backend.event.domain.TemplateType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EventRequest {

    @NotBlank(message = "Event name is required")
    private String eventName;

    @NotNull(message = "Template type is required")
    private TemplateType templateType;

    private String groom;
    private String bride;

    @NotNull(message = "Event date is required")
    private LocalDate eventDate;

    private LocalTime eatingTime;

    private String location;
    private String description;
    private String coverImageUrl;
}
