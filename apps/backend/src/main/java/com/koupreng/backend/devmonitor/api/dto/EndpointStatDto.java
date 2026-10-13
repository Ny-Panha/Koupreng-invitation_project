package com.koupreng.backend.devmonitor.api.dto;

public record EndpointStatDto(
        String method,
        String pattern,
        long count,
        double avgDurationMs,
        long errorCount
) {
}

