package com.koupreng.backend.delivery.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.koupreng.backend.delivery.infrastructure.persistence.InvitationDeliveryEventRepository;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.shared.exception.ApiException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;

class InvitationDeliveryServiceTests {

    @Test
    void shareMessageRejectsDraftBeforeReadingGuestData() {
        Fixture fixture = fixture(InvitationStatus.DRAFT);

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.service.shareMessage(fixture.authentication, 10L, 20L));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(fixture.guestRepository, never()).findByIdAndInvitationId(20L, 10L);
    }

    @Test
    void shareMessageUsesInvitationScopedGuestAndGeneratesItsLink() {
        Fixture fixture = fixture(InvitationStatus.PUBLISHED);
        Guest guest = new Guest();
        guest.setId(20L);
        guest.setGuestName("Sophea");
        guest.setInvitation(fixture.invitation);
        when(fixture.guestRepository.findByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(guest));

        var response = fixture.service.shareMessage(fixture.authentication, 10L, 20L);

        assertTrue(response.getInvitationUrl().startsWith("https://invite.example/i/my-event?token="));
        assertEquals(response.getInvitationUrl(), guest.getQrCodeUrl());
        assertTrue(response.getMessage().contains(response.getInvitationUrl()));
        verify(fixture.guestRepository).save(guest);
    }

    @Test
    void repeatedPreparationPreservesSentAndFailedOutcomesAndDoesNotDuplicateEvents() {
        Fixture fixture = fixture(InvitationStatus.PUBLISHED);
        Guest sent = guest(fixture, 21L, "SENT");
        Guest failed = guest(fixture, 22L, "FAILED");
        failed.setLastSendError("Original delivery error");
        Guest pending = guest(fixture, 23L, "PENDING");
        when(fixture.guestRepository.findByInvitationIdOrderByCreatedAtDesc(10L))
                .thenReturn(java.util.List.of(sent, failed, pending));
        fixture.service.prepare(fixture.authentication, 10L);
        fixture.service.prepare(fixture.authentication, 10L);
        assertEquals("SENT", sent.getSendStatus());
        assertEquals("FAILED", failed.getSendStatus());
        assertEquals("Original delivery error", failed.getLastSendError());
        assertEquals("LINK_GENERATED", pending.getSendStatus());
        verify(fixture.eventRepository, org.mockito.Mockito.times(1)).save(org.mockito.ArgumentMatchers.any());
    }

    private Guest guest(Fixture fixture, Long id, String status) {
        Guest guest = new Guest();
        guest.setId(id);
        guest.setInvitation(fixture.invitation);
        guest.setGuestName("Fictional guest");
        guest.setPhone("012345678");
        guest.setInviteToken("fixture-" + id);
        guest.setQrCodeUrl("https://invite.example/i/my-event?token=fixture-" + id);
        guest.setSendStatus(status);
        return guest;
    }

    @SuppressWarnings("unchecked")
    private Fixture fixture(InvitationStatus status) {
        InvitationService invitationService = mock(InvitationService.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        InvitationDeliveryEventRepository eventRepository = mock(InvitationDeliveryEventRepository.class);
        ObjectProvider<JavaMailSender> mailSenderProvider = mock(ObjectProvider.class);
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setSlug("my-event");
        invitation.setTitle("Our Wedding");
        invitation.setStatus(status);
        when(invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);

        InvitationDeliveryService service = new InvitationDeliveryService(
                invitationService,
                guestRepository,
                rsvpRepository,
                eventRepository,
                mailSenderProvider,
                "https://invite.example/"
        );
        return new Fixture(service, guestRepository, authentication, invitation, eventRepository);
    }

    private record Fixture(
            InvitationDeliveryService service,
            GuestRepository guestRepository,
            Authentication authentication,
            UserInvitation invitation,
            InvitationDeliveryEventRepository eventRepository
    ) {
    }
}
