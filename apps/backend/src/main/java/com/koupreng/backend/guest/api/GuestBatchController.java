package com.koupreng.backend.guest.api;

import com.koupreng.backend.guest.api.dto.*;
import com.koupreng.backend.guest.application.GuestBatchService;
import com.koupreng.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/v1/invitations/{invitationId}/guests/import-batch")
public class GuestBatchController {
    private final GuestBatchService service;

    @PostMapping(value = "/inspect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<GuestImportSourceResponse> inspect(Authentication auth, @PathVariable Long invitationId, @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("Import file inspected; no data saved", service.inspect(auth, invitationId, file));
    }

    @PostMapping("/preview")
    public ApiResponse<GuestBatchResponse> preview(Authentication auth, @PathVariable Long invitationId, @Valid @RequestBody GuestBatchRequest request) {
        return ApiResponse.success("Import validated; no data saved", service.preview(auth, invitationId, request));
    }

    @PostMapping
    public ApiResponse<GuestBatchResponse> commit(Authentication auth, @PathVariable Long invitationId, @Valid @RequestBody GuestBatchRequest request) {
        return ApiResponse.success("Selected rows imported atomically", service.commit(auth, invitationId, request));
    }
}
