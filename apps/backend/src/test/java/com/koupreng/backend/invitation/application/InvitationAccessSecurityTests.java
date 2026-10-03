package com.koupreng.backend.invitation.application;

import com.koupreng.backend.invitation.api.dto.InvitationAccessVerifyRequest;
import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.invitation.domain.InvitationVisibility;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.guest.domain.Guest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InvitationAccessSecurityTests {
    @Test
    void passwordFailureIsRecordedAndBlockedBeforeHashingWhenLimited() {
        Fixture fixture = fixture();
        InvitationAccessVerifyRequest request = new InvitationAccessVerifyRequest();
        request.setPassword("wrong");
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class,
                () -> fixture.service.verifyPublicAccess("protected", request)).getStatus());
        verify(fixture.limiter).recordFailure(10L);
        doThrow(new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Limited")).when(fixture.limiter).assertAllowed(10L);
        clearInvocations(fixture.passwordEncoder);
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, assertThrows(ApiException.class,
                () -> fixture.service.verifyPublicAccess("protected", request)).getStatus());
        verifyNoInteractions(fixture.passwordEncoder);
    }

    @Test
    void correctPasswordDoesNotIncreaseFailureCount() {
        Fixture fixture = fixture();
        InvitationAccessVerifyRequest request = new InvitationAccessVerifyRequest();
        request.setPassword("correct");
        when(fixture.passwordEncoder.matches("correct", "hash")).thenReturn(true);
        assertTrue(fixture.service.verifyPublicAccess("protected", request).isAccessGranted());
        verify(fixture.limiter, never()).recordFailure(any());
    }

    @Test
    void validGuestCapabilityBypassesPasswordFailureLock() {
        Fixture fixture = fixture();
        when(fixture.guests.findByInvitationIdAndInviteToken(10L, "guest-capability")).thenReturn(Optional.of(new Guest()));
        InvitationAccessVerifyRequest request = new InvitationAccessVerifyRequest();
        request.setInviteToken("guest-capability");
        request.setPassword("wrong");
        assertTrue(fixture.service.verifyPublicAccess("protected", request).isAccessGranted());
        verifyNoInteractions(fixture.limiter, fixture.passwordEncoder);
    }

    private Fixture fixture() {
        UserInvitationRepository invitations = mock(UserInvitationRepository.class);
        GuestRepository guests = mock(GuestRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        InvitationPasswordAttemptLimiter limiter = mock(InvitationPasswordAttemptLimiter.class);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setSlug("protected");
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PASSWORD_PROTECTED);
        invitation.setAccessPassword("hash");
        invitation.setAccessToken("invitation-capability");
        when(invitations.findBySlugAndStatusAndDeletedFalse("protected", InvitationStatus.PUBLISHED)).thenReturn(Optional.of(invitation));
        InvitationService service = new InvitationService(invitations, null, null, guests, null, null,
                encoder, null, null, null, new AppProperties(), null, null, limiter);
        return new Fixture(service, limiter, encoder, guests);
    }

    private record Fixture(InvitationService service, InvitationPasswordAttemptLimiter limiter,
            PasswordEncoder passwordEncoder, GuestRepository guests) { }
}
