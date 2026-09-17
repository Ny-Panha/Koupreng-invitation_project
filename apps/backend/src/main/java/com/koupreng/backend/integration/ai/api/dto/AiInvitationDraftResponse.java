package com.koupreng.backend.integration.ai.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiInvitationDraftResponse {

    private boolean enabled;
    private String provider;
    private String generatedText;
    private List<String> suggestions;
    private List<String> warnings;
}
