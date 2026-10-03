package com.koupreng.backend.entitlement.application;

import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.payment.infrastructure.persistence.UserTemplateAccessRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.time.Instant;
import java.util.EnumSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Composes independent purchases and trusted subscriptions without inventing a free-tier policy. */
@Service
public class EntitlementService {
    public enum Feature { PREMIUM_TEMPLATES, QR_INVITATIONS, QR_CHECK_IN, SEATING, ADVANCED_ANALYTICS,
        CUSTOM_BRANDING, TEAM_MEMBERS, AI_ASSISTANT }
    public record Policy(String source, Set<Feature> features, Integer maxInvitations, Integer maxGuests,
                         Integer maxGuestsPerInvitation, Integer maxTeamMembers) { }

    private final SubscriptionRepository subscriptions;
    private final SubscriptionPackageRepository packages;
    private final UserTemplateAccessRepository purchases;
    private final AppUserRepository users;
    private final UserInvitationRepository invitations;
    private final GuestRepository guests;
    private final boolean enforce;
    private final String freePackageCode;

    public EntitlementService(SubscriptionRepository subscriptions, SubscriptionPackageRepository packages,
            UserTemplateAccessRepository purchases, AppUserRepository users, UserInvitationRepository invitations,
            GuestRepository guests, @Value("${app.entitlements.enforce-package-policy:false}") boolean enforce,
            @Value("${app.entitlements.free-package-code:}") String freePackageCode) {
        this.subscriptions = subscriptions;
        this.packages = packages;
        this.purchases = purchases;
        this.users = users;
        this.invitations = invitations;
        this.guests = guests;
        this.enforce = enforce;
        this.freePackageCode = freePackageCode == null ? "" : freePackageCode.trim();
    }

    @Transactional(readOnly = true)
    public boolean hasTemplateAccess(AppUser user, InvitationTemplate template) {
        if (!template.isPremium()) {
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
        if (!enforce) {
            return new Policy("PRODUCT_POLICY_REVIEW_REQUIRED", Set.copyOf(EnumSet.allOf(Feature.class)), null, null, null, null);
        }
        SubscriptionPackage baseline = packages.findByCodeAndActiveTrue(freePackageCode)
                .filter(plan -> plan.getPrice() != null && plan.getPrice().signum() == 0)
                .orElseThrow(() -> new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ENTITLEMENT_POLICY_UNCONFIGURED",
                        "The free package policy requires owner review"));
        return fromPackage("CONFIGURED_FREE_PACKAGE", baseline);
    }

    @Transactional
    public void requireInvitationCreation(AppUser user) {
        if (!enforce) { return; }
        lockOwner(user);
        Policy policy = policy(user);
        requireCapacity(policy.maxInvitations(), invitations.countByUserIdAndDeletedFalse(user.getId()), 1);
    }

    @Transactional
    public void requireGuestCreation(UserInvitation invitation, int additional) {
        if (!enforce) { return; }
        AppUser owner = invitation.getUser();
        lockOwner(owner);
        Policy policy = policy(owner);
        requireCapacity(policy.maxGuests(), guests.countByInvitationUserId(owner.getId()), additional);
        requireCapacity(policy.maxGuestsPerInvitation(), guests.countByInvitationId(invitation.getId()), additional);
    }

    @Transactional(readOnly = true)
    public void requireFeature(AppUser user, Feature feature) {
        if (enforce && !policy(user).features().contains(feature)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "PACKAGE_FEATURE_REQUIRED", "This feature requires an eligible package");
        }
    }

    @Transactional
    public void requireTeamCapacity(AppUser owner, java.util.function.LongSupplier countMembers, int additional) {
        if (!enforce) { return; }
        lockOwner(owner);
        requireFeature(owner, Feature.TEAM_MEMBERS);
        requireCapacity(policy(owner).maxTeamMembers(), countMembers.getAsLong(), additional);
    }

    private java.util.Optional<SubscriptionPackage> paidPackage(AppUser user) {
        if (user == null || user.getId() == null) { return java.util.Optional.empty(); }
        Instant now = Instant.now();
        return subscriptions.findActiveForUser(user.getId(), now).stream()
                .filter(subscription -> subscription.isActive() && "ACTIVE".equals(subscription.getStatus())
                        && "PAID".equals(subscription.getPaymentStatus())
                        && (subscription.getStartDate() == null || !subscription.getStartDate().isAfter(now))
                        && (subscription.getEndDate() == null || subscription.getEndDate().isAfter(now)))
                .map(subscription -> subscription.getSubscriptionPackage()).filter(java.util.Objects::nonNull).findFirst();
    }

    private Policy fromPackage(String source, SubscriptionPackage plan) {
        EnumSet<Feature> features = EnumSet.noneOf(Feature.class);
        if (plan.isPremiumTemplatesEnabled()) { features.add(Feature.PREMIUM_TEMPLATES); }
        if (plan.isQrInvitationsEnabled()) { features.add(Feature.QR_INVITATIONS); }
        if (plan.isQrCheckInEnabled()) { features.add(Feature.QR_CHECK_IN); }
        if (plan.isSeatingEnabled()) { features.add(Feature.SEATING); }
        if (plan.isAdvancedAnalyticsEnabled()) { features.add(Feature.ADVANCED_ANALYTICS); }
        if (plan.isCustomBrandingEnabled()) { features.add(Feature.CUSTOM_BRANDING); }
        if (plan.isTeamMembersEnabled()) { features.add(Feature.TEAM_MEMBERS); }
        if (plan.isAiAssistantEnabled()) { features.add(Feature.AI_ASSISTANT); }
        return new Policy(source, Set.copyOf(features), plan.getMaxInvitations(), plan.getMaxGuests(),
                plan.getMaxGuestsPerInvitation(), plan.getMaxTeamMembers());
    }

    private void lockOwner(AppUser user) {
        users.findForUpdateById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));
    }

    private void requireCapacity(Integer limit, long current, int additional) {
        if (additional < 0 || (limit != null && limit < 0)) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "ENTITLEMENT_POLICY_INVALID", "Package limits require review");
        }
        if (limit != null && current + additional > limit) {
            throw new ApiException(HttpStatus.FORBIDDEN, "PACKAGE_LIMIT_REACHED", "The configured package limit has been reached");
        }
    }
}
