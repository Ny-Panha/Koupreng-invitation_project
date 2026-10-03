package com.koupreng.backend.entitlement.application;

import static org.junit.jupiter.api.Assertions.*;
import com.koupreng.backend.guest.api.dto.GuestImportRequest;
import com.koupreng.backend.guest.api.dto.GuestRequest;
import com.koupreng.backend.guest.application.GuestService;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.api.dto.InvitationRequest;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.invitation.domain.InvitationVisibility;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.rsvp.api.dto.RsvpRequest;
import com.koupreng.backend.rsvp.application.RsvpService;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(properties = {"app.entitlements.enforce-package-policy=true", "app.entitlements.free-package-code=p2-reviewed-free"})
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class EntitlementIntegrityMySqlTests {
    @Autowired GuestService guestService;
    @Autowired GuestRepository guests;
    @Autowired InvitationService invitationService;
    @Autowired UserInvitationRepository invitations;
    @Autowired AppUserRepository users;
    @Autowired SubscriptionPackageRepository packages;
    @Autowired RsvpService rsvpService;
    @Autowired RsvpRepository rsvps;

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

    @BeforeEach void reviewedFixturePolicy() {
        var plan = packages.findByCodeAndActiveTrue("p2-reviewed-free").orElseGet(SubscriptionPackage::new);
        plan.setCode("p2-reviewed-free"); plan.setPackageName("Isolated reviewed policy fixture"); plan.setPrice(BigDecimal.ZERO);
        plan.setMaxInvitations(2); plan.setMaxGuests(1); plan.setMaxGuestsPerInvitation(1);
        packages.saveAndFlush(plan);
    }

    @Test void concurrentGuestCreationHasOneWinnerAtTheConfiguredLimit() throws Exception {
        var fixture = fixture();
        assertEquals(1, race(() -> guestService.create(fixture.auth(), fixture.invitation().getId(), guest("First")),
                () -> guestService.create(fixture.auth(), fixture.invitation().getId(), guest("Second"))));
        assertEquals(1, guests.countByInvitationId(fixture.invitation().getId()));
    }

    @Test void genericRsvpAndOwnerGuestCreationShareTheSameSerializedQuota() throws Exception {
        var fixture = fixture();
        fixture.invitation().setStatus(InvitationStatus.PUBLISHED);
        fixture.invitation().setVisibility(InvitationVisibility.PUBLIC);
        invitations.saveAndFlush(fixture.invitation());
        var request = new RsvpRequest();
        request.setGuestName("Generic RSVP guest");
        request.setResponseStatus(RsvpStatus.ATTENDING);
        request.setAttendeeCount(1);
        java.util.concurrent.atomic.AtomicBoolean publicSubmissionWon = new java.util.concurrent.atomic.AtomicBoolean();

        assertEquals(1, race(() -> {
            var response = rsvpService.submitPublic(fixture.invitation().getSlug(), request);
            publicSubmissionWon.set(true);
            return response;
        }, () -> guestService.create(fixture.auth(), fixture.invitation().getId(), guest("Owner guest"))));

        assertEquals(1, guests.countByInvitationId(fixture.invitation().getId()));
        assertEquals(publicSubmissionWon.get() ? 1 : 0, rsvps.countByInvitationId(fixture.invitation().getId()));
    }

    @Test void concurrentInvitationCreationHasOneWinnerAtTheConfiguredLimit() throws Exception {
        var fixture = fixture();
        var first = new InvitationRequest(); first.setTitle("Quota first " + UUID.randomUUID());
        var second = new InvitationRequest(); second.setTitle("Quota second " + UUID.randomUUID());
        assertEquals(1, race(() -> invitationService.create(fixture.auth(), first),
                () -> invitationService.create(fixture.auth(), second)));
        assertEquals(2, invitations.countByUserIdAndDeletedFalse(fixture.owner().getId()));
    }

    @Test void bulkQuotaRejectionLeavesNoPartialGuestRows() {
        var fixture = fixture(); var request = new GuestImportRequest(); request.setGuests(List.of(guest("First"), guest("Second")));
        assertEquals("PACKAGE_LIMIT_REACHED", assertThrows(ApiException.class,
                () -> guestService.importGuests(fixture.auth(), fixture.invitation().getId(), request)).getCode());
        assertEquals(0, guests.countByInvitationId(fixture.invitation().getId()));
    }

    private int race(Callable<?> first, Callable<?> second) throws Exception {
        CountDownLatch ready = new CountDownLatch(2); CountDownLatch start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var left = pool.submit(() -> attempt(ready, start, first));
            var right = pool.submit(() -> attempt(ready, start, second));
            assertTrue(ready.await(5, TimeUnit.SECONDS)); start.countDown();
            return left.get(20, TimeUnit.SECONDS) + right.get(20, TimeUnit.SECONDS);
        }
    }
    private int attempt(CountDownLatch ready, CountDownLatch start, Callable<?> operation) throws Exception {
        ready.countDown(); assertTrue(start.await(5, TimeUnit.SECONDS));
        try { operation.call(); return 1; }
        catch (ApiException exception) { assertEquals("PACKAGE_LIMIT_REACHED", exception.getCode()); return 0; }
    }
    private Fixture fixture() {
        var owner = new AppUser(); owner.setFullName("Policy test"); owner.setEmail("policy-" + UUID.randomUUID() + "@example.test");
        owner = users.saveAndFlush(owner);
        var invitation = new UserInvitation(); invitation.setUser(owner); invitation.setTitle("Quota fixture"); invitation.setSlug("quota-" + UUID.randomUUID());
        invitation = invitations.saveAndFlush(invitation);
        Authentication auth = UsernamePasswordAuthenticationToken.authenticated(owner.getId().toString(), "unused", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        return new Fixture(owner, invitation, auth);
    }
    private GuestRequest guest(String name) { var request = new GuestRequest(); request.setGuestName(name); return request; }
    private static String required(String key) { String value = System.getenv(key); if (value == null || value.isBlank()) { throw new IllegalStateException("Missing isolated test configuration: " + key); } return value; }
    private record Fixture(AppUser owner, UserInvitation invitation, Authentication auth) { }
}
