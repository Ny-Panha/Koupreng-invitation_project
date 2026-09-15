package com.koupreng.backend.invitation.api.dto;

import com.koupreng.backend.invitation.domain.InvitationStatus;

/**
 * HTTP filter values for invitation status queries.
 *
 * <p>This type intentionally mirrors the stable wire values while keeping the
 * controller independent of the invitation persistence aggregate.</p>
 */
public enum InvitationStatusFilter {
    DRAFT,
    PUBLISHED,
    UNPUBLISHED,
    ARCHIVED;

    public InvitationStatus toDomain() {
        return InvitationStatus.valueOf(name());
    }
}
