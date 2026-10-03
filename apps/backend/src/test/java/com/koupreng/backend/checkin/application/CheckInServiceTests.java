package com.koupreng.backend.checkin.application;

import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.user.application.CurrentUserService;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.checkin.api.dto.CheckInResponse;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.checkin.domain.GuestCheckIn;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.checkin.infrastructure.persistence.GuestCheckInRepository;
import com.koupreng.backend.checkin.infrastructure.persistence.GuestCheckInEventRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.ArgumentMatchers.any;

class CheckInServiceTests {

    @Test
    void undoIsIdempotentAndPreservesOriginalCheckInAndGuestData() {
        Fixture fixture = fixture();
        GuestCheckIn existing = state(fixture);
        Instant originalTime = existing.getCheckedInAt();
        when(fixture.guestRepository.findForUpdateByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(fixture.guest));
        when(fixture.checkInRepository.findByInvitationIdAndGuestId(10L, 20L)).thenReturn(Optional.of(existing));
        fixture.service.undo(fixture.authentication, 10L, 20L);
        fixture.service.undo(fixture.authentication, 10L, 20L);
        org.junit.jupiter.api.Assertions.assertFalse(existing.isActive());
        assertEquals(originalTime, existing.getCheckedInAt());
        assertEquals("original note", existing.getNote());
        assertEquals("Sophea", fixture.guest.getGuestName());
        verify(fixture.events, times(1)).save(any());
        verify(fixture.audit, times(1)).logSystemEvent(org.mockito.ArgumentMatchers.eq("GUEST_CHECK_IN_UNDONE"),
                any(), any(), any(), any());
        verify(fixture.checkInRepository, never()).delete(any());
        verify(fixture.guestRepository, never()).delete(any());
    }

