package com.koupreng.backend.service;

import com.koupreng.backend.user.application.CurrentUserService;

import com.koupreng.backend.dto.notification.NotificationResponse;
import com.koupreng.backend.dto.notification.NotificationSummaryResponse;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.entity.notification.Notification;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.enums.NotificationChannel;
import com.koupreng.backend.enums.NotificationStatus;
import com.koupreng.backend.enums.NotificationType;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.NotificationRepository;
import com.koupreng.backend.repository.RsvpRepository;
import com.koupreng.backend.repository.TemplatePaymentOrderRepository;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceTests {

    @Test
    void sendInvitationNotificationCreatesAndDeliversNotification() {
        Fixture fixture = fixture();
        Guest guest = new Guest();
        guest.setId(101L);
        guest.setGuestName("Lok Sokha");
        guest.setSendStatus("PENDING");

        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L))
                .thenReturn(Optional.of(fixture.invitation));
        when(fixture.guestRepository.findByIdAndInvitationId(101L, 10L))
                .thenReturn(Optional.of(guest));

        NotificationResponse response = fixture.service.sendInvitationNotification(
                fixture.authentication,
                10L,
                101L,
                NotificationChannel.TELEGRAM
        );

        assertNotNull(response);
        assertEquals(NotificationType.INVITATION_SENT, response.getType());
        assertEquals(NotificationChannel.TELEGRAM, response.getChannel());
        verify(fixture.notificationRepository).save(any(Notification.class));
        verify(fixture.guestRepository).save(guest);
    }

    @Test
    void markAsReadUpdatesNotificationStatus() {
        Fixture fixture = fixture();
        Notification notification = new Notification();
        notification.setId(50L);
        notification.setUser(fixture.owner);
        notification.setStatus(NotificationStatus.DELIVERED);

        when(fixture.notificationRepository.findById(50L)).thenReturn(Optional.of(notification));

        NotificationResponse response = fixture.service.markAsRead(fixture.authentication, 50L);

        assertEquals(NotificationStatus.READ, response.getStatus());
        assertNotNull(notification.getReadAt());
        verify(fixture.notificationRepository).save(notification);
    }

    @Test
    void getNotificationSummaryReturnsCounts() {
        Fixture fixture = fixture();
        Notification n1 = new Notification();
        n1.setStatus(NotificationStatus.DELIVERED);
        n1.setReadAt(null);

        Notification n2 = new Notification();
        n2.setStatus(NotificationStatus.SENT);
        n2.setReadAt(Instant.now());

        when(fixture.notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(n1, n2));
        when(fixture.notificationRepository.countByUserIdAndReadAtIsNull(1L)).thenReturn(1L);

        NotificationSummaryResponse summary = fixture.service.getNotificationSummary(fixture.authentication);

        assertEquals(1L, summary.getUnread());
        assertEquals(2L, summary.getTotal());
        assertEquals(1L, summary.getDelivered());
        assertEquals(1L, summary.getSent());
    }

    private Fixture fixture() {
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        @SuppressWarnings("unchecked")
        ObjectProvider<JavaMailSender> mailSenderProvider = mock(ObjectProvider.class);
        Authentication authentication = mock(Authentication.class);

        AppUser owner = new AppUser();
        owner.setId(1L);
        owner.setEmail("host@example.com");

        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setUser(owner);
        invitation.setTitle("Wedding Invitation");

        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> {
            Notification n = inv.getArgument(0);
            if (n.getId() == null) {
                n.setId(99L);
            }
            if (n.getCreatedAt() == null) {
                n.setCreatedAt(Instant.now());
            }
            return n;
        });

        NotificationService service = new NotificationService(
                notificationRepository,
                userRepository,
                invitationRepository,
                guestRepository,
                rsvpRepository,
                paymentOrderRepository,
                currentUserService,
                mailSenderProvider
        );

        return new Fixture(
                service,
                notificationRepository,
                invitationRepository,
                guestRepository,
                authentication,
                owner,
                invitation
        );
    }

    private record Fixture(
            NotificationService service,
            NotificationRepository notificationRepository,
            UserInvitationRepository invitationRepository,
            GuestRepository guestRepository,
            Authentication authentication,
            AppUser owner,
            UserInvitation invitation
    ) {
    }
}
