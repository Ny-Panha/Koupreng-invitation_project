package com.koupreng.backend.organization.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationRequest {

    @NotBlank(message = "Organization name is required")
    private String name;
}
