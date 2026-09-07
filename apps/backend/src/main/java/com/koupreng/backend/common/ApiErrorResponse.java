package com.koupreng.backend.common;

import java.time.Instant;
import java.util.Map;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ApiError", description = "Standard error body returned by the API exception handler.")
public record ApiErrorResponse(
        @Schema(format = "date-time") Instant timestamp,
        @Schema(example = "400") int status,
        @Schema(example = "Bad Request") String error,
        @Schema(example = "REQUEST_INVALID") String code,
        @Schema(example = "Request validation failed") String message,
        @Schema(example = "/api/v1/invitations") String path,
        Map<String, String> fieldErrors,
        @Schema(description = "Legacy validation-field alias, present only on validation errors.")
        Map<String, String> fields
) {
}
