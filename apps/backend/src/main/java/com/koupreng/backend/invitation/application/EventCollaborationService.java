package com.koupreng.backend.invitation.application;

import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.entitlement.application.EntitlementService.Feature;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.organization.domain.Organization;
import com.koupreng.backend.organization.domain.OrganizationMember;
import com.koupreng.backend.organization.infrastructure.persistence.OrganizationMemberRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.domain.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import static com.koupreng.backend.invitation.application.EventAccessPolicy.Permission;

/** Explicit event grants from an accepted membership, evaluated on every request. */
@Service
@Transactional(readOnly = true)
public class EventCollaborationService {
    private final OrganizationMemberRepository members;
    private final EntitlementService entitlements;

    public EventCollaborationService(OrganizationMemberRepository members, EntitlementService entitlements) {
        this.members = members;
        this.entitlements = entitlements;
    }

    public Set<Permission> permissions(AppUser actor, UserInvitation event) {
        if (actor == null || actor.getId() == null || !actor.isActive() || event == null || event.isDeleted() || event.getUser() == null || !event.getUser().isActive()) return Set.of();
        if (Objects.equals(actor.getId(), event.getUser().getId())) return EnumSet.allOf(Permission.class);
        Organization organization = event.getOrganization();
        if (organization == null || !Organization.STATUS_ACTIVE.equals(organization.getStatus()) || organization.getOwner() == null
                || !Objects.equals(organization.getOwner().getId(), event.getUser().getId())) return Set.of();
        var member = members.findByOrganizationIdAndUserIdAndStatus(organization.getId(), actor.getId(), OrganizationMember.STATUS_ACTIVE);
        if (member.isEmpty() || member.get().getInviteAcceptedAt() == null) return Set.of();
        var policy = entitlements.policy(event.getUser());
        if (!policy.features().contains(Feature.TEAM_MEMBERS)) return Set.of();
        // A smaller new team policy must not silently keep excess grants active.
        if (policy.maxTeamMembers() != null && members.countByOrganizationOwnerIdAndStatusIn(event.getUser().getId(), List.of("ACTIVE", "INVITED")) > policy.maxTeamMembers()) return Set.of();
        return switch (member.get().getRole()) {
            case "ADMIN", "MANAGER" -> EnumSet.of(Permission.VIEW_EVENT, Permission.EDIT_EVENT, Permission.MANAGE_INVITATION,
                    Permission.MANAGE_GUESTS, Permission.MANAGE_RSVP, Permission.MANAGE_SEATING, Permission.MANAGE_CHECKIN, Permission.VIEW_REPORTS);
            case "DESIGNER" -> EnumSet.of(Permission.VIEW_EVENT, Permission.EDIT_EVENT, Permission.MANAGE_INVITATION);
            case "CHECK_IN_STAFF" -> EnumSet.of(Permission.VIEW_EVENT, Permission.MANAGE_CHECKIN);
            case "VIEWER" -> EnumSet.of(Permission.VIEW_EVENT, Permission.VIEW_REPORTS);
            default -> EnumSet.of(Permission.VIEW_EVENT);
        };
    }

    public void require(AppUser actor, UserInvitation event, Permission permission) {
        if (!permissions(actor, event).contains(permission)) throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission for this event action");
    }

    public Set<Feature> ownerFeatures(UserInvitation event) {
        return entitlements.policy(event.getUser()).features();
    }
}
