package com.koupreng.backend.service;

import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.delivery.DeliveryActionResponse;
import com.koupreng.backend.dto.delivery.DeliveryEventResponse;
import com.koupreng.backend.dto.delivery.DeliveryGuestResponse;
import com.koupreng.backend.dto.delivery.DeliveryRequest;
import com.koupreng.backend.dto.delivery.DeliverySummaryResponse;
import com.koupreng.backend.dto.delivery.ShareMessageResponse;
import com.koupreng.backend.entity.delivery.InvitationDeliveryEvent;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.Rsvp;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.InvitationDeliveryEventRepository;
import com.koupreng.backend.repository.RsvpRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Predicate;

@Service
public class InvitationDeliveryService {

    private static final String STATUS_LINK_GENERATED = "LINK_GENERATED";
    private static final String STATUS_NOT_READY = "NOT_READY";
    private static final String STATUS_SENT = "SENT";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_REMINDER_SENT = "REMINDER_SENT";

    private static final String CHANNEL_LINK = "LINK";
    private static final String CHANNEL_EMAIL = "EMAIL";
    private static final String CHANNEL_REMINDER_EMAIL = "REMINDER_EMAIL";

    private final InvitationService invitationService;
    private final GuestRepository guestRepository;
    private final RsvpRepository rsvpRepository;
    private final InvitationDeliveryEventRepository eventRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String publicBaseUrl;

    public InvitationDeliveryService(
            InvitationService invitationService,
            GuestRepository guestRepository,
            RsvpRepository rsvpRepository,
            InvitationDeliveryEventRepository eventRepository,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.invitation.public-base-url:http://localhost:5173}") String publicBaseUrl
    ) {
        this.invitationService = invitationService;
        this.guestRepository = guestRepository;
        this.rsvpRepository = rsvpRepository;
        this.eventRepository = eventRepository;
        this.mailSenderProvider = mailSenderProvider;
        this.publicBaseUrl = normalizeBaseUrl(publicBaseUrl);
    }

    @Transactional
    public DeliveryActionResponse prepare(Authentication authentication, Long invitationId) {
        UserInvitation invitation = requirePublishedOwnedInvitation(authentication, invitationId);
        List<Guest> guests = guestRepository.findByInvitationIdOrderByCreatedAtDesc(invitation.getId());
        Set<Long> respondedGuestIds = respondedGuestIds(invitation.getId());
        int successCount = 0;
        int failedCount = 0;

        for (Guest guest : guests) {
            ensureGuestLink(invitation, guest);
            if (isSendable(guest)) {
                guest.setSendStatus(STATUS_LINK_GENERATED);
                guest.setLastSendError(null);
                successCount++;
                recordEvent(
                        invitation,
                        guest,
                        STATUS_LINK_GENERATED,
                        CHANNEL_LINK,
                        STATUS_LINK_GENERATED,
                        shareText(invitation, guest),
                        null
                );
            } else {
                guest.setSendStatus(STATUS_NOT_READY);
                guest.setLastSendError("Guest phone or email is required");
                failedCount++;
                recordEvent(
                        invitation,
                        guest,
                        STATUS_NOT_READY,
                        CHANNEL_LINK,
                        STATUS_NOT_READY,
                        null,
                        guest.getLastSendError()
                );
            }
        }

        guestRepository.saveAll(guests);
        return DeliveryActionResponse.builder()
                .invitationId(invitation.getId())
                .totalTargets(guests.size())
                .successCount(successCount)
                .failedCount(failedCount)
                .guests(toGuestResponses(invitation, guests, respondedGuestIds))
                .build();
    }

