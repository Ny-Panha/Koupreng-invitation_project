package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.guest.GuestGroupResponse;
import com.koupreng.backend.dto.guest.GuestImportFileResultResponse;
import com.koupreng.backend.dto.guest.GuestImportRequest;
import com.koupreng.backend.dto.guest.GuestRequest;
import com.koupreng.backend.dto.guest.GuestResponse;
import com.koupreng.backend.dto.guest.GuestSendListResponse;
import com.koupreng.backend.service.GuestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1/invitations/{invitationId}/guests")
@Tag(name = "Guests", description = "Invitation-owner guest records, grouping, import, search, send lists, and exports.")
@SecurityRequirement(name = "bearerAuth")
public class GuestController {

    private final GuestService guestService;

    public GuestController(GuestService guestService) {
        this.guestService = guestService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GuestResponse>> create(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody GuestRequest request
    ) {
        GuestResponse response = guestService.create(authentication, invitationId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Guest created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GuestResponse>>> list(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guests fetched successfully",
                guestService.list(authentication, invitationId)
        ));
    }

    @GetMapping("/grouped")
    public ResponseEntity<ApiResponse<List<GuestGroupResponse>>> grouped(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guests grouped successfully",
                guestService.groupedByCategory(authentication, invitationId)
        ));
    }

    @GetMapping("/send-list")
    public ResponseEntity<ApiResponse<GuestSendListResponse>> sendList(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guest send list generated successfully",
                guestService.sendList(authentication, invitationId)
        ));
    }

    @GetMapping("/{guestId}")
    public ResponseEntity<ApiResponse<GuestResponse>> get(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long guestId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guest fetched successfully",
                guestService.get(authentication, invitationId, guestId)
        ));
    }

    @PutMapping("/{guestId}")
    public ResponseEntity<ApiResponse<GuestResponse>> update(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long guestId,
            @Valid @RequestBody GuestRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guest updated successfully",
                guestService.update(authentication, invitationId, guestId, request)
        ));
    }

    @DeleteMapping("/{guestId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long guestId
    ) {
        guestService.delete(authentication, invitationId, guestId);
        return ResponseEntity.ok(ApiResponse.success("Guest deleted successfully", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<GuestResponse>>> search(
            Authentication authentication,
            @PathVariable Long invitationId,
            @RequestParam(defaultValue = "") String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guests fetched successfully",
                guestService.search(authentication, invitationId, keyword)
        ));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<List<GuestResponse>>> importGuests(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody GuestImportRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Guests imported successfully",
                        guestService.importGuests(authentication, invitationId, request)
                ));
    }

    @PostMapping(value = "/import-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<GuestImportFileResultResponse>> importGuestsFile(
            Authentication authentication,
            @PathVariable Long invitationId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Guest import file processed successfully",
                        guestService.importGuestsFile(authentication, invitationId, file)
                ));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportGuests(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"guest-report-" + invitationId + ".csv\"")
                .contentType(new MediaType("text", "csv"))
                .body(guestService.exportGuestCsv(authentication, invitationId));
    }
}
