package com.koupreng.backend.guest.api.dto;

import java.util.List;
import java.util.UUID;

public record GuestBatchResponse(UUID batchId, int importedCount, int updatedCount, int skippedCount,
                                 int failedCount, boolean committed, List<RowResult> rows) {
    public record RowResult(int rowNumber, String status, List<String> issues) {}
}
