package com.koupreng.backend.admin.api.dto;

import com.koupreng.backend.user.domain.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateUserRoleRequest {

    @NotNull(message = "User role is required")
    private Role role;
}
