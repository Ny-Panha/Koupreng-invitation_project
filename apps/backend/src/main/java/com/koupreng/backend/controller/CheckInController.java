package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.checkin.CheckInResponse;
import com.koupreng.backend.dto.checkin.CheckInScanRequest;
import com.koupreng.backend.dto.checkin.CheckInSummaryResponse;
import com.koupreng.backend.dto.checkin.ManualCheckInRequest;
import com.koupreng.backend.service.CheckInService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "Check-In", description = "Invitation-owner guest check-in by QR token or manual selection.")
@SecurityRequirement(name = "bearerAuth")
public class CheckInController {

    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    @PostMapping("/invitations/{invitationId}/check-in/scan")
    public ResponseEntity<ApiResponse<CheckInResponse>> scan(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody CheckInScanRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guest check-in processed successfully",
                checkInService.scan(authentication, invitationId, request.getToken(), request.getNote())
        ));
    }

    @PostMapping("/invitations/{invitationId}/guests/{guestId}/check-in")
    public ResponseEntity<ApiResponse<CheckInResponse>> manual(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long guestId,
            @Valid @RequestBody(required = false) ManualCheckInRequest request
    ) {
        String note = request == null ? null : request.getNote();
        return ResponseEntity.ok(ApiResponse.success(
                "Guest check-in processed successfully",
                checkInService.manual(authentication, invitationId, guestId, note)
        ));
    }

    @GetMapping("/invitations/{invitationId}/check-in/summary")
    public ResponseEntity<ApiResponse<CheckInSummaryResponse>> summary(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Check-in summary fetched successfully",
                checkInService.summary(authentication, invitationId)
        ));
    }

    @GetMapping("/invitations/{invitationId}/check-in/list")
    public ResponseEntity<ApiResponse<List<CheckInResponse>>> list(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Check-in list fetched successfully",
                checkInService.list(authentication, invitationId)
        ));
    }
}
