package com.koupreng.backend.admin.api;

import com.koupreng.backend.admin.api.dto.*;
import com.koupreng.backend.admin.application.*;
import com.koupreng.backend.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@RestController
@RequestMapping("/api/v1/admin/reports/management")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Management reporting", description = "Read-only ADMIN reports. Calendar dates use Asia/Phnom_Penh; from inclusive / to exclusive. No settlement operations.")
public class AdminReportingController {
    private final AdminReportingService reporting;
    private final AdminReportExportService exports;
    public AdminReportingController(AdminReportingService reporting, AdminReportExportService exports) { this.reporting = reporting; this.exports = exports; }

    @GetMapping("/definitions")
    @Operation(summary = "Report schemas and KPI dictionary", description = "Bilingual columns, supported filters/date dimensions, unavailable-data notices and metric definitions.")
    public ResponseEntity<ApiResponse<AdminReportingModels.Catalog>> definitions(Authentication authentication) {
        reporting.requireAdmin(authentication);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(ApiResponse.success("Report definitions", new AdminReportingModels.Catalog(AdminReportCatalog.DEFINITIONS, AdminReportCatalog.METRICS)));
    }
    @GetMapping("/{report}")
    @Operation(summary = "Filtered, sorted report page", description = "One repeatable-read snapshot for rows, totals and chart aggregates. size 1..200; sort is a schema column; a stable ID tie-breaker is appended. Monetary chart groups below five payments are suppressed. Individual ledgers are explicitly ADMIN-authorized, not public aggregates.")
    public ResponseEntity<ApiResponse<AdminReportResponse>> report(Authentication authentication, @PathVariable String report, @org.springdoc.core.annotations.ParameterObject @ModelAttribute AdminReportQuery query) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(ApiResponse.success("Management report", reporting.report(authentication, report, query)));
    }
    @GetMapping("/{report}/export/{format}")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode="200",description="Complete filtered attachment",content={
        @io.swagger.v3.oas.annotations.media.Content(mediaType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",schema=@io.swagger.v3.oas.annotations.media.Schema(type="string",format="binary")),
        @io.swagger.v3.oas.annotations.media.Content(mediaType="text/csv",schema=@io.swagger.v3.oas.annotations.media.Schema(type="string",format="binary")),
        @io.swagger.v3.oas.annotations.media.Content(mediaType="text/html",schema=@io.swagger.v3.oas.annotations.media.Schema(type="string"))})
    @Operation(summary = "Filtered CSV, current-page CSV, XLSX or print HTML", description = "csv-page explicitly exports only the requested page/size. Other formats export all matching records. Bounded batches and SXSSF spill to a temporary snapshot file, then stream it after releasing the database transaction. html is print content, not a PDF download. report=all supports XLSX and common date filters only; individual exports preserve all supported filters.")
    public ResponseEntity<StreamingResponseBody> export(Authentication authentication, @PathVariable String report, @PathVariable String format, @org.springdoc.core.annotations.ParameterObject @ModelAttribute AdminReportQuery query) {
        return download(exports, authentication, report, format, query);
    }
    static ResponseEntity<StreamingResponseBody> download(AdminReportExportService exports, Authentication authentication, String report, String format, AdminReportQuery query) {
        return download(exports,authentication,report,format,query,false);
    }
    static ResponseEntity<StreamingResponseBody> download(AdminReportExportService exports, Authentication authentication, String report, String format, AdminReportQuery query, boolean legacyCsv) {
        var plan = legacyCsv ? exports.legacyCsvPlan(authentication,report,query) : exports.plan(authentication, report, format, query);
        String contentType = switch (plan.format()) {
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "csv" -> "text/csv;charset=UTF-8";
            default -> "text/html;charset=UTF-8";
        };
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, contentType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"koupreng-" + report + (plan.currentPage() ? "-page-" + (plan.filter().page() + 1) : "") + "-" + plan.filter().asOf().atZone(AdminReportFilter.ZONE).toLocalDate() + "." + plan.format() + "\"")
            .header(HttpHeaders.CACHE_CONTROL, "no-store, private")
            .header("X-Content-Type-Options", "nosniff").header("X-Report-Snapshot-Id", plan.snapshotId())
            .body(output -> exports.stream(authentication, plan, output));
    }
}
