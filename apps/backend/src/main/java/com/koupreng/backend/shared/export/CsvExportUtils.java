package com.koupreng.backend.shared.export;

import java.util.Arrays;
import java.util.stream.Collectors;

public class CsvExportUtils {

    public static String row(Object... args) {
        if (args == null) {
            return "";
        }
        return Arrays.stream(args)
                .map(CsvExportUtils::escapeCell)
                .collect(Collectors.joining(","));
    }

    public static String spreadsheetText(String value) {
        if (value == null) return "";
        // Include invisible Unicode format/control prefixes, not only ASCII space.
        if (value.matches("(?s)^[\\p{Z}\\p{C}\\s]*[=+\\-@＝＋－＠].*")
                || value.startsWith("\t") || value.startsWith("\r") || value.startsWith("\n")) return "'" + value;
        return value;
    }

    private static String escapeCell(Object arg) {
        if (arg == null) {
            return "\"\"";
        }
        String s = spreadsheetText(arg.toString());
        // Escape quotes and wrap in quotes
        String escaped = s.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
