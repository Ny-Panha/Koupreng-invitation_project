package com.koupreng.backend.organization.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationMemberRequest {

    @Email(message = "Member email is invalid")
    @NotBlank(message = "Member email is required")
    private String email;

    private String role;
}
