package com.koupreng.backend.integration.ai.api.dto;

import lombok.Data;

@Data
public class AiInvitationDraftRequest {

    private String language;
    private String tone;
    private String eventType;
    private String coupleNames;
    private String hostName;
    private String venueName;
    private String eventDate;
    private String notes;
}
