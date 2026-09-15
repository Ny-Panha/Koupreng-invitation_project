package com.koupreng.backend.user.api.dto;

import java.time.Instant;

import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.entity.user.Role;

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
