package com.koupreng.backend.invitation.application;

import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.organization.domain.Organization;
import com.koupreng.backend.organization.domain.OrganizationMember;
import com.koupreng.backend.organization.infrastructure.persistence.OrganizationMemberRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.domain.AppUser;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static com.koupreng.backend.invitation.application.EventAccessPolicy.Permission.*;

class EventCollaborationServiceTests {
    @Test void designerEditsContentButCannotManageGuestsSettingsOrFinance() {
        var f = fixture("DESIGNER");
        assertTrue(f.service.permissions(f.actor, f.event).contains(MANAGE_INVITATION));
        for (var denied : Set.of(MANAGE_GUESTS, MANAGE_SETTINGS, MANAGE_MEMBERS, MANAGE_GIFTS, MANAGE_BUDGET)) {
            assertThrows(ApiException.class, () -> f.service.require(f.actor, f.event, denied));
        }
        verify(f.entitlements, atLeastOnce()).policy(f.owner);
        verify(f.entitlements, never()).policy(f.actor);
    }
    @Test void ownerRetainsAccessWhenTeamPolicyEnds() {
        var f = fixture("VIEWER");
        assertTrue(f.service.permissions(f.owner, f.event).contains(MANAGE_MEMBERS));
        verifyNoInteractions(f.entitlements);
    }
    @Test void invitedRemovedAndChangedRolesDoNotKeepStalePermissions() {
        var f = fixture("DESIGNER");
        f.service.require(f.actor, f.event, EDIT_EVENT);
        f.member.setRole("VIEWER");
        assertThrows(ApiException.class, () -> f.service.require(f.actor, f.event, EDIT_EVENT));
        when(f.members.findByOrganizationIdAndUserIdAndStatus(10L, 2L, "ACTIVE")).thenReturn(Optional.empty());
        assertTrue(f.service.permissions(f.actor, f.event).isEmpty());
    }
    @Test void expiredOrOverCapacityOwnerPlanRevokesCollaboratorAccess() {
        var f = fixture("MANAGER");
        when(f.entitlements.policy(f.owner)).thenReturn(new EntitlementService.Policy("FREE", Set.of(), 1, 20, 20, 1));
        assertTrue(f.service.permissions(f.actor, f.event).isEmpty());
        when(f.entitlements.policy(f.owner)).thenReturn(policy());
        when(f.members.countByOrganizationOwnerIdAndStatusIn(eq(1L), anyList())).thenReturn(4L);
        assertTrue(f.service.permissions(f.actor, f.event).isEmpty());
    }
    @Test void crossOwnerOrganizationNeverGrantsAnEvent() {
        var f = fixture("MANAGER");
        var other = new AppUser(); other.setId(99L); f.event.getOrganization().setOwner(other);
        assertTrue(f.service.permissions(f.actor, f.event).isEmpty());
        verifyNoInteractions(f.entitlements);
    }
    @Test void scannerRoleCannotReadPrivateGuestManagementOrChangeContent() {
        var f = fixture("CHECK_IN_STAFF");
        f.service.require(f.actor, f.event, MANAGE_CHECKIN);
        assertThrows(ApiException.class, () -> f.service.require(f.actor, f.event, MANAGE_GUESTS));
        assertThrows(ApiException.class, () -> f.service.require(f.actor, f.event, EDIT_EVENT));
    }
    @Test void legacyActiveMembershipWithoutConsentDoesNotGainEventAccess() {
        var f = fixture("MANAGER"); f.member.setInviteAcceptedAt(null);
        assertTrue(f.service.permissions(f.actor, f.event).isEmpty());
    }
    private EntitlementService.Policy policy() { return new EntitlementService.Policy("TEST_GRANT", Set.of(EntitlementService.Feature.TEAM_MEMBERS), 4, 100, 50, 3); }
    private Fixture fixture(String role) {
        var members = mock(OrganizationMemberRepository.class); var entitlements = mock(EntitlementService.class);
        var owner = new AppUser(); owner.setId(1L); var actor = new AppUser(); actor.setId(2L);
        var org = new Organization(); org.setId(10L); org.setOwner(owner); org.setStatus("ACTIVE");
        var event = new UserInvitation(); event.setId(100L); event.setUser(owner); event.setOrganization(org);
        var member = new OrganizationMember(); member.setUser(actor); member.setOrganization(org); member.setRole(role); member.setStatus("ACTIVE");
        member.setInviteAcceptedAt(java.time.Instant.now());
        when(members.findByOrganizationIdAndUserIdAndStatus(10L, 2L, "ACTIVE")).thenReturn(Optional.of(member));
        when(entitlements.policy(owner)).thenReturn(policy());
        return new Fixture(new EventCollaborationService(members, entitlements), members, entitlements, owner, actor, event, member);
    }
    private record Fixture(EventCollaborationService service, OrganizationMemberRepository members, EntitlementService entitlements, AppUser owner, AppUser actor, UserInvitation event, OrganizationMember member) { }
}
