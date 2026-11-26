package com.koupreng.backend.phase15;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Real HTTP/JWT/JPA/MySQL acceptance tests for Phase 15 publish, unpublish,
 * visibility, password-gate and rate-limit contracts.
 *
 * <p>Deliberately restricted to the owned disposable database supplied through the
 * FLYWAY_TEST_DB_* environment variables; it never creates its own schema. The suite
 * is opt-in through RUN_PHASE7_MYSQL so it only runs in the Real HTTP CI job.</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "app.dev-sample-data.enabled=false", "app.auth.first-user-admin-enabled=false",
        "app.auth.max-register-attempts-per-minute=1000", "app.waf.max-requests-per-minute=10000",
        "app.security.logging.enabled=false"
})
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@EnabledIfEnvironmentVariable(named = "RUN_PHASE7_MYSQL", matches = "true")
class Phase15PublishingAccessMySqlTests {
    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        String url = required("FLYWAY_TEST_DB_URL");
        boolean ownedStudio = url.matches("jdbc:mysql://127\\.0\\.0\\.1:3306/koupreng_studio_[a-f0-9]{32}\\?.*");
        if (!url.startsWith("jdbc:mysql://127.0.0.1:3416/phase7_disposable?")
                && !url.startsWith("jdbc:mysql://127.0.0.1:3420/phase12_disposable?")
                && !ownedStudio) {
            throw new IllegalStateException("Requires an owned loopback disposable database");
        }
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
        registry.add("app.security.cors.allowed-origins",
                () -> "http://localhost:5173,http://localhost:5174,http://127.0.0.1:4175,http://127.0.0.1:4176");
    }

    @Test
    void publishValidationVisibilityPasswordGateAndRateLimitOverRealHttp() throws Exception {
        List<String> inspectedBodies = new ArrayList<>();
        Auth owner = register();

        // 1. Publish must fail while required venue fields are missing.
        Map<String, Object> incomplete = new HashMap<>();
        incomplete.put("title", "Phase 15 fictional validation fixture");
        incomplete.put("eventType", "WEDDING");
        incomplete.put("groomName", "Fictional groom");
        incomplete.put("brideName", "Fictional bride");
        incomplete.put("hostName", "Fictional host");
        incomplete.put("eventDate", "2027-05-01");
        incomplete.put("eventTime", "17:00");
        Reply created = call("POST", "/api/v1/invitations", owner, incomplete);
        assertEquals(201, created.status, created.body);
        long invitationId = created.data().path("id").asLong();
        String path = "/api/v1/invitations/" + invitationId;

        Reply invalidPublish = call("PATCH", path + "/publish", owner, null);
        assertEquals(400, invalidPublish.status, invalidPublish.body);
        assertTrue(invalidPublish.body.contains("Publish requirements missing"), invalidPublish.body);

        // 2. Fill every required field, publish PUBLIC, and read anonymously twice.
        assertEquals(200, call("PUT", path, owner, fullBody("PUBLIC", null)).status);
        Reply published = call("PATCH", path + "/publish", owner, null);
        assertEquals(200, published.status, published.body);
        String slug = published.data().path("slug").asText();
        assertFalse(slug.isBlank(), "A published invitation must own a slug");

        Reply anonymous = call("GET", "/api/v1/public/invitations/" + slug, null, null);
        assertEquals(200, anonymous.status, anonymous.body);
        inspectedBodies.add(anonymous.body);
        Reply refreshed = call("GET", "/api/v1/public/invitations/" + slug, null, null);
        assertEquals(200, refreshed.status, refreshed.body);
        assertEquals(slug, refreshed.data().path("slug").asText(), "Refresh must serve the same slug");

        // 3. Unpublishing revokes anonymous access.
        assertEquals(200, call("PATCH", path + "/unpublish", owner, null).status);
        assertEquals(404, call("GET", "/api/v1/public/invitations/" + slug, null, null).status);
        assertFalse(call("GET", "/api/v1/public/invitations/" + slug, null, null).body.contains("\"guest\""));

        // 4. PRIVATE is owner-only until a guest invite token is presented.
        assertEquals(200, call("PUT", path, owner, fullBody("PRIVATE", null)).status);
        assertEquals(200, call("PATCH", path + "/publish", owner, null).status);
        assertEquals(404, call("GET", "/api/v1/public/invitations/" + slug, null, null).status);

        Reply ownerView = call("GET", path, owner, null);
        assertEquals(200, ownerView.status, ownerView.body);
        inspectedBodies.add(ownerView.body);

        Reply guest = call("POST", path + "/guests", owner,
                Map.of("guestName", "Fictional private guest", "seatCount", 2));
        assertEquals(201, guest.status, guest.body);
        String inviteToken = guest.data().path("inviteToken").asText();
        assertFalse(inviteToken.isBlank(), "Guest creation must return an invite token");

        Reply guestRead = call("GET", "/api/v1/public/invitations/" + slug + "?token=" + inviteToken, null, null);
        assertEquals(200, guestRead.status, guestRead.body);
        inspectedBodies.add(guestRead.body);
        assertTrue(guestRead.data().path("guest").isObject(), "Guest token must yield the guest payload");
        assertEquals("Fictional private guest", guestRead.data().path("guest").path("guestName").asText());

        // 5. PASSWORD_PROTECTED blocks anonymous reads until the password is verified.
        String password = "Phase15!Pass-" + UUID.randomUUID();
        assertEquals(200, call("PUT", path, owner, fullBody("PASSWORD_PROTECTED", password)).status);
        assertEquals(200, call("PATCH", path + "/publish", owner, null).status);

        Reply gated = call("GET", "/api/v1/public/invitations/" + slug, null, null);
        assertEquals(403, gated.status, gated.body);
        assertTrue(gated.body.contains("Invitation password required"), gated.body);

        Reply wrongPassword = verify(slug, password + "-wrong");
        assertEquals(403, wrongPassword.status, wrongPassword.body);
        inspectedBodies.add(wrongPassword.body);

        Reply verified = verify(slug, password);
        assertEquals(200, verified.status, verified.body);
        inspectedBodies.add(verified.body);
        String accessToken = verified.data().path("accessToken").asText();
        assertFalse(accessToken.isBlank(), "Verification must return an access token");

        Reply protectedRead = call("GET", "/api/v1/public/invitations/" + slug + "?accessToken=" + accessToken, null, null);
        assertEquals(200, protectedRead.status, protectedRead.body);
        inspectedBodies.add(protectedRead.body);

        // 6. The limiter allows 5 password failures per minute, then returns 429.
        Auth secondOwner = register();
        String secondPassword = "Phase15!Second-" + UUID.randomUUID();
        Reply secondCreated = call("POST", "/api/v1/invitations", secondOwner,
                fullBody("PASSWORD_PROTECTED", secondPassword));
        assertEquals(201, secondCreated.status, secondCreated.body);
        long secondId = secondCreated.data().path("id").asLong();
        Reply secondPublished = call("PATCH", "/api/v1/invitations/" + secondId + "/publish", secondOwner, null);
        assertEquals(200, secondPublished.status, secondPublished.body);
        String secondSlug = secondPublished.data().path("slug").asText();
        for (int attempt = 1; attempt <= 5; attempt++) {
            assertEquals(403, verify(secondSlug, "wrong-" + attempt).status, "Failure " + attempt);
        }
        assertEquals(429, verify(secondSlug, secondPassword).status,
                "The sixth password attempt in the window must be rate limited");

        // 7. Rotating the password invalidates the old secret for verification.
        String rotated = "Phase15!Rotated-" + UUID.randomUUID();
        assertEquals(200, call("PUT", path, owner, fullBody("PASSWORD_PROTECTED", rotated)).status);
        assertEquals(403, verify(slug, password).status, "The old password must no longer verify");
        assertEquals(200, verify(slug, rotated).status, "The rotated password must verify");
        // The accessToken issued before rotation remains a separate bearer capability:
        // the contract does not revoke existing access tokens when the password changes,
        // so this is documented behavior and deliberately not asserted as revoked.

        // 8. Unpublishing also revokes password verification and anonymous reads.
        assertEquals(200, call("PATCH", path + "/unpublish", owner, null).status);
        assertEquals(404, call("GET", "/api/v1/public/invitations/" + slug, null, null).status);
        assertEquals(404, verify(slug, rotated).status);

        // 9. No public, verify or owner payload may leak the stored secret or bcrypt hash.
        for (String body : inspectedBodies) {
            assertFalse(body.contains("accessPassword"), "Response leaked the credential field: " + body);
            assertFalse(body.contains("$2"), "Response leaked a bcrypt hash: " + body);
        }
    }

    private Map<String, Object> fullBody(String visibility, String accessPassword) {
        Map<String, Object> body = new HashMap<>();
        body.put("title", "Phase 15 fictional published fixture");
        body.put("eventType", "WEDDING");
        body.put("groomName", "Fictional groom");
        body.put("brideName", "Fictional bride");
        body.put("hostName", "Fictional host");
        body.put("eventDate", "2027-05-01");
        body.put("eventTime", "17:00");
        body.put("venueName", "Fictional venue");
        body.put("venueAddress", "Fictional address");
        body.put("visibility", visibility);
        body.put("contentJson", "{}");
        if (accessPassword != null) {
            body.put("accessPassword", accessPassword);
        }
        return body;
    }

    private Reply verify(String slug, String password) throws Exception {
        return call("POST", "/api/v1/public/invitations/" + slug + "/access/verify", null,
                Map.of("password", password));
    }

    private Auth register() throws Exception {
        String email = "p15-" + UUID.randomUUID() + "@example.test";
        String password = "Phase15!aA15" + UUID.randomUUID();
        Reply reply = call("POST", "/api/auth/register", null,
                Map.of("fullName", "Phase 15 fictional account", "email", email, "password", password));
        assertEquals(200, reply.status, reply.body);
        return new Auth(reply.root.path("user").path("id").asLong(), email, reply.root.path("accessToken").asText(), password);
    }

    private Reply call(String method, String path, Auth user, Object body) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json");
        if (user != null) {
            request.header("Authorization", "Bearer " + user.token);
        }
        request.method(method, body == null
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
        var response = http.send(request.build(), HttpResponse.BodyHandlers.ofString());
        return new Reply(response.statusCode(),
                response.body().isBlank() ? json.createObjectNode() : json.readTree(response.body()),
                response.body());
    }

    private static String required(String key) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing disposable configuration: " + key);
        }
        return value;
    }

    private record Auth(long id, String email, String token, String password) { }

    private record Reply(int status, JsonNode root, String body) {
        JsonNode data() {
            return root.path("data");
        }
    }
}
