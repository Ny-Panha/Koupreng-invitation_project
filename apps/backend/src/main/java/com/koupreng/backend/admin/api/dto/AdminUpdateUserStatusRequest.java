package com.koupreng.backend.admin.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateUserStatusRequest {

    @NotBlank(message = "User status is required")
    private String status;
}
