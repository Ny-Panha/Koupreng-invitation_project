package com.koupreng.backend.auth.infrastructure.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import com.koupreng.backend.auth.api.dto.AuthResponse;
import com.koupreng.backend.config.AppProperties;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class AuthCookieService {

    private final AppProperties.Auth.Cookie properties;

    public AuthCookieService(AppProperties appProperties) {
        this.properties = appProperties.getAuth().getCookie();
    }

    public boolean isEnabled() {
        return properties.isEnabled();
    }

    public Optional<ResponseCookie> createAuthCookie(AuthResponse authResponse) {
        if (!isEnabled()) {
            return Optional.empty();
        }

        return Optional.of(baseCookie(authResponse.accessToken())
                .maxAge(maxAge(authResponse.expiresAt()))
                .build());
    }

    public Optional<ResponseCookie> clearAuthCookie() {
        if (!isEnabled()) {
            return Optional.empty();
        }

        return Optional.of(baseCookie("")
                .maxAge(Duration.ZERO)
                .build());
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(properties.getName(), value)
                .httpOnly(properties.isHttpOnly())
                .secure(properties.isSecure())
                .sameSite(properties.getSameSite())
                .path("/");
    }

    private Duration maxAge(Instant expiresAt) {
        long millisUntilExpiry = Math.max(0, expiresAt.toEpochMilli() - Instant.now().toEpochMilli());
        long secondsUntilExpiry = (millisUntilExpiry + 999) / 1000;
        long configuredMaxAge = properties.getMaxAgeSeconds();
        if (configuredMaxAge <= 0) {
            return Duration.ofSeconds(secondsUntilExpiry);
        }
        return Duration.ofSeconds(Math.min(configuredMaxAge, secondsUntilExpiry));
    }
}
