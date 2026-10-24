package com.koupreng.backend.organization.application;

import com.koupreng.backend.user.application.CurrentUserService;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.organization.api.dto.OrganizationMemberRequest;
import com.koupreng.backend.organization.domain.Organization;
import com.koupreng.backend.organization.domain.OrganizationMember;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.organization.infrastructure.persistence.OrganizationMemberRepository;
import com.koupreng.backend.organization.infrastructure.persistence.OrganizationRepository;
import com.koupreng.backend.audit.application.AuditLogService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrganizationServiceTests {

    @Test
    void existingAccountStillNeedsOneTimeAcceptanceAndTokenIsNotStoredOrListed() {
        Fixture f = fixture();
        when(f.userRepository.findByEmailIgnoreCase("member@example.test")).thenReturn(Optional.of(user(2L, "member@example.test")));
        when(f.memberRepository.save(any())).thenAnswer(call -> { OrganizationMember member = call.getArgument(0); member.setId(20L); return member; });
        var response = f.service.addMember(f.authentication, 10L, memberRequest("member@example.test", "DESIGNER"));
        var capture = org.mockito.ArgumentCaptor.forClass(OrganizationMember.class);
        verify(f.memberRepository).save(capture.capture());
        OrganizationMember member = capture.getValue();
        assertEquals("INVITED", member.getStatus());
        assertNull(member.getUser());
        assertNotEquals(response.getInvitationToken(), member.getInviteTokenHash());
        assertEquals(64, response.getInvitationToken().length());
        assertNull(com.koupreng.backend.organization.api.dto.OrganizationMemberResponse.from(member).getInvitationToken());
        when(f.memberRepository.findByInviteTokenHash(member.getInviteTokenHash())).thenReturn(Optional.of(member));
        when(f.memberRepository.findForUpdateByInviteTokenHash(member.getInviteTokenHash())).thenReturn(Optional.of(member));
        when(f.currentUserService.currentUser(f.authentication)).thenReturn(user(2L, "member@example.test"));
        f.service.acceptInvitation(f.authentication, response.getInvitationToken());
        assertEquals("ACTIVE", member.getStatus());
        assertEquals(2L, member.getUser().getId());
        assertNull(member.getInviteTokenHash());
        assertThrows(ApiException.class, () -> f.service.acceptInvitation(f.authentication, response.getInvitationToken()));
    }

    @Test
    void expiredOrWrongRecipientAcceptanceNeverActivatesMembership() {
        Fixture f = fixture();
        var org = new Organization(); org.setId(10L); org.setOwner(user(1L,"owner@example.test")); org.setStatus("ACTIVE");
        var member = new OrganizationMember(); member.setOrganization(org); member.setEmail("intended@example.test");
        member.setInviteExpiresAt(java.time.Instant.now().plusSeconds(60));
        when(f.memberRepository.findByInviteTokenHash(any())).thenReturn(Optional.of(member));
        when(f.memberRepository.findForUpdateByInviteTokenHash(any())).thenReturn(Optional.of(member));
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class, () -> f.service.acceptInvitation(f.authentication, "a".repeat(64))).getStatus());
        when(f.currentUserService.currentUser(f.authentication)).thenReturn(user(2L,"intended@example.test"));
        member.setInviteExpiresAt(java.time.Instant.now().minusSeconds(1));
        assertThrows(ApiException.class, () -> f.service.acceptInvitation(f.authentication, "a".repeat(64)));
        assertEquals("INVITED", member.getStatus());
        assertNull(member.getUser());
    }

    @Test
    void ownerRoleCannotBeAssignedThroughMemberEndpoint() {
        Fixture fixture = fixture();
        OrganizationMemberRequest request = memberRequest("member@example.test", "OWNER");

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.service.addMember(fixture.authentication, 10L, request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("ORGANIZATION_OWNER_ROLE_IMMUTABLE", exception.getCode());
    }

    @Test
    void inactiveMembershipDoesNotGrantOrganizationAccess() {
        Fixture fixture = fixture();
        AppUser member = user(2L, "member@example.test");
        when(fixture.currentUserService.currentUser(fixture.authentication)).thenReturn(member);
        when(fixture.memberRepository.existsByOrganizationIdAndUserIdAndStatus(
                10L, 2L, OrganizationMember.STATUS_ACTIVE)).thenReturn(false);

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.service.get(fixture.authentication, 10L));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void organizationListQueriesOnlyActiveMemberships() {
        Fixture fixture = fixture();
        AppUser member = user(2L, "member@example.test");
        when(fixture.currentUserService.currentUser(fixture.authentication)).thenReturn(member);

        assertEquals(0, fixture.service.listMine(fixture.authentication).size());
        verify(fixture.memberRepository).findByUserIdAndStatusOrderByCreatedAtDesc(
                2L,
                OrganizationMember.STATUS_ACTIVE
        );
    }

    @Test
    void addingMemberEmitsAuditEventWithoutEmailMetadata() {
        Fixture fixture = fixture();
        AppUser memberUser = user(2L, "member@example.test");
        when(fixture.userRepository.findByEmailIgnoreCase("member@example.test"))
                .thenReturn(Optional.of(memberUser));
        when(fixture.memberRepository.findByOrganizationIdAndEmailIgnoreCase(10L, "member@example.test"))
                .thenReturn(Optional.empty());
        when(fixture.memberRepository.save(any(OrganizationMember.class))).thenAnswer(invocation -> {
            OrganizationMember member = invocation.getArgument(0);
            member.setId(20L);
            return member;
        });

        fixture.service.addMember(
                fixture.authentication,
                10L,
                memberRequest("member@example.test", "VIEWER")
        );

        verify(fixture.auditLogService).logSystemEvent(
                eq("ORGANIZATION_MEMBER_SAVED"),
                eq("ORGANIZATION_MEMBER"),
                eq(20L),
                eq("Organization membership saved"),
                any()
        );
    }

    private Fixture fixture() {
        OrganizationRepository organizationRepository = mock(OrganizationRepository.class);
        OrganizationMemberRepository memberRepository = mock(OrganizationMemberRepository.class);
        AppUserRepository userRepository = mock(AppUserRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        Authentication authentication = mock(Authentication.class);
        AppUser owner = user(1L, "owner@example.test");
        Organization organization = new Organization();
        organization.setId(10L);
        organization.setName("Koupreng Team");
        organization.setOwner(owner);
        organization.setStatus(Organization.STATUS_ACTIVE);

        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        when(organizationRepository.findById(10L)).thenReturn(Optional.of(organization));
        when(memberRepository.findByOrganizationIdOrderByCreatedAtAsc(10L)).thenReturn(List.of());

        OrganizationService service = new OrganizationService(
                organizationRepository,
                memberRepository,
                userRepository,
                currentUserService,
                auditLogService
        );
        return new Fixture(service, memberRepository, userRepository, currentUserService,
                auditLogService, authentication);
    }

    private OrganizationMemberRequest memberRequest(String email, String role) {
        OrganizationMemberRequest request = new OrganizationMemberRequest();
        request.setEmail(email);
        request.setRole(role);
        return request;
    }

    private AppUser user(Long id, String email) {
        AppUser user = new AppUser();
        user.setId(id);
        user.setEmail(email);
        return user;
    }

    private record Fixture(
            OrganizationService service,
            OrganizationMemberRepository memberRepository,
            AppUserRepository userRepository,
            CurrentUserService currentUserService,
            AuditLogService auditLogService,
            Authentication authentication
    ) {
    }
}
