package com.koupreng.backend.dto;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;

public record AuthResponse(
        @Schema(description = "JWT used with Swagger Authorize and the Authorization header.",
                accessMode = Schema.AccessMode.READ_ONLY)
        String accessToken,
        @Schema(example = "Bearer", accessMode = Schema.AccessMode.READ_ONLY) String tokenType,
        @Schema(format = "date-time", accessMode = Schema.AccessMode.READ_ONLY) Instant expiresAt,
        UserResponse user
) {
    public static AuthResponse bearer(String accessToken, Instant expiresAt, UserResponse user) {
        return new AuthResponse(accessToken, "Bearer", expiresAt, user);
    }
}
