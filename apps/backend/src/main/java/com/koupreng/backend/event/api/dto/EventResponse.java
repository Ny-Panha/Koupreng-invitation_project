package com.koupreng.backend.event.api.dto;

import com.koupreng.backend.event.domain.EventStatus;
import com.koupreng.backend.event.domain.TemplateType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
public class EventResponse {

    private Long id;
    private String eventName;
    private TemplateType templateType;
    private String groom;
    private String bride;
    private LocalDate eventDate;
    private LocalTime eatingTime;
    private String location;
    private String description;
    private String coverImageUrl;
    private EventStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    // Helper for frontend display
    private boolean isPublished;
    private boolean isDraft;
}
