package com.koupreng.backend.controller;

import com.koupreng.backend.common.ApiErrorResponse;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.rsvp.RsvpRequest;
import com.koupreng.backend.dto.rsvp.RsvpResponse;
import com.koupreng.backend.dto.rsvp.RsvpSummaryResponse;
import com.koupreng.backend.dto.rsvp.RsvpUpdateRequest;
import com.koupreng.backend.dto.rsvp.WishResponse;
import com.koupreng.backend.service.RsvpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "RSVP", description = "Rate-limited public RSVP submission and invitation-owner RSVP management.")
@SecurityRequirement(name = "bearerAuth")
public class RsvpController {

    private final RsvpService rsvpService;

    public RsvpController(RsvpService rsvpService) {
        this.rsvpService = rsvpService;
    }

    @Operation(summary = "Submit a public RSVP",
            description = "Create or update a public RSVP after invitation access and deadline validation.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "RSVP accepted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid RSVP or closed deadline",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "429", description = "Public RSVP rate limit exceeded",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    @PostMapping("/public/invitations/{slug}/rsvp")
    public ResponseEntity<ApiResponse<RsvpResponse>> publicRsvp(
            @PathVariable String slug,
            @RequestParam(required = false) String accessToken,
            @Valid @RequestBody RsvpRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "RSVP submitted successfully",
                        rsvpService.submitPublic(slug, accessToken, request)
                ));
    }

    @Operation(summary = "Submit a personalized guest RSVP",
            description = "Create or update the RSVP associated with an opaque guest invitation token.")
    @PostMapping("/public/invitations/{slug}/guests/{inviteToken}/rsvp")
    public ResponseEntity<ApiResponse<RsvpResponse>> publicTokenRsvp(
            @PathVariable String slug,
            @PathVariable String inviteToken,
            @Valid @RequestBody RsvpRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "RSVP submitted successfully",
                        rsvpService.submitPublicWithToken(slug, inviteToken, request)
                ));
    }

    @Operation(summary = "Get the public RSVP summary")
    @GetMapping("/public/invitations/{slug}/rsvp-summary-public")
    public ResponseEntity<ApiResponse<RsvpSummaryResponse>> publicSummary(
            @PathVariable String slug,
            @RequestParam(required = false) String accessToken,
            @RequestParam(required = false, name = "token") String inviteToken
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Public RSVP summary fetched successfully",
                rsvpService.publicSummary(slug, accessToken, inviteToken)
        ));
    }

    @Operation(summary = "List public guest wishes",
            description = "Return approved wishes for an accessible published invitation.")
    @GetMapping("/public/invitations/{slug}/wishes")
    public ResponseEntity<ApiResponse<List<WishResponse>>> publicWishes(
            @PathVariable String slug,
            @RequestParam(required = false) String accessToken,
            @RequestParam(required = false, name = "token") String inviteToken
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Wishes fetched successfully",
                rsvpService.publicWishes(slug, accessToken, inviteToken)
        ));
    }

    @GetMapping("/invitations/{invitationId}/rsvps")
    public ResponseEntity<ApiResponse<List<RsvpResponse>>> list(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "RSVPs fetched successfully",
                rsvpService.list(authentication, invitationId)
        ));
    }

    @GetMapping("/invitations/{invitationId}/rsvps/summary")
    public ResponseEntity<ApiResponse<RsvpSummaryResponse>> summary(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "RSVP summary fetched successfully",
                rsvpService.summary(authentication, invitationId)
        ));
    }

    @PatchMapping("/invitations/{invitationId}/rsvps/{rsvpId}")
    public ResponseEntity<ApiResponse<RsvpResponse>> update(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long rsvpId,
            @Valid @RequestBody RsvpUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "RSVP updated successfully",
                rsvpService.update(authentication, invitationId, rsvpId, request)
        ));
    }

    @DeleteMapping("/invitations/{invitationId}/rsvps/{rsvpId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long rsvpId
    ) {
        rsvpService.delete(authentication, invitationId, rsvpId);
        return ResponseEntity.ok(ApiResponse.success("RSVP deleted successfully", null));
    }

    @GetMapping("/invitations/{invitationId}/wishes")
    public ResponseEntity<ApiResponse<List<WishResponse>>> wishes(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Wishes fetched successfully",
                rsvpService.wishes(authentication, invitationId)
        ));
    }
}
