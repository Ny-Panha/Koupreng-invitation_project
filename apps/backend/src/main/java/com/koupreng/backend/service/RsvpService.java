package com.koupreng.backend.service;

import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.rsvp.RsvpRequest;
import com.koupreng.backend.dto.rsvp.RsvpResponse;
import com.koupreng.backend.dto.rsvp.RsvpSummaryResponse;
import com.koupreng.backend.dto.rsvp.RsvpUpdateRequest;
import com.koupreng.backend.dto.rsvp.WishResponse;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.Rsvp;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.enums.RsvpStatus;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.RsvpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RsvpService {

    private static final Logger log = LoggerFactory.getLogger(RsvpService.class);

    private final RsvpRepository rsvpRepository;
    private final GuestRepository guestRepository;
    private final InvitationService invitationService;
    private final NotificationService notificationService;

    public RsvpService(
            RsvpRepository rsvpRepository,
            GuestRepository guestRepository,
            InvitationService invitationService,
            NotificationService notificationService
    ) {
        this.rsvpRepository = rsvpRepository;
        this.guestRepository = guestRepository;
        this.invitationService = invitationService;
        this.notificationService = notificationService;
    }

    @Transactional
    public RsvpResponse submitPublic(String slug, RsvpRequest request) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(slug, false);
        return submitPublicForInvitation(invitation, request);
    }

    @Transactional
    public RsvpResponse submitPublic(String slug, String accessToken, RsvpRequest request) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(slug, false, accessToken, null);
        return submitPublicForInvitation(invitation, request);
    }

    private RsvpResponse submitPublicForInvitation(UserInvitation invitation, RsvpRequest request) {
        validateDeadline(invitation);
        Guest guest = reusableGuest(invitation.getId(), request)
                .orElseGet(() -> createPublicGuest(invitation, request));
        guest.setInvitationViewedAt(Instant.now());
        guest.setSendStatus("RESPONDED");
        guestRepository.save(guest);
        Rsvp saved = upsertRsvp(invitation, guest, request);
        notifyRsvpRecorded(saved);
        return RsvpResponse.from(saved);
    }

    @Transactional
    public RsvpResponse submitPublicWithToken(String slug, String inviteToken, RsvpRequest request) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(slug, true);
        validateDeadline(invitation);
        Guest guest = guestRepository.findByInvitationIdAndInviteToken(invitation.getId(), inviteToken)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest invitation link not found"));
        guest.setInvitationViewedAt(Instant.now());
        guest.setSendStatus("RESPONDED");
        guestRepository.save(guest);
        Rsvp saved = upsertRsvp(invitation, guest, request);
        notifyRsvpRecorded(saved);
        return RsvpResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public RsvpSummaryResponse publicSummary(String slug) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(slug, false);
        return summaryForInvitation(invitation.getId());
    }

    @Transactional(readOnly = true)
    public RsvpSummaryResponse publicSummary(String slug, String accessToken, String inviteToken) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(
                slug,
                false,
                accessToken,
                inviteToken
        );
        return summaryForInvitation(invitation.getId());
    }

    @Transactional(readOnly = true)
    public List<WishResponse> publicWishes(String slug) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(slug, false);
        return wishesForInvitation(invitation.getId());
    }

    @Transactional(readOnly = true)
    public List<WishResponse> publicWishes(String slug, String accessToken, String inviteToken) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(
                slug,
                false,
                accessToken,
                inviteToken
        );
        return wishesForInvitation(invitation.getId());
    }

    @Transactional(readOnly = true)
    public List<RsvpResponse> publicWishes(String slug, String inviteToken) {
        UserInvitation invitation = invitationService.requirePublicInvitationForView(slug, inviteToken);
        return rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(invitation.getId()).stream()
                .filter(rsvp -> trimToNull(rsvp.getMessage()) != null)
                .map(RsvpResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RsvpResponse> list(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(invitationId).stream()
                .map(RsvpResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RsvpSummaryResponse summary(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return summaryForInvitation(invitationId);
    }

    @Transactional
    public RsvpResponse update(
            Authentication authentication,
            Long invitationId,
            Long rsvpId,
            RsvpUpdateRequest request
    ) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Rsvp rsvp = rsvpRepository.findByIdAndInvitationId(rsvpId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RSVP not found"));
        RsvpStatus status = request.getResponseStatus() == null
                ? rsvp.getResponseStatus()
                : request.getResponseStatus();
        if (status == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RSVP status is required");
        }
        Integer requestedAttendeeCount = request.getAttendeeCount() == null
                ? rsvp.getAttendeeCount()
                : request.getAttendeeCount();
        rsvp.setResponseStatus(status);
        rsvp.setAttendeeCount(attendeeCount(status, requestedAttendeeCount));
        if (request.getMessage() != null) {
            rsvp.setMessage(trimToNull(request.getMessage()));
        }
        return RsvpResponse.from(rsvpRepository.save(rsvp));
    }

    @Transactional
    public void delete(Authentication authentication, Long invitationId, Long rsvpId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Rsvp rsvp = rsvpRepository.findByIdAndInvitationId(rsvpId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RSVP not found"));
        rsvpRepository.delete(rsvp);
    }

    @Transactional(readOnly = true)
    public List<WishResponse> wishes(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return wishesForInvitation(invitationId);
    }

    private RsvpSummaryResponse summaryForInvitation(Long invitationId) {
        long totalGuests = guestRepository.countByInvitationId(invitationId);
        long attending = rsvpRepository.countByInvitationIdAndResponseStatus(invitationId, RsvpStatus.ATTENDING);
        long notAttending = rsvpRepository.countByInvitationIdAndResponseStatus(invitationId, RsvpStatus.NOT_ATTENDING);
        long maybe = rsvpRepository.countByInvitationIdAndResponseStatus(invitationId, RsvpStatus.MAYBE);
        long pending = rsvpRepository.countPendingGuests(invitationId);
        long totalAttendeeCount = rsvpRepository.sumAttendeeCountByInvitationIdAndStatus(invitationId, RsvpStatus.ATTENDING);
        return RsvpSummaryResponse.builder()
                .totalGuests(totalGuests)
                .attending(attending)
                .notAttending(notAttending)
                .maybe(maybe)
                .pending(pending)
                .totalAttendeeCount(totalAttendeeCount)
                .build();
    }

    private List<WishResponse> wishesForInvitation(Long invitationId) {
        return rsvpRepository.findByInvitationIdAndMessageIsNotNullOrderByRespondedAtDesc(invitationId).stream()
                .filter(rsvp -> trimToNull(rsvp.getMessage()) != null)
                .map(WishResponse::from)
                .toList();
    }

    private Rsvp upsertRsvp(UserInvitation invitation, Guest guest, RsvpRequest request) {
        if (request.getResponseStatus() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RSVP status is required");
        }
        int attendeeCount = attendeeCount(request.getResponseStatus(), request.getAttendeeCount());
        Rsvp rsvp = rsvpRepository.findByInvitationIdAndGuestId(invitation.getId(), guest.getId())
                .orElseGet(Rsvp::new);
        rsvp.setInvitation(invitation);
        rsvp.setGuest(guest);
        rsvp.setResponseStatus(request.getResponseStatus());
        rsvp.setAttendeeCount(attendeeCount);
        rsvp.setMessage(trimToNull(request.getMessage()));
        return rsvpRepository.save(rsvp);
    }

    private Optional<Guest> reusableGuest(Long invitationId, RsvpRequest request) {
        String email = trimToNull(request.getEmail());
        if (email != null) {
            Optional<Guest> guest = guestRepository.findByInvitationIdAndEmailIgnoreCase(invitationId, email);
            if (guest.isPresent()) {
                return guest;
            }
        }
        String phone = trimToNull(request.getPhone());
        if (phone != null) {
            return guestRepository.findByInvitationIdAndPhone(invitationId, phone);
        }
        return Optional.empty();
    }

    private Guest createPublicGuest(UserInvitation invitation, RsvpRequest request) {
        String guestName = trimToNull(request.getGuestName());
        if (guestName == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Guest name is required");
        }
        Guest guest = new Guest();
        guest.setInvitation(invitation);
        guest.setGuestName(guestName);
        guest.setPhone(trimToNull(request.getPhone()));
        guest.setEmail(trimToNull(request.getEmail()));
        guest.setInviteToken(uniqueInviteToken());
        guest.setQrCodeUrl("/i/" + invitation.getSlug() + "?token=" + guest.getInviteToken());
        guest.setInvitationViewedAt(Instant.now());
        return guestRepository.save(guest);
    }

    private int attendeeCount(RsvpStatus status, Integer requestedAttendeeCount) {
        int attendeeCount = requestedAttendeeCount == null
                ? (status == RsvpStatus.NOT_ATTENDING ? 0 : 1)
                : requestedAttendeeCount;
        if (attendeeCount < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Attendee count must be zero or greater");
        }
        if (status == RsvpStatus.NOT_ATTENDING) {
            return 0;
        }
        if (status == RsvpStatus.ATTENDING && attendeeCount < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Attending RSVP must include at least one attendee");
        }
        return attendeeCount;
    }

    private void validateDeadline(UserInvitation invitation) {
        if (invitation.getRsvpDeadline() != null && LocalDate.now().isAfter(invitation.getRsvpDeadline())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RSVP deadline has passed");
        }
    }

    private String uniqueInviteToken() {
        String token;
        do {
            token = UUID.randomUUID().toString().replace("-", "");
        } while (guestRepository.existsByInviteToken(token));
        return token;
    }

    private void notifyRsvpRecorded(Rsvp rsvp) {
        try {
            notificationService.sendRsvpConfirmation(rsvp);
            notificationService.notifyOwnerRsvpReceived(rsvp);
        } catch (RuntimeException exception) {
            log.warn("Could not create RSVP notification for RSVP {}", rsvp.getId(), exception);
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
