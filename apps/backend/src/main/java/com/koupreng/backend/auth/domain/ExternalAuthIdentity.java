package com.koupreng.backend.auth.domain;

import com.koupreng.backend.user.domain.AuthProvider;

public record ExternalAuthIdentity(
        AuthProvider provider,
        String providerId,
        String email,
        String fullName
) {
}
