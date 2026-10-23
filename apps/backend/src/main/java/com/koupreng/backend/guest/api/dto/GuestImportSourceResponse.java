package com.koupreng.backend.guest.api.dto;

import java.util.List;

public record GuestImportSourceResponse(List<Worksheet> worksheets) {
    public record Worksheet(String name, List<String> headers, List<SourceRow> rows) {}
    public record SourceRow(int rowNumber, List<String> values, List<String> issues) {}
}
