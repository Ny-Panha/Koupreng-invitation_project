package com.koupreng.backend.template.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.sql.DriverManager;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;

/** Real HTTP controller/service/JPA/Flyway path, using an isolated MySQL schema, without mocks. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class RoyalGardenCatalogMySqlTests {
    private static final String CODE = "royal-garden-cinematic";
    private static final String SCHEMA = "koupreng_catalog_test_" + UUID.randomUUID().toString().replace("-", "");
    private static boolean created;
    @Autowired MockMvc mvc;
    @Autowired InvitationTemplateRepository templates;
    @Autowired EntitlementService entitlements;
    @Autowired AppUserRepository users;
    @Autowired SubscriptionRepository subscriptions;
    @Autowired SubscriptionPackageRepository packages;

    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) throws Exception {
        String server = required("FLYWAY_TEST_DB_URL");
        if (!server.startsWith("jdbc:mysql://") || !SCHEMA.matches("koupreng_catalog_test_[a-f0-9]{32}")) {
            throw new IllegalStateException("Requires a disposable MySQL schema");
        }
        try (var connection = DriverManager.getConnection(server, required("FLYWAY_TEST_DB_USERNAME"), required("FLYWAY_TEST_DB_PASSWORD"));
             var sql = connection.createStatement()) {
            sql.execute("CREATE DATABASE `" + SCHEMA + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            created = true;
        }
        int start = server.indexOf('/', "jdbc:mysql://".length()), query = server.indexOf('?');
        String url = server.substring(0, start + 1) + SCHEMA + (query < 0 ? "" : server.substring(query));
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }

    @AfterAll static void cleanup() throws Exception {
        if (!created) return;
        try (var connection = DriverManager.getConnection(required("FLYWAY_TEST_DB_URL"), required("FLYWAY_TEST_DB_USERNAME"), required("FLYWAY_TEST_DB_PASSWORD"));
             var sql = connection.createStatement()) { sql.execute("DROP DATABASE `" + SCHEMA + "`"); }
    }

    @Test void adminPublicationRoundTripsCompatibilityAndKeepsInactiveDesignsPrivate() throws Exception {
        var admin = new AppUser(); admin.setEmail("catalog-admin"); admin.setFullName("Catalog Admin fixture");
        admin.setRole(com.koupreng.backend.user.domain.Role.ADMIN); users.saveAndFlush(admin);
        String payload = """
            {"name":"Royal Garden Cinematic","code":"royal-garden-cinematic","category":"TRADITIONAL",
             "premium":true,"price":0,"currency":"USD","status":"INACTIVE",
             "thumbnailUrl":"/images/marketing/catalog/royal-garden-cinematic-640.webp",
             "previewUrl":"/templates/royal-garden-cinematic",
             "supportedEventTypes":["WEDDING"],"supportedLanguages":["KH","EN","BOTH"]}
            """;
        mvc.perform(post("/api/v1/admin/templates").contentType("application/json").content(payload)).andExpect(status().isUnauthorized());
        var response = mvc.perform(post("/api/v1/admin/templates").with(user("catalog-admin").roles("ADMIN"))
            .contentType("application/json").content(payload)).andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.supportedEventTypes[0]").value("WEDDING")).andReturn();
        long id = new ObjectMapper().readTree(response.getResponse().getContentAsString()).path("data").path("id").asLong();
        assertTrue(id > 0);
        mvc.perform(get("/api/v1/templates/slug/" + CODE)).andExpect(status().isNotFound());
        mvc.perform(patch("/api/v1/admin/templates/" + id + "/activate").with(user("catalog-admin").roles("ADMIN"))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/templates")).andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].code", hasItem(CODE)))
            .andExpect(jsonPath("$.data[*].code", hasItem("silk-heritage")));
        mvc.perform(get("/api/v1/templates/" + id)).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.code").value(CODE)).andExpect(jsonPath("$.data.premium").value(true))
            .andExpect(jsonPath("$.data.price").value(0)).andExpect(jsonPath("$.data.currency").value("USD"))
            .andExpect(jsonPath("$.data.checkoutEligible").value(false))
            .andExpect(jsonPath("$.data.supportedLanguages.length()").value(3));
        // Updating an older Admin form must not erase associations omitted from its payload.
        mvc.perform(put("/api/v1/admin/templates/" + id).with(user("catalog-admin").roles("ADMIN"))
            .contentType("application/json").content("{\"name\":\"Royal Garden Cinematic\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.supportedLanguages.length()").value(3));
        var template = templates.findById(id).orElseThrow();
        assertFalse(entitlements.hasTemplateAccess(null, template));
        var owner = new AppUser(); owner.setFullName("Catalog fixture"); owner.setEmail("catalog@example.invalid");
        owner = users.saveAndFlush(owner);
        assertFalse(entitlements.hasTemplateAccess(owner, template));
        var plan = new SubscriptionPackage(); plan.setCode("catalog-premium"); plan.setPackageName("Catalog test Premium");
        plan.setPrice(new BigDecimal("15.00")); plan.setPremiumTemplatesEnabled(true); plan = packages.saveAndFlush(plan);
        var subscription = new Subscription(); subscription.setUser(owner); subscription.setSubscriptionPackage(plan);
        subscription.setStatus("ACTIVE"); subscription.setActive(true); subscription.setPaymentStatus("PAID");
        subscription.setStartDate(Instant.now().minusSeconds(60)); subscription.setEndDate(Instant.now().plusSeconds(3600));
        subscriptions.saveAndFlush(subscription);
        assertTrue(entitlements.hasTemplateAccess(owner, template));
        mvc.perform(patch("/api/v1/admin/templates/" + id + "/deactivate").with(user("catalog-admin").roles("ADMIN"))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/templates")).andExpect(jsonPath("$.data[*].code", not(hasItem(CODE))));
        mvc.perform(get("/api/v1/templates/" + id)).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/admin/templates/" + id).with(user("catalog-admin").roles("ADMIN")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("INACTIVE"));
        mvc.perform(get("/api/v1/admin/templates/" + id).with(user("regular").roles("USER"))).andExpect(status().isForbidden());
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException(name + " is required");
        return value;
    }
}
