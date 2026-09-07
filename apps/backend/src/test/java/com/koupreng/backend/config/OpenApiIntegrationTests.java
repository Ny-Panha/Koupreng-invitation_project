package com.koupreng.backend.config;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.dto.AuthResponse;
import com.koupreng.backend.dto.LoginRequest;
import com.koupreng.backend.dto.UserResponse;
import com.koupreng.backend.entity.user.Role;
import com.koupreng.backend.service.AuthService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "app.auth.cookie.enabled=false",
        "app.payment.admin-secret=openapi-test-secret",
        "app.waf.max-requests-per-minute=1000",
        "springdoc.api-docs.enabled=true",
        "springdoc.swagger-ui.enabled=true"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OpenApiIntegrationTests {

    private static final String STRICT_API_CSP =
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void openApiIsPublicAndContainsJwtBearerScheme() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.info.title").value("Koupreng E-Invitation API"))
                .andExpect(jsonPath("$.info.version").value("v1"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"));
    }

    @Test
    void generatedDocumentDistinguishesPublicProtectedAndAdminOperations() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/auth/login'].post.security").doesNotExist())
                .andExpect(jsonPath("$.paths['/api/v1/public/invitations/{slug}'].get.security").isEmpty())
                .andExpect(jsonPath("$.paths['/api/v1/payway/callback'].post.security").isEmpty())
                .andExpect(jsonPath("$.paths['/api/users/me'].get.security[0].bearerAuth").isArray())
                .andExpect(jsonPath("$.paths['/api/v1/admin/users'].get.security[0].bearerAuth").isArray())
                .andExpect(content().string(not(containsString("/api/v1/internal/template-payments/"))));
    }

    @Test
    void everyDocumentedOperationHasReadableSummary() throws Exception {
        String document = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode paths = objectMapper.readTree(document).path("paths");
        Set<String> httpMethods = Set.of("get", "post", "put", "patch", "delete", "head", "options", "trace");
        paths.properties().forEach(path -> path.getValue().properties().stream()
                .filter(operation -> httpMethods.contains(operation.getKey()))
                .forEach(operation -> assertFalse(
                        operation.getValue().path("summary").asText().isBlank(),
                        () -> operation.getKey().toUpperCase() + " " + path.getKey() + " is missing a summary")));
    }

    @Test
    void sensitiveRequestSchemasAreWriteOnly() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.schemas.LoginRequest.properties.password.writeOnly").value(true))
                .andExpect(jsonPath("$.components.schemas.RegisterRequest.properties.password.writeOnly").value(true))
                .andExpect(jsonPath("$.components.schemas.ResetPasswordRequest.properties.token.writeOnly").value(true))
                .andExpect(jsonPath("$.components.schemas.ResetPasswordRequest.properties.newPassword.writeOnly").value(true))
                .andExpect(jsonPath("$.components.schemas.GoogleLoginRequest.properties.idToken.writeOnly").value(true));
    }

    @Test
    void swaggerUiUsesScopedCspWhileNormalApiKeepsStrictCsp() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(header().string("Content-Security-Policy", containsString("default-src 'self'")))
                .andExpect(header().string("Content-Security-Policy", containsString("script-src 'self'")))
                .andExpect(header().string("Content-Security-Policy", containsString("connect-src 'self'")));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Security-Policy", STRICT_API_CSP));
    }

    @Test
    void loginRemainsPublicAndProtectedApiStillRequiresAuthentication() throws Exception {
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"identifier":"user@example.com","password":"ExamplePass123!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("test-jwt"));

        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void normalUserStillCannotAccessAdminApi() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isForbidden());
    }

    private AuthResponse authResponse() {
        Instant now = Instant.now();
        return AuthResponse.bearer(
                "test-jwt",
                now.plusSeconds(900),
                new UserResponse(1L, "user@example.com", null, "Test User", null,
                        Role.USER, "ACTIVE", now, now)
        );
    }
}
