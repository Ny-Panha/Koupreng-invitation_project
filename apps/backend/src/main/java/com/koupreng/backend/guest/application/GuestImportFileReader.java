package com.koupreng.backend.guest.application;

import com.koupreng.backend.guest.api.dto.GuestImportSourceResponse;
import com.koupreng.backend.guest.api.dto.GuestImportSourceResponse.SourceRow;
import com.koupreng.backend.guest.api.dto.GuestImportSourceResponse.Worksheet;
import com.koupreng.backend.shared.exception.ApiException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.zip.ZipInputStream;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/** Bounded, read-only parsing shared by inspection and the legacy file import. */
@Component
public class GuestImportFileReader {
    public static final int MAX_ROWS = 1000, MAX_COLUMNS = 32, MAX_CELL_LENGTH = 2000;
    private static final long MAX_BYTES = 5L * 1024 * 1024, MAX_EXPANDED_BYTES = 20L * 1024 * 1024;

    public GuestImportSourceResponse read(MultipartFile file) {
        if (file == null || file.isEmpty()) fail("Choose a nonempty CSV or XLSX file");
        if (file.getSize() > MAX_BYTES) fail("Guest import file must be 5MB or smaller");
        String name = String.valueOf(file.getOriginalFilename()).toLowerCase(Locale.ROOT);
        try {
            if (name.endsWith(".csv")) return csv(new String(file.getBytes(), StandardCharsets.UTF_8));
            if (name.endsWith(".xlsx")) return xlsx(file);
            fail("Only CSV and XLSX are supported; macro-enabled workbooks are not allowed");
        } catch (ApiException failure) { throw failure; }
        catch (Exception failure) { fail("Import file is malformed or exceeds safe workbook limits"); }
        throw new IllegalStateException();
    }

    private GuestImportSourceResponse csv(String input) {
        String text = input.startsWith("\uFEFF") ? input.substring(1) : input;
        List<List<String>> records = new ArrayList<>();
        int unclosedRecord = -1;
        List<String> values = new ArrayList<>();
        StringBuilder value = new StringBuilder();
        boolean quoted = false, closed = false;
        for (int i = 0; i <= text.length(); i++) {
            char c = i == text.length() ? '\n' : text.charAt(i);
            if (quoted) {
                if (i == text.length()) {
                    values.add(value.toString()); records.add(values);
                    unclosedRecord = records.size(); break;
                }
                if (c == '"') {
                    if (i + 1 < text.length() && text.charAt(i + 1) == '"') { value.append('"'); i++; }
                    else { quoted = false; closed = true; }
                } else value.append(c);
            } else if (c == '"') {
                if (value.length() > 0 || closed) fail("Unexpected quote at record " + (records.size() + 1));
                quoted = true;
            } else if (c == ',' || c == '\r' || c == '\n') {
                values.add(value.toString()); value.setLength(0); closed = false;
                if (values.size() > MAX_COLUMNS) fail("At most 32 source columns are supported");
                if (c != ',') {
                    if (c == '\r' && i + 1 < text.length() && text.charAt(i + 1) == '\n') i++;
                    records.add(values); values = new ArrayList<>();
                    if (records.size() > MAX_ROWS + 2) fail("At most 1000 guest rows are supported");
                }
            } else {
                if (closed) fail("Unexpected text after a quoted CSV field at record " + (records.size() + 1));
                value.append(c);
            }
            if (value.length() > MAX_CELL_LENGTH) fail("Cells must contain at most 2000 characters");
        }
        if (records.isEmpty() || records.getFirst().stream().allMatch(String::isBlank)) fail("Import file has no header row");
        List<SourceRow> rows = new ArrayList<>();
        for (int i = 1; i < records.size(); i++) {
            var cells = records.get(i);
            if (cells.stream().allMatch(String::isBlank)) continue;
            rows.add(new SourceRow(i + 1, cells, i + 1 == unclosedRecord ? List.of("CSV row has an unmatched quote") : cells.size() > records.getFirst().size() ? List.of("More cells than source headers") : List.of()));
        }
        if (rows.size() > MAX_ROWS) fail("At most 1000 guest rows are supported");
        return new GuestImportSourceResponse(List.of(new Worksheet("CSV", records.getFirst(), rows)));
    }

    private GuestImportSourceResponse xlsx(MultipartFile file) throws IOException {
        // Preflight expanded bytes before POI materializes XML or embedded content.
        try (var zip = new ZipInputStream(file.getInputStream())) {
            long total = 0; int entries = 0; byte[] buffer = new byte[8192];
            for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
                if (++entries > 1000 || entry.getName().toLowerCase(Locale.ROOT).contains("vbaproject")) fail("Unsafe workbook contents");
                int count;
                while ((count = zip.read(buffer)) != -1) if ((total += count) > MAX_EXPANDED_BYTES) fail("Expanded workbook must be 20MB or smaller");
            }
            if (entries == 0) fail("Invalid XLSX archive");
        }
        List<Worksheet> worksheets = new ArrayList<>();
        try (var workbook = new XSSFWorkbook(file.getInputStream())) {
            if (workbook.getNumberOfSheets() > 10) fail("At most 10 worksheets are supported");
            var formatter = new DataFormatter(Locale.ROOT);
            for (var sheet : workbook) {
                if (sheet.getPhysicalNumberOfRows() == 0) continue;
                if (sheet.getLastRowNum() - sheet.getFirstRowNum() > MAX_ROWS) fail("At most 1000 rows per worksheet are supported");
                List<SourceRow> rows = new ArrayList<>();
                List<String> headers = null;
                for (var row : sheet) {
                    int columns = Math.max(0, row.getLastCellNum());
                    if (columns > MAX_COLUMNS) fail("At most 32 source columns are supported");
                    List<String> cells = new ArrayList<>(), issues = new ArrayList<>();
                    for (int i = 0; i < columns; i++) {
                        var cell = row.getCell(i);
                        if (cell != null && cell.getCellType() == CellType.FORMULA) {
                            issues.add("Formula cells are not imported. Replace formulas with text values (column " + (i + 1) + ")");
                            cells.add("");
                        } else {
                            String value = formatter.formatCellValue(cell);
                            if (value.length() > MAX_CELL_LENGTH) fail("Cells must contain at most 2000 characters");
                            cells.add(value);
                        }
                    }
                    if (headers == null) { headers = cells; continue; }
                    if (cells.stream().allMatch(String::isBlank) && issues.isEmpty()) continue;
                    rows.add(new SourceRow(row.getRowNum() + 1, cells, issues));
                }
                if (headers != null) worksheets.add(new Worksheet(sheet.getSheetName(), headers, rows));
            }
        }
        if (worksheets.isEmpty()) fail("Workbook has no populated worksheets");
        return new GuestImportSourceResponse(worksheets);
    }

    private static void fail(String message) { throw new ApiException(HttpStatus.BAD_REQUEST, message); }
}
