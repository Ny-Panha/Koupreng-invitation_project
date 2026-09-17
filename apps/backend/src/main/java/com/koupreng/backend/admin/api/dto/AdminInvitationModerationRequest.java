package com.koupreng.backend.admin.api.dto;

import com.koupreng.backend.invitation.domain.InvitationModerationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminInvitationModerationRequest {

    @NotNull(message = "Moderation status is required")
    private InvitationModerationStatus status;

    private String reason;
}
