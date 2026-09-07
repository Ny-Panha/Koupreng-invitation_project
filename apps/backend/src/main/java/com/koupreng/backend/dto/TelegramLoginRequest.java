package com.koupreng.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record TelegramLoginRequest(
        @Schema(description = "Telegram OIDC token when using the OIDC flow.",
                accessMode = Schema.AccessMode.WRITE_ONLY, example = "telegram-id-token-placeholder")
        @Size(max = 8192) String idToken,
        @Positive Long id,
        @JsonProperty("first_name") @JsonAlias("firstName") @Size(max = 120) String firstName,
        @JsonProperty("last_name") @JsonAlias("lastName") @Size(max = 120) String lastName,
        @Size(max = 120) String username,
        @JsonProperty("photo_url") @JsonAlias("photoUrl") @Size(max = 512) String photoUrl,
        @JsonProperty("auth_date") @JsonAlias("authDate") @Positive Long authDate,
        @Schema(description = "Telegram login-widget signature for the legacy widget flow.",
                accessMode = Schema.AccessMode.WRITE_ONLY, example = "telegram-signature-placeholder")
        @Size(max = 256) String hash
) {
}
