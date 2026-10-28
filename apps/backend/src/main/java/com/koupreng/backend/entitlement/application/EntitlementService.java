package com.koupreng.backend.entitlement.application;

import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.payment.application.TemplateCheckoutPolicy;
import com.koupreng.backend.payment.infrastructure.persistence.UserTemplateAccessRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.time.Instant;
import com.koupreng.backend.subscription.application.PackageSnapshot;
import com.koupreng.backend.entitlement.api.dto.CurrentEntitlementsResponse;
import com.koupreng.backend.entitlement.api.dto.CurrentEntitlementsResponse.Usage;
import com.koupreng.backend.subscription.api.dto.SubscriptionPackageResponse;
import java.util.Map;
import java.util.EnumSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Backend authority for current benefits; roles never imply a product tier. */
@Service
public class EntitlementService {
    public enum Feature { PREMIUM_TEMPLATES, QR_INVITATIONS, QR_CHECK_IN, SEATING, ADVANCED_ANALYTICS,
        CUSTOM_BRANDING, TEAM_MEMBERS, AI_ASSISTANT, GUEST_IMPORT, PRE_WEDDING_VIDEO, COUPLE_MONOGRAM, ILLUSTRATED_VENUE_MAP }
    public record Policy(String source, Set<Feature> features, Integer maxInvitations, Integer maxGuests,
                         Integer maxGuestsPerInvitation, Integer maxTeamMembers) { }

    private final SubscriptionRepository subscriptions;
    private final SubscriptionPackageRepository packages;
    private final UserTemplateAccessRepository purchases;
    private final AppUserRepository users;
    private final UserInvitationRepository invitations;
    private final GuestRepository guests;
    private final String freePackageCode;

    public EntitlementService(SubscriptionRepository subscriptions, SubscriptionPackageRepository packages,
            UserTemplateAccessRepository purchases, AppUserRepository users, UserInvitationRepository invitations,
            GuestRepository guests, @Value("${app.entitlements.enforce-package-policy:true}") boolean enforce,
            @Value("${app.entitlements.free-package-code:FREE}") String freePackageCode) {
        this.subscriptions = subscriptions;
        this.packages = packages;
        this.purchases = purchases;
        this.users = users;
        this.invitations = invitations;
        this.guests = guests;
        // A legacy .env may explicitly set FREE_PACKAGE_CODE=, bypassing Spring's default.
        this.freePackageCode = freePackageCode == null || freePackageCode.isBlank() ? "FREE" : freePackageCode.trim();
    }

    @Transactional(readOnly = true)
    public boolean hasTemplateAccess(AppUser user, InvitationTemplate template) {
        if (!template.isPremium() && !TemplateCheckoutPolicy.offer(template).eligible()) {
            return true;
        }
        if (user == null || user.getId() == null) {
            return false;
        }
        return purchases.existsByUserIdAndTemplateIdAndActiveTrue(user.getId(), template.getId())
                || paidPackage(user).map(SubscriptionPackage::isPremiumTemplatesEnabled).orElse(false);
    }

