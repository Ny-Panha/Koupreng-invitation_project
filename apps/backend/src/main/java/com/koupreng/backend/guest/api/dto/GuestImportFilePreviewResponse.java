package com.koupreng.backend.guest.api.dto;

import java.util.List;

/** Advisory parsing result; no guests or invitation capabilities have been created. */
public record GuestImportFilePreviewResponse(
        int acceptedCount,
        int skippedCount,
        List<GuestImportErrorResponse> errorRows,
        List<ValidRow> validRows
) {
    public GuestImportFilePreviewResponse {
        errorRows = List.copyOf(errorRows);
        validRows = List.copyOf(validRows);
    }

    public record ValidRow(int rowNumber, GuestRequest guest) { }
}
