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

    private static String escapeCell(Object arg) {
        if (arg == null) {
            return "\"\"";
        }
        String s = arg.toString();
        // Check for CSV Formula Injection
        String trimmed = s.stripLeading();
        if (!trimmed.isEmpty()) {
            char first = trimmed.charAt(0);
            if (first == '=' || first == '+' || first == '-' || first == '@'
                    || first == '\t' || first == '\r' || first == '\n'
                    || first == '＝' || first == '＋' || first == '－' || first == '＠') {
                s = "'" + s;
            }
        }
        // Escape quotes and wrap in quotes
        String escaped = s.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
