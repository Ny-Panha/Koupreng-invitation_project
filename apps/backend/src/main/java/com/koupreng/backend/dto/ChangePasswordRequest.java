package com.koupreng.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @Schema(format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
                description = "Current password; legacy alias of currentPassword.")
        @Size(max = 100)
        String oldPassword,

        @Schema(format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
                description = "Current password; preferred request field.")
        @Size(max = 100)
        String currentPassword,

        @Schema(format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
                example = "NewExamplePass123!")
        @NotBlank
        @Size(min = 8, max = 100)
        String newPassword
) {
    public ChangePasswordRequest {
        oldPassword = trimToNull(oldPassword);
        currentPassword = trimToNull(currentPassword);
    }

    @Override
    public String oldPassword() {
        return oldPassword != null ? oldPassword : currentPassword;
    }

    @Override
    public String currentPassword() {
        return currentPassword != null ? currentPassword : oldPassword;
    }

    @AssertTrue(message = "Current password is required")
    public boolean isCurrentPasswordPresent() {
        return currentPassword() != null;
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
