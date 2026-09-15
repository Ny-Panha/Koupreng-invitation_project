package com.koupreng.backend.dto;

import jakarta.validation.constraints.NotNull;

import com.koupreng.backend.user.domain.Role;

public record UpdateRoleRequest(
        @NotNull Role role
) {
}
