package com.koupreng.backend.devmonitor.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClientTelemetryRequest(
        @NotBlank @Size(max = 64) String requestId,
        @Size(max = 64) String actionId,
        @NotBlank @Size(max = 32) String clientApp,
        @Size(max = 128) String frontendRoute,
        @Size(max = 64) String clientAction,
        @NotBlank @Size(max = 16) String method,
        @NotBlank @Size(max = 255) String path,
        int status,
        long clientDurationMs,
        @Size(max = 64) String outcome,
        @Size(max = 64) String errorCode,
        @Size(max = 255) String errorMessage
) {
}
