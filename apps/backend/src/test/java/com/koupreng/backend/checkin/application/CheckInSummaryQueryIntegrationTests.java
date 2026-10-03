package com.koupreng.backend.checkin.application;

import com.koupreng.backend.checkin.domain.GuestCheckIn;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.rsvp.domain.Rsvp;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:p2-check-in-query;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.jpa.properties.hibernate.generate_statistics=true"
})
@ActiveProfiles("test")
@Transactional
class CheckInSummaryQueryIntegrationTests {
    @Autowired EntityManager entityManager;
    @Autowired EntityManagerFactory entityManagerFactory;
    @Autowired CheckInService checkInService;
    @MockitoBean CurrentUserService currentUserService;

    @Test
    void summaryPreservesActiveAttendanceCountsWithBoundedQueries() {
        Authentication authentication = mock(Authentication.class);
        AppUser owner = new AppUser();
        owner.setEmail("check-in-query@example.test");
        owner.setFullName("Check-in query");
        entityManager.persist(owner);
        InvitationTemplate template = new InvitationTemplate();
        template.setName("Check-in query template");
        template.setCode("check-in-query-template");
        entityManager.persist(template);
        UserInvitation invitation = new UserInvitation();
        invitation.setTitle("Check-in query");
        invitation.setSlug("check-in-query");
        invitation.setUser(owner);
        invitation.setTemplate(template);
        entityManager.persist(invitation);
        for (int index = 0; index < 20; index++) {
            Guest guest = new Guest();
            guest.setInvitation(invitation);
            guest.setGuestName("Query guest " + index);
            entityManager.persist(guest);
            GuestCheckIn checkIn = new GuestCheckIn();
            checkIn.setInvitation(invitation);
            checkIn.setGuest(guest);
            checkIn.setCheckedInBy(owner);
            checkIn.setSource("MANUAL");
            checkIn.setActive(index != 0);
            entityManager.persist(checkIn);
            // One active guest has no RSVP; attendance count is per guest, not attendee quantity.
            if (index < 19) {
                Rsvp rsvp = new Rsvp();
                rsvp.setInvitation(invitation);
                rsvp.setGuest(guest);
                rsvp.setResponseStatus(index < 10 ? RsvpStatus.ATTENDING : RsvpStatus.NOT_ATTENDING);
                rsvp.setAttendeeCount(3);
                entityManager.persist(rsvp);
            }
        }
        entityManager.flush();
        Long invitationId = invitation.getId();
        entityManager.clear();
        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        var result = checkInService.summary(authentication, invitationId);
        assertEquals(20, result.getTotalGuests());
        assertEquals(19, result.getCheckedIn());
        assertEquals(1, result.getRemaining());
        assertEquals(9, result.getAttendingCheckedIn());
        long queries = statistics.getPrepareStatementCount();
        long entities = statistics.getEntityLoadCount();
        System.out.println("P2_CHECK_IN_SUMMARY guests=20 statements=" + queries + " entities=" + entities);
        assertTrue(queries <= 6, "Summary must aggregate attendance without a per-guest RSVP query: " + queries);
        assertTrue(entities <= 3, "Summary must not hydrate every check-in and RSVP: " + entities);
    }
}
