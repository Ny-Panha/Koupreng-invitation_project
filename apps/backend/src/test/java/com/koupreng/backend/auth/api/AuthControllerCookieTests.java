package com.koupreng.backend.auth.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;

import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.auth.api.dto.AuthResponse;
import com.koupreng.backend.auth.api.dto.LoginRequest;
import com.koupreng.backend.auth.application.AccountService;
import com.koupreng.backend.auth.application.AuthService;
import com.koupreng.backend.auth.infrastructure.security.AuthCookieService;
import com.koupreng.backend.auth.api.dto.MessageResponse;
import com.koupreng.backend.user.api.dto.UserResponse;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.application.UserService;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

class AuthControllerCookieTests {

    @Test
    void loginReturnsJsonTokenWithoutCookieWhenCookieAuthDisabled() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = controller(authService, false);
        AuthResponse authResponse = authResponse();
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = controller.login(new LoginRequest("user@example.com", "password123"));

        assertEquals(authResponse, response.getBody());
        assertNull(response.getHeaders().getFirst(HttpHeaders.SET_COOKIE));
    }

    @Test
    void loginSetsHttpOnlyCookieWhenCookieAuthEnabled() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = controller(authService, true);
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse());

        ResponseEntity<AuthResponse> response = controller.login(new LoginRequest("user@example.com", "password123"));

        String cookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertNotNull(cookie);
        assertTrue(cookie.startsWith("koupreng_access_token=jwt-token"));
        assertTrue(cookie.contains("Path=/"));
        assertTrue(cookie.contains("Max-Age=900"));
        assertTrue(cookie.contains("HttpOnly"));
        assertTrue(cookie.contains("SameSite=Lax"));
    }

    @Test
    void logoutClearsCookieWhenCookieAuthEnabled() {
        AuthService authService = mock(AuthService.class);
        Authentication authentication = mock(Authentication.class);
        AuthController controller = controller(authService, true);
        doNothing().when(authService).logout(authentication);

        ResponseEntity<MessageResponse> response = controller.logout(authentication);

        String cookie = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertNotNull(cookie);
        assertTrue(cookie.startsWith("koupreng_access_token="));
        assertTrue(cookie.contains("Path=/"));
        assertTrue(cookie.contains("Max-Age=0"));
        assertTrue(cookie.contains("HttpOnly"));
        assertTrue(cookie.contains("SameSite=Lax"));
    }

    private AppProperties appProperties(boolean cookieEnabled) {
        AppProperties appProperties = new AppProperties();
        appProperties.getAuth().getCookie().setEnabled(cookieEnabled);
        appProperties.getAuth().getCookie().setName("koupreng_access_token");
        appProperties.getAuth().getCookie().setHttpOnly(true);
        appProperties.getAuth().getCookie().setSameSite("Lax");
        appProperties.getAuth().getCookie().setMaxAgeSeconds(900);
        return appProperties;
    }

    private AuthController controller(AuthService authService, boolean cookieEnabled) {
        return new AuthController(
                authService,
                mock(AccountService.class),
                mock(UserService.class),
                new AuthCookieService(appProperties(cookieEnabled))
        );
    }

    private AuthResponse authResponse() {
        UserResponse user = new UserResponse(
                1L,
                "user@example.com",
                null,
                "Test User",
                null,
                Role.USER,
                "ACTIVE",
                Instant.now(),
                Instant.now()
        );
        return AuthResponse.bearer("jwt-token", Instant.now().plusSeconds(900), user);
    }
}
