package com.koupreng.backend.dto.invitation;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InvitationAccessVerifyRequest {

    @Schema(format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
            example = "invitation-passcode-placeholder")
    @Size(max = 255)
    private String password;

    @Schema(description = "Short-lived invitation access token.", accessMode = Schema.AccessMode.WRITE_ONLY,
            example = "invitation-access-token-placeholder")
    @Size(max = 120)
    private String accessToken;

    @Schema(description = "Opaque token from a personalized guest invitation link.",
            accessMode = Schema.AccessMode.WRITE_ONLY, example = "guest-invite-token-placeholder")
    @Size(max = 120)
    private String inviteToken;
}