    @Transactional(readOnly = true)
    public Policy policy(AppUser user) {
        var paid = paidPackage(user);
        if (paid.isPresent()) {
            return fromPackage("PAID_SUBSCRIPTION", paid.get());
        }
        SubscriptionPackage baseline = packages.findByCodeAndActiveTrue(freePackageCode)
                .filter(plan -> plan.getPrice() != null && plan.getPrice().signum() == 0)
                .orElseThrow(() -> new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ENTITLEMENT_POLICY_UNCONFIGURED",
                        "The free package policy requires owner review"));
        return fromPackage("CONFIGURED_FREE_PACKAGE", baseline);
    }

    @Transactional
    public void requireInvitationCreation(AppUser user) {
        lockOwner(user);
        Policy policy = policy(user);
        requireCapacity(policy.maxInvitations(), invitations.countByUserIdAndDeletedFalse(user.getId()), 1, "invitations", "ACCOUNT");
    }

    @Transactional
    public void requireGuestCreation(UserInvitation invitation, int additional) {
        AppUser owner = invitation.getUser();
        lockOwner(owner);
        Policy policy = policy(owner);
        requireCapacity(policy.maxGuests(), guests.countByInvitationUserId(owner.getId()), additional, "guests", "ACCOUNT");
        requireCapacity(policy.maxGuestsPerInvitation(), guests.countByInvitationId(invitation.getId()), additional, "guestsPerInvitation", "EVENT");
    }

    @Transactional(readOnly = true)
    public void requireFeature(AppUser user, Feature feature) {
        if (!policy(user).features().contains(feature)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "PACKAGE_FEATURE_REQUIRED", "This feature requires an eligible package", Map.of("feature", feature.name()));
        }
    }

    @Transactional
    public void requireTeamCapacity(AppUser owner, java.util.function.LongSupplier countMembers, int additional) {
        lockOwner(owner);
        requireFeature(owner, Feature.TEAM_MEMBERS);
        requireCapacity(policy(owner).maxTeamMembers(), countMembers.getAsLong(), additional, "teamMembers", "ACCOUNT");
    }

    private java.util.Optional<SubscriptionPackage> paidPackage(AppUser user) {
        if (user == null || user.getId() == null) { return java.util.Optional.empty(); }
        Instant now = Instant.now();
        return subscriptions.findActiveForUser(user.getId(), now).stream()
                .filter(subscription -> PackageSnapshot.eligible(subscription, now))
                .map(PackageSnapshot::resolve).filter(java.util.Objects::nonNull).findFirst();
    }

    @Transactional(readOnly = true)
    public CurrentEntitlementsResponse current(AppUser user) {
        Instant now = Instant.now();
        var active = subscriptions.findActiveForUser(user.getId(), now).stream().filter(s -> PackageSnapshot.eligible(s, now)).findFirst();
        var plan = active.map(PackageSnapshot::resolve).orElseGet(() -> packages.findByCodeAndActiveTrue(freePackageCode)
            .filter(p -> p.getPrice() != null && p.getPrice().signum() == 0)
            .orElseThrow(() -> new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ENTITLEMENT_POLICY_UNCONFIGURED", "The Free policy requires administrator review")));
        String source = active.map(s -> "DEMO_ADMIN_GRANT".equals(s.getConfirmSource()) ? "DEMO_ADMIN_GRANT" : "PAID_SUBSCRIPTION").orElse("CONFIGURED_FREE_PACKAGE");
        Policy policy = fromPackage(source, plan);
        return new CurrentEntitlementsResponse(SubscriptionPackageResponse.from(plan), source,
            active.map(s -> s.getEndDate()).orElse(null), policy.features().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet()),
            Map.of("invitations", usage(plan.getMaxInvitations(), invitations.countByUserIdAndDeletedFalse(user.getId())),
                   "guests", usage(plan.getMaxGuests(), guests.countByInvitationUserId(user.getId()))));
    }
    private Usage usage(Integer limit, long used) { return new Usage(limit, used, limit == null ? null : Math.max(0L, limit - used)); }

    private Policy fromPackage(String source, SubscriptionPackage plan) {
        return new Policy(source, featuresForPackage(plan, !"CONFIGURED_FREE_PACKAGE".equals(source)),
                plan.getMaxInvitations(), plan.getMaxGuests(), plan.getMaxGuestsPerInvitation(), plan.getMaxTeamMembers());
    }

    /** Catalog projection and enforcement share the same policy; projections never activate benefits. */
    public static Set<Feature> featuresForPackage(SubscriptionPackage plan, boolean activatedPurchase) {
        EnumSet<Feature> features = EnumSet.noneOf(Feature.class);
        // Resolve the purchased snapshot, never the browser's tier or a generic paid flag.
        if (activatedPurchase && "PREMIUM".equals(plan.getCode())) {
            features.add(Feature.PRE_WEDDING_VIDEO);
            features.add(Feature.COUPLE_MONOGRAM);
            features.add(Feature.ILLUSTRATED_VENUE_MAP);
        }
        if (plan.isPremiumTemplatesEnabled()) { features.add(Feature.PREMIUM_TEMPLATES); }
        if (plan.isQrInvitationsEnabled()) { features.add(Feature.QR_INVITATIONS); }
        if (plan.isQrCheckInEnabled()) { features.add(Feature.QR_CHECK_IN); }
        if (plan.isSeatingEnabled()) { features.add(Feature.SEATING); }
        if (plan.isAdvancedAnalyticsEnabled()) { features.add(Feature.ADVANCED_ANALYTICS); }
        if (plan.isCustomBrandingEnabled()) { features.add(Feature.CUSTOM_BRANDING); }
        if (plan.isTeamMembersEnabled()) { features.add(Feature.TEAM_MEMBERS); }
        if (plan.isAiAssistantEnabled()) { features.add(Feature.AI_ASSISTANT); }
        // Guest import is a core capability unless the admin explicitly disables its existing benefit key.
        try {
            var flags = plan.getFeaturesJson() == null ? null : new com.fasterxml.jackson.databind.ObjectMapper().readTree(plan.getFeaturesJson());
            if (flags == null || !flags.has("guestImport") || flags.path("guestImport").asBoolean()) features.add(Feature.GUEST_IMPORT);
        } catch (Exception invalid) { throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Invalid package benefit configuration"); }
        return Set.copyOf(features);
    }

    /** Caller must first authorize access to this event. No other events' usage is exposed. */
    @Transactional(readOnly = true)
    public Map<String, Usage> eventQuotas(UserInvitation event) {
        return Map.of("guestsPerInvitation", usage(policy(event.getUser()).maxGuestsPerInvitation(), guests.countByInvitationId(event.getId())));
    }

    private void lockOwner(AppUser user) {
        users.findForUpdateById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));
    }

    private void requireCapacity(Integer limit, long current, int additional, String resource, String scope) {
        if (additional < 0 || (limit != null && limit < 0)) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ENTITLEMENT_POLICY_INVALID", "Package limits require review");
        }
        if (limit != null && current + additional > limit) {
            throw new ApiException(HttpStatus.FORBIDDEN, "PACKAGE_LIMIT_REACHED", "The configured package limit has been reached",
                    Map.of("resource", resource, "scope", scope, "limit", limit, "used", current, "requested", additional));
        }
    }
}
