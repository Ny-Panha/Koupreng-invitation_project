package com.koupreng.backend.auth.infrastructure.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.koupreng.backend.auth.api.dto.ForgotPasswordRequest;
import com.koupreng.backend.auth.application.AccountService;
import com.koupreng.backend.auth.application.AuthService;
import com.koupreng.backend.service.UserService;

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
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CHANGE_PASSWORD_BODY))
                .andExpect(status().isOk());
    }

    @Test
    void hostileOriginIsRejectedEvenWithCsrfToken() throws Exception {
        mockMvc.perform(post("/api/auth/change-password")
                        .with(user("user").roles("USER"))
                        .with(csrf())
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
}
