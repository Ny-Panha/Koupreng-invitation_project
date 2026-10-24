package com.koupreng.backend.seating.api;

import com.koupreng.backend.seating.api.dto.*;
import com.koupreng.backend.seating.application.SeatingLayoutService;
import com.koupreng.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/v1/invitations/{invitationId}/seating/layout")
@Tag(name = "Seating", description = "Event-owned seating assignments and versioned floor-plan geometry.")
@SecurityRequirement(name = "bearerAuth")
public class SeatingLayoutController {
    private final SeatingLayoutService service;
    @Operation(summary = "Retrieve the event floor-plan layout", description = "Returns version zero when no cloud layout exists. Guest assignments remain separate.")
    @GetMapping public ApiResponse<SeatingLayoutResponse> get(Authentication auth, @PathVariable Long invitationId) {
        return ApiResponse.success("Saved event layout", service.get(auth, invitationId));
    }
    @Operation(summary = "Save the event floor-plan layout", description = "Requires event ownership, seating entitlement and the last retrieved version. Stale versions return 409 without overwriting edits.")
    @PutMapping public ApiResponse<SeatingLayoutResponse> save(Authentication auth, @PathVariable Long invitationId, @Valid @RequestBody SeatingLayoutRequest request) {
        return ApiResponse.success("Event layout saved", service.save(auth, invitationId, request));
    }
}
