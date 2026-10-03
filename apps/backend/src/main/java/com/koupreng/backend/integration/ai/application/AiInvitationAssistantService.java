package com.koupreng.backend.integration.ai.application;

import com.koupreng.backend.integration.ai.api.dto.AiInvitationDraftRequest;
import com.koupreng.backend.integration.ai.api.dto.AiInvitationDraftResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.ExecutionException;

@Service
public class AiInvitationAssistantService {

    private final boolean enabled;
    private final String provider;
    private final List<AiInvitationProvider> adapters;
    private final long timeoutMillis;

    public AiInvitationAssistantService(
            boolean enabled, String provider
    ) {
        this(enabled, provider, List.of(), 10_000);
    }

    @Autowired
    public AiInvitationAssistantService(
            @Value("${app.ai.assistant.enabled:false}") boolean enabled,
            @Value("${app.ai.assistant.provider:}") String provider,
            List<AiInvitationProvider> adapters,
            @Value("${app.ai.assistant.timeout-millis:10000}") long timeoutMillis
    ) {
        this.enabled = enabled;
        this.provider = provider == null ? "" : provider.trim();
        this.adapters = List.copyOf(adapters);
        if (timeoutMillis <= 0) {
            throw new IllegalArgumentException("AI timeout must be positive");
        }
        this.timeoutMillis = timeoutMillis;
    }

    public AiInvitationDraftResponse draft(AiInvitationDraftRequest request) {
        return generate("INVITATION_COPY", request);
    }

    private AiInvitationDraftResponse generate(String operation, AiInvitationDraftRequest request) {
        AiInvitationProvider adapter = adapters.stream().filter(candidate -> provider.equals(candidate.name()))
                .findFirst().orElse(null);
        if (!enabled || provider.isBlank() || adapter == null) {
            return fallback(operation, request, "AI is unavailable. Local template assistance remains available.");
        }
        CompletableFuture<AiInvitationProvider.Result> pending = null;
        try {
            pending = adapter.generate(operation, request == null ? new AiInvitationDraftRequest() : request);
            AiInvitationProvider.Result result = pending.get(timeoutMillis, TimeUnit.MILLISECONDS);
            if (result == null || result.generatedText() == null || result.generatedText().isBlank()) {
                return fallback(operation, request, "AI returned no text. Local template assistance remains available.");
            }
            return AiInvitationDraftResponse.builder().enabled(true).provider(provider)
                    .source("AI_PROVIDER").operation(operation).generatedText(result.generatedText())
                    .suggestions(result.suggestions() == null ? List.of() : List.copyOf(result.suggestions()))
                    .warnings(List.of()).build();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            return fallback(operation, request, "AI was interrupted. Local template assistance remains available.");
        } catch (TimeoutException | ExecutionException | RuntimeException exception) {
            return fallback(operation, request, "AI could not complete. Local template assistance remains available.");
        } finally {
            if (pending != null && !pending.isDone()) {
                pending.cancel(true);
            }
        }
    }

    private AiInvitationDraftResponse fallback(String operation, AiInvitationDraftRequest request, String warning) {
        return AiInvitationDraftResponse.builder().enabled(false)
                .provider(provider.isBlank() ? "UNCONFIGURED" : provider).source("LOCAL_TEMPLATE")
                .operation(operation).generatedText("").suggestions(localSuggestions(request))
                .warnings(List.of(warning)).build();
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
        return generate("STORY", request);
    }

    public AiInvitationDraftResponse formalText(AiInvitationDraftRequest request) {
        return generate("FORMAL_TEXT", request);
    }

    public AiInvitationDraftResponse translate(AiInvitationDraftRequest request) {
        return generate("TRANSLATE", request);
    }

    public AiInvitationDraftResponse timelineSuggestion(AiInvitationDraftRequest request) {
        return generate("TIMELINE_SUGGESTION", request);
    }
}
