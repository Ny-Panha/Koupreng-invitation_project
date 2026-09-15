package com.koupreng.backend.service;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.seating.SeatAssignmentRequest;
import com.koupreng.backend.entity.invitation.EventTable;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.GuestSeatAssignment;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.repository.EventTableRepository;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.GuestSeatAssignmentRepository;
import com.koupreng.backend.repository.UserInvitationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SeatingServiceTests {

    @Test
    void assignmentLocksTableAndGuestBeforeCapacityCheck() {
        Fixture fixture = fixture();
        GuestSeatAssignment existing = new GuestSeatAssignment();
        existing.setId(90L);
        existing.setTable(fixture.table);
        existing.setGuest(guest(fixture.invitation, 21L));
        existing.setSeatCount(4);
        when(fixture.tableRepository.findForUpdateByIdAndInvitationId(30L, 10L))
                .thenReturn(Optional.of(fixture.table));
        when(fixture.guestRepository.findForUpdateByIdAndInvitationId(20L, 10L))
                .thenReturn(Optional.of(fixture.guest));
        when(fixture.assignmentRepository.findByTableId(30L)).thenReturn(List.of(existing));

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.service.assign(fixture.authentication, 10L, assignmentRequest()));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("SEATING_CAPACITY_EXCEEDED", exception.getCode());
        verify(fixture.tableRepository).findForUpdateByIdAndInvitationId(30L, 10L);
        verify(fixture.guestRepository).findForUpdateByIdAndInvitationId(20L, 10L);
    }

    private Fixture fixture() {
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        EventTableRepository tableRepository = mock(EventTableRepository.class);
        GuestSeatAssignmentRepository assignmentRepository = mock(GuestSeatAssignmentRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        Authentication authentication = mock(Authentication.class);
        AppUser owner = new AppUser();
        owner.setId(1L);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setUser(owner);
        EventTable table = new EventTable();
        table.setId(30L);
        table.setInvitation(invitation);
        table.setTableName("A1");
        table.setCapacity(4);
        Guest guest = guest(invitation, 20L);

        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        when(invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(invitation));

        SeatingService service = new SeatingService(
                invitationRepository,
                guestRepository,
                tableRepository,
                assignmentRepository,
                currentUserService
        );
        return new Fixture(service, invitationRepository, guestRepository, tableRepository,
                assignmentRepository, currentUserService, authentication, invitation, table, guest);
    }

    private SeatAssignmentRequest assignmentRequest() {
        SeatAssignmentRequest request = new SeatAssignmentRequest();
        request.setGuestId(20L);
        request.setTableId(30L);
        request.setSeatCount(1);
        return request;
    }

    private Guest guest(UserInvitation invitation, Long id) {
        Guest guest = new Guest();
        guest.setId(id);
        guest.setInvitation(invitation);
        guest.setGuestName("Guest " + id);
        guest.setSeatCount(1);
        return guest;
    }

    private record Fixture(
            SeatingService service,
            UserInvitationRepository invitationRepository,
            GuestRepository guestRepository,
            EventTableRepository tableRepository,
            GuestSeatAssignmentRepository assignmentRepository,
            CurrentUserService currentUserService,
            Authentication authentication,
            UserInvitation invitation,
            EventTable table,
            Guest guest
    ) {
    }
}
