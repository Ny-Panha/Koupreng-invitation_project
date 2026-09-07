package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.ai.AiInvitationDraftRequest;
import com.koupreng.backend.dto.ai.AiInvitationDraftResponse;
import com.koupreng.backend.service.AiInvitationAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Invitation Assistant", description = "Authenticated invitation copy, story, translation, and timeline suggestions.")
@SecurityRequirement(name = "bearerAuth")
public class AiInvitationAssistantController {

    private final AiInvitationAssistantService assistantService;

    public AiInvitationAssistantController(AiInvitationAssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @PostMapping("/invitation-copy")
    public ResponseEntity<ApiResponse<AiInvitationDraftResponse>> draft(
            @RequestBody(required = false) AiInvitationDraftRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "AI invitation assistant response fetched successfully",
                assistantService.draft(request == null ? new AiInvitationDraftRequest() : request)
        ));
    }

    @PostMapping("/invitation/story")
    public ResponseEntity<ApiResponse<AiInvitationDraftResponse>> story(
            @RequestBody(required = false) AiInvitationDraftRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "AI invitation story assistant response fetched successfully",
                assistantService.story(request == null ? new AiInvitationDraftRequest() : request)
        ));
    }

    @PostMapping("/invitation/formal-text")
    public ResponseEntity<ApiResponse<AiInvitationDraftResponse>> formalText(
            @RequestBody(required = false) AiInvitationDraftRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "AI invitation formal text assistant response fetched successfully",
                assistantService.formalText(request == null ? new AiInvitationDraftRequest() : request)
        ));
    }

    @PostMapping("/invitation/translate")
    public ResponseEntity<ApiResponse<AiInvitationDraftResponse>> translate(
            @RequestBody(required = false) AiInvitationDraftRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "AI invitation translation assistant response fetched successfully",
                assistantService.translate(request == null ? new AiInvitationDraftRequest() : request)
        ));
    }

    @PostMapping("/invitation/timeline-suggestion")
    public ResponseEntity<ApiResponse<AiInvitationDraftResponse>> timelineSuggestion(
            @RequestBody(required = false) AiInvitationDraftRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "AI invitation timeline assistant response fetched successfully",
                assistantService.timelineSuggestion(request == null ? new AiInvitationDraftRequest() : request)
        ));
    }
}
