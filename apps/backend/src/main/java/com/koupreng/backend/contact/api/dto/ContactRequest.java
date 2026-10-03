package com.koupreng.backend.contact.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 30) String phone,
        @Size(max = 120) String plan,
        @NotBlank @Size(max = 5000) String message
) { }
