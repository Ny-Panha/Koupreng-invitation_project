package com.koupreng.backend.integration.ai.application;

import com.koupreng.backend.integration.ai.api.dto.AiInvitationDraftRequest;
import com.koupreng.backend.integration.ai.api.dto.AiInvitationDraftResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiInvitationAssistantService {

    private final boolean enabled;
    private final String provider;

    public AiInvitationAssistantService(
            @Value("${app.ai.assistant.enabled:false}") boolean enabled,
            @Value("${app.ai.assistant.provider:}") String provider
    ) {
        this.enabled = enabled;
        this.provider = provider == null ? "" : provider.trim();
    }

    public AiInvitationDraftResponse draft(AiInvitationDraftRequest request) {
        if (!enabled || provider.isBlank()) {
            return AiInvitationDraftResponse.builder()
                    .enabled(false)
                    .provider(provider.isBlank() ? "UNCONFIGURED" : provider)
                    .generatedText("")
                    .suggestions(localSuggestions(request))
                    .warnings(List.of("AI invitation writing is not configured. Set app.ai.assistant.enabled=true and a provider before generating copy."))
                    .build();
        }

        return AiInvitationDraftResponse.builder()
                .enabled(false)
                .provider(provider)
                .generatedText("")
                .suggestions(localSuggestions(request))
                .warnings(List.of("AI provider adapter is not implemented yet. Request was accepted but no external AI call was made."))
                .build();
    }

    private List<String> localSuggestions(AiInvitationDraftRequest request) {
        String language = request == null || request.getLanguage() == null
                ? "Khmer"
                : request.getLanguage().trim();
        String tone = request == null || request.getTone() == null
                ? "formal"
                : request.getTone().trim();
        return List.of(
                "Use " + language + " language with a " + tone + " tone.",
                "Include the couple or host names, event date, venue, and RSVP deadline.",
                "Keep the main invitation text short enough for mobile sharing."
        );
    }

    public AiInvitationDraftResponse story(AiInvitationDraftRequest request) {
        return draft(request);
    }

    public AiInvitationDraftResponse formalText(AiInvitationDraftRequest request) {
        return draft(request);
    }

    public AiInvitationDraftResponse translate(AiInvitationDraftRequest request) {
        return draft(request);
    }

    public AiInvitationDraftResponse timelineSuggestion(AiInvitationDraftRequest request) {
        return draft(request);
    }
}
