package com.koupreng.backend.auth.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

import org.springframework.security.authentication.BadCredentialsException;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.auth.api.dto.AuthResponse;
import com.koupreng.backend.auth.api.dto.GoogleLoginRequest;
import com.koupreng.backend.auth.api.dto.LoginRequest;
import com.koupreng.backend.auth.api.dto.TelegramLoginRequest;
import com.koupreng.backend.auth.domain.ExternalAuthIdentity;
import com.koupreng.backend.auth.domain.UserExternalIdentity;
import com.koupreng.backend.auth.infrastructure.persistence.UserExternalIdentityRepository;
import com.koupreng.backend.auth.api.dto.RegisterRequest;
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
    void localRegistrationCannotAttachPasswordToExistingSocialFirstAccount() {
        Fixture fixture = fixture();
        AppUser existing = activeUser();
        existing.setPasswordHash(null);
        when(fixture.userRepository.existsByEmailIgnoreCase(existing.getEmail())).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class, () -> fixture.authService.register(
                new RegisterRequest("Local registration", existing.getEmail(), null, "password123")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertNull(existing.getPasswordHash());
        verify(fixture.passwordEncoder, never()).encode(anyString());
        verify(fixture.userRepository, never()).save(any());
    }

    @Test
    void differentProviderSubjectCannotTakeOverSocialFirstAccountBySameEmail() {
        Fixture fixture = fixture();
        AppUser existing = activeUser();
        existing.setPasswordHash(null);
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE, "different-subject", existing.getEmail(), "Changed Name"));
        when(fixture.userRepository.findByEmailIgnoreCase(existing.getEmail())).thenReturn(Optional.of(existing));

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.authService.loginWithGoogle(new GoogleLoginRequest("google-token")));

        assertEquals("ACCOUNT_LINK_REQUIRED", exception.getCode());
        assertNull(existing.getPasswordHash());
        assertEquals("Test User", existing.getFullName());
        verify(fixture.externalIdentityRepository, never()).saveAndFlush(any());
        verify(fixture.jwtEncoder, never()).encode(any());
    }

    @Test
    void unlinkedGoogleIdentityCannotTakeOverLocalAccountByEmail() {
        Fixture fixture = fixture();
        AppUser existing = activeUser();
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE, "unlinked-subject", "user@example.com", "External User"));
        when(fixture.userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(existing));
        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.authService.loginWithGoogle(new GoogleLoginRequest("google-token")));
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Test User", existing.getFullName());
        assertEquals("hash", existing.getPasswordHash());
    }

    @Test
    void syntheticTelegramEmailCannotSelectLocalAccount() {
        Fixture fixture = fixture();
        AppUser existing = activeUser();
        existing.setEmail("telegram-42@telegram.local");
        when(fixture.telegramIdentityVerifier.verify(any(TelegramLoginRequest.class))).thenReturn(new ExternalAuthIdentity(
                AuthProvider.TELEGRAM, "42", "telegram-42@telegram.local", "Telegram User"));
        when(fixture.userRepository.findByEmailIgnoreCase("telegram-42@telegram.local")).thenReturn(Optional.of(existing));
        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.authService.loginWithTelegram(new TelegramLoginRequest(
                        null, 42L, "Telegram", "User", null, null, 1_700_000_000L, "hash")));
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Test User", existing.getFullName());
    }

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
    void loginRejectsDisabledUsers() {
        Fixture fixture = fixture();
        AppUser disabledUser = activeUser();
        disabledUser.setStatus(AppUser.STATUS_DISABLED);

        when(fixture.userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(disabledUser));

        assertThrows(BadCredentialsException.class, () ->
                fixture.authService.login(new LoginRequest("user@example.com", "password123"))
        );
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
    void loginWithTelegramUsesRecordedProviderSubject() {
        Fixture fixture = fixture();
        AppUser existing = activeUser();
        existing.setEmail("telegram-42@telegram.local");
        when(fixture.telegramIdentityVerifier.verify(any(TelegramLoginRequest.class))).thenReturn(new ExternalAuthIdentity(
                AuthProvider.TELEGRAM,
                "42",
                "telegram-42@telegram.local",
                "Telegram User"
        ));
        UserExternalIdentity linked = linked(existing, AuthProvider.TELEGRAM, "42");
        when(fixture.externalIdentityRepository.findByProviderAndProviderSubject(AuthProvider.TELEGRAM, "42"))
                .thenReturn(Optional.of(linked));
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
        assertEquals("Test User", response.user().fullName());
        verify(fixture.userRepository, never()).save(existing);
    }

    @Test
    void recordedSubjectWinsWhenProviderEmailNowMatchesDifferentLocalUser() {
        Fixture fixture = fixture();
        AppUser original = activeUser();
        original.setEmail("original@example.com");
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE, "original-subject", "other@example.com", "Changed Name"));
        when(fixture.externalIdentityRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, "original-subject"))
                .thenReturn(Optional.of(linked(original, AuthProvider.GOOGLE, "original-subject")));
        when(fixture.jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(jwt("google-jwt"));
        AuthResponse response = fixture.authService.loginWithGoogle(new GoogleLoginRequest("google-token"));
        assertEquals(1L, response.user().id());
        assertEquals("original@example.com", response.user().email());
        assertEquals("Test User", response.user().fullName());
        verify(fixture.userRepository, never()).findByEmailIgnoreCase("other@example.com");
    }

    @Test
    void authenticatedLocalAccountCanExplicitlyLinkVerifiedGoogleIdentity() {
        Fixture fixture = fixture();
        AppUser user = activeUser();
        Authentication authentication = authenticated(fixture, user);
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE, "google-123", "user@example.com", "External Name"));
        assertEquals(1L, fixture.authService.linkGoogle(authentication, new GoogleLoginRequest("google-token")).id());
        org.mockito.ArgumentCaptor<UserExternalIdentity> captor = org.mockito.ArgumentCaptor.forClass(UserExternalIdentity.class);
        verify(fixture.externalIdentityRepository).saveAndFlush(captor.capture());
        assertEquals("google-123", captor.getValue().getProviderSubject());
        assertEquals(user, captor.getValue().getUser());
        assertEquals("hash", user.getPasswordHash());
        assertEquals("Test User", user.getFullName());
    }

    @Test
    void anotherAccountsProviderIdentityCannotBeLinked() {
        Fixture fixture = fixture();
        AppUser user = activeUser();
        Authentication authentication = authenticated(fixture, user);
        AppUser other = activeUser();
        other.setId(2L);
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE, "claimed-subject", "user@example.com", "External Name"));
        when(fixture.externalIdentityRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, "claimed-subject"))
                .thenReturn(Optional.of(linked(other, AuthProvider.GOOGLE, "claimed-subject")));
        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.authService.linkGoogle(authentication, new GoogleLoginRequest("google-token")));
        assertEquals("IDENTITY_ALREADY_LINKED", exception.getCode());
        verify(fixture.externalIdentityRepository, never()).saveAndFlush(any());
    }

    @Test
    void existingProviderSubjectCannotBeSilentlyReplaced() {
        Fixture fixture = fixture();
        AppUser user = activeUser();
        Authentication authentication = authenticated(fixture, user);
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE, "new-subject", "user@example.com", "External Name"));
        when(fixture.externalIdentityRepository.findByUserIdAndProvider(1L, AuthProvider.GOOGLE))
                .thenReturn(Optional.of(linked(user, AuthProvider.GOOGLE, "original-subject")));
        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.authService.linkGoogle(authentication, new GoogleLoginRequest("google-token")));
        assertEquals("IDENTITY_PROVIDER_MISMATCH", exception.getCode());
    }

    @Test
    void repeatedExplicitLinkIsIdempotent() {
        Fixture fixture = fixture();
        AppUser user = activeUser();
        Authentication authentication = authenticated(fixture, user);
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE, "existing-subject", "user@example.com", "External Name"));
        when(fixture.externalIdentityRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, "existing-subject"))
                .thenReturn(Optional.of(linked(user, AuthProvider.GOOGLE, "existing-subject")));
        assertEquals(1L, fixture.authService.linkGoogle(authentication, new GoogleLoginRequest("google-token")).id());
        verify(fixture.externalIdentityRepository, never()).saveAndFlush(any());
    }

    @Test
    void disabledProviderAccountCannotLogin() {
        Fixture fixture = fixture();
        AppUser user = activeUser();
        user.setStatus(AppUser.STATUS_DISABLED);
        when(fixture.googleIdentityVerifier.verify("google-token")).thenReturn(new ExternalAuthIdentity(
                AuthProvider.GOOGLE, "disabled-subject", "user@example.com", "External Name"));
        when(fixture.externalIdentityRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, "disabled-subject"))
                .thenReturn(Optional.of(linked(user, AuthProvider.GOOGLE, "disabled-subject")));
        assertThrows(BadCredentialsException.class,
                () -> fixture.authService.loginWithGoogle(new GoogleLoginRequest("google-token")));
    }

    @Test
    void localRegistrationCannotReserveSyntheticTelegramAddress() {
        Fixture fixture = fixture();
        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.authService.register(new RegisterRequest("Local", "telegram-42@telegram.local", null, "password123")));
        assertEquals("AUTH_RESERVED_EMAIL_DOMAIN", exception.getCode());
        verify(fixture.userRepository, never()).save(any());
    }

    private Authentication authenticated(Fixture fixture, AppUser user) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(user.getId().toString());
        when(fixture.userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(fixture.userRepository.findForUpdateById(user.getId())).thenReturn(Optional.of(user));
        return authentication;
    }

    private UserExternalIdentity linked(AppUser user, AuthProvider provider, String subject) {
        UserExternalIdentity linked = new UserExternalIdentity();
        linked.setUser(user);
        linked.setProvider(provider);
        linked.setProviderSubject(subject);
        return linked;
    }

    private Fixture fixture() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtEncoder jwtEncoder = mock(JwtEncoder.class);
        GoogleIdentityVerifier googleIdentityVerifier = mock(GoogleIdentityVerifier.class);
        TelegramIdentityVerifier telegramIdentityVerifier = mock(TelegramIdentityVerifier.class);
        MessageService messageService = mock(MessageService.class);
        UserExternalIdentityRepository externalIdentityRepository = mock(UserExternalIdentityRepository.class);
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
                messageService,
                null,
                null,
                externalIdentityRepository
        );
        return new Fixture(
                authService,
                userRepository,
                passwordEncoder,
                jwtEncoder,
                googleIdentityVerifier,
                telegramIdentityVerifier,
                externalIdentityRepository
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
            TelegramIdentityVerifier telegramIdentityVerifier,
            UserExternalIdentityRepository externalIdentityRepository
    ) {
    }
}
