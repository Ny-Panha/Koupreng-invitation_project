package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.qr.QrCodeResponse;
import com.koupreng.backend.service.QrCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "QR Codes", description = "Invitation-owner invitation and personalized guest QR payload generation.")
@SecurityRequirement(name = "bearerAuth")
public class QrCodeController {

    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping("/invitations/{invitationId}/qr")
    public ResponseEntity<ApiResponse<QrCodeResponse>> invitationQr(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation QR generated successfully",
                qrCodeService.invitationQr(authentication, invitationId)
        ));
    }

    @GetMapping("/invitations/{invitationId}/guests/{guestId}/qr")
    public ResponseEntity<ApiResponse<QrCodeResponse>> guestQr(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long guestId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guest QR generated successfully",
                qrCodeService.guestQr(authentication, invitationId, guestId)
        ));
    }
}
