package com.koupreng.backend.auth.infrastructure.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.koupreng.backend.auth.api.dto.ForgotPasswordRequest;
import com.koupreng.backend.auth.application.AccountService;
import com.koupreng.backend.auth.application.AuthService;
import com.koupreng.backend.user.application.UserService;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import jakarta.servlet.http.Cookie;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.BadJwtException;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "app.auth.cookie.enabled=true",
        "app.payment.admin-secret=cookie-csrf-test-secret",
        "app.waf.max-requests-per-minute=1000"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CookieCsrfSecurityTests {

    private static final String CHANGE_PASSWORD_BODY = """
            {"oldPassword":"Oldpass123","newPassword":"Newpass123"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private AccountService accountService;

    @MockitoBean
    private UserService userService;

    @MockitoBean private JwtDecoder jwtDecoder;
    @MockitoBean private AppUserRepository userRepository;
    @MockitoBean private UserAuthCacheService authCache;

    @Test
    void crossOriginCookieLoginProvidesProofForTheFirstMutationWithoutReload() throws Exception {
        mockAuthentication();
        when(authService.login(any())).thenReturn(com.koupreng.backend.auth.api.dto.AuthResponse.bearer(
                "valid-cookie-token", java.time.Instant.now().plusSeconds(900), null));
        var response = mockMvc.perform(post("/api/v1/auth/login")
                        .header("Origin", "http://localhost:5173").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"host@example.test\",\"password\":\"Example123!\"}"))
                .andExpect(status().isOk()).andReturn().getResponse();
        String proof = response.getHeader("X-XSRF-TOKEN");
        org.assertj.core.api.Assertions.assertThat(proof).isNotBlank();
        mockMvc.perform(post("/api/v1/auth/change-password")
                        .cookie(new Cookie("koupreng_access_token", "valid-cookie-token"), response.getCookie("XSRF-TOKEN"))
                        .header("X-XSRF-TOKEN", proof).header("Origin", "http://localhost:5173")
                        .contentType(MediaType.APPLICATION_JSON).content(CHANGE_PASSWORD_BODY)).andExpect(status().isOk());
    }

    @Test
    void cookieBootstrapExposesMatchingCsrfProofForBothCurrentUserAliases() throws Exception {
        mockAuthentication();
        for (String path : new String[]{"/api/auth/me", "/api/v1/auth/me"}) {
            var response = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(path)
                            .cookie(new Cookie("koupreng_access_token", "valid-cookie-token"))
                            .header("Origin", "http://localhost:5173"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Expose-Headers", containsString("X-XSRF-TOKEN")))
                    .andReturn().getResponse();
            org.assertj.core.api.Assertions.assertThat(response.getHeader("X-XSRF-TOKEN")).isNotBlank();
            org.assertj.core.api.Assertions.assertThat(response.getCookie("XSRF-TOKEN").getValue())
                    .isEqualTo(response.getHeader("X-XSRF-TOKEN"));
        }
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/auth/me")
                        .header("Origin", "http://localhost:5173"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void allowedCookieOriginCanPreflightXsrfHeaderAndHostileOriginCannot() throws Exception {
        mockMvc.perform(options("/api/v1/users/me")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "PATCH")
                        .header("Access-Control-Request-Headers", "content-type,x-xsrf-token"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Headers", containsString("x-xsrf-token")))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        mockMvc.perform(options("/api/v1/users/me")
                        .header("Origin", "https://attacker.example")
                        .header("Access-Control-Request-Method", "PATCH")
                        .header("Access-Control-Request-Headers", "x-xsrf-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void explicitBearerRemainsUsableWithoutCsrfInCookieModeAndInvalidBearerNeverFallsBack() throws Exception {
        mockAuthentication();
        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer valid-header-token")
                        .contentType(MediaType.APPLICATION_JSON).content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isOk());
        when(jwtDecoder.decode("invalid-header-token")).thenThrow(new BadJwtException("Invalid test token"));
        mockMvc.perform(post("/api/auth/change-password")
                        .cookie(new Cookie("koupreng_access_token", "valid-cookie-token"))
                        .header("Authorization", "Bearer invalid-header-token")
                        .contentType(MediaType.APPLICATION_JSON).content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cookieJwtMutationRequiresMatchingXsrfCookieAndHeader() throws Exception {
        mockAuthentication();
        mockMvc.perform(post("/api/auth/change-password")
                        .cookie(new Cookie("koupreng_access_token", "valid-cookie-token"))
                        .contentType(MediaType.APPLICATION_JSON).content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/auth/change-password")
                        .cookie(new Cookie("koupreng_access_token", "valid-cookie-token"), new Cookie("XSRF-TOKEN", "csrf-proof"))
                        .header("X-XSRF-TOKEN", "wrong-proof")
                        .contentType(MediaType.APPLICATION_JSON).content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/auth/change-password")
                        .cookie(new Cookie("koupreng_access_token", "valid-cookie-token"), new Cookie("XSRF-TOKEN", "csrf-proof"))
                        .header("X-XSRF-TOKEN", "csrf-proof")
                        .header("Origin", "http://localhost:5173")
                        .contentType(MediaType.APPLICATION_JSON).content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isOk());
    }

    private void mockAuthentication() {
        AppUser appUser = new AppUser();
        appUser.setId(55L);
        appUser.setFullName("Cookie test");
        appUser.setRole(Role.USER);
        when(userRepository.findById(55L)).thenReturn(Optional.of(appUser));
        when(authCache.getAuthInfo(55L)).thenReturn(Optional.of(new UserAuthCacheService.CachedAuthInfo(true, 0, Role.USER)));
        Jwt token = Jwt.withTokenValue("test-jwt").header("alg", "HS256").subject("55").claim("token_version", 0).build();
        when(jwtDecoder.decode("valid-header-token")).thenReturn(token);
        when(jwtDecoder.decode("valid-cookie-token")).thenReturn(token);
    }

    @Test
    void authenticatedMutationRejectsMissingCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/change-password")
                        .with(user("user").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isForbidden());
    }

    @Test
    void authenticatedMutationAcceptsValidCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/change-password")
                        .with(user("user").roles("USER"))
                        .cookie(new Cookie("XSRF-TOKEN", "csrf-proof"))
                        .header("X-XSRF-TOKEN", "csrf-proof")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isOk());
    }

    @Test
    void hostileOriginIsRejectedEvenWithCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/change-password")
                        .with(user("user").roles("USER"))
                        .cookie(new Cookie("XSRF-TOKEN", "csrf-proof"))
                        .header("X-XSRF-TOKEN", "csrf-proof")
                        .header("Origin", "https://attacker.example")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isForbidden());
    }

    @Test
    void explicitlyIgnoredRecoveryEndpointRemainsPublicWithoutCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"user@example.com"}
                                """))
                .andExpect(status().isOk());

        verify(accountService).forgotPassword(any(ForgotPasswordRequest.class));
    }

    @Test
    void canonicalRecoveryEndpointIsAlsoIgnoredByCsrf() throws Exception {
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"canonical@example.com"}
                                """))
                .andExpect(status().isOk());

        verify(accountService).forgotPassword(any(ForgotPasswordRequest.class));
    }

    @Test
    void canonicalProfileMutationRejectsMissingCsrfToken() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me")
                        .with(user("user").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Updated User","phone":"012345678"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void canonicalProfileMutationAcceptsValidCsrfToken() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me")
                        .with(user("user").roles("USER"))
                        .cookie(new Cookie("XSRF-TOKEN", "csrf-proof"))
                        .header("X-XSRF-TOKEN", "csrf-proof")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Updated User","phone":"012345678"}
                                """))
                .andExpect(status().isOk());
    }
}
