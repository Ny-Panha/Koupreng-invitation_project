package com.koupreng.backend.auth.infrastructure.security;

import com.koupreng.backend.auth.api.dto.ForgotPasswordRequest;
import com.koupreng.backend.auth.api.dto.ResetPasswordRequest;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.payment.admin-secret=auth-test-secret",
        "app.waf.max-requests-per-minute=1000"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthEndpointSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private AccountService accountService;

    @MockitoBean
    private UserService userService;

    @Test
    void forgotPasswordIsPublic() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"user@example.com"}
                                """))
                .andExpect(status().isOk());

        verify(accountService).forgotPassword(any(ForgotPasswordRequest.class));
    }

    @Test
    void resetPasswordIsPublic() throws Exception {
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"reset-token","newPassword":"Newpass123"}
                                """))
                .andExpect(status().isOk());

        verify(accountService).resetPassword(any(ResetPasswordRequest.class));
    }

    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changePasswordRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"oldPassword":"Oldpass123","newPassword":"Newpass123"}
                                """))
                .andExpect(status().isUnauthorized());
    }
}
