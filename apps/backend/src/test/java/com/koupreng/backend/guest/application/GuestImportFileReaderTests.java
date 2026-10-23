package com.koupreng.backend.guest.application;

import com.koupreng.backend.shared.exception.ApiException;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import static org.junit.jupiter.api.Assertions.*;

class GuestImportFileReaderTests {
    private final GuestImportFileReader reader = new GuestImportFileReader();
    private MockMultipartFile csv(String text) { return new MockMultipartFile("file", "guests.csv", "text/csv", text.getBytes(StandardCharsets.UTF_8)); }

    @Test void quotedKhmerNewlinesBomAndEscapedQuotesRoundTrip() {
        var sheet = reader.read(csv("\uFEFFguestName,phone,note\r\n\"ភ្ញៀវ, ក\",012000001,\"First line\nQuoted \"\"note\"\"\"\r\n\r\n")).worksheets().getFirst();
        assertEquals("guestName", sheet.headers().getFirst());
        assertEquals(1, sheet.rows().size());
        assertEquals("012000001", sheet.rows().getFirst().values().get(1));
        assertEquals("First line\nQuoted \"note\"", sheet.rows().getFirst().values().get(2));
    }
    @Test void rejectsOversizedRowsColumnsCellsAndDisallowedArchives() {
        assertThrows(ApiException.class, () -> reader.read(csv("guestName\n" + "Guest\n".repeat(1001))));
        assertThrows(ApiException.class, () -> reader.read(csv("guestName\n" + "x".repeat(2001))));
        assertThrows(ApiException.class, () -> reader.read(csv("x,".repeat(32) + "guestName\nGuest")));
        assertThrows(ApiException.class, () -> reader.read(new MockMultipartFile("file", "bad.xlsx", null, new byte[] { 1,2,3 })));
        assertThrows(ApiException.class, () -> reader.read(new MockMultipartFile("file", "macro.xlsm", null, new byte[] { 1 })));
        assertThrows(ApiException.class, () -> reader.read(new MockMultipartFile("file", "large.csv", null, new byte[5 * 1024 * 1024 + 1])));
    }
    @Test void multipleWorksheetsKeepTextPhonesAndReportFormulaCellsWithoutEvaluation() throws Exception {
        byte[] bytes;
        try (var book = new XSSFWorkbook(); var out = new ByteArrayOutputStream()) {
            var sheet = book.createSheet("Guests");
            var header = sheet.createRow(0); header.createCell(0).setCellValue("guestName"); header.createCell(1).setCellValue("phone");
            var row = sheet.createRow(1); row.createCell(0).setCellValue("ភ្ញៀវគំរូ"); row.createCell(1).setCellValue("012000001");
            sheet.createRow(2).createCell(0).setCellFormula("1+1");
            book.createSheet("Other").createRow(0).createCell(0).setCellValue("Name");
            book.write(out); bytes = out.toByteArray();
        }
        var source = reader.read(new MockMultipartFile("file", "guests.xlsx", null, bytes));
        assertEquals(2, source.worksheets().size());
        assertEquals("012000001", source.worksheets().getFirst().rows().getFirst().values().get(1));
        assertTrue(source.worksheets().getFirst().rows().get(1).issues().getFirst().contains("Formula"));
    }
    @Test void realDownloadableTemplatesReimportWithKhmerAndLeadingZeroPhones() throws Exception {
        var folder = Path.of("../frontend-user/public/downloads");
        for (var extension : new String[] {"csv", "xlsx"}) {
            var file = folder.resolve("Koupreng-Guest-Import-Template." + extension);
            var source = reader.read(new MockMultipartFile("file", file.getFileName().toString(), null, Files.readAllBytes(file)));
            var sheet = source.worksheets().getFirst();
            assertEquals("guestName", sheet.headers().getFirst());
            assertTrue(sheet.rows().getFirst().values().getFirst().contains("ភ្ញៀវ"));
            assertEquals("012000001", sheet.rows().getFirst().values().get(1));
            if (extension.equals("xlsx")) assertEquals(3, source.worksheets().size());
        }
    }
}
