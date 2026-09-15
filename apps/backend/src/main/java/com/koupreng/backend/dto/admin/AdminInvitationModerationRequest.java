package com.koupreng.backend.dto.admin;

import com.koupreng.backend.invitation.domain.InvitationModerationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminInvitationModerationRequest {

    @NotNull(message = "Moderation status is required")
    private InvitationModerationStatus status;

    private String reason;
}