    @Transactional(readOnly = true)
    public DeliverySummaryResponse summary(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        List<Guest> guests = guestRepository.findByInvitationIdOrderByCreatedAtDesc(invitation.getId());
        Set<Long> respondedGuestIds = respondedGuestIds(invitation.getId());

        int notReady = 0;
        int ready = 0;
        int linkGenerated = 0;
        int sent = 0;
        int failed = 0;
        int reminderSent = 0;
        int opened = 0;

        for (Guest guest : guests) {
            String status = guest.getSendStatus();
            if (!isSendable(guest) || STATUS_NOT_READY.equals(status)) {
                notReady++;
            }
            if (isSendable(guest)) {
                ready++;
            }
            if (STATUS_LINK_GENERATED.equals(status)) {
                linkGenerated++;
            }
            if (STATUS_SENT.equals(status)) {
                sent++;
            }
            if (STATUS_FAILED.equals(status)) {
                failed++;
            }
            if (STATUS_REMINDER_SENT.equals(status)
                    || (guest.getReminderCount() != null && guest.getReminderCount() > 0)) {
                reminderSent++;
            }
            if (guest.getInvitationViewedAt() != null) {
                opened++;
            }
        }

        return DeliverySummaryResponse.builder()
                .invitationId(invitation.getId())
                .invitationSlug(invitation.getSlug())
                .totalGuests(guests.size())
                .notReady(notReady)
                .ready(ready)
                .linkGenerated(linkGenerated)
                .sent(sent)
                .failed(failed)
                .reminderSent(reminderSent)
                .opened(opened)
                .responded(respondedGuestIds.size())
                .guests(toGuestResponses(invitation, guests, respondedGuestIds))
                .build();
    }

    @Transactional
    public ShareMessageResponse shareMessage(Authentication authentication, Long invitationId, Long guestId) {
        UserInvitation invitation = requirePublishedOwnedInvitation(authentication, invitationId);
        Guest guest = requireGuest(invitation.getId(), guestId);
        ensureGuestLink(invitation, guest);
        guestRepository.save(guest);

        return ShareMessageResponse.builder()
                .guestId(guest.getId())
                .guestName(guest.getGuestName())
                .invitationUrl(invitationUrl(invitation, guest))
                .message(shareText(invitation, guest))
                .build();
    }

    @Transactional
    public DeliveryGuestResponse markShared(Authentication authentication, Long invitationId, Long guestId) {
        UserInvitation invitation = requirePublishedOwnedInvitation(authentication, invitationId);
        Guest guest = requireGuest(invitation.getId(), guestId);
        ensureGuestLink(invitation, guest);
        guest.setSendStatus(STATUS_SENT);
        guest.setLastSentAt(Instant.now());
        guest.setLastSendChannel(CHANNEL_LINK);
        guest.setLastSendError(null);
        Guest saved = guestRepository.save(guest);
        recordEvent(
                invitation,
                saved,
                "LINK_SHARED",
                CHANNEL_LINK,
                STATUS_SENT,
                shareText(invitation, saved),
                null
        );
        return toGuestResponse(
                invitation,
                saved,
                rsvpRepository.findByInvitationIdAndGuestId(invitation.getId(), saved.getId()).isPresent()
        );
    }

    @Transactional
    public DeliveryActionResponse sendEmail(Authentication authentication, Long invitationId, DeliveryRequest request) {
        UserInvitation invitation = requirePublishedOwnedInvitation(authentication, invitationId);
        List<Guest> targets = resolveTargets(invitation.getId(), request, guest -> hasText(guest.getEmail()));
        Set<Long> respondedGuestIds = respondedGuestIds(invitation.getId());
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        int successCount = 0;
        int failedCount = 0;

        for (Guest guest : targets) {
            ensureGuestLink(invitation, guest);
            String message = emailMessage(invitation, guest, request);
            String error = validateEmailTarget(guest, mailSender);

            if (error == null) {
                try {
                    sendMail(mailSender, guest.getEmail(), emailSubject(invitation, request), message);
                    guest.setSendStatus(STATUS_SENT);
                    guest.setLastSentAt(Instant.now());
                    guest.setLastSendChannel(CHANNEL_EMAIL);
                    guest.setLastSendError(null);
                    successCount++;
                    recordEvent(invitation, guest, "EMAIL_SENT", CHANNEL_EMAIL, STATUS_SENT, message, null);
                } catch (MailException ex) {
                    error = safeError(ex);
                }
            }

            if (error != null) {
                guest.setSendStatus(STATUS_FAILED);
                guest.setLastSendChannel(CHANNEL_EMAIL);
                guest.setLastSendError(error);
                failedCount++;
                recordEvent(invitation, guest, "EMAIL_FAILED", CHANNEL_EMAIL, STATUS_FAILED, message, error);
            }
        }

        guestRepository.saveAll(targets);
        return DeliveryActionResponse.builder()
                .invitationId(invitation.getId())
                .totalTargets(targets.size())
                .successCount(successCount)
                .failedCount(failedCount)
                .guests(toGuestResponses(invitation, targets, respondedGuestIds))
                .build();
    }

