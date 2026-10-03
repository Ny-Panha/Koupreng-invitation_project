package com.koupreng.backend.integration.ai.api.dto;

import lombok.Data;
import jakarta.validation.constraints.Size;

@Data
public class AiInvitationDraftRequest {

    @Size(max = 60) private String language;
    @Size(max = 60) private String tone;
    @Size(max = 120) private String eventType;
    @Size(max = 240) private String coupleNames;
    @Size(max = 120) private String hostName;
    @Size(max = 240) private String venueName;
    @Size(max = 60) private String eventDate;
    @Size(max = 5000) private String notes;
}
