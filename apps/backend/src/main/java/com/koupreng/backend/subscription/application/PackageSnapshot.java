package com.koupreng.backend.subscription.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.subscription.api.dto.SubscriptionPackageResponse;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import org.springframework.http.HttpStatus;

/** Purchased benefits are frozen at order creation; catalog changes apply to new orders. */
public final class PackageSnapshot {
    private static final ObjectMapper JSON = new ObjectMapper();
    private PackageSnapshot() { }
    public static String capture(SubscriptionPackage plan) {
        try { return JSON.writeValueAsString(SubscriptionPackageResponse.from(plan)); }
        catch (Exception e) { throw new IllegalStateException("Cannot snapshot package benefits", e); }
    }
    public static SubscriptionPackage resolve(Subscription subscription) {
        if (subscription.getBenefitsSnapshot() == null) return subscription.getSubscriptionPackage();
        try { return JSON.readValue(subscription.getBenefitsSnapshot(), SubscriptionPackage.class); }
        catch (Exception e) { throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ENTITLEMENT_SNAPSHOT_INVALID", "Subscription benefits require administrator review"); }
    }
    public static boolean eligible(Subscription s, java.time.Instant now) {
        return s.isActive() && "ACTIVE".equals(s.getStatus())
            && ("PAID".equals(s.getPaymentStatus()) || ("NOT_REQUIRED".equals(s.getPaymentStatus()) && "DEMO_ADMIN_GRANT".equals(s.getConfirmSource())))
            && (s.getStartDate() == null || !s.getStartDate().isAfter(now))
            && (s.getEndDate() == null || s.getEndDate().isAfter(now));
    }
}
