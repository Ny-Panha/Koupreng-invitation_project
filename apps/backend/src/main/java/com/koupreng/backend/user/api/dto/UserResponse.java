package com.koupreng.backend.user.api.dto;

import java.time.Instant;

import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;

public record UserResponse(
        Long id,
        String email,
        String phone,
        String fullName,
        String profileImage,
        Role role,
        String status,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getFullName(),
                user.getProfileImage(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
