package com.koupreng.backend.seating.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.seating.api.dto.*;
import com.koupreng.backend.seating.domain.SeatingLayout;
import com.koupreng.backend.seating.infrastructure.persistence.*;
import com.koupreng.backend.shared.exception.ApiException;
import jakarta.validation.Validator;
import java.time.Instant;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class SeatingLayoutService {
    private final InvitationService invitations;
    private final UserInvitationRepository events;
    private final EventTableRepository tables;
    private final SeatingLayoutRepository layouts;
    private final Validator validator;
    private final ObjectMapper json;
    private final com.koupreng.backend.entitlement.application.EntitlementService entitlements;

    @Transactional(readOnly = true)
    public SeatingLayoutResponse get(Authentication auth, Long eventId) {
        invitations.requireOwnedInvitationEntity(auth, eventId);
        return layouts.findById(eventId).map(this::response).orElse(new SeatingLayoutResponse(eventId, 0, null, null));
    }

    @Transactional
    public SeatingLayoutResponse save(Authentication auth, Long eventId, SeatingLayoutRequest request) {
        var event = invitations.requireOwnedInvitationEntity(auth, eventId);
        entitlements.requireFeature(event.getUser(), com.koupreng.backend.entitlement.application.EntitlementService.Feature.SEATING);
        if (!validator.validate(request).isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Layout coordinates or schema are invalid");
        events.findForUpdateByIdAndUserId(eventId, event.getUser().getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));
        var stored = layouts.findById(eventId).orElseGet(() -> { var layout = new SeatingLayout(); layout.setInvitationId(eventId); return layout; });
        if (stored.getVersion() != request.version()) {
            throw new ApiException(HttpStatus.CONFLICT, "This layout was changed on another device. Your edits are retained. Reload the saved layout before replacing it.");
        }
        var ids = tables.findByInvitationIdOrderBySortOrderAscTableNameAsc(eventId).stream().map(table -> table.getId()).collect(Collectors.toSet());
        if (!ids.containsAll(request.data().positions().keySet())) throw new ApiException(HttpStatus.BAD_REQUEST, "Layout contains an unknown or cross-event table");
        try { stored.setLayoutJson(json.writeValueAsString(request.data())); }
        catch (Exception failure) { throw new IllegalStateException("Layout could not be encoded", failure); }
        stored.setVersion(stored.getVersion() + 1); stored.setUpdatedAt(Instant.now());
        return response(layouts.saveAndFlush(stored));
    }

    private SeatingLayoutResponse response(SeatingLayout layout) {
        try { return new SeatingLayoutResponse(layout.getInvitationId(), layout.getVersion(), json.readValue(layout.getLayoutJson(), SeatingLayoutRequest.LayoutData.class), layout.getUpdatedAt()); }
        catch (Exception failure) { throw new IllegalStateException("Saved layout could not be read", failure); }
    }
}
