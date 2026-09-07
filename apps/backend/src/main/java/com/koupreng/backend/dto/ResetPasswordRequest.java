package com.koupreng.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @Schema(description = "Single-use password reset token.", accessMode = Schema.AccessMode.WRITE_ONLY,
                example = "password-reset-token-placeholder")
        @NotBlank
        @Size(max = 255)
        String token,

        @Schema(format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
                example = "NewExamplePass123!")
        @NotBlank
        @Size(min = 8, max = 100)
        String newPassword
) {
}
