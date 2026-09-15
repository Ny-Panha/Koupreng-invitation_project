package com.koupreng.backend.shared.export;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CsvExportUtilsTests {

    @Test
    void testRowFormattingAndInjectionPrevention() {
        assertEquals("\"\"", CsvExportUtils.row((Object) null));
        assertEquals("\"abc\",\"def\"", CsvExportUtils.row("abc", "def"));
        assertEquals("\"123\",\"45.67\"", CsvExportUtils.row(123, 45.67));
        
        // Formula injection test
        assertEquals("\"'=1+1\"", CsvExportUtils.row("=1+1"));
        assertEquals("\"'   =1+1\"", CsvExportUtils.row("   =1+1"));
        assertEquals("\"'+SUM(1,2)\"", CsvExportUtils.row("+SUM(1,2)"));
        assertEquals("\"'@HYPERLINK(\"\"http://evil\"\")\"", CsvExportUtils.row("@HYPERLINK(\"http://evil\")"));
        
        // Full width variants
        assertEquals("\"'＝1+1\"", CsvExportUtils.row("＝1+1"));
        assertEquals("\"'＋SUM(1,2)\"", CsvExportUtils.row("＋SUM(1,2)"));
        assertEquals("\"'－1\"", CsvExportUtils.row("－1"));
        assertEquals("\"'＠test\"", CsvExportUtils.row("＠test"));
    }
}
