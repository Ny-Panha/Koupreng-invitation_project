package com.koupreng.backend.service;

import com.koupreng.backend.user.application.CurrentUserService;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.checkin.CheckInResponse;
import com.koupreng.backend.dto.checkin.CheckInSummaryResponse;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.entity.invitation.GuestCheckIn;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.repository.GuestCheckInRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Service
public class CheckInService {

    private final GuestCheckInRepository checkInRepository;
    private final GuestRepository guestRepository;
    private final UserInvitationRepository invitationRepository;
    private final RsvpRepository rsvpRepository;
    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    public CheckInService(
            GuestCheckInRepository checkInRepository,
            GuestRepository guestRepository,
            UserInvitationRepository invitationRepository,
            RsvpRepository rsvpRepository,
            CurrentUserService currentUserService,
            AuditLogService auditLogService
    ) {
        this.checkInRepository = checkInRepository;
        this.guestRepository = guestRepository;
        this.invitationRepository = invitationRepository;
        this.rsvpRepository = rsvpRepository;
        this.currentUserService = currentUserService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public CheckInResponse scan(Authentication authentication, Long invitationId, String tokenOrUrl, String note) {
        UserInvitation invitation = requireCheckInInvitation(authentication, invitationId);
        String token = extractToken(tokenOrUrl);
        Guest guest = guestRepository.findForUpdateByInvitationIdAndInviteToken(invitation.getId(), token)
                .orElseThrow(() -> invalidScanToken(token));
        return checkIn(authentication, invitation, guest, "QR", note);
    }

    @Transactional
    public CheckInResponse manual(Authentication authentication, Long invitationId, Long guestId, String note) {
        UserInvitation invitation = requireCheckInInvitation(authentication, invitationId);
        Guest guest = guestRepository.findForUpdateByIdAndInvitationId(guestId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
        return checkIn(authentication, invitation, guest, "MANUAL", note);
    }

    @Transactional(readOnly = true)
    public CheckInSummaryResponse summary(Authentication authentication, Long invitationId) {
        requireCheckInInvitation(authentication, invitationId);
        long total = guestRepository.countByInvitationId(invitationId);
        long checkedIn = checkInRepository.countByInvitationId(invitationId);
        long attendingCheckedIn = checkInRepository.findByInvitationIdOrderByCheckedInAtDesc(invitationId).stream()
                .filter(checkIn -> {
                    Guest g = checkIn.getGuest();
                    if (g == null) return false;
                    return rsvpRepository.findByInvitationIdAndGuestId(invitationId, g.getId())
                            .map(rsvp -> RsvpStatus.ATTENDING == rsvp.getResponseStatus())
                            .orElse(false);
                })
                .count();

        return CheckInSummaryResponse.builder()
                .invitationId(invitationId)
                .totalGuests(total)
                .checkedIn(checkedIn)
                .remaining(Math.max(0, total - checkedIn))
                .attendingCheckedIn(attendingCheckedIn)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CheckInResponse> list(Authentication authentication, Long invitationId) {
        requireCheckInInvitation(authentication, invitationId);
        return checkInRepository.findByInvitationIdOrderByCheckedInAtDesc(invitationId).stream()
                .map(checkIn -> CheckInResponse.from(checkIn, false))
                .toList();
    }

    private CheckInResponse checkIn(
            Authentication authentication,
            UserInvitation invitation,
            Guest guest,
            String source,
            String note
    ) {
        return checkInRepository.findByInvitationIdAndGuestId(invitation.getId(), guest.getId())
                .map(existing -> CheckInResponse.from(existing, true))
                .orElseGet(() -> {
                    GuestCheckIn checkIn = new GuestCheckIn();
                    checkIn.setInvitation(invitation);
                    checkIn.setGuest(guest);
                    checkIn.setCheckedInBy(currentUserService.currentUser(authentication));
                    checkIn.setCheckedInAt(Instant.now());
                    checkIn.setSource(source);
                    checkIn.setNote(trimToNull(note));
                    GuestCheckIn saved = checkInRepository.save(checkIn);
                    auditLogService.logSystemEvent(
                            "GUEST_CHECKED_IN",
                            "GUEST",
                            guest.getId(),
                            "Guest checked in",
                            java.util.Map.of("invitationId", invitation.getId(), "source", source)
                    );
                    if (guest.getSendStatus() == null || "PENDING".equalsIgnoreCase(guest.getSendStatus()) || "NOT_READY".equalsIgnoreCase(guest.getSendStatus())) {
                        guest.setSendStatus("RESPONDED");
                        guestRepository.save(guest);
                    }
                    return CheckInResponse.from(saved, false);
                });
    }

    private UserInvitation requireCheckInInvitation(Authentication authentication, Long invitationId) {
        AppUser user = currentUserService.currentUser(authentication);
        UserInvitation invitation = invitationRepository.findByIdAndDeletedFalse(invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
        if (!isAdmin(authentication)
                && (invitation.getUser() == null || !Objects.equals(invitation.getUser().getId(), user.getId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this invitation");
        }
        return invitation;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private ApiException invalidScanToken(String token) {
        if (guestRepository.existsByInviteToken(token)) {
            return new ApiException(
                    HttpStatus.CONFLICT,
                    "CHECKIN_WRONG_INVITATION",
                    "Check-in token belongs to a different invitation"
            );
        }
        return new ApiException(
                HttpStatus.NOT_FOUND,
                "CHECKIN_INVALID_TOKEN",
                "Guest check-in token not found"
        );
    }

    private String extractToken(String tokenOrUrl) {
        String value = trimToNull(tokenOrUrl);
        if (value == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Check-in token is required");
        }
        if (!value.contains("?") && !value.contains("=") && !value.contains("/")) {
            return value;
        }
        try {
            URI uri = URI.create(value);
            String query = uri.getRawQuery();
            if (query == null && value.contains("?")) {
                query = value.substring(value.indexOf('?') + 1);
            }
            if (query != null) {
                return Arrays.stream(query.split("&"))
                        .map(part -> part.split("=", 2))
                        .filter(parts -> parts.length == 2 && ("token".equals(parts[0]) || "i".equals(parts[0])))
                        .map(parts -> URLDecoder.decode(parts[1], StandardCharsets.UTF_8))
                        .findFirst()
                        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Check-in token is invalid"));
            }
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Check-in token is invalid");
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, "Check-in token is invalid");
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
