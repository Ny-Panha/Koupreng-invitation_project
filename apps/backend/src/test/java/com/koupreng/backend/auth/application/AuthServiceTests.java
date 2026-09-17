package com.koupreng.backend.auth.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.auth.api.dto.AuthResponse;
import com.koupreng.backend.auth.api.dto.GoogleLoginRequest;
import com.koupreng.backend.auth.api.dto.LoginRequest;
import com.koupreng.backend.auth.api.dto.TelegramLoginRequest;
import com.koupreng.backend.auth.domain.ExternalAuthIdentity;
import com.koupreng.backend.auth.infrastructure.identity.GoogleIdentityVerifier;
import com.koupreng.backend.auth.infrastructure.identity.TelegramIdentityVerifier;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.AuthProvider;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.shared.i18n.MessageService;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

class AuthServiceTests {

    @Test
    void loginReturnsBearerToken() {
        Fixture fixture = fixture();
        AppUser user = activeUser();

        when(fixture.userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(fixture.passwordEncoder.matches("password123", user.getPasswordHash())).thenReturn(true);
        when(fixture.jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(jwt("jwt-token"));

        AuthResponse response = fixture.authService.login(new LoginRequest("user@example.com", "password123"));

        assertEquals("jwt-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(1L, response.user().id());
    }

    @Test
    void logoutIncrementsTokenVersion() {
        Fixture fixture = fixture();
        AppUser user = activeUser();
        Authentication authentication = mock(Authentication.class);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("1");
        when(fixture.userRepository.findById(1L)).thenReturn(Optional.of(user));

        fixture.authService.logout(authentication);

        assertEquals(1, user.getTokenVersion());
    }

    @Test
    void loginWithGoogleCreatesExternalUserAndIssuesToken() {
        Fixture fixture = fixture();
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE,
                "google-123",
                "User@Example.com",
                "Google User"
        ));
        when(fixture.userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());
        when(fixture.userRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser user = invocation.getArgument(0);
            user.setId(10L);
            return user;
        });
        when(fixture.jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(jwt("google-jwt"));

        AuthResponse response = fixture.authService.loginWithGoogle(new GoogleLoginRequest("google-token"));

        assertEquals("google-jwt", response.accessToken());
        assertEquals("user@example.com", response.user().email());
        assertEquals("Google User", response.user().fullName());
        verify(fixture.userRepository).save(any(AppUser.class));
    }

    @Test
    void loginWithTelegramReusesExternalUserAndIssuesToken() {
        Fixture fixture = fixture();
        AppUser existing = activeUser();
        existing.setEmail("telegram-42@telegram.local");
        when(fixture.telegramIdentityVerifier.verify(any(TelegramLoginRequest.class))).thenReturn(new ExternalAuthIdentity(
                AuthProvider.TELEGRAM,
                "42",
                "telegram-42@telegram.local",
                "Telegram User"
        ));
        when(fixture.userRepository.findByEmailIgnoreCase("telegram-42@telegram.local")).thenReturn(Optional.of(existing));
        when(fixture.userRepository.save(existing)).thenReturn(existing);
        when(fixture.jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(jwt("telegram-jwt"));

        AuthResponse response = fixture.authService.loginWithTelegram(new TelegramLoginRequest(
                null,
                42L,
                "Telegram",
                "User",
                "telegram_user",
                null,
                1_700_000_000L,
                "hash"
        ));

        assertEquals("telegram-jwt", response.accessToken());
        assertEquals("Telegram User", response.user().fullName());
        verify(fixture.userRepository).save(existing);
    }

    private Fixture fixture() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtEncoder jwtEncoder = mock(JwtEncoder.class);
        GoogleIdentityVerifier googleIdentityVerifier = mock(GoogleIdentityVerifier.class);
        TelegramIdentityVerifier telegramIdentityVerifier = mock(TelegramIdentityVerifier.class);
        MessageService messageService = mock(MessageService.class);
        when(messageService.get(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
        AppProperties appProperties = new AppProperties();
        appProperties.getJwt().setIssuer("koupreng-backend");
        appProperties.getJwt().setSecret("local_test_jwt_secret_64_characters_or_longer_for_auth_service_tests_123456");
        AuthService authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtEncoder,
                appProperties,
                googleIdentityVerifier,
                telegramIdentityVerifier,
                messageService
        );
        return new Fixture(
                authService,
                userRepository,
                passwordEncoder,
                jwtEncoder,
                googleIdentityVerifier,
                telegramIdentityVerifier
        );
    }

    private AppUser activeUser() {
        AppUser user = new AppUser();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setFullName("Test User");
        user.setPasswordHash("hash");
        user.setRole(Role.USER);
        user.setStatus(AppUser.STATUS_ACTIVE);
        return user;
    }

    private Jwt jwt(String tokenValue) {
        return Jwt.withTokenValue(tokenValue)
                .header("alg", "HS256")
                .subject("1")
                .claim("token_version", 0)
                .build();
    }

    private record Fixture(
            AuthService authService,
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            GoogleIdentityVerifier googleIdentityVerifier,
            TelegramIdentityVerifier telegramIdentityVerifier
    ) {
    }
}
