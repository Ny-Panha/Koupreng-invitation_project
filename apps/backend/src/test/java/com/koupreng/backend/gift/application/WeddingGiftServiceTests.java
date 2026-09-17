package com.koupreng.backend.gift.application;

import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.gift.api.dto.WeddingGiftRequest;
import com.koupreng.backend.gift.api.dto.WeddingGiftResponse;
import com.koupreng.backend.gift.domain.WeddingGift;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.gift.infrastructure.persistence.WeddingGiftRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WeddingGiftServiceTests {

    @Test
    void createWeddingGiftPersistsWithCalculatedDefaults() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.weddingGiftRepository.save(any(WeddingGift.class))).thenAnswer(inv -> {
            WeddingGift gift = inv.getArgument(0);
            gift.setId(100L);
            return gift;
        });

        WeddingGiftRequest request = new WeddingGiftRequest();
        request.setName("Sok Dara");
        request.setAmount(new BigDecimal("50.00"));
        request.setMethod("ABA_PAYWAY");
        request.setNote("Best wishes!");

        WeddingGiftResponse response = fixture.service.create(authentication, 10L, request);

        assertEquals(100L, response.getId());
        assertEquals("Sok Dara", response.getName());
        assertEquals(new BigDecimal("50.00"), response.getAmount());
        assertEquals("ABA_PAYWAY", response.getMethod());
        assertEquals("Best wishes!", response.getNote());
        assertEquals(LocalDate.now(), response.getDate());
    }

    @Test
    void createRejectsNegativeAmountBySettingZero() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.weddingGiftRepository.save(any(WeddingGift.class))).thenAnswer(inv -> inv.getArgument(0));

        WeddingGiftRequest request = new WeddingGiftRequest();
        request.setName("Keo Sophea");
        request.setAmount(new BigDecimal("-20.00"));

        WeddingGiftResponse response = fixture.service.create(authentication, 10L, request);

        assertEquals(BigDecimal.ZERO, response.getAmount());
    }

    @Test
    void updateThrowsNotFoundWhenGiftDoesNotExist() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.weddingGiftRepository.findByIdAndInvitationId(999L, 10L)).thenReturn(Optional.empty());

        WeddingGiftRequest request = new WeddingGiftRequest();
        request.setName("Test");

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.update(authentication, 10L, 999L, request)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void deleteRemovesGiftSuccessfully() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        WeddingGift gift = new WeddingGift();
        gift.setId(100L);

        when(fixture.invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(fixture.weddingGiftRepository.findByIdAndInvitationId(100L, 10L)).thenReturn(Optional.of(gift));

        fixture.service.delete(authentication, 10L, 100L);

        verify(fixture.weddingGiftRepository).delete(gift);
    }

    private Fixture fixture() {
        WeddingGiftRepository weddingGiftRepository = mock(WeddingGiftRepository.class);
        InvitationService invitationService = mock(InvitationService.class);
        WeddingGiftService service = new WeddingGiftService(weddingGiftRepository, invitationService);
        return new Fixture(service, weddingGiftRepository, invitationService);
    }

    private record Fixture(
            WeddingGiftService service,
            WeddingGiftRepository weddingGiftRepository,
            InvitationService invitationService
    ) {
    }
}
