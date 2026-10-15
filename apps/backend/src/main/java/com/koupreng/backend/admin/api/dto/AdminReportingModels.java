package com.koupreng.backend.admin.api.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Explicit, versioned column schemas describe minimized, read-only SQL projections. */
public final class AdminReportingModels {
    private AdminReportingModels() { }
    public record Column(String key, String labelKm, String labelEn, String type) { }
    public record Definition(String code, String titleKm, String titleEn, String sheetName,
                             String defaultDateDimension, List<String> dateDimensions,
                             List<String> filters, List<Column> columns, List<String> notes) { }
    public record Metadata(String snapshotId, Instant generatedAt, String timezone,
                           LocalDate from, LocalDate to, String dateDimension,
                           Map<String, String> filters, long totalMatchingRecords,
                           String scope, String sort, String direction, String version) { }
    public record Series(String name, String dimension, List<Map<String, Object>> points) { }
    public record Catalog(List<Definition> definitions, List<Metric> metrics) { }
    public record Metric(String code, String labelKm, String labelEn, String definition,
                         String calculation, String databaseSource, String dateDimension,
                         String includedStatuses, String excludedStatuses, String denominator,
                         String currencyBehavior, String missingDataBehavior, String version) { }
}
