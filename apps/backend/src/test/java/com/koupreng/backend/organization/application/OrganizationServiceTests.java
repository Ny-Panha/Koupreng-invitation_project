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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrganizationServiceTests {

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