    @Transactional
    public DeliveryActionResponse sendReminders(Authentication authentication, Long invitationId, DeliveryRequest request) {
        UserInvitation invitation = requirePublishedOwnedInvitation(authentication, invitationId);
        Set<Long> respondedGuestIds = respondedGuestIds(invitation.getId());
        List<Guest> targets = resolveTargets(
                invitation.getId(),
                request,
                guest -> hasText(guest.getEmail()) && !respondedGuestIds.contains(guest.getId())
        ).stream()
                .filter(guest -> !respondedGuestIds.contains(guest.getId()))
                .toList();
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        int successCount = 0;
        int failedCount = 0;

        for (Guest guest : targets) {
            ensureGuestLink(invitation, guest);
            String message = reminderMessage(invitation, guest, request);
            String error = validateEmailTarget(guest, mailSender);

            if (error == null) {
                try {
                    sendMail(mailSender, guest.getEmail(), reminderSubject(invitation, request), message);
                    guest.setSendStatus(STATUS_REMINDER_SENT);
                    guest.setLastReminderAt(Instant.now());
                    guest.setReminderCount(guest.getReminderCount() == null ? 1 : guest.getReminderCount() + 1);
                    guest.setLastSendChannel(CHANNEL_REMINDER_EMAIL);
                    guest.setLastSendError(null);
                    successCount++;
                    recordEvent(
                            invitation,
                            guest,
                            "REMINDER_SENT",
                            CHANNEL_REMINDER_EMAIL,
                            STATUS_REMINDER_SENT,
                            message,
                            null
                    );
                } catch (MailException ex) {
                    error = safeError(ex);
                }
            }

            if (error != null) {
                guest.setSendStatus(STATUS_FAILED);
                guest.setLastSendChannel(CHANNEL_REMINDER_EMAIL);
                guest.setLastSendError(error);
                failedCount++;
                recordEvent(
                        invitation,
                        guest,
                        "REMINDER_FAILED",
                        CHANNEL_REMINDER_EMAIL,
                        STATUS_FAILED,
                        message,
                        error
                );
            }
        }

        guestRepository.saveAll(targets);
        return DeliveryActionResponse.builder()
                .invitationId(invitation.getId())
                .totalTargets(targets.size())
                .successCount(successCount)
                .failedCount(failedCount)
                .guests(toGuestResponses(invitation, targets, respondedGuestIds))
                .build();
    }

    @Transactional(readOnly = true)
    public List<DeliveryEventResponse> events(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return eventRepository.findByInvitationIdOrderByCreatedAtDesc(invitationId).stream()
                .map(DeliveryEventResponse::from)
                .toList();
    }

    private UserInvitation requirePublishedOwnedInvitation(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        if (invitation.getStatus() != InvitationStatus.PUBLISHED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invitation must be published before sending");
        }
        return invitation;
    }

