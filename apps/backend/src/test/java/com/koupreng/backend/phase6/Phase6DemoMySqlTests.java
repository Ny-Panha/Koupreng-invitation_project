package com.koupreng.backend.phase6;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.auth.application.AuthService;
import com.koupreng.backend.auth.api.dto.*;
import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.subscription.application.PackageSnapshot;
import com.koupreng.backend.subscription.domain.*;
import com.koupreng.backend.subscription.infrastructure.persistence.*;
import com.koupreng.backend.user.domain.*;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** Explicitly invoked, test-source-only provisioning. It cannot run in a production artifact. */
@SpringBootTest(properties = {"spring.flyway.enabled=true", "spring.jpa.hibernate.ddl-auto=validate",
    "spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect", "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
    "app.dev-sample-data.enabled=false", "app.auth.first-user-admin-enabled=false", "app.waf.max-requests-per-minute=1000"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named="PHASE6_DEMO_PROVISION", matches="true")
class Phase6DemoMySqlTests {
    @Autowired JdbcTemplate jdbc;
    @Autowired AuthService auth;
    @Autowired AppUserRepository users;
    @Autowired SubscriptionPackageRepository packages;
    @Autowired SubscriptionRepository subscriptions;
    @Autowired EntitlementService entitlements;
    @Autowired AuditLogService audit;
    @Autowired MockMvc mvc;
    private final ObjectMapper json = new ObjectMapper();
    private static final Path PRIVATE = Path.of("D:/Koupreng-Phase6-private/demo-access.json");

    @Test @org.springframework.transaction.annotation.Transactional
    void immutableBenefitsPendingFutureExpiredAndRevokedGrantsResolveSafely() throws Exception {
        AppUser user = new AppUser(); user.setFullName("Rollback-only lifecycle fixture"); users.saveAndFlush(user);
        String email = "version-admin-"+UUID.randomUUID()+"@koupreng.test", password = "Kp!"+UUID.randomUUID();
        auth.register(new RegisterRequest("Rollback-only catalog reviewer",email,null,password));
        var actor = users.findByEmailIgnoreCase(email).orElseThrow(); actor.setRole(Role.ADMIN); users.saveAndFlush(actor);
        String bearer = "Bearer "+auth.login(new LoginRequest(email,password)).accessToken();
        var catalogChange = new LinkedHashMap<String,Object>();
        catalogChange.put("code","DEV_PHASE6_"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT));
        catalogChange.put("packageName","Rollback-only version policy"); catalogChange.put("price",1);
        catalogChange.put("currency","USD"); catalogChange.put("billingInterval","YEARLY"); catalogChange.put("durationDays",365);
        catalogChange.put("active",true); catalogChange.put("maxInvitations",2); catalogChange.put("seatingEnabled",true);
        for (String flag : List.of("premiumTemplatesEnabled","qrCheckInEnabled","advancedAnalyticsEnabled","customBrandingEnabled","teamMembersEnabled","aiAssistantEnabled","publicVisible")) catalogChange.put(flag,false);
        catalogChange.put("qrInvitationsEnabled",true);
        String created = mvc.perform(post("/api/v1/admin/packages").header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(catalogChange)))
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        var plan = packages.findById(json.readTree(created).path("data").path("id").asLong()).orElseThrow();
        long originalRevision = plan.getRevision();
        Subscription grant = new Subscription(); grant.setUser(user); grant.setSubscriptionPackage(plan);
        grant.setBenefitsSnapshot(PackageSnapshot.capture(plan)); grant.setProvider("LOCAL_DEMO");
        grant.setPaymentStatus("NOT_REQUIRED"); grant.setConfirmSource("DEMO_ADMIN_GRANT");
        grant.setStartDate(Instant.now().minusSeconds(60)); grant.setEndDate(Instant.now().plusSeconds(3600));
        grant.setStatus("ACTIVE"); grant.setActive(true); subscriptions.saveAndFlush(grant);
        catalogChange.put("revision",originalRevision); catalogChange.put("maxInvitations",0); catalogChange.put("seatingEnabled",false);
        mvc.perform(put("/api/v1/admin/packages/"+plan.getId()).header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(catalogChange)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.revision").value(originalRevision+1));
        assertThat(entitlements.current(user).packagePlan().getRevision()).isEqualTo(originalRevision);
        assertThat(entitlements.current(user).packagePlan().getMaxInvitations()).isEqualTo(2);
        entitlements.requireFeature(user,EntitlementService.Feature.SEATING);
        grant.setPaymentStatus("PENDING"); subscriptions.saveAndFlush(grant);
        assertThat(entitlements.current(user).packagePlan().getCode()).isEqualTo("FREE");
        grant.setPaymentStatus("NOT_REQUIRED"); grant.setStartDate(Instant.now().plusSeconds(60)); subscriptions.saveAndFlush(grant);
        assertThat(entitlements.current(user).packagePlan().getCode()).isEqualTo("FREE");
        grant.setStartDate(Instant.now().minusSeconds(120)); grant.setEndDate(Instant.now().minusSeconds(60)); subscriptions.saveAndFlush(grant);
        assertThat(entitlements.current(user).packagePlan().getCode()).isEqualTo("FREE");
        grant.setEndDate(Instant.now().plusSeconds(3600)); grant.setActive(false); grant.setStatus("REVOKED"); subscriptions.saveAndFlush(grant);
        assertThat(entitlements.current(user).packagePlan().getCode()).isEqualTo("FREE");
    }

    @Test void freeSignupCalendarPersistencePublishedEditsAndStaleSaveAreEnforcedThroughServlets() throws Exception {
        String suffix = UUID.randomUUID().toString();
        var session = auth.register(new RegisterRequest("Calendar fixture", "calendar-"+suffix+"@koupreng.test", null, "Kp!"+suffix));
        String bearer = "Bearer "+session.accessToken();
        mvc.perform(get("/api/v1/me/entitlements").header("Authorization",bearer)).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.packagePlan.code").value("FREE"));
        var payload = new LinkedHashMap<String,Object>();
        payload.put("title","Calendar persistence fixture"); payload.put("eventType","WEDDING");
        payload.put("eventDate","2028-02-29"); payload.put("eventTime","17:30");
        payload.put("groomName","Fictional host"); payload.put("brideName","Fictional partner");
        payload.put("venueName","Fictional venue"); payload.put("venueAddress","Fictional address");
        payload.put("visibility","PUBLIC"); payload.put("languageMode","EN");
        payload.put("contentJson","{\"schedule\":[{\"id\":\"one\",\"day\":1,\"date\":\"2028-02-29\",\"time\":\"07:00\",\"period\":\"MORNING\"},{\"id\":\"two\",\"day\":2,\"date\":\"2028-03-02\",\"time\":\"17:30\",\"period\":\"EVENING\"}],\"storyChapters\":[{\"title\":\"រឿងរ៉ាវ\",\"text\":\"សេចក្ដីស្រឡាញ់\\nliteral Khmer story\"}],\"showStory\":true}");
        var injection = new LinkedHashMap<>(payload); injection.put("contentJson", "{\"storyChapters\":[{\"text\":\"<script>alert(1)</script>\"}]}");
        mvc.perform(post("/api/v1/invitations").header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(injection)))
            .andExpect(status().isForbidden());
        String raw = mvc.perform(post("/api/v1/invitations").header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(payload)))
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        var created = json.readTree(raw).path("data"); long id = created.path("id").asLong();
        mvc.perform(post("/api/v1/invitations").header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(payload)))
            .andExpect(status().isForbidden());
        payload.put("expectedUpdatedAt",created.path("updatedAt").asText());
        payload.put("eventDate","2028-12-31");
        raw = mvc.perform(put("/api/v1/invitations/"+id).header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(payload)))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var updated = json.readTree(raw).path("data");
        assertThat(json.readTree(updated.path("contentJson").asText()).path("schedule").get(1).path("date").asText()).isEqualTo("2028-03-02");
        mvc.perform(put("/api/v1/invitations/"+id).header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(payload)))
            .andExpect(status().isConflict());
        payload.put("expectedUpdatedAt",updated.path("updatedAt").asText());
        payload.put("contentJson","{\"schedule\":[{\"date\":\"2027-02-29\"}]}");
        mvc.perform(put("/api/v1/invitations/"+id).header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(payload)))
            .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/invitations/"+id).header("Authorization",bearer)).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.eventDate").value("2028-12-31"));
        String published = mvc.perform(patch("/api/v1/invitations/"+id+"/publish").header("Authorization",bearer)).andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        payload.put("expectedUpdatedAt",json.readTree(published).path("data").path("updatedAt").asText());
        payload.put("contentJson",updated.path("contentJson").asText()); payload.put("title","Calendar persistence fixture, published edit");
        mvc.perform(put("/api/v1/invitations/"+id).header("Authorization",bearer).contentType("application/json").content(json.writeValueAsString(payload)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("PUBLISHED"));
        mvc.perform(get("/api/v1/public/invitations/"+created.path("slug").asText())).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.contentJson").value(updated.path("contentJson").asText()));
    }

    @Test void provisionAndVerifyOnlyTheIsolatedDevelopmentDatabase() throws Exception {
        assertThat(jdbc.queryForObject("SELECT @@port", Integer.class)).isEqualTo(3416);
        assertThat(jdbc.queryForObject("SELECT @@datadir", String.class).replace('\\','/').toLowerCase(Locale.ROOT))
            .isEqualTo("d:/koupreng-phase6-private/mysql-data/");
        assertThat(jdbc.queryForObject("SELECT DATABASE()", String.class)).isEqualTo("phase6_disposable");
        Map<String,Map<String,String>> credentials = Files.exists(PRIVATE)
            ? json.readValue(Files.readString(PRIVATE), new TypeReference<>() {}) : new LinkedHashMap<>();
        var results = new ArrayList<String>();
        // A separate synthetic administrator keeps account roles separate from demo tiers.
        AppUser reviewer = account("Phase 6 Reviewer", "phase6.reviewer@koupreng.test", null, credentials);
        reviewer.setRole(Role.ADMIN); users.saveAndFlush(reviewer);
        String[][] inventory = {{"Free Demo","free.demo@koupreng.test",null,"FREE"},
            {"Daly","kuydaly123@gmail.com",null,"BASIC"}, {"Long",null,"012345678","PRO"}, {"Vireak",null,"060400652","PREMIUM"}};
        for (String[] row : inventory) {
            String identifier = row[1] == null ? row[2] : row[1];
            boolean existed = row[1] == null ? users.findByPhone(row[2]).isPresent() : users.findByEmailIgnoreCase(row[1]).isPresent();
            AppUser user = account(row[0], row[1], row[2], credentials);
            Role role = user.getRole(); String hash = user.getPasswordHash();
            var plan = packages.findByCodeAndActiveTrue(row[3]).orElseThrow();
            if (!"FREE".equals(row[3])) {
                String order = "PHASE6-DEMO-" + row[3];
                if (subscriptions.findByOrderCode(order).isEmpty() && subscriptions.findActiveForUser(user.getId(), Instant.now()).stream().noneMatch(s -> PackageSnapshot.eligible(s, Instant.now()))) {
                    Subscription grant = new Subscription(); grant.setUser(user); grant.setSubscriptionPackage(plan);
                    grant.setOrderCode(order); grant.setBenefitsSnapshot(PackageSnapshot.capture(plan));
                    grant.setAmount(BigDecimal.ZERO); grant.setCurrency(plan.getCurrency());
                    grant.setProvider("LOCAL_DEMO"); grant.setPaymentStatus("NOT_REQUIRED");
                    grant.setConfirmSource("DEMO_ADMIN_GRANT"); grant.setConfirmedBy("phase6-local-reviewer");
                    grant.setConfirmedAt(Instant.now()); grant.setStartDate(Instant.now());
                    grant.setEndDate(grant.getStartDate().plus(plan.getDurationDays(), ChronoUnit.DAYS));
                    grant.setStatus("ACTIVE"); grant.setActive(true);
                    subscriptions.saveAndFlush(grant);
                    audit.logSystemEvent("DEMO_ADMIN_GRANT", "SUBSCRIPTION", grant.getId(), "Authorized disposable local nonrevenue grant",
                        Map.of("issuer",reviewer.getId(),"userId",user.getId(),"tier",row[3],"expiry",grant.getEndDate().toString(),"source","DEMO_ADMIN_GRANT"));
                }
            }
            assertThat(users.findById(user.getId()).orElseThrow().getPasswordHash()).isEqualTo(hash);
            assertThat(users.findById(user.getId()).orElseThrow().getRole()).isEqualTo(role);
            var effective = entitlements.current(user);
            assertThat(effective.packagePlan().getCode()).isEqualTo(row[3]);
            assertThat(effective.packagePlan().getMaxInvitations()).isEqualTo(plan.getMaxInvitations());
            assertThat(effective.features().contains("SEATING")).isEqualTo(plan.isSeatingEnabled());
            if (!plan.isSeatingEnabled()) assertThatThrownBy(() -> entitlements.requireFeature(user, EntitlementService.Feature.SEATING)).hasMessageContaining("eligible package");
            else entitlements.requireFeature(user, EntitlementService.Feature.SEATING);
            Map<String,String> secret = credentials.get(identifier);
            assertThat(secret).as("New local fixture has protected login credentials").isNotNull();
            String token = auth.login(new LoginRequest(identifier,secret.get("password"))).accessToken();
            mvc.perform(get("/api/v1/me/entitlements").header("Authorization","Bearer "+token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.packagePlan.code").value(row[3]));
            if (role == Role.USER) mvc.perform(get("/api/v1/admin/reports/management/payments/export/csv").header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
            results.add(row[3]+" | "+row[0]+" | "+(row[1]==null ? "***"+row[2].substring(row[2].length()-3) : row[1].charAt(0)+"***@"+row[1].split("@")[1])+" | "+(existed?"found, preserved":"created in isolated DB")+" | source="+effective.source()+" | expiry="+effective.expiresAt()+" | login/JWT/current plan/feature gates PASS");
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM subscriptions WHERE provider='LOCAL_DEMO' AND (payment_status='PAID' OR paid_at IS NOT NULL OR payway_transaction_id IS NOT NULL)",Long.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM system_audit_logs WHERE action='REPORT_ACCESS_DENIED'",Long.class)).isGreaterThanOrEqualTo(4L);
        Files.writeString(PRIVATE,json.writerWithDefaultPrettyPrinter().writeValueAsString(credentials));
        Files.writeString(Path.of("D:/Koupreng-UXUI-Phase6/phase6-demo-accounts-result.txt"),"DISPOSABLE LOCAL MYSQL 8.0.39; loopback:3416; nonrevenue; no outbound messages\n"+String.join("\n",results)+"\nPasswords and tokens excluded. Access is stored only in the ACL-protected private directory.\n");
    }
    private AppUser account(String name, String email, String phone, Map<String,Map<String,String>> credentials) throws Exception {
        var existing = email == null ? users.findByPhone(phone) : users.findByEmailIgnoreCase(email);
        if (existing.isPresent()) return existing.get();
        byte[] random = new byte[32]; new java.security.SecureRandom().nextBytes(random);
        String password = "Kp!"+Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        auth.register(new RegisterRequest(name,email,phone,password));
        String identifier = email == null ? phone : email;
        credentials.put(identifier,Map.of("identifier",identifier,"password",password));
        // Persist protected credentials immediately; a later assertion cannot strand a fixture.
        Files.writeString(PRIVATE,json.writerWithDefaultPrettyPrinter().writeValueAsString(credentials));
        return (email == null ? users.findByPhone(phone) : users.findByEmailIgnoreCase(email)).orElseThrow();
    }
}
