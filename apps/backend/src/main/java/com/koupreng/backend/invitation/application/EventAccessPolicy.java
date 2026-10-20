package com.koupreng.backend.invitation.application;

import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.domain.AppUser;
import org.springframework.http.HttpStatus;

import java.util.Objects;

/** Owner-only workspace policy. Organization membership never implies event access.
 * Collaborator grants can be added here once each module enforces a specific permission.
 */
public final class EventAccessPolicy {
    public enum Permission {
        VIEW_EVENT, EDIT_EVENT, MANAGE_INVITATION, MANAGE_GUESTS, MANAGE_RSVP,
        MANAGE_GIFTS, MANAGE_BUDGET, MANAGE_SEATING, MANAGE_CHECKIN,
        VIEW_REPORTS, MANAGE_SETTINGS, MANAGE_MEMBERS
    }

    private EventAccessPolicy() { }

    public static void requireOwner(AppUser actor, UserInvitation invitation, Permission permission) {
        Objects.requireNonNull(permission, "permission");
        if (actor == null || actor.getId() == null || invitation == null || invitation.isDeleted()
                || invitation.getUser() == null
                || !Objects.equals(actor.getId(), invitation.getUser().getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this invitation");
        }
    }
}
