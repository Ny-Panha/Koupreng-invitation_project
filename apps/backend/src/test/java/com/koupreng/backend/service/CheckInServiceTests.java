package com.koupreng.backend.service;

import com.koupreng.backend.user.application.CurrentUserService;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.checkin.CheckInResponse;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.GuestCheckIn;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.repository.GuestCheckInRepository;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.RsvpRepository;
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

class CheckInServiceTests {

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
        when(fixture.checkInRepository.findByInvitationIdOrderByCheckedInAtDesc(10L)).thenReturn(java.util.List.of());

        var summary = fixture.service.summary(fixture.authentication, 10L);

        assertEquals(10L, summary.getInvitationId());
        assertEquals(50L, summary.getTotalGuests());
        assertEquals(30L, summary.getCheckedIn());
        assertEquals(20L, summary.getRemaining());
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
                auditLogService
        );
        return new Fixture(service, checkInRepository, guestRepository, authentication, invitation, guest);
    }

    private record Fixture(
            CheckInService service,
            GuestCheckInRepository checkInRepository,
            GuestRepository guestRepository,
            Authentication authentication,
            UserInvitation invitation,
            Guest guest
    ) {
    }
}
