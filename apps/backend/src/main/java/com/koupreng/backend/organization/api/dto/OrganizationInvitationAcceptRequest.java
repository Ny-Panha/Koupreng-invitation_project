package com.koupreng.backend.organization.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OrganizationInvitationAcceptRequest(
        @NotBlank @Pattern(regexp = "[a-f0-9]{64}") String token) { }
