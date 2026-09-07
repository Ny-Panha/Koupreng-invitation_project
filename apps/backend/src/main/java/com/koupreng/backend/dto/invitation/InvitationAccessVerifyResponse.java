package com.koupreng.backend.dto.invitation;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationAccessVerifyResponse {

    private String slug;
    private boolean accessGranted;
    @Schema(description = "Short-lived token for subsequent public invitation requests.",
            accessMode = Schema.AccessMode.READ_ONLY)
    private String accessToken;
}
