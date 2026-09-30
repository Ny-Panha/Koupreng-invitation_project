package com.koupreng.backend.admin.api.dto;

import com.koupreng.backend.invitation.domain.InvitationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminInvitationStatusRequest {

    @NotNull(message = "Invitation status is required")
    private InvitationStatus status;
}