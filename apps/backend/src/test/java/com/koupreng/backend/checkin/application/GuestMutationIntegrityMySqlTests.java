package com.koupreng.backend.checkin.application;

import com.koupreng.backend.checkin.infrastructure.persistence.GuestCheckInEventRepository;
import com.koupreng.backend.checkin.infrastructure.persistence.GuestCheckInRepository;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.rsvp.application.RsvpService;
import com.koupreng.backend.rsvp.domain.Rsvp;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class GuestMutationIntegrityMySqlTests {
    @Autowired private CheckInService checkIns;
    @Autowired private GuestCheckInRepository states;
    @Autowired private GuestCheckInEventRepository events;
    @Autowired private RsvpService rsvpService;
    @Autowired private RsvpRepository rsvps;
    @Autowired private AppUserRepository users;
    @Autowired private GuestRepository guests;
    @Autowired private UserInvitationRepository invitations;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> required("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }

    @Test
    void undoAndRecheckInPreserveHistoryAndRejectNonOwner() {
        Fixture fixture = fixture();
        var auth = authentication(fixture.owner);
        var initial = checkIns.manual(auth, fixture.invitation.getId(), fixture.guest.getId(), "Original check-in note");
        var originalTime = states.findById(initial.getId()).orElseThrow().getCheckedInAt();
        AppUser other = user();
        assertEquals(403, assertThrows(ApiException.class, () -> checkIns.undo(authentication(other),
                fixture.invitation.getId(), fixture.guest.getId())).getStatus().value());
        assertEquals(1, checkIns.summary(auth, fixture.invitation.getId()).getCheckedIn());
        checkIns.undo(auth, fixture.invitation.getId(), fixture.guest.getId());
        checkIns.undo(auth, fixture.invitation.getId(), fixture.guest.getId());
        assertEquals(0, checkIns.summary(auth, fixture.invitation.getId()).getCheckedIn());
        assertTrue(checkIns.list(auth, fixture.invitation.getId()).isEmpty());
        var undone = states.findById(initial.getId()).orElseThrow();
        assertFalse(undone.isActive());
        assertEquals(originalTime, undone.getCheckedInAt());
        assertEquals("Original check-in note", undone.getNote());
        var next = checkIns.manual(auth, fixture.invitation.getId(), fixture.guest.getId(), "Second check-in note");
        assertEquals(initial.getId(), next.getId());
        assertEquals(1, checkIns.summary(auth, fixture.invitation.getId()).getCheckedIn());
        var history = events.findByCheckInIdOrderByOccurredAtAscIdAsc(initial.getId());
        assertEquals(List.of("CHECKED_IN", "UNDONE", "CHECKED_IN"), history.stream().map(event -> event.getAction()).toList());
        assertEquals("Original check-in note", history.getFirst().getNote());
        assertEquals("Second check-in note", history.getLast().getNote());
        assertEquals("Guest fixture", guests.findById(fixture.guest.getId()).orElseThrow().getGuestName());
    }

    @Test
    void wishModerationPreservesAttendanceGuestAndResponseTime() {
        Fixture fixture = fixture();
        Rsvp rsvp = new Rsvp();
        rsvp.setInvitation(fixture.invitation);
        rsvp.setGuest(fixture.guest);
        rsvp.setResponseStatus(RsvpStatus.ATTENDING);
        rsvp.setAttendeeCount(2);
        rsvp.setMessage("Best wishes");
        rsvps.saveAndFlush(rsvp);
        var responseTime = rsvps.findById(rsvp.getId()).orElseThrow().getRespondedAt();
        assertEquals(403, assertThrows(ApiException.class, () -> rsvpService.moderateWish(authentication(user()),
                fixture.invitation.getId(), rsvp.getId())).getStatus().value());
        rsvpService.moderateWish(authentication(fixture.owner), fixture.invitation.getId(), rsvp.getId());
        rsvpService.moderateWish(authentication(fixture.owner), fixture.invitation.getId(), rsvp.getId());
        Rsvp preserved = rsvps.findById(rsvp.getId()).orElseThrow();
        assertNull(preserved.getMessage());
        assertEquals(RsvpStatus.ATTENDING, preserved.getResponseStatus());
        assertEquals(2, preserved.getAttendeeCount());
        assertEquals(fixture.guest.getId(), preserved.getGuest().getId());
        assertEquals(responseTime, preserved.getRespondedAt());
        assertTrue(rsvpService.wishes(authentication(fixture.owner), fixture.invitation.getId()).isEmpty());
    }

    private Fixture fixture() {
        AppUser owner = user();
        UserInvitation invitation = new UserInvitation();
        invitation.setUser(owner);
        invitation.setTitle("Guest mutation fixture");
        invitation.setSlug("mutation-" + UUID.randomUUID());
        invitations.saveAndFlush(invitation);
        Guest guest = new Guest();
        guest.setInvitation(invitation);
        guest.setGuestName("Guest fixture");
        guest.setInviteToken(UUID.randomUUID().toString());
        guests.saveAndFlush(guest);
        return new Fixture(owner, invitation, guest);
    }

    private AppUser user() {
        AppUser user = new AppUser();
        user.setFullName("Guest mutation owner");
        user.setRole(Role.USER);
        user.setEmail("guest-mutation-" + UUID.randomUUID() + "@example.com");
        return users.saveAndFlush(user);
    }

    private UsernamePasswordAuthenticationToken authentication(AppUser user) {
        return new UsernamePasswordAuthenticationToken(user.getId().toString(), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    private record Fixture(AppUser owner, UserInvitation invitation, Guest guest) { }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) { throw new IllegalStateException(name + " is required"); }
        return value;
    }
}
