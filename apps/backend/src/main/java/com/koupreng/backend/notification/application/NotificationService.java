package com.koupreng.backend.notification.application;

import com.koupreng.backend.user.application.CurrentUserService;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.notification.api.dto.CreateNotificationRequest;
import com.koupreng.backend.notification.api.dto.NotificationResponse;
import com.koupreng.backend.notification.api.dto.NotificationStatusUpdateRequest;
import com.koupreng.backend.notification.api.dto.NotificationSummaryResponse;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.rsvp.domain.Rsvp;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.notification.domain.Notification;
import com.koupreng.backend.entity.payment.TemplatePaymentOrder;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.enums.NotificationChannel;
import com.koupreng.backend.enums.NotificationStatus;
import com.koupreng.backend.enums.NotificationType;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.repository.TemplatePaymentOrderRepository;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class NotificationService {

    private static final Duration REMINDER_DEDUPLICATION_WINDOW = Duration.ofHours(12);

    private final NotificationRepository notificationRepository;
    private final AppUserRepository userRepository;
    private final UserInvitationRepository invitationRepository;
    private final GuestRepository guestRepository;
    private final RsvpRepository rsvpRepository;
    private final TemplatePaymentOrderRepository paymentOrderRepository;
    private final CurrentUserService currentUserService;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    public NotificationService(
            NotificationRepository notificationRepository,
            AppUserRepository userRepository,
            UserInvitationRepository invitationRepository,
            GuestRepository guestRepository,
            RsvpRepository rsvpRepository,
            TemplatePaymentOrderRepository paymentOrderRepository,
            CurrentUserService currentUserService,
            ObjectProvider<JavaMailSender> mailSenderProvider
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
        this.guestRepository = guestRepository;
        this.rsvpRepository = rsvpRepository;
        this.paymentOrderRepository = paymentOrderRepository;
        this.currentUserService = currentUserService;
        this.mailSenderProvider = mailSenderProvider;
    }

    @Transactional
    public NotificationResponse createNotification(Authentication authentication, CreateNotificationRequest request) {
        Notification notification = buildNotification(authentication, request);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse sendInvitationNotification(
            Authentication authentication,
            Long invitationId,
            Long guestId,
            NotificationChannel channel
    ) {
        UserInvitation invitation = requireInvitationForOwnerOrAdmin(authentication, invitationId);
        Guest guest = requireGuest(invitationId, guestId);
        Notification notification = baseSendNotification(
                invitation.getUser(),
                invitation,
                guest,
                null,
                null,
                NotificationType.INVITATION_SENT,
                channel,
                "Invitation sent",
                "Invitation link was prepared for " + guest.getGuestName()
        );
        notification = deliver(notification);
        updateGuestDelivery(guest, notification);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse sendRsvpConfirmation(Rsvp rsvp) {
        if (rsvp == null || rsvp.getInvitation() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RSVP is required");
        }
        Guest guest = rsvp.getGuest();
        UserInvitation invitation = rsvp.getInvitation();
        Notification notification = baseSendNotification(
                invitation.getUser(),
                invitation,
                guest,
                rsvp,
                null,
                NotificationType.RSVP_CONFIRMATION,
                NotificationChannel.SYSTEM,
                "RSVP confirmation",
                "RSVP response recorded for " + (guest == null ? invitation.getTitle() : guest.getGuestName())
        );
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(Instant.now());
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse notifyOwnerRsvpReceived(Rsvp rsvp) {
        if (rsvp == null || rsvp.getInvitation() == null || rsvp.getInvitation().getUser() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RSVP owner notification requires an invitation owner");
        }
        Guest guest = rsvp.getGuest();
        UserInvitation invitation = rsvp.getInvitation();
        String guestName = guest == null ? "A guest" : guest.getGuestName();
        Notification notification = baseSendNotification(
                invitation.getUser(),
                invitation,
                guest,
                rsvp,
                null,
                NotificationType.RSVP_RECEIVED,
                NotificationChannel.SYSTEM,
                "New RSVP received",
                guestName + " responded " + rsvp.getResponseStatus()
        );
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(Instant.now());
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse sendReminderNotification(
            Authentication authentication,
            Long invitationId,
            Long guestId,
            NotificationChannel channel
    ) {
        UserInvitation invitation = requireInvitationForOwnerOrAdmin(authentication, invitationId);
        Guest guest = requireGuest(invitationId, guestId);
        Instant cutoff = Instant.now().minus(REMINDER_DEDUPLICATION_WINDOW);
        if (guest.getLastReminderAt() != null && guest.getLastReminderAt().isAfter(cutoff)) {
            throw new ApiException(HttpStatus.CONFLICT, "Reminder was already sent recently");
        }
        if (notificationRepository.existsByGuestIdAndTypeAndCreatedAtAfter(
                guestId,
                NotificationType.REMINDER,
                cutoff
        )) {
            throw new ApiException(HttpStatus.CONFLICT, "Reminder notification already exists recently");
        }

        Notification notification = baseSendNotification(
                invitation.getUser(),
                invitation,
                guest,
                null,
                null,
                NotificationType.REMINDER,
                channel,
                "RSVP reminder",
                "Reminder prepared for " + guest.getGuestName()
        );
        notification = deliver(notification);
        if (notification.getStatus() != NotificationStatus.FAILED) {
            guest.setLastReminderAt(Instant.now());
            Integer reminderCountValue = guest.getReminderCount();
            int reminderCount = reminderCountValue == null ? 0 : reminderCountValue;
            guest.setReminderCount(reminderCount + 1);
            guestRepository.save(guest);
        }
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse recordDeliveryStatus(
            Authentication authentication,
            Long notificationId,
            NotificationStatusUpdateRequest request
    ) {
        Notification notification = requireNotification(notificationId);
        applyStatus(notification, request.getStatus(), request.getProviderMessageId(), request.getErrorMessage());
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listMyNotifications(Authentication authentication) {
        AppUser user = currentUserService.currentUser(authentication);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listInvitationNotifications(Authentication authentication, Long invitationId) {
        requireInvitationForOwnerOrAdmin(authentication, invitationId);
        return notificationRepository.findByInvitationIdOrderByCreatedAtDesc(invitationId).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(Authentication authentication, Long notificationId) {
        AppUser user = currentUserService.currentUser(authentication);
        Notification notification = requireNotification(notificationId);
        if (!canAccessNotification(authentication, user, notification)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this notification");
        }
        notification.setReadAt(Instant.now());
        notification.setStatus(NotificationStatus.READ);
        return NotificationResponse.from(notificationRepository.save(notification));
    }

    @Transactional
    public List<NotificationResponse> markAllAsRead(Authentication authentication) {
        AppUser user = currentUserService.currentUser(authentication);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        Instant now = Instant.now();
        notifications.stream()
                .filter(notification -> notification.getReadAt() == null)
                .forEach(notification -> {
                    notification.setReadAt(now);
                    notification.setStatus(NotificationStatus.READ);
                });
        return notificationRepository.saveAll(notifications).stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotificationSummaryResponse getNotificationSummary(Authentication authentication) {
        AppUser user = currentUserService.currentUser(authentication);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return NotificationSummaryResponse.builder()
                .total(notifications.size())
                .unread(notificationRepository.countByUserIdAndReadAtIsNull(user.getId()))
                .pending(count(notifications, NotificationStatus.PENDING))
                .sent(count(notifications, NotificationStatus.SENT))
                .delivered(count(notifications, NotificationStatus.DELIVERED))
                .failed(count(notifications, NotificationStatus.FAILED))
                .cancelled(count(notifications, NotificationStatus.CANCELLED))
                .build();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listAllForAdmin(
            NotificationStatus status,
            NotificationType type,
            NotificationChannel channel
    ) {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(notification -> status == null || notification.getStatus() == status)
                .filter(notification -> type == null || notification.getType() == type)
                .filter(notification -> channel == null || notification.getChannel() == channel)
                .map(NotificationResponse::from)
                .toList();
    }

    private Notification buildNotification(Authentication authentication, CreateNotificationRequest request) {
        Notification notification = new Notification();
        UserInvitation invitation = request.getInvitationId() == null
                ? null
                : invitationRepository.findByIdAndDeletedFalse(request.getInvitationId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
        AppUser user = resolveUser(authentication, request.getUserId(), invitation);
        Guest guest = request.getGuestId() == null ? null : requireGuestForRequest(request.getGuestId(), invitation);
        Rsvp rsvp = request.getRsvpId() == null
                ? null
                : rsvpRepository.findById(request.getRsvpId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RSVP not found"));
        TemplatePaymentOrder paymentOrder = request.getPaymentOrderId() == null
                ? null
                : paymentOrderRepository.findById(request.getPaymentOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment order not found"));

        notification.setUser(user);
        notification.setInvitation(invitation);
        notification.setGuest(guest);
        notification.setRsvp(rsvp);
        notification.setPaymentOrder(paymentOrder);
        notification.setType(request.getType());
        notification.setChannel(request.getChannel());
        notification.setStatus(request.getStatus() == null ? NotificationStatus.PENDING : request.getStatus());
        notification.setTitle(trimOrDefault(request.getTitle(), "Notification"));
        notification.setMessage(trimToNull(request.getMessage()));
        notification.setRecipientName(trimToNull(firstPresent(request.getRecipientName(), guest == null ? null : guest.getGuestName())));
        notification.setRecipientEmail(trimToNull(firstPresent(request.getRecipientEmail(), guest == null ? null : guest.getEmail())));
        notification.setRecipientPhone(trimToNull(firstPresent(request.getRecipientPhone(), guest == null ? null : guest.getPhone())));
        notification.setRecipientTelegramId(trimToNull(request.getRecipientTelegramId()));
        return notification;
    }

    private AppUser resolveUser(Authentication authentication, Long userId, UserInvitation invitation) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        }
        if (invitation != null && invitation.getUser() != null) {
            return invitation.getUser();
        }
        return currentUserService.currentUser(authentication);
    }

    private Guest requireGuestForRequest(Long guestId, UserInvitation invitation) {
        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
        if (invitation != null && (guest.getInvitation() == null || !guest.getInvitation().getId().equals(invitation.getId()))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Guest does not belong to invitation");
        }
        return guest;
    }

    private Notification baseSendNotification(
            AppUser user,
            UserInvitation invitation,
            Guest guest,
            Rsvp rsvp,
            TemplatePaymentOrder paymentOrder,
            NotificationType type,
            NotificationChannel channel,
            String title,
            String message
    ) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setInvitation(invitation);
        notification.setGuest(guest);
        notification.setRsvp(rsvp);
        notification.setPaymentOrder(paymentOrder);
        notification.setType(type);
        notification.setChannel(channel == null ? NotificationChannel.SYSTEM : channel);
        notification.setStatus(NotificationStatus.PENDING);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRecipientName(guest == null ? null : guest.getGuestName());
        notification.setRecipientEmail(guest == null ? null : guest.getEmail());
        notification.setRecipientPhone(guest == null ? null : guest.getPhone());
        return notification;
    }

    private Notification deliver(Notification notification) {
        if (notification.getChannel() == NotificationChannel.EMAIL) {
            return sendEmail(notification);
        }
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(Instant.now());
        return notification;
    }

    private Notification sendEmail(Notification notification) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage("Email sender is not configured");
            return notification;
        }
        if (notification.getRecipientEmail() == null || notification.getRecipientEmail().isBlank()) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage("Recipient email is missing");
            return notification;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(notification.getRecipientEmail());
            message.setSubject(notification.getTitle());
            message.setText(notification.getMessage() == null ? "" : notification.getMessage());
            mailSender.send(message);
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(Instant.now());
        } catch (RuntimeException exception) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(exception.getMessage());
        }
        return notification;
    }

    private void updateGuestDelivery(Guest guest, Notification notification) {
        if (guest == null) {
            return;
        }
        guest.setLastSendChannel(notification.getChannel().name());
        if (notification.getStatus() == NotificationStatus.FAILED) {
            guest.setSendStatus(NotificationStatus.FAILED.name());
            guest.setLastSendError(notification.getErrorMessage());
        } else {
            guest.setSendStatus(notification.getStatus().name());
            guest.setLastSentAt(Instant.now());
            guest.setLastSendError(null);
        }
        guestRepository.save(guest);
    }

    private void applyStatus(
            Notification notification,
            NotificationStatus status,
            String providerMessageId,
            String errorMessage
    ) {
        notification.setStatus(status);
        notification.setProviderMessageId(trimToNull(providerMessageId));
        if (status == NotificationStatus.SENT && notification.getSentAt() == null) {
            notification.setSentAt(Instant.now());
        } else if (status == NotificationStatus.DELIVERED) {
            if (notification.getSentAt() == null) {
                notification.setSentAt(Instant.now());
            }
            notification.setDeliveredAt(Instant.now());
        } else if (status == NotificationStatus.READ) {
            notification.setReadAt(Instant.now());
        } else if (status == NotificationStatus.FAILED) {
            notification.setErrorMessage(trimOrDefault(errorMessage, "Notification failed"));
        }
    }

    private UserInvitation requireInvitationForOwnerOrAdmin(Authentication authentication, Long invitationId) {
        AppUser user = currentUserService.currentUser(authentication);
        UserInvitation invitation = invitationRepository.findByIdAndDeletedFalse(invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
        if (!isAdmin(authentication)
                && (invitation.getUser() == null || !invitation.getUser().getId().equals(user.getId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this invitation");
        }
        return invitation;
    }

    private Guest requireGuest(Long invitationId, Long guestId) {
        return guestRepository.findByIdAndInvitationId(guestId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
    }

    private Notification requireNotification(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
    }

    private boolean canAccessNotification(Authentication authentication, AppUser user, Notification notification) {
        if (isAdmin(authentication)) {
            return true;
        }
        if (notification.getUser() != null && notification.getUser().getId().equals(user.getId())) {
            return true;
        }
        UserInvitation invitation = notification.getInvitation();
        return invitation != null && invitation.getUser() != null && invitation.getUser().getId().equals(user.getId());
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private long count(List<Notification> notifications, NotificationStatus status) {
        return notifications.stream()
                .filter(notification -> notification.getStatus() == status)
                .count();
    }

    private String firstPresent(String first, String second) {
        String normalized = trimToNull(first);
        return normalized == null ? trimToNull(second) : normalized;
    }

    private String trimOrDefault(String value, String defaultValue) {
        String trimmed = trimToNull(value);
        return trimmed == null ? defaultValue : trimmed;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
