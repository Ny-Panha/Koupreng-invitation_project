package com.koupreng.backend.devmonitor.api.dto;

import java.time.Instant;

/**
 * Immutable telemetry event representing an observed HTTP request/response cycle.
 */
public record ApiMonitorEventDto(
        long id,
        String requestId,
        String actionId,
        Instant timestamp,
        String clientApp,
        String frontendRoute,
        String clientAction,
        String method,
        String path,
        String target,
        String matchedPattern,
        String controller,
        int status,
        long durationMs,
        long clientDurationMs,
        boolean slow,
        int sqlQueryCount,
        long sqlDurationMs,
        boolean nPlusOneDetected,
        String source,
        String contractStatus,
        String clientIp,
        String userPrincipal,
        String userRole,
        boolean authenticated,
        String outcome,
        String errorCode
) {
}
