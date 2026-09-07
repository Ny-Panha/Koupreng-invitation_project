package com.koupreng.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @Schema(description = "Registered email address or phone number.", example = "user@example.com")
        @JsonAlias({"email", "phone", "emailOrPhone"}) @NotBlank @Size(max = 255) String identifier,
        @Schema(format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
                example = "ExamplePass123!")
        @NotBlank @Size(max = 100) String password
) {
}
