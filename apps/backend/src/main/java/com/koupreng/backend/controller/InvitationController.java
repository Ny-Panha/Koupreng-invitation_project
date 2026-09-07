package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.invitation.InvitationCustomizationRequest;
import com.koupreng.backend.dto.invitation.InvitationCustomizationResponse;
import com.koupreng.backend.dto.invitation.InvitationAccessVerifyRequest;
import com.koupreng.backend.dto.invitation.InvitationAccessVerifyResponse;
import com.koupreng.backend.dto.invitation.InvitationRequest;
import com.koupreng.backend.dto.invitation.InvitationResponse;
import com.koupreng.backend.dto.invitation.InvitationSummaryResponse;
import com.koupreng.backend.dto.invitation.PublicInvitationResponse;
import com.koupreng.backend.enums.InvitationStatus;
import com.koupreng.backend.service.InvitationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "Invitations", description = "Invitation-owner lifecycle and public published-invitation access.")
@SecurityRequirement(name = "bearerAuth")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/invitations")
    public ResponseEntity<ApiResponse<InvitationResponse>> create(
            Authentication authentication,
            @Valid @RequestBody InvitationRequest request
    ) {
        InvitationResponse response = invitationService.create(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invitation created successfully", response));
    }

    @GetMapping("/invitations/my")
    public ResponseEntity<ApiResponse<List<InvitationSummaryResponse>>> myInvitations(
            Authentication authentication,
            @RequestParam(required = false) InvitationStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitations fetched successfully",
                invitationService.listMine(authentication, status)
        ));
    }

    @GetMapping("/invitations/my/status/{status}")
    public ResponseEntity<ApiResponse<List<InvitationSummaryResponse>>> myInvitationsByStatus(
            Authentication authentication,
            @PathVariable InvitationStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitations fetched successfully",
                invitationService.listMine(authentication, status)
        ));
    }

    @GetMapping("/invitations/{id}")
    public ResponseEntity<ApiResponse<InvitationResponse>> get(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation fetched successfully",
                invitationService.get(authentication, id)
        ));
    }

    @PutMapping("/invitations/{id}")
    public ResponseEntity<ApiResponse<InvitationResponse>> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody InvitationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation updated successfully",
                invitationService.update(authentication, id, request)
        ));
    }

    @DeleteMapping("/invitations/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication authentication,
            @PathVariable Long id
    ) {
        invitationService.delete(authentication, id);
        return ResponseEntity.ok(ApiResponse.success("Invitation deleted successfully", null));
    }

    @PatchMapping("/invitations/{id}/draft")
    public ResponseEntity<ApiResponse<InvitationResponse>> saveAsDraft(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation saved as draft",
                invitationService.saveAsDraft(authentication, id)
        ));
    }

    @PatchMapping("/invitations/{id}/publish")
    public ResponseEntity<ApiResponse<InvitationResponse>> publish(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation published successfully",
                invitationService.publish(authentication, id)
        ));
    }

    @PatchMapping("/invitations/{id}/unpublish")
    public ResponseEntity<ApiResponse<InvitationResponse>> unpublish(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation unpublished successfully",
                invitationService.unpublish(authentication, id)
        ));
    }

    @GetMapping("/invitations/{id}/preview")
    public ResponseEntity<ApiResponse<InvitationResponse>> preview(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation preview loaded",
                invitationService.preview(authentication, id)
        ));
    }

    @GetMapping("/invitations/{id}/customization")
    public ResponseEntity<ApiResponse<InvitationCustomizationResponse>> getCustomization(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation customization loaded",
                invitationService.getCustomization(authentication, id)
        ));
    }

    @PutMapping("/invitations/{id}/customization")
    public ResponseEntity<ApiResponse<InvitationCustomizationResponse>> updateCustomization(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody InvitationCustomizationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation customization saved",
                invitationService.updateCustomization(authentication, id, request)
        ));
    }

    @Operation(summary = "Retrieve a public invitation",
            description = "Return a published invitation after applying its visibility and access-token rules.")
    @GetMapping("/public/invitations/{slug}")
    public ResponseEntity<ApiResponse<PublicInvitationResponse>> publicInvitation(
            @PathVariable String slug,
            @RequestParam(required = false) String accessToken,
            @RequestParam(required = false, name = "token") String inviteToken
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation fetched successfully",
                invitationService.publicBySlug(slug, accessToken, inviteToken)
        ));
    }

    @Operation(summary = "Retrieve a personalized guest invitation",
            description = "Return the safe personalized invitation view for an opaque guest invite token.")
    @GetMapping("/public/invitations/{slug}/guest-view")
    public ResponseEntity<ApiResponse<com.koupreng.backend.dto.invitation.GuestInvitationViewResponse>> publicGuestInvitationView(
            @PathVariable String slug,
            @RequestParam(required = false, name = "token") String inviteToken
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Personalized guest invitation fetched successfully",
                invitationService.guestView(slug, inviteToken)
        ));
    }

    @Operation(summary = "Verify public invitation access",
            description = "Validate a passcode or invitation token without exposing stored access credentials.")
    @PostMapping("/public/invitations/{slug}/access/verify")
    public ResponseEntity<ApiResponse<InvitationAccessVerifyResponse>> verifyPublicAccess(
            @PathVariable String slug,
            @Valid @RequestBody InvitationAccessVerifyRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation access verified successfully",
                invitationService.verifyPublicAccess(slug, request)
        ));
    }
}
