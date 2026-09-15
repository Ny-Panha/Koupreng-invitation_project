package com.koupreng.backend.service;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.gift.WeddingGiftRequest;
import com.koupreng.backend.dto.gift.WeddingGiftResponse;
import com.koupreng.backend.entity.gift.WeddingGift;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.repository.WeddingGiftRepository;
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
    private final InvitationService invitationService;

    public WeddingGiftService(
            WeddingGiftRepository weddingGiftRepository,
            InvitationService invitationService
    ) {
        this.weddingGiftRepository = weddingGiftRepository;
        this.invitationService = invitationService;
    }

    @Transactional(readOnly = true)
    public List<WeddingGiftResponse> list(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return weddingGiftRepository.findAllByInvitationId(invitationId).stream()
                .map(WeddingGiftResponse::from)
                .toList();
    }

    @Transactional
    public WeddingGiftResponse create(Authentication authentication, Long invitationId, WeddingGiftRequest request) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        WeddingGift gift = new WeddingGift();
        gift.setInvitation(invitation);
        applyRequest(gift, request);
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
        applyRequest(gift, request);
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

    private void applyRequest(WeddingGift gift, WeddingGiftRequest request) {
        gift.setGiverName(trimToNull(request.getName()));
        gift.setAmount(nonNegative(request.getAmount()));
        gift.setMethod(trimToNull(request.getMethod()));
        gift.setReceivedDate(request.getDate() == null ? LocalDate.now() : request.getDate());
        gift.setNote(trimToNull(request.getNote()));
    }

    private BigDecimal nonNegative(BigDecimal value) {
        if (value == null || value.signum() < 0) {
            return BigDecimal.ZERO;
        }
        return value;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
