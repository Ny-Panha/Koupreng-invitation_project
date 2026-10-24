package com.koupreng.backend.admin.application;

import com.koupreng.backend.admin.api.dto.*;
import com.koupreng.backend.admin.api.dto.AdminReportingModels.*;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.export.CsvExportUtils;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@Service
public class AdminReportSnapshotWriter {
    private final AdminReportingService reporting;
    public AdminReportSnapshotWriter(AdminReportingService reporting) { this.reporting = reporting; }
    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public AdminReportExportService.FileResult generate(Authentication auth, AdminReportExportService.Plan plan) throws IOException {
        reporting.requireAdmin(auth);
        Path path = Files.createTempFile("koupreng-report-", "." + plan.format());
        boolean complete = false;
        long rowCount = 0;
        try {
            if (plan.format().equals("xlsx")) {
                try (OutputStream output = Files.newOutputStream(path)) { rowCount = new AdminReportWorkbookWriter(reporting).write(plan, output); }
            } else {
                var snapshot = reporting.snapshot(plan.report(), plan.currentPage() ? plan.filter() : exportFilter(plan.filter(), plan.report()), plan.snapshotId());
                rowCount = plan.currentPage() ? snapshot.getRows().size() : snapshot.getTotalElements();
                if (rowCount > 100_000) throw new ApiException(HttpStatus.BAD_REQUEST, "Export exceeds 100,000 records; narrow the filters");
                if (plan.format().equals("html") && snapshot.getTotalElements() > 20_000)
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Print preview exceeds 20,000 records; narrow filters or use complete XLSX/CSV export");
                try (Writer output = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
                    if (plan.legacyCsv()) legacyCsv(output,plan,snapshot);
                    else if (plan.format().equals("csv")) csv(output, plan, snapshot);
                    else html(output, plan, snapshot);
                }
            }
            complete = true; return new AdminReportExportService.FileResult(path, rowCount);
        } finally { if (!complete) Files.deleteIfExists(path); }
    }
    public static AdminReportFilter exportFilter(AdminReportFilter source, String code) {
        var definition = AdminReportCatalog.definition(code);
        String dimension = code.equals("executive") || !definition.dateDimensions().contains(source.dimension()) ? definition.defaultDateDimension() : source.dimension();
        return new AdminReportFilter(source.from(), source.to(), dimension, source.filters().entrySet().stream().filter(e -> definition.filters().contains(e.getKey())).collect(java.util.stream.Collectors.toMap(Map.Entry::getKey,Map.Entry::getValue)), definition.columns().stream().anyMatch(c -> c.key().equals(source.sort())) ? source.sort() : "id", source.direction(), 0, 200, source.asOf());
    }
    @FunctionalInterface public interface RowWriter { void accept(Map<String,Object> row, long number) throws IOException; }
    static void eachRow(AdminReportingService reporting, String code, AdminReportFilter filter, AdminReportResponse snapshot, RowWriter consumer) throws IOException {
        long written = 0;
        List<?> batch = snapshot.getRows();
        while (written < snapshot.getTotalElements()) {
            if (batch.isEmpty()) throw new IOException("Reporting snapshot row count changed unexpectedly");
            for (Object value : batch) {
                @SuppressWarnings("unchecked") Map<String,Object> row = (Map<String,Object>) value;
                consumer.accept(row, ++written);
            }
            if (written < snapshot.getTotalElements()) batch = reporting.exportRows(code, filter, written, 200);
        }
        if (written != snapshot.getTotalElements()) throw new IOException("Reporting snapshot count mismatch");
    }
    static List<List<Object>> metadata(AdminReportExportService.Plan plan, AdminReportResponse snapshot) {
        var definition = snapshot.getDefinition(); var filter = plan.filter();
        return List.of(
            List.of("Brand", "KoupReng E-Invitation"), List.of("Report", definition.code()),
            List.of("Khmer title", definition.titleKm()), List.of("English title", definition.titleEn()),
            List.of("From (inclusive)", Objects.toString(filter.from(), "All time")), List.of("To (exclusive)", Objects.toString(filter.to(), "All time")),
            List.of("Date dimension", snapshot.getMetadata().dateDimension()), List.of("Timezone", AdminReportFilter.ZONE.getId()),
            List.of("Generated at", filter.asOf().atZone(AdminReportFilter.ZONE).toString()), List.of("Snapshot ID", plan.snapshotId()),
            List.of("Scope", plan.currentPage() ? "CURRENT PAGE " + (filter.page() + 1) : "ALL FILTERED RECORDS"), List.of("Matching records", snapshot.getTotalElements()),
            List.of("Applied filters", snapshot.getMetadata().filters().toString()), List.of("Sort", snapshot.getMetadata().sort() + " " + snapshot.getMetadata().direction()), List.of("Units", "Counts / fractions; USD and KHR separate"),
            List.of("Classification", "Confidential — authorized administrative use"), List.of("Source", "System-generated persisted projections"),
            List.of("Version", AdminReportCatalog.VERSION));
    }
    private void csv(Writer output, AdminReportExportService.Plan plan, AdminReportResponse snapshot) throws IOException {
        output.write('\uFEFF');
        var headers = new ArrayList<Object>(); headers.add("Row"); snapshot.getDefinition().columns().forEach(c -> headers.add(c.key()));
        output.write(CsvExportUtils.row(headers.toArray()) + "\r\n");
        RowWriter writeRow = (row, index) -> {
            var values = new ArrayList<Object>(); values.add(index);
            for (var column : snapshot.getDefinition().columns()) values.add(display(row.get(column.key())));
            output.write(CsvExportUtils.row(values.toArray()) + "\r\n");
        };
        if (plan.currentPage()) {
            long index = (long) plan.filter().page() * plan.filter().size();
            for (Object value : snapshot.getRows()) {
                @SuppressWarnings("unchecked") var row = (Map<String,Object>) value;
                writeRow.accept(row, ++index);
            }
        } else eachRow(reporting, plan.report(), exportFilter(plan.filter(), plan.report()), snapshot, writeRow);
    }
    private void legacyCsv(Writer output, AdminReportExportService.Plan plan, AdminReportResponse snapshot) throws IOException {
        output.write('\uFEFF');boolean invitations=plan.report().equals("invitations");
        output.write(invitations ? CsvExportUtils.row("ID","Title","Slug","EventType","Status","ModerationStatus","Owner","EventDate","Venue","CreatedAt","PublishedAt")
            : CsvExportUtils.row("Reference","Type","PackageName","Amount","Currency","Status","Provider","CreatedAt"));
        output.write("\r\n");
        var filter=exportFilter(plan.filter(),plan.report());long written=0;
        while(written<snapshot.getTotalElements()) {
            var batch=reporting.legacyExportRows(plan.report(),filter,written,200);
            if(batch.isEmpty()) throw new IOException("Legacy export snapshot count mismatch");
            for(var row:batch) {
                Object[] values=invitations ? new Object[]{row.get("id"),row.get("title"),row.get("slug"),row.get("eventType"),row.get("status"),row.get("moderationStatus"),row.get("ownerName"),row.get("eventDate"),row.get("venueName"),row.get("createdAt"),row.get("publishedAt")}
                    : new Object[]{row.get("orderCode"),row.get("productType"),row.get("legacyPackageName"),"PAID".equals(row.get("paymentStatus")) ? ("MATCHED".equals(row.get("reconciliationOutcome")) ? row.get("paidAmount") : null) : row.get("expectedAmount"),row.get("currency"),row.get("paymentStatus"),row.get("provider"),row.get("createdAt")};
                output.write(CsvExportUtils.row(values)+"\r\n");written++;
            }
        }
        if(written!=snapshot.getTotalElements()) throw new IOException("Legacy export snapshot count mismatch");
    }
    static String display(Object value) {
        if (value == null) return "";
        if (value instanceof Instant instant) return DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss XXX").format(instant.atZone(AdminReportFilter.ZONE));
        return value.toString();
    }
    static String escape(Object value) {
        return display(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }
    private void html(Writer output, AdminReportExportService.Plan plan, AdminReportResponse snapshot) throws IOException {
        var definition = snapshot.getDefinition();
        output.write("<!doctype html><html lang=\"km\"><head><meta charset=\"utf-8\"><title>" + escape(definition.titleEn()) + "</title><style>");
        output.write("""
          @font-face{font-family:ReportKhmer;src:url('/fonts/reports/KantumruyPro-Regular.ttf') format('truetype');font-weight:400;font-display:block}
          @font-face{font-family:ReportKhmer;src:url('/fonts/reports/KantumruyPro-Bold.ttf') format('truetype');font-weight:700;font-display:block}
          @font-face{font-family:ReportTitle;src:url('/fonts/reports/Moul-Regular.woff2') format('woff2');font-display:swap}
          @page{size:A4 landscape;margin:14mm 10mm 17mm;@bottom-left{content:'KoupReng · Confidential';font-size:8pt}@bottom-right{content:counter(page) ' / ' counter(pages);font-size:8pt}}
          *{box-sizing:border-box}body{margin:0;background:white;color:#17241e;font:10pt/1.6 ReportKhmer,'Times New Roman',serif}
          header{border-bottom:2px solid #9c7637;padding-bottom:10px}h1{font:16pt/1.9 ReportTitle,ReportKhmer,serif;margin:8px 0}h2{font-size:13pt;margin:8px 0;break-after:avoid}
          .brand{font-weight:700;color:#77572c}dl{display:grid;grid-template-columns:35% 65%;font-size:9pt;margin:8px 0}dt,dd{margin:0;padding:2px;overflow-wrap:anywhere}
          table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:9pt;margin:12px 0}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}
          th,td{border:1px solid #bdc7c2;padding:5px;vertical-align:top;overflow-wrap:anywhere;white-space:normal}th{background:#eaf0eb;color:#213d30;text-align:left;font-weight:bold}
          .number{text-align:right;font-variant-numeric:tabular-nums}.note{font-size:9pt;color:#42554b}.band{break-before:page}.summary{background:#f6f3eb;padding:10px}
          dl.metadata{grid-template-columns:18% 32% 18% 32%;font-size:8pt;line-height:1.5}.summary{break-inside:avoid}h2{break-after:avoid}
          footer{border-top:1px solid #a9b8af;margin-top:14px;padding-top:6px;font-size:8pt}svg{max-width:100%;height:auto}img{max-width:100%}
          """);
        output.write("</style></head><body><header><p class=\"brand\">KoupReng E-Invitation · System-generated report</p><h1>" + escape(definition.titleKm()) + "</h1><h2>" + escape(definition.titleEn()) + "</h2></header><dl class=\"metadata\">");
        for (var row : metadata(plan, snapshot)) output.write("<dt>" + escape(row.getFirst()) + "</dt><dd>" + escape(row.getLast()) + "</dd>");
        output.write("</dl><section class=\"summary\"><h2>Summary / សង្ខេប</h2>");
        writeSummaryHtml(output, snapshot.getFilteredSummary());
        output.write("</section>");
        for (var series : snapshot.getSeries()) {
            writeCountChart(output, series.name(), series.points());
            output.write("<h2>" + escape(series.name()) + " · " + escape(series.dimension()) + "</h2><table><thead><tr><th>Period</th><th>Count</th><th>Currency</th><th>Amount</th></tr></thead><tbody>");
            for (var point : series.points()) output.write("<tr><td>" + escape(point.get("period")) + "</td><td>" + escape(point.get("count")) + "</td><td>" + escape(point.get("currency")) + "</td><td>" + (Boolean.TRUE.equals(point.get("suppressed")) ? "Suppressed (&lt;5 payments)" : escape(point.get("amount"))) + "</td></tr>");
            output.write("</tbody></table>");
        }
        for (String key : List.of("eventCategoryBreakdown","categories","topUsage","topPurchases","accountStatuses","activeStates","outcomes","statuses")) {
            Object values = snapshot.getFilteredSummary().get(key);
            if (values instanceof List<?> list) {
                var points = new ArrayList<Map<String,Object>>();
                for (Object value : list) if (value instanceof Map<?,?> entry) points.add(Map.of("label",Objects.toString(entry.get("category"),Objects.toString(entry.get("label"),"Unavailable")),"count",entry.containsKey("total") ? entry.get("total") : entry.get("count")));
                writeCountChart(output,key,points);
            }
        }
        // Keep wide reports readable: repeat identifiers across column bands
        // instead of scaling twenty columns into tiny landscape print text.
        var columns = definition.columns(); int bandSize = 7;
        for (int start = 0, band = 0; start < columns.size(); start += bandSize, band++) {
            var selected = new ArrayList<Column>();
            if (start > 0) selected.add(columns.getFirst());
            selected.addAll(columns.subList(start, Math.min(start + bandSize, columns.size())));
            output.write("<section" + (band > 0 ? " class=\"band\"" : "") + "><h2>" + escape(definition.titleEn()) + " · Column group " + (band + 1) + "</h2><table><thead><tr><th style=\"width:7%\">#</th>");
            for (var column : selected) output.write("<th>" + escape(column.labelKm()) + "<br>" + escape(column.labelEn()) + "</th>");
            output.write("</tr></thead><tbody>");
            eachRow(reporting, plan.report(), exportFilter(plan.filter(), plan.report()), snapshot, (row, number) -> {
                output.write("<tr><td>" + number + "</td>");
                for (var column : selected) output.write("<td" + (List.of("NUMBER", "MONEY", "PERCENT").contains(column.type()) ? " class=\"number\"" : "") + ">" + (row.get(column.key()) == null ? "—" : escape(column.type().equals("PERCENT") ? new java.math.BigDecimal(row.get(column.key()).toString()).multiply(java.math.BigDecimal.valueOf(100)).setScale(2,java.math.RoundingMode.HALF_UP).stripTrailingZeros().toPlainString() + "%" : row.get(column.key()))) + "</td>");
                output.write("</tr>");
            });
            if (snapshot.getTotalElements() == 0) output.write("<tr><td colspan=\"" + (selected.size() + 1) + "\">No matching records / មិនមានទិន្នន័យ</td></tr>");
            output.write("</tbody></table></section>");
        }
        for (String note : snapshot.getNotices()) output.write("<p class=\"note\">" + escape(note) + "</p>");
        output.write("<footer>" + escape(definition.code()) + " · " + escape(plan.filter().asOf()) + " · " + escape(plan.snapshotId()) + "<br>Confidential — Internal administrative use. No signature or approval is implied.</footer></body></html>");
    }
    private void writeCountChart(Writer output, String title, List<Map<String,Object>> points) throws IOException {
        if (points.isEmpty()) return;
        double maximum=points.stream().mapToDouble(point -> ((Number)point.get("count")).doubleValue()).max().orElse(1);
        maximum=Math.max(1,maximum);
        // Twelve bars per figure keeps charts within an A4 page; every point is retained.
        for (int start=0;start<points.size();start+=12) {
            var selected=points.subList(start,Math.min(start+12,points.size()));
            output.write("<h2>"+escape(title)+" · Count</h2><svg role=\"img\" aria-label=\""+escape(title)+"\" viewBox=\"0 0 700 "+(35+selected.size()*28)+"\" style=\"break-inside:avoid\"><title>"+escape(title)+" — persisted record counts</title>");
            for(int i=0;i<selected.size();i++) {
                var point=selected.get(i);int y=15+i*28;
                String label=Objects.toString(point.get("period"),Objects.toString(point.get("label"),"Unavailable"))+" "+Objects.toString(point.get("currency"),"");
                double count=((Number)point.get("count")).doubleValue();
                output.write("<text x=\"0\" y=\""+(y+14)+"\" font-size=\"11\">"+escape(label)+"</text><rect x=\"240\" y=\""+y+"\" width=\""+(380*count/maximum)+"\" height=\"18\" fill=\"#92703b\"/><text x=\"635\" y=\""+(y+14)+"\" font-size=\"11\">"+escape(point.get("count"))+"</text>");
            }
            output.write("</svg>");
        }
    }
    private void writeSummaryHtml(Writer output, Map<String,Object> summary) throws IOException {
        output.write("<dl>");
        for (var item : summary.entrySet()) {
            if (item.getValue() instanceof Map<?,?> map) for (var value : map.entrySet()) output.write("<dt>" + escape(summaryLabel(item.getKey())) + " / " + escape(value.getKey()) + "</dt><dd>" + escape(value.getValue()) + "</dd>");
            else if (!(item.getValue() instanceof List<?>)) {
                Object value=item.getValue();
                if(value instanceof Number && (item.getKey().endsWith("Rate") || item.getKey().equals("periodGrowth"))) value=new java.math.BigDecimal(value.toString()).multiply(java.math.BigDecimal.valueOf(100)).setScale(2,java.math.RoundingMode.HALF_UP).stripTrailingZeros().toPlainString()+"%";
                output.write("<dt>" + escape(summaryLabel(item.getKey())) + "</dt><dd>" + (value == null ? "Unavailable / មិនមានទិន្នន័យ" : escape(value)) + "</dd>");
            }
        }
        output.write("</dl>");
    }
    private String summaryLabel(String key) {
        String code=key.replace("ByCurrency","");if(code.equals("pendingValue")) code="pendingOrderValue";
        final String metricCode=code;
        return AdminReportCatalog.METRICS.stream().filter(metric -> metric.code().equals(metricCode)).findFirst().map(Metric::labelEn)
            .orElse(key.replaceAll("([a-z])([A-Z])","$1 $2"));
    }
}
