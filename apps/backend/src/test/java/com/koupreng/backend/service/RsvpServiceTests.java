package com.koupreng.backend.service;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.rsvp.RsvpRequest;
import com.koupreng.backend.dto.rsvp.RsvpResponse;
import com.koupreng.backend.dto.rsvp.RsvpSummaryResponse;
import com.koupreng.backend.dto.rsvp.RsvpUpdateRequest;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.Rsvp;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.enums.RsvpStatus;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.RsvpRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RsvpServiceTests {

    @Test
    void publicTokenRsvpUpdatesExistingGuestResponse() {
        Fixture fixture = fixture();
        UserInvitation invitation = invitation(LocalDate.now().plusDays(5));
        Guest guest = guest(invitation);
        Rsvp existing = new Rsvp();
        existing.setId(88L);
        existing.setInvitation(invitation);
        existing.setGuest(guest);

        when(fixture.invitationService.requirePublishedInvitationForRsvp("samnang-sreyneang", true))
                .thenReturn(invitation);
        when(fixture.guestRepository.findByInvitationIdAndInviteToken(10L, "token"))
                .thenReturn(Optional.of(guest));
        when(fixture.rsvpRepository.findByInvitationIdAndGuestId(10L, 20L))
                .thenReturn(Optional.of(existing));

        RsvpResponse response = fixture.service.submitPublicWithToken("samnang-sreyneang", "token", request(RsvpStatus.ATTENDING, 2));

        assertEquals(88L, response.getId());
        assertEquals(RsvpStatus.ATTENDING, response.getResponseStatus());
        assertEquals(2, response.getAttendeeCount());
        verify(fixture.notificationService).sendRsvpConfirmation(existing);
        verify(fixture.notificationService).notifyOwnerRsvpReceived(existing);
    }

    @Test
    void attendingRsvpRequiresAtLeastOneAttendee() {
        Fixture fixture = fixture();
        UserInvitation invitation = invitation(LocalDate.now().plusDays(5));
        Guest guest = guest(invitation);
        when(fixture.invitationService.requirePublishedInvitationForRsvp("samnang-sreyneang", true))
                .thenReturn(invitation);
        when(fixture.guestRepository.findByInvitationIdAndInviteToken(10L, "token"))
                .thenReturn(Optional.of(guest));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.submitPublicWithToken("samnang-sreyneang", "token", request(RsvpStatus.ATTENDING, 0))
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void ownerCanUpdateRsvpStatus() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        Rsvp existing = new Rsvp();
        existing.setId(88L);
        existing.setInvitation(invitation(LocalDate.now().plusDays(5)));
        existing.setGuest(guest(existing.getInvitation()));
        existing.setResponseStatus(RsvpStatus.MAYBE);
        existing.setAttendeeCount(0);

        when(fixture.rsvpRepository.findByIdAndInvitationId(88L, 10L))
                .thenReturn(Optional.of(existing));

        RsvpUpdateRequest request = new RsvpUpdateRequest();
        request.setResponseStatus(RsvpStatus.ATTENDING);
        request.setAttendeeCount(2);
        request.setMessage("See you soon");

        RsvpResponse response = fixture.service.update(authentication, 10L, 88L, request);

        assertEquals(RsvpStatus.ATTENDING, response.getResponseStatus());
        assertEquals(2, response.getAttendeeCount());
        assertEquals("See you soon", response.getMessage());
    }

    @Test
    void publicRsvpAfterDeadlineFails() {
        Fixture fixture = fixture();
        when(fixture.invitationService.requirePublishedInvitationForRsvp("late", false))
                .thenReturn(invitation(LocalDate.now().minusDays(1)));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.submitPublic("late", request(RsvpStatus.ATTENDING, 1))
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void summaryReturnsCounts() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        when(fixture.guestRepository.countByInvitationId(10L)).thenReturn(5L);
        when(fixture.rsvpRepository.countByInvitationIdAndResponseStatus(10L, RsvpStatus.ATTENDING)).thenReturn(2L);
        when(fixture.rsvpRepository.countByInvitationIdAndResponseStatus(10L, RsvpStatus.NOT_ATTENDING)).thenReturn(1L);
        when(fixture.rsvpRepository.countByInvitationIdAndResponseStatus(10L, RsvpStatus.MAYBE)).thenReturn(1L);
        when(fixture.rsvpRepository.countPendingGuests(10L)).thenReturn(1L);
        when(fixture.rsvpRepository.sumAttendeeCountByInvitationIdAndStatus(10L, RsvpStatus.ATTENDING)).thenReturn(4L);

        RsvpSummaryResponse response = fixture.service.summary(authentication, 10L);

        assertEquals(5, response.getTotalGuests());
        assertEquals(2, response.getAttending());
        assertEquals(1, response.getPending());
        assertEquals(4, response.getTotalAttendeeCount());
    }

    @Test
    void ownerCanListRsvps() {
        Fixture fixture = fixture();
        Rsvp rsvp = new Rsvp();
        rsvp.setId(1L);
        rsvp.setInvitation(invitation(LocalDate.now().plusDays(5)));
        when(fixture.rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(10L)).thenReturn(List.of(rsvp));

        List<RsvpResponse> responses = fixture.service.list(mock(Authentication.class), 10L);

        assertEquals(1, responses.size());
    }

    private Fixture fixture() {
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        InvitationService invitationService = mock(InvitationService.class);
        NotificationService notificationService = mock(NotificationService.class);
        RsvpService service = new RsvpService(
                rsvpRepository,
                guestRepository,
                invitationService,
                notificationService
        );

        when(rsvpRepository.save(any(Rsvp.class))).thenAnswer(invocation -> {
            Rsvp rsvp = invocation.getArgument(0);
            if (rsvp.getId() == null) {
                rsvp.setId(30L);
            }
            return rsvp;
        });

        return new Fixture(service, rsvpRepository, guestRepository, invitationService, notificationService);
    }

    private RsvpRequest request(RsvpStatus status, Integer count) {
        RsvpRequest request = new RsvpRequest();
        request.setGuestName("Sophea");
        request.setResponseStatus(status);
        request.setAttendeeCount(count);
        return request;
    }

    private UserInvitation invitation(LocalDate deadline) {
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setSlug("samnang-sreyneang");
        invitation.setRsvpDeadline(deadline);
        return invitation;
    }

    private Guest guest(UserInvitation invitation) {
        Guest guest = new Guest();
        guest.setId(20L);
        guest.setInvitation(invitation);
        guest.setGuestName("Sophea");
        guest.setInviteToken("token");
        return guest;
    }

    private record Fixture(
            RsvpService service,
            RsvpRepository rsvpRepository,
            GuestRepository guestRepository,
            InvitationService invitationService,
            NotificationService notificationService
    ) {
    }
}
