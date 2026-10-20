package com.koupreng.backend.ticket.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.application.QrCodeService;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.media.infrastructure.persistence.MediaFileRepository;
import com.koupreng.backend.seating.infrastructure.persistence.GuestSeatAssignmentRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.ticket.api.dto.*;
import com.koupreng.backend.ticket.domain.InvitationTicketDesign;
import com.koupreng.backend.ticket.infrastructure.persistence.InvitationTicketDesignRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketService {
    private final InvitationService invitations;
    private final QrCodeService qr;
    private final EntitlementService entitlements;
    private final InvitationTicketDesignRepository designs;
    private final GuestRepository guests;
    private final MediaFileRepository media;
    private final GuestSeatAssignmentRepository seating;
    private final ObjectMapper mapper = new ObjectMapper();

    public TicketService(InvitationService invitations, QrCodeService qr, EntitlementService entitlements,
            InvitationTicketDesignRepository designs, GuestRepository guests, MediaFileRepository media,
            GuestSeatAssignmentRepository seating) {
        this.invitations = invitations; this.qr = qr; this.entitlements = entitlements;
        this.designs = designs; this.guests = guests; this.media = media; this.seating = seating;
    }
    private void requireFeature(UserInvitation invitation) {
        entitlements.requireFeature(invitation.getUser(), EntitlementService.Feature.QR_INVITATIONS);
    }
    @Transactional(readOnly = true)
    public TicketDesignResponse design(Authentication auth, Long eventId) {
        var event = invitations.requireOwnedInvitationEntity(auth, eventId);
        requireFeature(event);
        return appearance(eventId);
    }
    @Transactional
    public TicketDesignResponse save(Authentication auth, Long eventId, TicketDesignRequest request) {
        var event = invitations.requireOwnedInvitationEntity(auth, eventId);
        requireFeature(event);
        requireImage(eventId, request.backgroundMediaId()); requireImage(eventId, request.coverMediaId());
        var row = designs.findById(eventId).orElseGet(() -> {
            var created = new InvitationTicketDesign(); created.setInvitationId(eventId); created.setInvitation(event); return created;
        });
        long current = row.getVersion() == null ? 0 : row.getVersion() + 1;
        if (request.version() != current) throw new ApiException(HttpStatus.CONFLICT, "Ticket design changed. Reload before saving.");
        try { row.setDesignJson(mapper.writeValueAsString(request)); }
        catch (JsonProcessingException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid ticket design"); }
        designs.saveAndFlush(row);
        return appearance(eventId);
    }
    private TicketDesignResponse appearance(Long eventId) {
        var row = designs.findById(eventId).orElse(null);
        TicketDesignRequest value = TicketDesignRequest.defaults();
        if (row != null) {
            try { value = mapper.readValue(row.getDesignJson(), TicketDesignRequest.class).withVersion(row.getVersion() + 1); }
            catch (JsonProcessingException e) { throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Ticket design could not be read"); }
        }
        return new TicketDesignResponse(1, value, imageUrl(eventId, value.backgroundMediaId()), imageUrl(eventId, value.coverMediaId()));
    }
    private String imageUrl(Long eventId, Long mediaId) {
        if (mediaId == null) return null;
        var image = media.findByIdAndInvitationId(mediaId, eventId).orElse(null);
        if (image == null) return null;
        if (image.getMimeType() == null || !image.getMimeType().matches("image/(jpeg|png|webp)"))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ticket media must be a validated image");
        return image.getFileUrl();
    }
    private void requireImage(Long eventId, Long mediaId) {
        if (mediaId != null && imageUrl(eventId, mediaId) == null)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose an image belonging to this event");
    }
    @Transactional
    public TicketResponse ownerTicket(Authentication auth, Long eventId, Long guestId) {
        var event = invitations.requireOwnedInvitationEntity(auth, eventId);
        requireFeature(event);
        Guest guest = guestId == null ? null : guests.findByIdAndInvitationId(guestId, eventId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
        var payload = guest == null ? qr.invitationQr(auth, eventId) : qr.guestQr(auth, eventId, guestId);
        return ticket(event, guest, payload.getInvitationUrl(), payload.getQrCodeDataUri());
    }
    @Transactional(readOnly = true)
    public TicketResponse publicTicket(String slug, String token, String accessToken) {
        var event = invitations.requirePublicInvitationForView(slug, token, accessToken);
        requireFeature(event);
        Guest guest = token == null || token.isBlank() ? null : guests.findByInvitationIdAndInviteToken(event.getId(), token)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Invalid guest invitation"));
        String url = qr.invitationUrl(event, guest == null ? null : guest.getInviteToken());
        // Uses precisely the existing scanner's URL/token identity, without creating guests or RSVPs.
        return ticket(event, guest, url, qr.renderDataUri(url));
    }
    private TicketResponse ticket(UserInvitation event, Guest guest, String url, String qrImage) {
        var appearance = appearance(event.getId());
        var config = appearance.design();
        var seat = guest == null ? null : seating.findByInvitationIdAndGuestId(event.getId(), guest.getId()).orElse(null);
        String host = event.getHostName() == null || event.getHostName().isBlank() ? event.getGroomName() : event.getHostName();
        String partner = event.getPartnerName() == null || event.getPartnerName().isBlank() ? event.getBrideName() : event.getPartnerName();
        return new TicketResponse(guest == null ? "GENERAL" : "GUEST", event.getTitle(), host, partner,
                event.getEventDate(), event.getEventTime(), event.getVenueName(), guest == null ? null : guest.getGuestName(),
                guest != null && config.showGroup() ? guest.getGuestGroup() : null,
                guest != null && config.showTable() ? (seat == null ? guest.getTableNumber() : seat.getTable().getTableName()) : null,
                seat != null && config.showTable() ? seat.getSeatLabel() : null,
                guest != null && config.showSeatCount() ? (seat == null ? guest.getSeatCount() : seat.getSeatCount()) : null,
                url, url, qrImage, appearance);
    }
}
