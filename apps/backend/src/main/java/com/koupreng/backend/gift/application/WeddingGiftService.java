package com.koupreng.backend.gift.application;

import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.gift.api.dto.WeddingGiftRequest;
import com.koupreng.backend.gift.api.dto.WeddingGiftResponse;
import com.koupreng.backend.gift.domain.WeddingGift;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.gift.infrastructure.persistence.WeddingGiftRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class WeddingGiftService {

    private final WeddingGiftRepository weddingGiftRepository;
    private final GuestRepository guestRepository;
    private final InvitationService invitationService;
    private final com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository invitationRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public WeddingGiftService(
            WeddingGiftRepository weddingGiftRepository,
            GuestRepository guestRepository,
            InvitationService invitationService,
            com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository invitationRepository
    ) {
        this.weddingGiftRepository = weddingGiftRepository;
        this.guestRepository = guestRepository;
        this.invitationService = invitationService;
        this.invitationRepository = invitationRepository;
    }

    public WeddingGiftService(WeddingGiftRepository gifts, GuestRepository guests, InvitationService invitations) {
        this(gifts, guests, invitations, null);
    }

    @Transactional(readOnly = true)
    public List<WeddingGiftResponse> list(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return weddingGiftRepository.findAllByInvitationId(invitationId).stream()
                .map(WeddingGiftResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WeddingGiftResponse> listForAdmin(Long invitationId) {
        return weddingGiftRepository.findAllByInvitationId(invitationId).stream()
                .map(WeddingGiftResponse::from)
                .toList();
    }

    @Transactional
    public WeddingGiftResponse create(Authentication authentication, Long invitationId, WeddingGiftRequest request) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        String requestId = request.getClientRequestId() == null ? null : request.getClientRequestId().toString();
        if (requestId != null) {
            if (invitationRepository != null) invitationRepository.findForUpdateByIdAndUserId(invitationId, invitation.getUser().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));
            var existing = weddingGiftRepository.findByInvitationIdAndClientRequestId(invitationId, requestId);
            if (existing.isPresent()) {
                var prior = existing.get();
                if (!java.util.Objects.equals(prior.getGuestId(), request.getGuestId()) || !java.util.Objects.equals(prior.getGiverName(), trimToNull(request.getName()))
                    || prior.getAmount().compareTo(nonNegative(request.getAmount())) != 0 || !prior.getCurrency().equals(normalizeCurrency(request.getCurrency()))
                    || !java.util.Objects.equals(prior.getMethod(), trimToNull(request.getMethod())) || !java.util.Objects.equals(prior.getNote(), trimToNull(request.getNote()))
                    || !java.util.Objects.equals(prior.getReceivedDate(), request.getDate() == null ? LocalDate.now() : request.getDate())) {
                    throw new ApiException(HttpStatus.CONFLICT, "This gift request was already saved with different values. Review the existing record.");
                }
                return WeddingGiftResponse.from(prior);
            }
        }
        WeddingGift gift = new WeddingGift();
        gift.setInvitation(invitation);
        gift.setClientRequestId(requestId);
        applyRequest(gift, invitationId, request);
        return WeddingGiftResponse.from(weddingGiftRepository.save(gift));
    }

    @Transactional
    public WeddingGiftResponse update(
            Authentication authentication,
            Long invitationId,
            Long giftId,
            WeddingGiftRequest request
    ) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        WeddingGift gift = requireGift(invitationId, giftId);
        applyRequest(gift, invitationId, request);
        return WeddingGiftResponse.from(weddingGiftRepository.save(gift));
    }

    @Transactional
    public void delete(Authentication authentication, Long invitationId, Long giftId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        weddingGiftRepository.delete(requireGift(invitationId, giftId));
    }

    private WeddingGift requireGift(Long invitationId, Long giftId) {
        return weddingGiftRepository.findByIdAndInvitationId(giftId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wedding gift not found"));
    }

    private void applyRequest(WeddingGift gift, Long invitationId, WeddingGiftRequest request) {
        Long guestId = request.getGuestId();
        if (guestId != null && !guestRepository.findByIdAndInvitationId(guestId, invitationId).isPresent()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Guest not found for this invitation");
        }
        gift.setGuestId(guestId);
        gift.setGiverName(trimToNull(request.getName()));
        gift.setAmount(nonNegative(request.getAmount()));
        gift.setCurrency(normalizeCurrency(request.getCurrency()));
        gift.setMethod(trimToNull(request.getMethod()));
        gift.setReceivedDate(request.getDate() == null ? LocalDate.now() : request.getDate());
        gift.setNote(trimToNull(request.getNote()));
    }

    private String normalizeCurrency(String currency) {
        String normalized = currency == null || currency.isBlank() ? "USD" : currency.trim().toUpperCase();
        if (!normalized.equals("USD") && !normalized.equals("KHR")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Currency must be USD or KHR");
        }
        return normalized;
    }

    private BigDecimal nonNegative(BigDecimal value) {
        if (value == null) return BigDecimal.ZERO;
        if (value.signum() < 0 || value.scale() > 2 || value.compareTo(new BigDecimal("9999999999.99")) > 0) throw new ApiException(HttpStatus.BAD_REQUEST, "Gift amount must be nonnegative with at most two decimal places");
        return value;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
