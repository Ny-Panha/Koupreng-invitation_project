package com.koupreng.backend.devmonitor.api.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record ApiMonitorStatsDto(
        long totalRequests,
        long successCount,
        long clientErrorCount,
        long serverErrorCount,
        long slowRequestsCount,
        double avgDurationMs,
        double p95DurationMs,
        long userAppCount,
        long adminAppCount,
        long otherAppCount,
        Map<Integer, Long> statusDistribution,
        List<EndpointStatDto> topEndpoints,
        Instant generatedAt
) {
}

