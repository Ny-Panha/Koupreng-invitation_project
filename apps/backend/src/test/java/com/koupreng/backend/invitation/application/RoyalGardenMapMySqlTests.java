package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.invitation.api.dto.InvitationRequest;
import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.subscription.application.PackageSnapshot;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

/** Real MySQL persistence in an explicitly configured disposable database. */
@SpringBootTest(properties = {"app.entitlements.free-package-code=FREE", "app.dev.seed-enabled=false"})
@ActiveProfiles("test")
@Transactional
@EnabledIfEnvironmentVariable(named="RUN_FLYWAY_INTEGRATION", matches="true")
class RoyalGardenMapMySqlTests {
    private static final String MAP = """
        {"version":2,"enabled":true,"aspectRatio":"landscape","theme":"royal-blue",
         "description":{"km":"ផ្លូវគំរូ","en":"Example route"},
         "settings":{"showLegend":true,"showDirectionsButton":true},
         "nodes":[{"id":"saved-curve","type":"curve","x":0.5,"y":0.5,"width":0.4,"height":0.1,
                   "rotation":0,"curvature":0.5,"fontSize":32,"color":"#c7984d","label":{"km":"ផ្លូវ","en":"Road"}}]}
        """;
    @Autowired InvitationService invitations;
    @Autowired AppUserRepository users;
    @Autowired SubscriptionRepository subscriptions;
    @Autowired SubscriptionPackageRepository packages;
    @Autowired EntityManager entityManager;
    private final ObjectMapper json = new ObjectMapper();

    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> required("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }

    @ParameterizedTest @ValueSource(strings={"PRO","PREMIUM"})
    void activatedOwnerCanSaveReloadPublishAndReadTheSameMap(String code) throws Exception {
        var fixture = owner(code);
        var created = invitations.create(fixture.auth(), request(MAP));
        entityManager.flush(); entityManager.clear();
        var loaded = invitations.get(fixture.auth(), created.getId());
        assertEquals(json.readTree(MAP), json.readTree(loaded.getContentJson()).get("illustratedMap"));
        var updated = request(MAP.replace("\"curvature\":0.5", "\"curvature\":0.75"));
        updated.setExpectedUpdatedAt(loaded.getUpdatedAt());
        invitations.update(fixture.auth(), created.getId(), updated);
        entityManager.flush(); entityManager.clear();
        var published = invitations.publish(fixture.auth(), created.getId());
        entityManager.flush(); entityManager.clear();
        var guest = invitations.publicBySlug(published.getSlug());
        var content = json.readTree(guest.getContentJson());
        assertEquals(.75, content.path("illustratedMap").path("nodes").get(0).path("curvature").asDouble());
        assertEquals("saved-curve",content.path("illustratedMap").path("nodes").get(0).path("id").asText());
        assertTrue(content.path("saveTheDate").path("showAddToCalendar").asBoolean());
    }

    @ParameterizedTest @ValueSource(strings={"FREE","BASIC"})
    void freeAndBasicCannotPersistNewOrDisabledPaidMapProperties(String code) {
        var fixture = owner(code);
        var request = request(MAP.replace("\"enabled\":true", "\"enabled\":false"));
        var error = assertThrows(ApiException.class, () -> invitations.create(fixture.auth(), request));
        assertEquals(HttpStatus.FORBIDDEN,error.getStatus());
        assertEquals("PACKAGE_FEATURE_REQUIRED",error.getCode());
    }

    @Test void anotherAuthenticatedUserCannotEditTheOwnersMap() {
        var owner=owner("PREMIUM"); var stranger=owner("PRO");
        var event=invitations.create(owner.auth(),request(MAP));
        entityManager.flush();
        var update=request(MAP); update.setExpectedUpdatedAt(event.getUpdatedAt());
        var error=assertThrows(ApiException.class,()->invitations.update(stranger.auth(),event.getId(),update));
        assertTrue(List.of(HttpStatus.FORBIDDEN,HttpStatus.NOT_FOUND).contains(error.getStatus()));
    }

    @Test void expiredSubscriptionStillAllowsAnExactDisableOnlyChange() {
        var owner=owner("PRO");
        var event=invitations.create(owner.auth(),request(MAP)); entityManager.flush();
        owner.subscription().setEndDate(Instant.now().minusSeconds(60)); subscriptions.saveAndFlush(owner.subscription());
        entityManager.clear();
        var current=invitations.get(owner.auth(),event.getId());
        var disable=request(MAP.replace("\"enabled\":true","\"enabled\":false"));disable.setExpectedUpdatedAt(current.getUpdatedAt());
        var saved=invitations.update(owner.auth(),event.getId(),disable);
        assertTrue(saved.getContentJson().contains("\"enabled\":false"));
    }

    private Fixture owner(String code) {
        var user=new AppUser(); user.setFullName("Royal Garden isolated test");user.setEmail("rg-v33-"+UUID.randomUUID()+"@example.test");
        user=users.saveAndFlush(user);
        Subscription subscription=null;
        if (!"FREE".equals(code)) {
            var plan=packages.findByCodeAndActiveTrue(code).orElseThrow();
            subscription=new Subscription();subscription.setUser(user);subscription.setSubscriptionPackage(plan);
            subscription.setBenefitsSnapshot(PackageSnapshot.capture(plan));subscription.setStartDate(Instant.now().minusSeconds(60));subscription.setEndDate(Instant.now().plusSeconds(3600));
            subscription.setStatus("ACTIVE");subscription.setActive(true);subscription.setPaymentStatus("NOT_REQUIRED");subscription.setConfirmSource("DEMO_ADMIN_GRANT");
            subscription=subscriptions.saveAndFlush(subscription);
        }
        Authentication auth=UsernamePasswordAuthenticationToken.authenticated(user.getId().toString(),"unused",List.of(new SimpleGrantedAuthority("ROLE_USER")));
        return new Fixture(auth,subscription);
    }
    private InvitationRequest request(String map) {
        var request=new InvitationRequest();request.setTitle("Royal Garden isolated test");request.setEventType(EventType.WEDDING);
        request.setEventDate(LocalDate.of(2027,6,19));request.setEventTime(LocalTime.of(17,0));request.setVenueName("Example hall");request.setVenueAddress("Example address");
        request.setGroomName("សុវណ្ណ");request.setBrideName("ដាលីន");request.setLanguageMode("BILINGUAL");request.setVisibility("PUBLIC");
        request.setContentJson("{\"illustratedMap\":"+map+",\"saveTheDate\":{\"enabled\":true,\"showCalendar\":true,\"showAddToCalendar\":true}}");
        return request;
    }
    private static String required(String key) { var value=System.getenv(key);if(value==null||value.isBlank())throw new IllegalStateException("Missing isolated test configuration: "+key);return value; }
    private record Fixture(Authentication auth,Subscription subscription) {}
}
