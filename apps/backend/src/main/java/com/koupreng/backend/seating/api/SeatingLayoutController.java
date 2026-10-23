package com.koupreng.backend.seating.api;

import com.koupreng.backend.seating.api.dto.*;
import com.koupreng.backend.seating.application.SeatingLayoutService;
import com.koupreng.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/v1/invitations/{invitationId}/seating/layout")
public class SeatingLayoutController {
    private final SeatingLayoutService service;
    @GetMapping public ApiResponse<SeatingLayoutResponse> get(Authentication auth, @PathVariable Long invitationId) {
        return ApiResponse.success("Saved event layout", service.get(auth, invitationId));
    }
    @PutMapping public ApiResponse<SeatingLayoutResponse> save(Authentication auth, @PathVariable Long invitationId, @Valid @RequestBody SeatingLayoutRequest request) {
        return ApiResponse.success("Event layout saved", service.save(auth, invitationId, request));
    }
}
