package com.koupreng.backend.admin.application;

import com.koupreng.backend.admin.api.dto.*;
import com.koupreng.backend.admin.api.dto.AdminReportingModels.*;
import com.koupreng.backend.shared.export.CsvExportUtils;
import java.io.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

/** Fixed styles, 100-row SXSSF window, bounded query batches and sheet continuation. */
final class AdminReportWorkbookWriter {
    private final AdminReportingService reporting;
    private final int sheetCapacity;
    AdminReportWorkbookWriter(AdminReportingService reporting) { this(reporting, 1_048_500); }
    AdminReportWorkbookWriter(AdminReportingService reporting, int sheetCapacity) { this.reporting = reporting; this.sheetCapacity = sheetCapacity; }
    long write(AdminReportExportService.Plan plan, OutputStream output) throws IOException {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100)) {
            workbook.setCompressTempFiles(true);
            var styles = new Styles(workbook);
            var definitions = plan.report().equals("all") ? AdminReportCatalog.DEFINITIONS
                : List.of(AdminReportCatalog.definition(plan.report()));
            var snapshots = new ArrayList<AdminReportResponse>();
            for (var definition : definitions) {
                var filter = worksheetFilter(plan, definition);
                var snapshot = reporting.snapshot(definition.code(), filter, plan.snapshotId()); snapshots.add(snapshot);
                if (snapshot.getTotalElements() > 100_000) throw new com.koupreng.backend.shared.exception.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST, "Export exceeds 100,000 records per report; narrow filters");
                writeData(workbook, styles, definition, filter, snapshot);
            }
            if (!plan.report().equals("all")) {
                writeSummary(workbook, styles, snapshots.getFirst());
                if (!plan.report().equals("dictionary")) {
                    var definition = AdminReportCatalog.definition("dictionary");
                    var filter = worksheetFilter(plan, definition);
                    writeData(workbook, styles, definition, filter, reporting.snapshot("dictionary", filter, plan.snapshotId()));
                }
            }
            var meta = workbook.createSheet("Metadata"); int row = 0;
            for (var snapshot : snapshots) {
                for (var values : AdminReportSnapshotWriter.metadata(plan, snapshot)) {
                    var cells = meta.createRow(row++); set(cells.createCell(0), snapshot.getReport(), "TEXT", styles);
                    set(cells.createCell(1), values.getFirst(), "TEXT", styles); set(cells.createCell(2), values.getLast(), "TEXT", styles);
                }
                for (String note : snapshot.getNotices()) {
                    var cells = meta.createRow(row++); set(cells.createCell(0), snapshot.getReport(), "TEXT", styles);
                    set(cells.createCell(1), "Note", "TEXT", styles); set(cells.createCell(2), note, "TEXT", styles);
                }
            }
            meta.setColumnWidth(0,24*256); meta.setColumnWidth(1,26*256); meta.setColumnWidth(2,90*256); meta.createFreezePane(0,1);
            workbook.setForceFormulaRecalculation(true);
            workbook.write(output);
            return snapshots.stream().mapToLong(AdminReportResponse::getTotalElements).sum();
        }
    }
    private AdminReportFilter worksheetFilter(AdminReportExportService.Plan plan, Definition definition) {
        if (!plan.report().equals("all")) return AdminReportSnapshotWriter.exportFilter(plan.filter(), definition.code());
        var query = new AdminReportQuery(); query.setFrom(plan.filter().from()); query.setTo(plan.filter().to());
        return AdminReportFilter.of(definition, query, plan.filter().asOf());
    }
    private void writeData(SXSSFWorkbook workbook, Styles styles, Definition definition, AdminReportFilter filter, AdminReportResponse snapshot) throws IOException {
        var state = new SheetState();
        state.sheet = newSheet(workbook, styles, definition, snapshot, ""); state.row = 6;
        AdminReportSnapshotWriter.eachRow(reporting, definition.code(), filter, snapshot, (values, number) -> {
            if (state.row >= sheetCapacity) {
                finish(state.sheet, definition, state.row);
                addMoneyChecks(state.sheet, styles, definition, state.row, state.money);
                state.money=emptyMoney();
                state.sheet = newSheet(workbook, styles, definition, snapshot, "_" + (++state.part)); state.row = 6;
            }
            var row = state.sheet.createRow(state.row++); row.setHeightInPoints(34);
            set(row.createCell(0), number, "NUMBER", styles);
            for (int i = 0; i < definition.columns().size(); i++) {
                var column = definition.columns().get(i);
                set(row.createCell(i+1), values.get(column.key()), column.type(), styles);
            }
            String currency=Objects.toString(values.get("currency"),"");
            if("MATCHED".equals(values.get("reconciliationOutcome")) && state.money.containsKey(currency)) {
                var amount=new BigDecimal(values.get("paidAmount").toString());
                state.money.merge(currency,amount,BigDecimal::add);
            }
        });
        finish(state.sheet, definition, state.row);
        addMoneyChecks(state.sheet, styles, definition, state.row, state.money);
    }
    private static Map<String,BigDecimal> emptyMoney() {var map=new LinkedHashMap<String,BigDecimal>();map.put("USD",BigDecimal.ZERO);map.put("KHR",BigDecimal.ZERO);return map;}
    private static final class SheetState { Sheet sheet; int row; int part = 1; Map<String,BigDecimal> money=emptyMoney(); }
    private Sheet newSheet(SXSSFWorkbook workbook, Styles styles, Definition definition, AdminReportResponse snapshot, String suffix) {
        String name = definition.sheetName(); name = name.substring(0,Math.min(name.length(),31-suffix.length())) + suffix;
        Sheet sheet = workbook.createSheet(WorkbookUtil.createSafeSheetName(name));
        int last = definition.columns().size();
        set(sheet.createRow(0).createCell(0), "KoupReng E-Invitation · " + definition.titleKm(), "TEXT", styles);
        sheet.getRow(0).getCell(0).setCellStyle(styles.title); sheet.getRow(0).setHeightInPoints(38);
        sheet.addMergedRegion(new CellRangeAddress(0,0,0,last));
        set(sheet.createRow(1).createCell(0), definition.titleEn(), "TEXT", styles); sheet.addMergedRegion(new CellRangeAddress(1,1,0,last));
        set(sheet.createRow(2).createCell(0), "Period [" + Objects.toString(snapshot.getMetadata().from(),"all time") + ", " + Objects.toString(snapshot.getMetadata().to(),"all time") + ") · " + snapshot.getMetadata().dateDimension() + " · Asia/Phnom_Penh", "TEXT", styles);
        sheet.addMergedRegion(new CellRangeAddress(2,2,0,last));
        set(sheet.createRow(3).createCell(0), "ALL FILTERED RECORDS · " + snapshot.getTotalElements() + " records · " + snapshot.getMetadata().snapshotId(), "TEXT", styles); sheet.addMergedRegion(new CellRangeAddress(3,3,0,last));
        var head = sheet.createRow(5); head.setHeightInPoints(52); var cell = head.createCell(0); cell.setCellValue("#"); cell.setCellStyle(styles.header);
        sheet.setColumnWidth(0,8*256);
        for (int i = 0; i < definition.columns().size(); i++) {
            var column = definition.columns().get(i); cell = head.createCell(i+1); cell.setCellValue(column.labelKm() + "\n" + column.labelEn()); cell.setCellStyle(styles.header);
            sheet.setColumnWidth(i+1,(List.of("NUMBER","PERCENT","MONEY").contains(column.type()) ? 17 : column.type().equals("DATETIME") ? 23 : 27)*256);
        }
        sheet.createFreezePane(2,6); sheet.setRepeatingRows(new CellRangeAddress(5,5,-1,-1));
        sheet.setRepeatingColumns(new CellRangeAddress(-1,-1,0,1));
        sheet.setFitToPage(true); var print = sheet.getPrintSetup(); print.setPaperSize(PrintSetup.A4_PAPERSIZE);
        print.setLandscape(definition.columns().size()>6); print.setFitWidth((short)(definition.columns().size()>14 ? 2 : 1)); print.setFitHeight((short)0);
        sheet.setMargin(PageMargin.LEFT,0.3); sheet.setMargin(PageMargin.RIGHT,0.3);
        sheet.getFooter().setLeft(definition.code() + " · Confidential"); sheet.getFooter().setCenter(snapshot.getMetadata().generatedAt().toString()); sheet.getFooter().setRight("Page &P / &N");
        return sheet;
    }
    private void finish(Sheet sheet, Definition definition, int nextRow) {
        int last = definition.columns().size(); sheet.setAutoFilter(new CellRangeAddress(5,Math.max(5,nextRow-1),0,last));
        var status = definition.columns().stream().filter(c -> c.key().equals("reconciliationOutcome") || c.key().equals("paymentStatus") || c.key().equals("status")).findFirst();
        if (status.isPresent() && nextRow>6) {
            int col = definition.columns().indexOf(status.get())+1; String ref = CellReference.convertNumToColString(col) + "7";
            var formatting = sheet.getSheetConditionalFormatting(); var rule = formatting.createConditionalFormattingRule("OR(" + ref + "=\"MATCHED\"," + ref + "=\"PAID\"," + ref + "=\"PUBLISHED\")");
            rule.createPatternFormatting().setFillBackgroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            formatting.addConditionalFormatting(new CellRangeAddress[]{new CellRangeAddress(6,nextRow-1,col,col)},rule);
        }
        sheet.getWorkbook().setPrintArea(sheet.getWorkbook().getSheetIndex(sheet),0,last,0,Math.max(6,nextRow-1));
    }
    private void addMoneyChecks(Sheet sheet, Styles styles, Definition definition, int nextRow, Map<String,BigDecimal> totals) {
        if (!List.of("payments","reconciliation").contains(definition.code()) || nextRow<=6) return;
        var keys = definition.columns().stream().map(Column::key).toList();
        String paid = CellReference.convertNumToColString(keys.indexOf("paidAmount")+1), currency = CellReference.convertNumToColString(keys.indexOf("currency")+1), outcome = CellReference.convertNumToColString(keys.indexOf("reconciliationOutcome")+1);
        int dataEnd = nextRow;
        for (String unit : List.of("USD","KHR")) {
            var row = sheet.createRow(nextRow++); set(row.createCell(0), "Verified " + unit + " (sheet)", "TEXT", styles);
            var cell = row.createCell(2); cell.setCellStyle(styles.money);
            cell.setCellFormula("SUMIFS(" + paid + "7:" + paid + dataEnd + "," + currency + "7:" + currency + dataEnd + ",\"" + unit + "\"," + outcome + "7:" + outcome + dataEnd + ",\"MATCHED\")");
            set(cell,totals.get(unit),"MONEY",styles);
        }
        sheet.getWorkbook().setPrintArea(sheet.getWorkbook().getSheetIndex(sheet),0,definition.columns().size(),0,nextRow-1);
    }
    private void writeSummary(SXSSFWorkbook workbook, Styles styles, AdminReportResponse snapshot) {
        var sheet = workbook.createSheet("Summary"); int index = 0;
        for (var entry : snapshot.getFilteredSummary().entrySet()) {
            if (entry.getValue() instanceof Map<?,?> map) for (var value : map.entrySet()) {
                var row = sheet.createRow(index++); set(row.createCell(0), entry.getKey(), "TEXT", styles); set(row.createCell(1),value.getKey(),"TEXT",styles);set(row.createCell(2),value.getValue(),"MONEY",styles);
            } else if (!(entry.getValue() instanceof List<?>)) {
                var row = sheet.createRow(index++); set(row.createCell(0),entry.getKey(),"TEXT",styles);set(row.createCell(1),entry.getValue(),"NUMBER",styles);
            }
        }
        sheet.setColumnWidth(0,40*256); sheet.setColumnWidth(1,30*256); sheet.setColumnWidth(2,22*256); sheet.createFreezePane(0,1);
    }
    private static void set(Cell cell, Object value, String type, Styles styles) {
        cell.setCellStyle(styles.text);
        if (value == null) { cell.setCellValue("Unavailable / មិនមានទិន្នន័យ"); return; }
        if (value instanceof Instant instant) {
            cell.setCellValue(LocalDateTime.ofInstant(instant,AdminReportFilter.ZONE)); cell.setCellStyle(styles.dateTime);
        } else if (value instanceof LocalDate date) {
            cell.setCellValue(date); cell.setCellStyle(styles.date);
        } else if (value instanceof Number number) {
            var decimal = new BigDecimal(number.toString());
            if (decimal.stripTrailingZeros().precision()>15) throw new IllegalArgumentException("Excel numeric precision exceeds 15 significant digits; use CSV");
            cell.setCellValue(decimal.doubleValue());
            cell.setCellStyle(type.equals("PERCENT") ? styles.percent : type.equals("MONEY") ? styles.money : styles.number);
        } else cell.setCellValue(CsvExportUtils.spreadsheetText(value.toString()));
    }
    private static final class Styles {
        final CellStyle text,number,money,percent,date,dateTime,header,title;
        Styles(Workbook workbook) {
            Font normal = workbook.createFont(); normal.setFontName("Kantumruy Pro"); normal.setFontHeightInPoints((short)10);
            text=workbook.createCellStyle(); text.setFont(normal); text.setWrapText(true); text.setVerticalAlignment(VerticalAlignment.TOP);
            number=copy(workbook,text,"#,##0"); money=copy(workbook,text,"#,##0.00"); percent=copy(workbook,text,"0.00%");
            date=copy(workbook,text,"yyyy-mm-dd"); dateTime=copy(workbook,text,"yyyy-mm-dd hh:mm:ss");
            header=workbook.createCellStyle();header.cloneStyleFrom(text);Font bold=workbook.createFont();bold.setFontName("Kantumruy Pro");bold.setBold(true);bold.setColor(IndexedColors.WHITE.getIndex());header.setFont(bold);header.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            title=workbook.createCellStyle();title.cloneStyleFrom(text);Font titleFont=workbook.createFont();titleFont.setFontName("Moul");titleFont.setBold(true);titleFont.setFontHeightInPoints((short)16);title.setFont(titleFont);
        }
        private static CellStyle copy(Workbook wb,CellStyle source,String format) { var style=wb.createCellStyle();style.cloneStyleFrom(source);style.setDataFormat(wb.createDataFormat().getFormat(format));style.setAlignment(HorizontalAlignment.RIGHT);return style; }
    }
}
