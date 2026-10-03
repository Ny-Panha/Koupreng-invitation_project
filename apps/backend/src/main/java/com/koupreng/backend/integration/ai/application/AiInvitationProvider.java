package com.koupreng.backend.integration.ai.application;

import com.koupreng.backend.integration.ai.api.dto.AiInvitationDraftRequest;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/** Internal adapter boundary. No provider, credentials or external calls are selected here. */
public interface AiInvitationProvider {
    String name();
    CompletableFuture<Result> generate(String operation, AiInvitationDraftRequest request);
    record Result(String generatedText, List<String> suggestions) { }
}
