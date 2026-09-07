package com.koupreng.backend.config;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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
        "scalar.enabled=true",
        "scalar.path=/docs",
        "scalar.url=/v3/api-docs"
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
    void scalarUsesScopedCspWhileNormalApiKeepsStrictCsp() throws Exception {
        mockMvc.perform(get("/docs"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(containsString("Koupreng E-Invitation API")))
                .andExpect(header().string("Content-Security-Policy", containsString("default-src 'self'")))
                .andExpect(header().string(
                        "Content-Security-Policy",
                        containsString("script-src 'self' 'unsafe-inline'")))
                .andExpect(header().string("Content-Security-Policy", containsString("connect-src 'self'")));

        mockMvc.perform(get("/docs/scalar.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(not("")));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Security-Policy", STRICT_API_CSP));
    }

    @Test
    void obsoleteSwaggerUiIsNotPubliclyExposed() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void importantRequestsHaveCompleteNamedExamples() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/auth/login'].post.requestBody.content['application/json']"
                        + ".examples.demoUser.value.identifier").value("demo@koupreng.local"))
                .andExpect(jsonPath("$.paths['/api/auth/login'].post.requestBody.content['application/json']"
                        + ".examples.demoUser.value.password").value("DemoPass123!"))
                .andExpect(jsonPath("$.paths['/api/auth/register'].post.requestBody.content['application/json']"
                        + ".examples.newUser.value.fullName").value("Koupreng Demo User"))
                .andExpect(jsonPath("$.paths['/api/v1/invitations'].post.requestBody.content['application/json']"
                        + ".examples.khmerWedding.value.eventType").value("WEDDING"))
                .andExpect(jsonPath("$.paths['/api/v1/invitations'].post.requestBody.content['application/json']"
                        + ".examples.khmerWedding.value.languageMode").value("BILINGUAL"))
                .andExpect(jsonPath("$.paths['/api/v1/invitations'].post.requestBody.content['application/json']"
                        + ".examples.khmerWedding.value.rsvpDeadline").value("2035-02-10"))
                .andExpect(jsonPath("$.paths['/api/v1/invitations/{invitationId}/guests'].post.requestBody"
                        + ".content['application/json'].examples.familyGuest.value.seatCount").value(4))
                .andExpect(jsonPath("$.paths['/api/v1/public/invitations/{slug}/rsvp'].post.requestBody"
                        + ".content['application/json'].examples.attending.value.responseStatus")
                        .value("ATTENDING"))
                .andExpect(jsonPath("$.paths['/api/v1/invitations/{invitationId}/check-in/scan'].post.requestBody"
                        + ".content['application/json'].examples.fixtureGuest.value.token")
                        .value("demo-guest-attending-token"));
    }

    @Test
    void stableFixtureParametersArePreFilled() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/public/invitations/{slug}'].get.parameters[0].example")
                        .value("demo-wedding"))
                .andExpect(jsonPath("$.paths['/api/v1/public/invitations/{slug}/guests/{inviteToken}/rsvp']"
                        + ".post.parameters[1].example").value("demo-guest-attending-token"));
    }

    @Test
    void everyInteractiveJsonRequestHasAnExample() throws Exception {
        String document = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode paths = objectMapper.readTree(document).path("paths");
        Set<String> httpMethods = Set.of("get", "post", "put", "patch", "delete");
        List<String> missingExamples = new ArrayList<>();
        paths.properties().forEach(path -> path.getValue().properties().stream()
                .filter(operation -> httpMethods.contains(operation.getKey()))
                .filter(operation -> !"/api/v1/payway/callback".equals(path.getKey()))
                .forEach(operation -> {
                    JsonNode jsonBody = operation.getValue().path("requestBody").path("content")
                            .path("application/json");
                    if (!jsonBody.isMissingNode() && jsonBody.path("examples").isEmpty()) {
                        missingExamples.add(operation.getKey().toUpperCase() + " " + path.getKey());
                    }
                }));

        assertTrue(missingExamples.isEmpty(), () -> "Missing request examples: " + missingExamples);
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
