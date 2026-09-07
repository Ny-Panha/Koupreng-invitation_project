package com.koupreng.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @JsonAlias({"fullname", "full_name"}) @NotBlank @Size(max = 120) String fullName,
        @Email @Size(max = 255) String email,
        @Size(max = 30) String phone,
        @Schema(format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
                example = "ExamplePass123!")
        @NotBlank @Size(min = 8, max = 100) String password
) {
}
