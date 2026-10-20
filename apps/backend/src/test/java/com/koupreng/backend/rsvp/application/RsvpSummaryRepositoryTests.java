package com.koupreng.backend.rsvp.application;

import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.rsvp.domain.Rsvp;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.jpa.show-sql=false"
})
@ActiveProfiles("test")
class RsvpSummaryRepositoryTests {
    @Autowired EntityManager entityManager;
    @Autowired RsvpRepository repository;

    @Test
    void emptySummaryReturnsZeroInsteadOfNull() {
        var counts = repository.summarizeByInvitationId(-1L);
        assertEquals(0, counts.getAttending());
        assertEquals(0, counts.getNotAttending());
        assertEquals(0, counts.getMaybe());
        assertEquals(0, counts.getTotalAttendeeCount());
    }

    @Test
    void summaryPreservesIndependentCountsNullsAnonymousResponsesAndInvitationIsolation() {
        var owner = new AppUser();
        owner.setFullName("Summary fixture");
        owner.setRole(Role.USER);
        entityManager.persist(owner);
        var invitation = invitation(owner, "Summary fixture");
        var other = invitation(owner, "Other fixture");
        response(invitation, RsvpStatus.ATTENDING, 3);
        response(invitation, RsvpStatus.ATTENDING, null);
        response(invitation, RsvpStatus.NOT_ATTENDING, 8);
        response(invitation, RsvpStatus.MAYBE, 9);
        response(invitation, null, 10);
        response(other, RsvpStatus.ATTENDING, 100);
        entityManager.flush();
        entityManager.clear();

        var counts = repository.summarizeByInvitationId(invitation.getId());
        assertEquals(2, counts.getAttending());
        assertEquals(1, counts.getNotAttending());
        assertEquals(1, counts.getMaybe());
        assertEquals(3, counts.getTotalAttendeeCount());
    }

    private UserInvitation invitation(AppUser owner, String title) {
        var value = new UserInvitation();
        value.setUser(owner);
        value.setTitle(title);
        entityManager.persist(value);
        return value;
    }

    private void response(UserInvitation invitation, RsvpStatus status, Integer attendees) {
        var value = new Rsvp();
        value.setInvitation(invitation);
        value.setResponseStatus(status);
        value.setAttendeeCount(attendees);
        entityManager.persist(value);
    }
}
