package com.koupreng.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GoogleLoginRequest(
        @Schema(description = "Google-issued ID token verified by the backend.",
                accessMode = Schema.AccessMode.WRITE_ONLY, example = "google-id-token-placeholder")
        @NotBlank @Size(max = 4096) String idToken
) {
}
