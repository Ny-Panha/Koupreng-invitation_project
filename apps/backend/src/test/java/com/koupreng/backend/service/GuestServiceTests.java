package com.koupreng.backend.service;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.guest.GuestGroupResponse;
import com.koupreng.backend.dto.guest.GuestRequest;
import com.koupreng.backend.dto.guest.GuestResponse;
import com.koupreng.backend.dto.guest.GuestSendListResponse;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.repository.GuestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GuestServiceTests {

    @Test
    void createGuestGeneratesInviteTokenAndQrUrl() {
        Fixture fixture = fixture();

        GuestResponse response = fixture.service.create(fixture.authentication, 10L, request("Sophea"));

        assertEquals("Sophea", response.getGuestName());
        assertNotNull(response.getInviteToken());
        assertEquals("/i/samnang-sreyneang?token=" + response.getInviteToken(), response.getQrCodeUrl());
    }

    @Test
    void createGuestRejectsDuplicateEmailWithinInvitation() {
        Fixture fixture = fixture();
        GuestRequest request = request("Duplicate");
        request.setEmail("guest@example.test");
        when(fixture.guestRepository.findByInvitationIdAndEmailIgnoreCase(10L, "guest@example.test"))
                .thenReturn(Optional.of(guest(fixture.invitation, "Existing")));

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.service.create(fixture.authentication, 10L, request));

        assertEquals("GUEST_DUPLICATE", exception.getCode());
    }

    @Test
    void updateGuestChangesEditableFields() {
        Fixture fixture = fixture();
        Guest guest = guest(fixture.invitation, "Sophea");
        GuestRequest request = request("Sophea Updated");
        request.setPhone("012345678");
        when(fixture.guestRepository.findByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(guest));

        GuestResponse response = fixture.service.update(fixture.authentication, 10L, 20L, request);

        assertEquals("Sophea Updated", response.getGuestName());
        assertEquals("012345678", response.getPhone());
    }

    @Test
    void listGuestsByInvitation() {
        Fixture fixture = fixture();
        when(fixture.guestRepository.findByInvitationIdOrderByCreatedAtDesc(10L))
                .thenReturn(List.of(guest(fixture.invitation, "Sophea")));

        List<GuestResponse> responses = fixture.service.list(fixture.authentication, 10L);

        assertEquals(1, responses.size());
        assertEquals("Sophea", responses.getFirst().getGuestName());
    }

    @Test
    void searchGuestsByKeyword() {
        Fixture fixture = fixture();
        when(fixture.guestRepository.search(10L, "sop"))
                .thenReturn(List.of(guest(fixture.invitation, "Sophea")));

        List<GuestResponse> responses = fixture.service.search(fixture.authentication, 10L, "sop");

        assertEquals(1, responses.size());
        assertEquals("Sophea", responses.getFirst().getGuestName());
    }

    @Test
    void groupedByCategoryGroupsGuestsByGuestGroup() {
        Fixture fixture = fixture();
        Guest family = guest(fixture.invitation, "Sophea");
        family.setGuestGroup("Family");
        Guest friend = guest(fixture.invitation, "Dara");
        friend.setGuestGroup("Friends");
        Guest uncategorized = guest(fixture.invitation, "Maly");
        when(fixture.guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(10L))
                .thenReturn(List.of(family, friend, uncategorized));

        List<GuestGroupResponse> responses = fixture.service.groupedByCategory(fixture.authentication, 10L);

        assertEquals(3, responses.size());
        assertEquals("Family", responses.get(0).getCategory());
        assertEquals(1, responses.get(0).getTotalGuests());
        assertEquals("Friends", responses.get(1).getCategory());
        assertEquals("Uncategorized", responses.get(2).getCategory());
    }

    @Test
    void sendListGeneratesInviteLinksAndCountsSendableGuests() {
        Fixture fixture = fixture();
        Guest phoneGuest = guest(fixture.invitation, "Sophea");
        phoneGuest.setInviteToken(null);
        phoneGuest.setQrCodeUrl(null);
        phoneGuest.setPhone("012345678");
        Guest noContactGuest = guest(fixture.invitation, "Dara");
        noContactGuest.setQrCodeUrl(null);
        when(fixture.guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(10L))
                .thenReturn(List.of(phoneGuest, noContactGuest));

        GuestSendListResponse response = fixture.service.sendList(fixture.authentication, 10L);

        assertEquals(2, response.getTotalGuests());
        assertEquals(1, response.getSendableGuests());
        assertEquals("samnang-sreyneang", response.getInvitationSlug());
        assertNotNull(response.getGuests().getFirst().getInviteToken());
        assertEquals(response.getGuests().getFirst().getInvitationUrl(), response.getGuests().getFirst().getQrCodeUrl());
        assertEquals("/i/samnang-sreyneang?token=" + response.getGuests().getFirst().getInviteToken(),
                response.getGuests().getFirst().getInvitationUrl());
        verify(fixture.guestRepository).save(phoneGuest);
        verify(fixture.guestRepository).save(noContactGuest);
    }

    @Test
    void deleteGuestRemovesGuest() {
        Fixture fixture = fixture();
        Guest guest = guest(fixture.invitation, "Sophea");
        when(fixture.guestRepository.findByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(guest));

        fixture.service.delete(fixture.authentication, 10L, 20L);

        verify(fixture.guestRepository).delete(guest);
    }

    private Fixture fixture() {
        GuestRepository guestRepository = mock(GuestRepository.class);
        InvitationService invitationService = mock(InvitationService.class);
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = invitation();
        GuestService service = new GuestService(guestRepository, invitationService);

        when(invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(guestRepository.existsByInviteToken(any())).thenReturn(false);
        when(guestRepository.save(any(Guest.class))).thenAnswer(invocation -> {
            Guest guest = invocation.getArgument(0);
            if (guest.getId() == null) {
                guest.setId(20L);
            }
            return guest;
        });

        return new Fixture(service, guestRepository, authentication, invitation);
    }

    private GuestRequest request(String name) {
        GuestRequest request = new GuestRequest();
        request.setGuestName(name);
        return request;
    }

    private UserInvitation invitation() {
        AppUser user = new AppUser();
        user.setId(1L);
        user.setFullName("Owner");

        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setUser(user);
        invitation.setTitle("Wedding");
        invitation.setSlug("samnang-sreyneang");
        return invitation;
    }

    private Guest guest(UserInvitation invitation, String name) {
        Guest guest = new Guest();
        guest.setId(20L);
        guest.setInvitation(invitation);
        guest.setGuestName(name);
        guest.setInviteToken("token");
        return guest;
    }

    private record Fixture(
            GuestService service,
            GuestRepository guestRepository,
            Authentication authentication,
            UserInvitation invitation
    ) {
    }
}
