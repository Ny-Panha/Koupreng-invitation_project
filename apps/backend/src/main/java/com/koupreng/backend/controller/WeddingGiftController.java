package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.gift.WeddingGiftRequest;
import com.koupreng.backend.dto.gift.WeddingGiftResponse;
import com.koupreng.backend.service.WeddingGiftService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1/invitations/{invitationId}/gifts")
@Tag(name = "Wedding Gifts", description = "Invitation-owner wedding gift records and contribution amounts.")
@SecurityRequirement(name = "bearerAuth")
public class WeddingGiftController {

    private final WeddingGiftService weddingGiftService;

    public WeddingGiftController(WeddingGiftService weddingGiftService) {
        this.weddingGiftService = weddingGiftService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WeddingGiftResponse>>> list(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Wedding gifts fetched successfully",
                weddingGiftService.list(authentication, invitationId)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WeddingGiftResponse>> create(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody WeddingGiftRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Wedding gift created successfully",
                        weddingGiftService.create(authentication, invitationId, request)
                ));
    }

    @PutMapping("/{giftId}")
    public ResponseEntity<ApiResponse<WeddingGiftResponse>> update(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long giftId,
            @Valid @RequestBody WeddingGiftRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Wedding gift updated successfully",
                weddingGiftService.update(authentication, invitationId, giftId, request)
        ));
    }

    @DeleteMapping("/{giftId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long giftId
    ) {
        weddingGiftService.delete(authentication, invitationId, giftId);
        return ResponseEntity.ok(ApiResponse.success("Wedding gift deleted successfully", null));
    }
}
