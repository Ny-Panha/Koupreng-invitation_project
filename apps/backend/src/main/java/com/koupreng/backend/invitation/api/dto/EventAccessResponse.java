package com.koupreng.backend.invitation.api.dto;
import java.util.Set;

public record EventAccessResponse(boolean owner, Set<String> permissions, Set<String> ownerFeatures, Long organizationId,
        java.util.Map<String, com.koupreng.backend.entitlement.api.dto.CurrentEntitlementsResponse.Usage> quotas) {
    public EventAccessResponse(boolean owner, Set<String> permissions, Set<String> ownerFeatures, Long organizationId) {
        this(owner, permissions, ownerFeatures, organizationId, java.util.Map.of());
    }
}
