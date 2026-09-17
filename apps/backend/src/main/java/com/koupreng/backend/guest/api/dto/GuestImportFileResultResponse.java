package com.koupreng.backend.guest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestImportFileResultResponse {

    private int importedCount;
    private int skippedCount;
    private List<GuestImportErrorResponse> errorRows;
    private List<GuestResponse> guests;
}
