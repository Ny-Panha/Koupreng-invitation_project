package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.delivery.DeliveryActionResponse;
import com.koupreng.backend.dto.delivery.DeliveryEventResponse;
import com.koupreng.backend.dto.delivery.DeliveryGuestResponse;
import com.koupreng.backend.dto.delivery.DeliveryRequest;
import com.koupreng.backend.dto.delivery.DeliverySummaryResponse;
import com.koupreng.backend.dto.delivery.ShareMessageResponse;
import com.koupreng.backend.service.InvitationDeliveryService;
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
@RequestMapping("/api/v1/invitations/{invitationId}/delivery")
@Tag(name = "Invitation Delivery", description = "Invitation-owner preparation, sharing, email, reminders, and delivery history.")
@SecurityRequirement(name = "bearerAuth")
public class InvitationDeliveryController {

    private final InvitationDeliveryService deliveryService;

    public InvitationDeliveryController(InvitationDeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @PostMapping("/prepare")
    public ResponseEntity<ApiResponse<DeliveryActionResponse>> prepare(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation delivery prepared successfully",
                deliveryService.prepare(authentication, invitationId)
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DeliverySummaryResponse>> summary(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Delivery summary fetched successfully",
                deliveryService.summary(authentication, invitationId)
        ));
    }

    @GetMapping("/guests/{guestId}/share-message")
    public ResponseEntity<ApiResponse<ShareMessageResponse>> shareMessage(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long guestId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Share message generated successfully",
                deliveryService.shareMessage(authentication, invitationId, guestId)
        ));
    }

    @PostMapping("/guests/{guestId}/mark-shared")
    public ResponseEntity<ApiResponse<DeliveryGuestResponse>> markShared(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long guestId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guest invitation marked as shared",
                deliveryService.markShared(authentication, invitationId, guestId)
        ));
    }

    @PostMapping("/email")
    public ResponseEntity<ApiResponse<DeliveryActionResponse>> sendEmail(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody(required = false) DeliveryRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Email delivery processed successfully",
                deliveryService.sendEmail(authentication, invitationId, request)
        ));
    }

    @PostMapping("/reminders")
    public ResponseEntity<ApiResponse<DeliveryActionResponse>> sendReminders(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody(required = false) DeliveryRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Reminder delivery processed successfully",
                deliveryService.sendReminders(authentication, invitationId, request)
        ));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<DeliveryEventResponse>>> events(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Delivery events fetched successfully",
                deliveryService.events(authentication, invitationId)
        ));
    }
}
