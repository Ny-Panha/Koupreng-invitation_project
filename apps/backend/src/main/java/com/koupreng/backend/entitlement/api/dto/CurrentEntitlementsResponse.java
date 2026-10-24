package com.koupreng.backend.entitlement.api.dto;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import com.koupreng.backend.subscription.api.dto.SubscriptionPackageResponse;

public record CurrentEntitlementsResponse(SubscriptionPackageResponse packagePlan, String source,
    Instant expiresAt, Set<String> features, Map<String, Usage> quotas) {
    public record Usage(Integer limit, long used, Long remaining) { }
}
