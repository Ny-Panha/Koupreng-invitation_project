package com.koupreng.backend.devmonitor.infrastructure;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class DevSqlStatementTracker {

    public record TraceResult(
            int queryCount,
            long durationMs,
            boolean nPlusOneDetected,
            List<String> queries
    ) {
        public static TraceResult empty() {
            return new TraceResult(0, 0, false, List.of());
        }
    }

    private static final class TraceState {
        final List<String> queries = new ArrayList<>();
        final Map<String, Integer> normalizedQueryCounts = new HashMap<>();
        boolean nPlusOneDetected = false;
    }

    private static final ThreadLocal<TraceState> CURRENT_TRACE = new ThreadLocal<>();

    private DevSqlStatementTracker() {
    }

    public static void startTrace() {
        CURRENT_TRACE.set(new TraceState());
    }

    public static void recordQuery(String sql) {
        TraceState state = CURRENT_TRACE.get();
        if (state == null || sql == null || sql.isBlank()) {
            return;
        }

        state.queries.add(sql);
        String normalized = normalizeSql(sql);
        int count = state.normalizedQueryCounts.merge(normalized, 1, Integer::sum);
        if (count >= 3) {
            state.nPlusOneDetected = true;
        }
    }

    public static TraceResult stopTrace() {
        TraceState state = CURRENT_TRACE.get();
        CURRENT_TRACE.remove();
        if (state == null) {
            return TraceResult.empty();
        }
        long durationMs = 0L;
        return new TraceResult(
                state.queries.size(),
                durationMs,
                state.nPlusOneDetected,
                List.copyOf(state.queries)
        );
    }

    private static String normalizeSql(String sql) {
        if (sql == null) {
            return "";
        }
        return sql.replaceAll("'(?:[^'\\\\]|\\\\.)*'", "?")
                .replaceAll("\\b\\d+\\b", "?")
                .replaceAll("\\s+", " ")
                .trim();
    }
}

