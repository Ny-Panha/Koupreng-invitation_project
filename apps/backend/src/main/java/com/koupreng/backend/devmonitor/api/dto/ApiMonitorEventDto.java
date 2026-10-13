package com.koupreng.backend.devmonitor.api.dto;

import java.time.Instant;

public record ApiMonitorEventDto(
        long id,
        String requestId,
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
        boolean slow,
        String clientIp,
        String userPrincipal,
        String userRole,
        boolean authenticated,
        String outcome,
        String errorCode
) {
}

