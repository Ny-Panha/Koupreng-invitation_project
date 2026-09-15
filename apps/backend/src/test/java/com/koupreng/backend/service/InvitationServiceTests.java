package com.koupreng.backend.service;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.invitation.InvitationRequest;
import com.koupreng.backend.dto.invitation.InvitationResponse;
import com.koupreng.backend.dto.invitation.PublicGuestResponse;
import com.koupreng.backend.dto.invitation.PublicInvitationResponse;
import com.koupreng.backend.entity.invitation.EventType;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.InvitationTemplate;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.enums.InvitationStatus;
import com.koupreng.backend.enums.InvitationVisibility;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.InvitationTemplateRepository;
import com.koupreng.backend.repository.UserInvitationRepository;
import com.koupreng.backend.repository.UserTemplateAccessRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InvitationServiceTests {

    @Test
    void createDraftInvitationGeneratesSlug() {
        Fixture fixture = fixture();
        InvitationRequest request = request("Samnang and Sreyneang");

        InvitationResponse response = fixture.service.create(fixture.authentication, request);

        assertEquals(InvitationStatus.DRAFT, response.getStatus());
        assertEquals("Samnang and Sreyneang", response.getTitle());
        assertNotNull(response.getSlug());
    }

    @Test
    void publishWithMissingFieldsFails() {
        Fixture fixture = fixture();
        UserInvitation invitation = invitation(fixture.owner);
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(invitation));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.publish(fixture.authentication, 10L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("eventType"));
    }

    @Test
    void publishValidInvitationSucceeds() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(invitation));

        InvitationResponse response = fixture.service.publish(fixture.authentication, 10L);

        assertEquals(InvitationStatus.PUBLISHED, response.getStatus());
        assertNotNull(response.getPublishedAt());
    }

    @Test
    void updateInvitationChangesEditableFields() {
        Fixture fixture = fixture();
        UserInvitation invitation = invitation(fixture.owner);
        InvitationRequest request = request("Updated invitation");
        request.setVenueName("Updated Hall");
        request.setEventType(EventType.OTHER);
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(invitation));

        InvitationResponse response = fixture.service.update(fixture.authentication, 10L, request);

        assertEquals("Updated invitation", response.getTitle());
        assertEquals("Updated Hall", response.getVenueName());
        assertEquals(EventType.OTHER, response.getEventType());
    }

    @Test
    void createInvitationRejectsPremiumTemplateWithoutAccess() {
        Fixture fixture = fixture();
        InvitationTemplate template = template(20L, true);
        InvitationRequest request = request("Premium invitation");
        request.setTemplateId(20L);
        when(fixture.templateRepository.findById(20L)).thenReturn(Optional.of(template));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.create(fixture.authentication, request)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        assertEquals("Premium template access is required", exception.getMessage());
    }

    @Test
    void createInvitationAllowsPremiumTemplateWithAccess() {
        Fixture fixture = fixture();
        InvitationTemplate template = template(20L, true);
        InvitationRequest request = request("Premium invitation");
        request.setTemplateId(20L);
        when(fixture.templateRepository.findById(20L)).thenReturn(Optional.of(template));
        when(fixture.templateAccessRepository.existsByUserIdAndTemplateIdAndActiveTrue(1L, 20L))
                .thenReturn(true);

        InvitationResponse response = fixture.service.create(fixture.authentication, request);

        assertEquals(20L, response.getTemplateId());
        assertEquals("Premium template", response.getTemplateName());
    }

    @Test
    void unpublishPublishedInvitationSucceeds() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(invitation));

        InvitationResponse response = fixture.service.unpublish(fixture.authentication, 10L);

        assertEquals(InvitationStatus.UNPUBLISHED, response.getStatus());
    }

    @Test
    void publicSlugReturnsPublishedPublicInvitation() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PUBLIC);
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));

        PublicInvitationResponse response = fixture.service.publicBySlug("draft-invitation");

        assertEquals("draft-invitation", response.getSlug());
        assertFalse(hasDeclaredField(PublicInvitationResponse.class, "id"));
        assertFalse(hasDeclaredField(PublicInvitationResponse.class, "userId"));
        assertFalse(hasDeclaredField(PublicInvitationResponse.class, "ownerName"));
        assertFalse(hasDeclaredField(PublicInvitationResponse.class, "accessPassword"));
    }

    @Test
    void publicSlugRejectsUnpublishedInvitation() {
        Fixture fixture = fixture();
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.empty());

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.publicBySlug("draft-invitation")
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void publicSlugAllowsPrivateInvitationWithGuestToken() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PRIVATE);
        Guest guest = new Guest();
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));
        when(fixture.guestRepository.findByInvitationIdAndInviteToken(10L, "token"))
                .thenReturn(Optional.of(guest));

        PublicInvitationResponse response = fixture.service.publicBySlug("draft-invitation", "token");

        assertEquals("draft-invitation", response.getSlug());
    }

    @Test
    void publicSlugReturnsOnlySafePersonalizedGuestFieldsAndMarksFirstView() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PUBLIC);
        Guest guest = new Guest();
        guest.setId(91L);
        guest.setGuestName("Lok Dara and family");
        guest.setGuestGroup("Family");
        guest.setNote("private host note");
        guest.setInviteToken("secret-token");
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));
        when(fixture.guestRepository.findByInvitationIdAndInviteToken(10L, "secret-token"))
                .thenReturn(Optional.of(guest));

        PublicInvitationResponse response = fixture.service.publicBySlug("draft-invitation", "secret-token");

        assertEquals("Lok Dara and family", response.getGuest().getGuestName());
        assertEquals("Family", response.getGuest().getGuestGroup());
        assertNotNull(guest.getInvitationViewedAt());
        assertFalse(hasDeclaredField(PublicGuestResponse.class, "id"));
        assertFalse(hasDeclaredField(PublicGuestResponse.class, "note"));
        assertFalse(hasDeclaredField(PublicGuestResponse.class, "inviteToken"));
        assertFalse(hasDeclaredField(PublicGuestResponse.class, "phone"));
    }

    @Test
    void publicSlugWithUnknownTokenStaysGenericForPublicInvitation() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PUBLIC);
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));
        when(fixture.guestRepository.findByInvitationIdAndInviteToken(10L, "unknown"))
                .thenReturn(Optional.empty());

        PublicInvitationResponse response = fixture.service.publicBySlug("draft-invitation", "unknown");

        assertNull(response.getGuest());
        verify(fixture.guestRepository).findByInvitationIdAndInviteToken(10L, "unknown");
    }

    @Test
    void privateInvitationRejectsTokenThatDoesNotBelongToThatInvitation() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PRIVATE);
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));
        when(fixture.guestRepository.findByInvitationIdAndInviteToken(10L, "other-invitation-token"))
                .thenReturn(Optional.empty());

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.publicBySlug("draft-invitation", "other-invitation-token")
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        verify(fixture.guestRepository).findByInvitationIdAndInviteToken(10L, "other-invitation-token");
    }

    @Test
    void publicSlugPreservesPublishedDesignAndContentJson() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PUBLIC);
        invitation.setDesignJson("{\"openingStyle\":\"khmer-royal\"}");
        invitation.setContentJson("{\"opening\":{\"openButtonText\":\"Open\"}}");
        invitation.setEnabledSections("{\"gallery\":false,\"rsvp\":true}");
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));

        PublicInvitationResponse response = fixture.service.publicBySlug("draft-invitation");

        assertEquals(invitation.getDesignJson(), response.getDesignJson());
        assertEquals(invitation.getContentJson(), response.getContentJson());
        assertEquals(invitation.getEnabledSections(), response.getEnabledSections());
    }

    @Test
    void publicSlugRejectsPrivateInvitationWithoutGuestToken() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PRIVATE);
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.publicBySlug("draft-invitation", null)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void publicSlugAllowsPasswordProtectedInvitationWithGuestToken() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PASSWORD_PROTECTED);
        Guest guest = new Guest();
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));
        when(fixture.guestRepository.findByInvitationIdAndInviteToken(10L, "token"))
                .thenReturn(Optional.of(guest));

        PublicInvitationResponse response = fixture.service.publicBySlug("draft-invitation", "token");

        assertEquals("draft-invitation", response.getSlug());
    }

    @Test
    void publicSlugRejectsPasswordProtectedInvitationWithoutGuestToken() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        invitation.setStatus(InvitationStatus.PUBLISHED);
        invitation.setVisibility(InvitationVisibility.PASSWORD_PROTECTED);
        when(fixture.invitationRepository.findBySlugAndStatusAndDeletedFalse("draft-invitation", InvitationStatus.PUBLISHED))
                .thenReturn(Optional.of(invitation));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.publicBySlug("draft-invitation", null)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void nonOwnerCannotUpdateInvitation() {
        Fixture fixture = fixture();
        AppUser otherUser = user(2L);
        when(fixture.currentUserService.currentUser(fixture.authentication)).thenReturn(otherUser);
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(validInvitation(fixture.owner)));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.update(fixture.authentication, 10L, request("Updated"))
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void nonOwnerCannotDeleteInvitation() {
        Fixture fixture = fixture();
        AppUser otherUser = user(2L);
        when(fixture.currentUserService.currentUser(fixture.authentication)).thenReturn(otherUser);
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(validInvitation(fixture.owner)));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.delete(fixture.authentication, 10L)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void deleteRemovesInvitationScopedDataAndInvitation() {
        Fixture fixture = fixture();
        UserInvitation invitation = validInvitation(fixture.owner);
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(invitation));

        fixture.service.delete(fixture.authentication, 10L);

        verify(fixture.guestRepository).deleteByInvitationId(10L);
        verify(fixture.invitationRepository).delete(invitation);
    }

    private Fixture fixture() {
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        UserTemplateAccessRepository templateAccessRepository = mock(UserTemplateAccessRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        Authentication authentication = mock(Authentication.class);
        AppUser owner = user(1L);
        InvitationService service = new InvitationService(
                invitationRepository,
                templateRepository,
                guestRepository,
                templateAccessRepository,
                currentUserService,
                passwordEncoder
        );

        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        when(invitationRepository.existsBySlug(any())).thenReturn(false);
        when(invitationRepository.existsBySlugAndIdNot(any(), any())).thenReturn(false);
        when(invitationRepository.save(any(UserInvitation.class))).thenAnswer(invocation -> {
            UserInvitation invitation = invocation.getArgument(0);
            if (invitation.getId() == null) {
                invitation.setId(10L);
            }
            return invitation;
        });

        return new Fixture(
                service,
                invitationRepository,
                templateRepository,
                guestRepository,
                templateAccessRepository,
                currentUserService,
                authentication,
                owner
        );
    }

    private InvitationRequest request(String title) {
        InvitationRequest request = new InvitationRequest();
        request.setTitle(title);
        return request;
    }

    private UserInvitation invitation(AppUser owner) {
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setUser(owner);
        invitation.setTitle("Draft invitation");
        invitation.setSlug("draft-invitation");
        invitation.setStatus(InvitationStatus.DRAFT);
        return invitation;
    }

    private UserInvitation validInvitation(AppUser owner) {
        UserInvitation invitation = invitation(owner);
        invitation.setEventType(EventType.WEDDING);
        invitation.setEventDate(LocalDate.now().plusDays(30));
        invitation.setEventTime(LocalTime.of(17, 0));
        invitation.setVenueName("Koupreng Hall");
        invitation.setVenueAddress("Phnom Penh");
        invitation.setGroomName("Samnang");
        invitation.setBrideName("Sreyneang");
        invitation.setRsvpDeadline(LocalDate.now().plusDays(20));
        return invitation;
    }

    private InvitationTemplate template(Long id, boolean premium) {
        InvitationTemplate template = new InvitationTemplate();
        template.setId(id);
        template.setName("Premium template");
        template.setPremium(premium);
        return template;
    }

    private AppUser user(Long id) {
        AppUser user = new AppUser();
        user.setId(id);
        user.setFullName("Test User " + id);
        return user;
    }

    private static boolean hasDeclaredField(Class<?> type, String fieldName) {
        return Arrays.stream(type.getDeclaredFields())
                .anyMatch(field -> field.getName().equals(fieldName));
    }

    private record Fixture(
            InvitationService service,
            UserInvitationRepository invitationRepository,
            InvitationTemplateRepository templateRepository,
            GuestRepository guestRepository,
            UserTemplateAccessRepository templateAccessRepository,
            CurrentUserService currentUserService,
            Authentication authentication,
            AppUser owner
    ) {
    }
}