    @Test
    void undoDeniesNonOwnerBeforeLockingGuest() {
        Fixture fixture = fixture();
        AppUser other = new AppUser();
        other.setId(99L);
        when(fixture.currentUserService.currentUser(fixture.authentication)).thenReturn(other);
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class,
                () -> fixture.service.undo(fixture.authentication, 10L, 20L)).getStatus());
        verify(fixture.guestRepository, never()).findForUpdateByIdAndInvitationId(any(), any());
        verify(fixture.events, never()).save(any());
    }

    @Test
    void recheckInReusesStateIdAndRecordsNewEvent() {
        Fixture fixture = fixture();
        GuestCheckIn existing = state(fixture);
        existing.setActive(false);
        existing.setUndoneAt(Instant.now());
        when(fixture.guestRepository.findForUpdateByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(fixture.guest));
        when(fixture.checkInRepository.findByInvitationIdAndGuestId(10L, 20L)).thenReturn(Optional.of(existing));
        when(fixture.checkInRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        CheckInResponse response = fixture.service.manual(fixture.authentication, 10L, 20L, "new note");
        assertEquals(40L, response.getId());
        assertEquals("CHECKED_IN", response.getResult());
        org.junit.jupiter.api.Assertions.assertTrue(existing.isActive());
        org.junit.jupiter.api.Assertions.assertNull(existing.getUndoneAt());
        verify(fixture.events).save(any());
    }

    private GuestCheckIn state(Fixture fixture) {
        GuestCheckIn state = new GuestCheckIn();
        state.setId(40L);
        state.setInvitation(fixture.invitation);
        state.setGuest(fixture.guest);
        state.setCheckedInAt(Instant.parse("2026-08-10T10:00:00Z"));
        state.setSource("QR");
        state.setNote("original note");
        return state;
    }

    @Test
    void duplicateManualCheckInIsSerializedAndReturnsStableResult() {
        Fixture fixture = fixture();
        GuestCheckIn existing = new GuestCheckIn();
        existing.setId(40L);
        existing.setInvitation(fixture.invitation);
        existing.setGuest(fixture.guest);
        existing.setCheckedInAt(Instant.parse("2026-08-10T10:00:00Z"));
        existing.setSource("MANUAL");
        when(fixture.guestRepository.findForUpdateByIdAndInvitationId(20L, 10L))
                .thenReturn(Optional.of(fixture.guest));
        when(fixture.checkInRepository.findByInvitationIdAndGuestId(10L, 20L))
                .thenReturn(Optional.of(existing));

        CheckInResponse response = fixture.service.manual(fixture.authentication, 10L, 20L, null);

        assertEquals("ALREADY_CHECKED_IN", response.getResult());
        assertEquals(Instant.parse("2026-08-10T10:00:00Z"), response.getCheckedInAt());
        verify(fixture.guestRepository).findForUpdateByIdAndInvitationId(20L, 10L);
    }

    @Test
    void scanDistinguishesWrongInvitationWithoutReturningGuestData() {
        Fixture fixture = fixture();
        when(fixture.guestRepository.findForUpdateByInvitationIdAndInviteToken(10L, "other-token"))
                .thenReturn(Optional.empty());
        when(fixture.guestRepository.existsByInviteToken("other-token")).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.service.scan(fixture.authentication, 10L, "other-token", null));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("CHECKIN_WRONG_INVITATION", exception.getCode());
    }

    @Test
    void summaryReturnsAggregatedMetrics() {
        Fixture fixture = fixture();
        when(fixture.guestRepository.countByInvitationId(10L)).thenReturn(50L);
        when(fixture.checkInRepository.countByInvitationId(10L)).thenReturn(30L);
        when(fixture.rsvpRepository.countActiveCheckedInGuestsByInvitationIdAndResponseStatus(10L, RsvpStatus.ATTENDING))
                .thenReturn(18L);

        var summary = fixture.service.summary(fixture.authentication, 10L);

        assertEquals(10L, summary.getInvitationId());
        assertEquals(50L, summary.getTotalGuests());
        assertEquals(30L, summary.getCheckedIn());
        assertEquals(20L, summary.getRemaining());
        assertEquals(18L, summary.getAttendingCheckedIn());
    }

    @Test
    void listReturnsOrderedCheckIns() {
        Fixture fixture = fixture();
        GuestCheckIn checkIn = new GuestCheckIn();
        checkIn.setId(1L);
        checkIn.setInvitation(fixture.invitation);
        checkIn.setGuest(fixture.guest);
        checkIn.setSource("QR");
        checkIn.setCheckedInAt(Instant.now());

        when(fixture.checkInRepository.findByInvitationIdOrderByCheckedInAtDesc(10L))
                .thenReturn(java.util.List.of(checkIn));

        var list = fixture.service.list(fixture.authentication, 10L);

        assertEquals(1, list.size());
        assertEquals("Sophea", list.get(0).getGuestName());
        assertEquals("QR", list.get(0).getSource());
    }

    private Fixture fixture() {
        GuestCheckInRepository checkInRepository = mock(GuestCheckInRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        GuestCheckInEventRepository events = mock(GuestCheckInEventRepository.class);
        Authentication authentication = mock(Authentication.class);
        AppUser owner = new AppUser();
        owner.setId(1L);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setUser(owner);
        Guest guest = new Guest();
        guest.setId(20L);
        guest.setInvitation(invitation);
        guest.setGuestName("Sophea");
        guest.setInviteToken("token");

        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        when(invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(invitation));

        CheckInService service = new CheckInService(
                checkInRepository,
                guestRepository,
                invitationRepository,
                rsvpRepository,
                currentUserService,
                auditLogService,
                events
        );
        return new Fixture(service, checkInRepository, guestRepository, authentication, invitation, guest,
                currentUserService, auditLogService, events, rsvpRepository);
    }

    private record Fixture(
            CheckInService service,
            GuestCheckInRepository checkInRepository,
            GuestRepository guestRepository,
            Authentication authentication,
            UserInvitation invitation,
            Guest guest,
            CurrentUserService currentUserService,
            AuditLogService audit,
            GuestCheckInEventRepository events,
            RsvpRepository rsvpRepository
    ) {
    }
}
