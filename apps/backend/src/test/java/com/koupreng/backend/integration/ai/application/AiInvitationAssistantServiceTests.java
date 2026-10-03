package com.koupreng.backend.integration.ai.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import com.koupreng.backend.integration.ai.api.dto.AiInvitationDraftRequest;
import org.junit.jupiter.api.Test;

class AiInvitationAssistantServiceTests {
    private final AiInvitationProvider adapter = mock(AiInvitationProvider.class);
    private final AiInvitationDraftRequest request = new AiInvitationDraftRequest();

    @Test void disabledAndMissingAdaptersPreserveHonestLocalFallback() {
        var disabled = new AiInvitationAssistantService(false, "test", List.of(adapter), 20).draft(request);
        assertThat(disabled.isEnabled()).isFalse();
        assertThat(disabled.getSource()).isEqualTo("LOCAL_TEMPLATE");
        assertThat(disabled.getGeneratedText()).isEmpty();
        assertThat(disabled.getSuggestions()).isNotEmpty();
        assertThat(new AiInvitationAssistantService(true, "test").draft(request).isEnabled()).isFalse();
        verify(adapter, never()).generate(any(), any());
    }

    @Test void configuredInternalAdapterReceivesDistinctOperationsAndGeneratedContent() {
        when(adapter.name()).thenReturn("test");
        when(adapter.generate(any(), any())).thenReturn(CompletableFuture.completedFuture(new AiInvitationProvider.Result("Generated text", List.of("Advice"))));
        var service = new AiInvitationAssistantService(true, "test", List.of(adapter), 100);
        var results = List.of(service.draft(request), service.story(request), service.formalText(request), service.translate(request), service.timelineSuggestion(request));
        assertThat(results).allSatisfy(result -> {
            assertThat(result.isEnabled()).isTrue();
            assertThat(result.getSource()).isEqualTo("AI_PROVIDER");
            assertThat(result.getGeneratedText()).isEqualTo("Generated text");
        });
        assertThat(results).extracting(result -> result.getOperation())
                .containsExactly("INVITATION_COPY", "STORY", "FORMAL_TEXT", "TRANSLATE", "TIMELINE_SUGGESTION");
    }

    @Test void adapterFailureDoesNotExposePrivateDiagnostics() {
        when(adapter.name()).thenReturn("test");
        when(adapter.generate(any(), any())).thenReturn(CompletableFuture.failedFuture(new IllegalStateException("private provider credentials")));
        var result = new AiInvitationAssistantService(true, "test", List.of(adapter), 100).translate(request);
        assertThat(result.getSource()).isEqualTo("LOCAL_TEMPLATE");
        assertThat(result.getWarnings().toString()).doesNotContain("private provider credentials");
        assertThat(result.getGeneratedText()).isEmpty();
    }

    @Test void timeoutCancelsPendingWorkAndReturnsLocalFallback() {
        when(adapter.name()).thenReturn("test");
        var pending = new CompletableFuture<AiInvitationProvider.Result>();
        when(adapter.generate(any(), any())).thenReturn(pending);
        assertThat(new AiInvitationAssistantService(true, "test", List.of(adapter), 5).draft(request).isEnabled()).isFalse();
        assertThat(pending.isCancelled()).isTrue();
    }
}
