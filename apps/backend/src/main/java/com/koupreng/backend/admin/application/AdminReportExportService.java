package com.koupreng.backend.admin.application;

import com.koupreng.backend.admin.api.dto.AdminReportQuery;
import com.koupreng.backend.shared.exception.ApiException;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/** HTTP body is copied from a completed snapshot file; no full byte[] result. */
@Service
public class AdminReportExportService {
    public record Plan(String report, String format, AdminReportFilter filter, String snapshotId, boolean legacyCsv, boolean currentPage) {
        public Plan(String report, String format, AdminReportFilter filter, String snapshotId) { this(report,format,filter,snapshotId,false,false); }
        public Plan(String report, String format, AdminReportFilter filter, String snapshotId, boolean legacyCsv) { this(report,format,filter,snapshotId,legacyCsv,false); }
    }
    public record FileResult(Path path, long rowCount) implements AutoCloseable {
        public FileResult(Path path) { this(path, -1); }
        public void copyTo(OutputStream output) throws IOException { Files.copy(path, output); }
        @Override public void close() throws IOException { Files.deleteIfExists(path); }
    }
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.koupreng.backend.audit.application.AuditLogService audit;
    private final AdminReportingService reporting;
    private final AdminReportSnapshotWriter writer;
    public AdminReportExportService(AdminReportingService reporting, AdminReportSnapshotWriter writer) {
        this.reporting = reporting; this.writer = writer;
    }
    public Plan plan(Authentication auth, String report, String format, AdminReportQuery query) {
        if (!List.of("csv", "csv-page", "xlsx", "html").contains(format) || (report.equals("all") && !format.equals("xlsx")))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported report export format");
        if (report.equals("all")) {
            // Full-platform exports use one common period. Do not silently drop
            // a ledger-specific filter from unrelated worksheets.
            var filter = reporting.validate(auth, "executive", query);
            return new Plan(report, format, filter, UUID.randomUUID().toString());
        }
        return new Plan(report, format.equals("csv-page") ? "csv" : format, reporting.validate(auth, report, query), UUID.randomUUID().toString(), false, format.equals("csv-page"));
    }
    public Plan legacyCsvPlan(Authentication auth, String report, AdminReportQuery query) {
        if (!List.of("invitations","payments").contains(report)) throw new ApiException(HttpStatus.BAD_REQUEST,"Unsupported legacy CSV");
        var plan=plan(auth,report,"csv",query);
        return new Plan(report,"csv",plan.filter(),plan.snapshotId(),true);
    }
    public void stream(Authentication auth, Plan plan, OutputStream output) throws IOException {
        // Generation's transaction ends before a slow client starts consuming.
        if (audit != null) audit.logAdminAction(auth, "REPORT_EXPORT_STARTED", "REPORT", null, "Administrative export requested", null, exportMetadata(plan, -1));
        try (var file = writer.generate(auth, plan)) {
            file.copyTo(output);
            if (audit != null) audit.logAdminAction(auth, "REPORT_EXPORT_COMPLETED", "REPORT", null, "Administrative export completed", null, exportMetadata(plan, file.rowCount()));
        } catch (IOException | RuntimeException failure) {
            if (audit != null) audit.logAdminAction(auth, "REPORT_EXPORT_FAILED", "REPORT", null, "Administrative export failed", null, exportMetadata(plan, -1));
            throw failure;
        }
    }
    private Map<String,Object> exportMetadata(Plan plan, long rows) {
        return Map.of("report",plan.report(),"format",plan.format(),"snapshotId",plan.snapshotId(),
            "from",Objects.toString(plan.filter().from(),"ALL"),"to",Objects.toString(plan.filter().to(),"ALL"),
            "filterKeys",plan.filter().filters().keySet(),"rows",rows,"scope",plan.currentPage() ? "CURRENT_PAGE" : "ALL_FILTERED_RECORDS",
            "page",plan.filter().page(),"size",plan.filter().size());
    }
}
