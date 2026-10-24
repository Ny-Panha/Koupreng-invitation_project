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
    @io.swagger.v3.oas.annotations.Operation(summary = "Inspect a CSV or XLSX guest source", description = "Owner-only, read-only parsing. Limits: 5MB upload, 20MB expanded workbook, 10 sheets, 1000 rows per sheet, 32 columns, 2000 characters per cell. Formula rows are reported without evaluation.")
    public ApiResponse<GuestImportSourceResponse> inspect(Authentication auth, @PathVariable Long invitationId, @RequestParam("file") MultipartFile file) {
        return ApiResponse.success("Import file inspected; no data saved", service.inspect(auth, invitationId, file));
    }

    @PostMapping("/preview")
    @io.swagger.v3.oas.annotations.Operation(summary = "Validate mapped guest rows", description = "No writes. Reports READY, INVALID, DUPLICATE, NAME_MATCH or SKIPPED for every source row. Group and category are free text, not enums. Existing guests are never updated.")
    public ApiResponse<GuestBatchResponse> preview(Authentication auth, @PathVariable Long invitationId, @Valid @RequestBody GuestBatchRequest request) {
        return ApiResponse.success("Import validated; no data saved", service.preview(auth, invitationId, request));
    }

    @PostMapping
    @io.swagger.v3.oas.annotations.Operation(summary = "Commit a reviewed guest batch", description = "Owner-authorized event-scoped import. All selected rows and the idempotency receipt commit in one transaction; any unresolved row or capacity failure aborts the transaction. Reusing batchId with identical rows returns the committed receipt; different content returns 409.")
    public ApiResponse<GuestBatchResponse> commit(Authentication auth, @PathVariable Long invitationId, @Valid @RequestBody GuestBatchRequest request) {
        return ApiResponse.success("Selected rows imported atomically", service.commit(auth, invitationId, request));
    }
}
