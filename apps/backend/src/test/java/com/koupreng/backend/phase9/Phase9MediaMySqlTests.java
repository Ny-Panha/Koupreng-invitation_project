package com.koupreng.backend.phase9;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.subscription.application.PackageSnapshot;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

/** Actual HTTP, JWT, Flyway, MySQL and local-file storage. No intercepted API/storage provider. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "app.dev-sample-data.enabled=false", "app.auth.first-user-admin-enabled=false",
        "app.auth.max-register-attempts-per-minute=1000", "app.waf.max-requests-per-minute=10000",
        "app.security.logging.enabled=false", "app.security.upload.max-gallery-files-per-invitation=1",
        "app.storage.provider=local", "app.security.cors.allowed-origins=http://127.0.0.1:4291"
})
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_PHASE7_MYSQL", matches = "true")
class Phase9MediaMySqlTests {
    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    @Autowired AppUserRepository users;
    @Autowired SubscriptionPackageRepository packages;
    @Autowired SubscriptionRepository subscriptions;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private static final Path uploads = Path.of(System.getProperty("java.io.tmpdir"), "koupreng-p9-" + UUID.randomUUID(), "uploads");
    private static final byte[] PNG = Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAccAAAAASUVORK5CYII=");
    private static final byte[] MP4 = "0000ftypisom-phase9-format-fixture".getBytes(StandardCharsets.US_ASCII);

    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        String url = required("FLYWAY_TEST_DB_URL");
        if (!url.startsWith("jdbc:mysql://127.0.0.1:3416/phase7_disposable?") && !url.startsWith("jdbc:mysql://127.0.0.1:3420/phase12_disposable?")) throw new IllegalStateException("Requires task-owned disposable MySQL");
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
        registry.add("app.storage.local.upload-dir", uploads::toString);
    }

    @Test void reproduceGalleryQuotaFailureThenPersistIndependentTicketCoverAndBackground() throws Exception {
        Auth owner = register(); grant(owner, "PREMIUM"); JsonNode event = createEvent(owner);
        long id = event.path("id").asLong(); String path = eventPath(id);
        assertEquals(201, upload(path + "/media/gallery", owner, "files", "gallery.png", "image/png", PNG).status);
        Reply quota = upload(path + "/media/gallery", owner, "files", "ticket-cover.png", "image/png", PNG);
        assertEquals(409, quota.status); assertTrue(quota.root.toString().contains("gallery limit"));
        Reply cover = upload(path + "/media/ticket-image", owner, "file", "ticket-cover.png", "image/png", PNG);
        Reply background = upload(path + "/media/ticket-image", owner, "file", "ticket-background.png", "image/png", PNG);
        assertEquals(201, cover.status); assertEquals(201, background.status);
        assertEquals("TICKET_IMAGE", cover.data().path("mediaType").asText());
        var imageRequest = HttpRequest.newBuilder(URI.create(origin() + cover.data().path("fileUrl").asText())).header("Origin", "http://127.0.0.1:4291").GET().build();
        var image = http.send(imageRequest, HttpResponse.BodyHandlers.ofByteArray());
        assertEquals(200, image.statusCode()); assertArrayEquals(PNG, image.body());
        assertEquals("http://127.0.0.1:4291", image.headers().firstValue("Access-Control-Allow-Origin").orElse(""));
        assertEquals(403, http.send(HttpRequest.newBuilder(imageRequest.uri()).header("Origin", "https://untrusted.example.test").GET().build(), HttpResponse.BodyHandlers.discarding()).statusCode());
        var design = (com.fasterxml.jackson.databind.node.ObjectNode) call("GET", path + "/ticket-design", owner, null).data().path("design").deepCopy();
        design.put("coverMediaId", cover.data().path("id").asLong()); design.put("backgroundMediaId", background.data().path("id").asLong());
        design.put("coverFocusY", 75); design.put("backgroundOpacity", .25); design.put("coverFit", "CONTAIN");
        Reply saved = call("PUT", path + "/ticket-design", owner, design); assertEquals(200, saved.status);
        assertFalse(saved.data().path("coverUrl").isNull()); assertFalse(saved.data().path("backgroundUrl").isNull());
        Reply loaded = call("GET", path + "/ticket-design", owner, null); assertEquals(75, loaded.data().path("design").path("coverFocusY").asInt());
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM media_files WHERE invitation_id=? AND media_type='GALLERY_IMAGE'", Integer.class, id));
        assertEquals(409, call("DELETE", path + "/media/" + cover.data().path("id").asLong(), owner, null).status);
        Auth stranger = register(); grant(stranger, "PREMIUM");
        assertEquals(403, upload(path + "/media/ticket-image", stranger, "file", "unauthorized.png", "image/png", PNG).status);
        JsonNode other = createEvent(stranger);
        var otherDesign = (com.fasterxml.jackson.databind.node.ObjectNode) call("GET", eventPath(other.path("id").asLong()) + "/ticket-design", stranger, null).data().path("design").deepCopy();
        otherDesign.put("coverMediaId", cover.data().path("id").asLong());
        assertEquals(400, call("PUT", eventPath(other.path("id").asLong()) + "/ticket-design", stranger, otherDesign).status);
        assertEquals(400, upload(path + "/media/ticket-image", owner, "file", "bad.svg", "image/svg+xml", "<svg/>".getBytes()).status);
        assertEquals(413, upload(path + "/media/ticket-image", owner, "file", "huge.png", "image/png", new byte[5 * 1024 * 1024 + 1]).status);
    }

    @Test void freeAndProCannotUploadOrForgePremiumConfiguration() throws Exception {
        Auth owner = register(); JsonNode event = createEvent(owner); long id = event.path("id").asLong();
        for (String plan : List.of("FREE", "PRO")) {
            if (plan.equals("PRO")) grant(owner, plan);
            assertEquals(403, upload(eventPath(id) + "/media/pre-wedding-video", owner, "file", "movie.mp4", "video/mp4", MP4).status);
            Reply forged = saveContent(owner, id, Map.of("preWeddingVideo", Map.of("enabled", true, "videoMediaId", 1234567)));
            assertEquals(403, forged.status);
            assertFalse(call("GET", "/api/v1/me/entitlements", owner, null).data().path("features").toString().contains("PRE_WEDDING_VIDEO"));
        }
    }

    @Test void cinematicBytesRequirePublishedAccessCurrentPremiumAndSelectedOwnedId() throws Exception {
        Auth owner = register(); Subscription grant = grant(owner, "PREMIUM"); JsonNode event = createEvent(owner); long id = event.path("id").asLong();
        String path = eventPath(id), slug = event.path("slug").asText();
        Reply video = upload(path + "/media/pre-wedding-video", owner, "file", "movie.mp4", "video/mp4", MP4);
        assertEquals(201, video.status); long mediaId = video.data().path("id").asLong();
        assertTrue(video.data().path("fileUrl").isNull());
        var settings = Map.of("preWeddingVideo", Map.of("enabled", true, "videoMediaId", mediaId));
        assertEquals(200, saveContent(owner, id, settings).status);
        assertEquals(404, content(slug, mediaId, null).statusCode());
        assertEquals(200, call("PATCH", path + "/publish", owner, null).status);
        Reply publicEvent = call("GET", "/api/v1/public/invitations/" + slug, null, null);
        assertTrue(publicEvent.data().path("cinematicOpening").path("enabled").asBoolean());
        var bytes = content(slug, mediaId, null); assertEquals(200, bytes.statusCode()); assertArrayEquals(MP4, bytes.body());
        assertEquals("private, no-store", bytes.headers().firstValue("Cache-Control").orElse(""));
        Reply listing = call("GET", "/api/v1/public/invitations/" + slug + "/media", null, null);
        assertFalse(listing.root.toString().contains("PRE_WEDDING_VIDEO"));
        String publicId = jdbc.queryForObject("SELECT public_id FROM media_files WHERE media_id=?", String.class, mediaId);
        assertFalse(Files.exists(uploads.resolve(publicId))); // private bytes live outside the static upload root
        assertNotEquals(200, http.send(HttpRequest.newBuilder(URI.create(origin() + "/uploads/" + publicId)).GET().build(), HttpResponse.BodyHandlers.discarding()).statusCode());
        assertEquals(404, content(slug, mediaId + 1000000, null).statusCode());
        assertEquals(409, call("DELETE", path + "/media/" + mediaId, owner, null).status);
        Auth other = register(); grant(other, "PREMIUM"); long otherId = createEvent(other).path("id").asLong();
        assertEquals(400, saveContent(other, otherId, settings).status);
        grant.setEndDate(Instant.now().minusSeconds(1)); subscriptions.saveAndFlush(grant);
        assertFalse(call("GET", "/api/v1/public/invitations/" + slug, null, null).data().path("cinematicOpening").path("enabled").asBoolean());
        assertEquals(404, content(slug, mediaId, null).statusCode());
        assertEquals(403, saveContent(owner, id, settings).status);
        assertEquals(200, saveContent(owner, id, Map.of("preWeddingVideo", Map.of("enabled", false, "videoMediaId", mediaId))).status);
    }

    @Test void privateInvitationCannotReleaseCinematicBytesWithoutItsAccessToken() throws Exception {
        Auth owner = register(); grant(owner, "PREMIUM"); JsonNode event = createEvent(owner); long id = event.path("id").asLong();
        long video = upload(eventPath(id) + "/media/pre-wedding-video", owner, "file", "movie.mp4", "video/mp4", MP4).data().path("id").asLong();
        var body = eventBody(); body.put("visibility", "PRIVATE"); body.put("contentJson", json.writeValueAsString(Map.of("preWeddingVideo", Map.of("enabled", true, "videoMediaId", video))));
        body.put("expectedUpdatedAt", call("GET", eventPath(id), owner, null).data().path("updatedAt").asText());
        assertEquals(200, call("PUT", eventPath(id), owner, body).status);
        assertEquals(200, call("PATCH", eventPath(id) + "/publish", owner, null).status);
        assertEquals(404, content(event.path("slug").asText(), video, null).statusCode());
        String access = jdbc.queryForObject("SELECT access_token FROM invitations WHERE invitation_id=?", String.class, id);
        assertEquals(200, content(event.path("slug").asText(), video, access).statusCode());
    }

    private Reply saveContent(Auth auth, long id, Object settings) throws Exception {
        var body = eventBody(); body.put("contentJson", json.writeValueAsString(settings));
        body.put("expectedUpdatedAt", call("GET", eventPath(id), auth, null).data().path("updatedAt").asText());
        return call("PUT", eventPath(id), auth, body);
    }
    private JsonNode createEvent(Auth auth) throws Exception { Reply created = call("POST", "/api/v1/invitations", auth, eventBody()); assertEquals(201, created.status); return created.data(); }
    private Map<String,Object> eventBody() {
        var body = new HashMap<String,Object>(); body.put("title", "Phase 9 fictional celebration"); body.put("eventType", "WEDDING");
        body.put("groomName", "Fictional host"); body.put("brideName", "Fictional partner"); body.put("hostName", "Fictional host");
        body.put("eventDate", "2027-12-05"); body.put("eventTime", "17:30"); body.put("venueName", "Fixture venue"); body.put("venueAddress", "Fixture address");
        body.put("visibility", "PUBLIC"); body.put("contentJson", "{}"); return body;
    }
    private Auth register() throws Exception {
        Reply created = call("POST", "/api/auth/register", null, Map.of("fullName", "Phase 9 fictional account", "email", "p9-" + UUID.randomUUID() + "@example.test", "password", "Fixture!9aA" + UUID.randomUUID()));
        assertEquals(200, created.status); return new Auth(created.root.path("user").path("id").asLong(), created.root.path("accessToken").asText());
    }
    private Subscription grant(Auth auth, String code) {
        var plan = packages.findByCodeAndActiveTrue(code).orElseThrow();
        var grant = new Subscription(); grant.setUser(users.findById(auth.id).orElseThrow()); grant.setSubscriptionPackage(plan);
        grant.setBenefitsSnapshot(PackageSnapshot.capture(plan)); grant.setStatus("ACTIVE"); grant.setActive(true); grant.setPaymentStatus("NOT_REQUIRED"); grant.setConfirmSource("DEMO_ADMIN_GRANT");
        grant.setStartDate(Instant.now().minusSeconds(60)); grant.setEndDate(Instant.now().plusSeconds(3600)); return subscriptions.saveAndFlush(grant);
    }
    private HttpResponse<byte[]> content(String slug, long id, String access) throws Exception {
        var body = new HashMap<String,Object>(); if (access != null) body.put("accessToken", access);
        return http.send(HttpRequest.newBuilder(URI.create(origin() + "/api/v1/public/invitations/" + slug + "/media/" + id + "/cinematic-content"))
                .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build(), HttpResponse.BodyHandlers.ofByteArray());
    }
    private Reply upload(String path, Auth auth, String field, String name, String mime, byte[] bytes) throws Exception {
        String boundary = "Phase9" + UUID.randomUUID();
        byte[] prefix = ("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + field + "\"; filename=\"" + name + "\"\r\nContent-Type: " + mime + "\r\n\r\n").getBytes(StandardCharsets.UTF_8);
        var output = new java.io.ByteArrayOutputStream(); output.write(prefix); output.write(bytes); output.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        var response = http.send(HttpRequest.newBuilder(URI.create(origin() + path)).header("Authorization", "Bearer " + auth.token)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary).POST(HttpRequest.BodyPublishers.ofByteArray(output.toByteArray())).build(), HttpResponse.BodyHandlers.ofString());
        return new Reply(response.statusCode(), json.readTree(response.body()));
    }
    private Reply call(String method, String path, Auth auth, Object body) throws Exception {
        var request = HttpRequest.newBuilder(URI.create(origin() + path)).timeout(Duration.ofSeconds(30)).header("Content-Type", "application/json");
        if (auth != null) request.header("Authorization", "Bearer " + auth.token);
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
        var response = http.send(request.build(), HttpResponse.BodyHandlers.ofString());
        return new Reply(response.statusCode(), response.body().isBlank() ? json.createObjectNode() : json.readTree(response.body()));
    }
    private String origin() { return "http://127.0.0.1:" + port; }
    private String eventPath(long id) { return "/api/v1/invitations/" + id; }
    private static String required(String key) { return Objects.requireNonNull(System.getenv(key), key + " is required"); }
    private record Auth(long id, String token) { }
    private record Reply(int status, JsonNode root) { JsonNode data() { return root.path("data"); } }
}
