package com.koupreng.backend.user.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @JsonAlias({"fullname", "full_name"})
        @NotBlank
        @Size(max = 120)
        String fullName,

        @Size(max = 30)
        String phone,

        @JsonAlias({"profile_image", "profileImageUrl", "profile_image_url"})
        @Size(max = 1024)
        String profileImage
) {
}