    private Guest requireGuest(Long invitationId, Long guestId) {
        return guestRepository.findByIdAndInvitationId(guestId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
    }

    private List<Guest> resolveTargets(Long invitationId, DeliveryRequest request, Predicate<Guest> allEligibleFilter) {
        List<Guest> guests = guestRepository.findByInvitationIdOrderByCreatedAtDesc(invitationId);
        if (request == null || Boolean.TRUE.equals(request.getAllEligible())) {
            return guests.stream()
                    .filter(allEligibleFilter)
                    .toList();
        }
        if (request.getGuestIds() == null || request.getGuestIds().isEmpty()) {
            return List.of();
        }
        Set<Long> guestIds = new HashSet<>(request.getGuestIds());
        return guests.stream()
                .filter(guest -> guestIds.contains(guest.getId()))
                .toList();
    }

    private void ensureGuestLink(UserInvitation invitation, Guest guest) {
        if (!hasText(guest.getInviteToken())) {
            guest.setInviteToken(uniqueInviteToken());
        }
        guest.setQrCodeUrl(invitationUrl(invitation, guest));
    }

    private String invitationUrl(UserInvitation invitation, Guest guest) {
        return publicBaseUrl + "/i/" + invitation.getSlug() + "?token=" + guest.getInviteToken();
    }

    private String shareText(UserInvitation invitation, Guest guest) {
        return "Dear " + guest.getGuestName()
                + ", you are invited to " + invitationTitle(invitation)
                + ". Open your invitation: " + invitationUrl(invitation, guest);
    }

    private String emailMessage(UserInvitation invitation, Guest guest, DeliveryRequest request) {
        String customMessage = request == null ? null : trimToNull(request.getMessage());
        if (customMessage != null) {
            return customMessage + "\n\n" + invitationUrl(invitation, guest);
        }
        return shareText(invitation, guest);
    }

    private String reminderMessage(UserInvitation invitation, Guest guest, DeliveryRequest request) {
        String customMessage = request == null ? null : trimToNull(request.getMessage());
        if (customMessage != null) {
            return customMessage + "\n\n" + invitationUrl(invitation, guest);
        }
        return "Reminder: please RSVP for " + invitationTitle(invitation)
                + ". Open your invitation: " + invitationUrl(invitation, guest);
    }

    private String emailSubject(UserInvitation invitation, DeliveryRequest request) {
        String subject = request == null ? null : trimToNull(request.getSubject());
        return subject == null ? "Invitation: " + invitationTitle(invitation) : subject;
    }

    private String reminderSubject(UserInvitation invitation, DeliveryRequest request) {
        String subject = request == null ? null : trimToNull(request.getSubject());
        return subject == null ? "Reminder: " + invitationTitle(invitation) : subject;
    }

    private void sendMail(JavaMailSender mailSender, String to, String subject, String message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        mailSender.send(mailMessage);
    }

    private String validateEmailTarget(Guest guest, JavaMailSender mailSender) {
        if (!hasText(guest.getEmail())) {
            return "Guest email is required";
        }
        if (mailSender == null) {
            return "Mail sender is not configured";
        }
        return null;
    }

    private void recordEvent(
            UserInvitation invitation,
            Guest guest,
            String eventType,
            String channel,
            String status,
            String message,
            String errorMessage
    ) {
        InvitationDeliveryEvent event = new InvitationDeliveryEvent();
        event.setInvitation(invitation);
        event.setGuest(guest);
        event.setEventType(eventType);
        event.setChannel(channel);
        event.setStatus(status);
        event.setMessage(message);
        event.setErrorMessage(errorMessage);
        eventRepository.save(event);
    }

    private List<DeliveryGuestResponse> toGuestResponses(
            UserInvitation invitation,
            List<Guest> guests,
            Set<Long> respondedGuestIds
    ) {
        return guests.stream()
                .map(guest -> toGuestResponse(invitation, guest, respondedGuestIds.contains(guest.getId())))
                .toList();
    }

    private DeliveryGuestResponse toGuestResponse(UserInvitation invitation, Guest guest, boolean responded) {
        return DeliveryGuestResponse.from(guest, invitationUrl(invitation, guest), isSendable(guest), responded);
    }

    private Set<Long> respondedGuestIds(Long invitationId) {
        Set<Long> guestIds = new HashSet<>();
        for (Rsvp rsvp : rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(invitationId)) {
            if (rsvp.getGuest() != null && rsvp.getGuest().getId() != null) {
                guestIds.add(rsvp.getGuest().getId());
            }
        }
        return guestIds;
    }

    private boolean isSendable(Guest guest) {
        return hasText(guest.getPhone()) || hasText(guest.getEmail());
    }

    private String invitationTitle(UserInvitation invitation) {
        String title = trimToNull(invitation.getTitle());
        return title == null ? "our invitation" : title;
    }

    private String uniqueInviteToken() {
        String token;
        do {
            token = UUID.randomUUID().toString().replace("-", "");
        } while (guestRepository.existsByInviteToken(token));
        return token;
    }

    private String safeError(Exception ex) {
        String message = ex.getMessage();
        return hasText(message) ? message : ex.getClass().getSimpleName();
    }

    private String normalizeBaseUrl(String value) {
        String base = trimToNull(value);
        if (base == null) {
            return "http://localhost:5173";
        }
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
