package com.koupreng.backend.entitlement.application;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.payment.infrastructure.persistence.UserTemplateAccessRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class EntitlementServiceTests {
    private final SubscriptionRepository subscriptions = mock(SubscriptionRepository.class);
    private final SubscriptionPackageRepository packages = mock(SubscriptionPackageRepository.class);
    private final UserTemplateAccessRepository purchases = mock(UserTemplateAccessRepository.class);
    private final AppUserRepository users = mock(AppUserRepository.class);
    private final UserInvitationRepository invitations = mock(UserInvitationRepository.class);
    private final GuestRepository guests = mock(GuestRepository.class);
    private final AppUser user = user();

    @Test void freeTemplateAndIndependentPurchaseRemainAvailableWithoutSubscription() {
        var template = template();
        var service = service(false);
        assertThat(service.hasTemplateAccess(user, template)).isTrue();
        template.setPremium(true);
        assertThat(service.hasTemplateAccess(user, template)).isFalse();
        when(purchases.existsByUserIdAndTemplateIdAndActiveTrue(1L, 5L)).thenReturn(true);
        assertThat(service.hasTemplateAccess(user, template)).isTrue();
    }

    @Test void onlyPaidActiveUnexpiredPackageGrantsPremiumCapability() {
        var template = template(); template.setPremium(true);
        var subscription = subscription();
        when(subscriptions.findActiveForUser(eq(1L), any())).thenReturn(List.of(subscription));
        var service = service(false);
        assertThat(service.hasTemplateAccess(user, template)).isTrue();
        subscription.setPaymentStatus("PENDING");
        assertThat(service.hasTemplateAccess(user, template)).isFalse();
        subscription.setPaymentStatus("PAID"); subscription.setEndDate(Instant.now().minusSeconds(1));
        assertThat(service.hasTemplateAccess(user, template)).isFalse();
        subscription.setEndDate(Instant.now().plusSeconds(3600)); subscription.setActive(false);
        assertThat(service.hasTemplateAccess(user, template)).isFalse();
        subscription.setActive(true); subscription.setStatus("PENDING_PAYMENT");
        assertThat(service.hasTemplateAccess(user, template)).isFalse();
    }

    @Test void featureFlagsComposeWithoutRevokingIndependentPurchases() {
        var subscription = subscription(); subscription.getSubscriptionPackage().setPremiumTemplatesEnabled(false);
        when(subscriptions.findActiveForUser(eq(1L), any())).thenReturn(List.of(subscription));
        var template = template(); template.setPremium(true);
        assertThat(service(false).hasTemplateAccess(user, template)).isFalse();
        when(purchases.existsByUserIdAndTemplateIdAndActiveTrue(1L, 5L)).thenReturn(true);
        assertThat(service(true).hasTemplateAccess(user, template)).isTrue();
        assertThatThrownBy(() -> service(true).requireFeature(user, EntitlementService.Feature.SEATING)).isInstanceOf(ApiException.class);
        assertThatCode(() -> service(false).requireFeature(user, EntitlementService.Feature.SEATING)).doesNotThrowAnyException();
    }

    @Test void compatibilityPolicyPreservesExistingFeaturesAndDoesNotQueryQuotas() {
        var service = service(false);
        assertThat(service.policy(user).source()).isEqualTo("PRODUCT_POLICY_REVIEW_REQUIRED");
        service.requireInvitationCreation(user);
        service.requireGuestCreation(invitation(), 1000);
        verifyNoInteractions(users, invitations, guests);
    }

    @Test void configuredInvitationQuotaChecksAfterOwnerLock() {
        var plan = baseline(); plan.setMaxInvitations(2);
        configureBaseline(plan);
        when(invitations.countByUserIdAndDeletedFalse(1L)).thenReturn(1L);
        service(true).requireInvitationCreation(user);
        var order = inOrder(users, invitations);
        order.verify(users).findForUpdateById(1L); order.verify(invitations).countByUserIdAndDeletedFalse(1L);
        when(invitations.countByUserIdAndDeletedFalse(1L)).thenReturn(2L);
        assertThatThrownBy(() -> service(true).requireInvitationCreation(user)).isInstanceOf(ApiException.class);
    }

    @Test void guestQuotasCoverOwnerTotalPerInvitationAndBulkCount() {
        var plan = baseline(); plan.setMaxGuests(10); plan.setMaxGuestsPerInvitation(3); configureBaseline(plan);
        when(guests.countByInvitationUserId(1L)).thenReturn(8L);
        when(guests.countByInvitationId(9L)).thenReturn(2L);
        service(true).requireGuestCreation(invitation(), 1);
        assertThatThrownBy(() -> service(true).requireGuestCreation(invitation(), 2)).isInstanceOf(ApiException.class);
        when(guests.countByInvitationUserId(1L)).thenReturn(10L);
        assertThatThrownBy(() -> service(true).requireGuestCreation(invitation(), 1)).isInstanceOf(ApiException.class);
    }

    @Test void unlimitedAndExplicitZeroLimitsRemainDistinctAndMissingPolicyFailsClearly() {
        var plan = baseline(); configureBaseline(plan);
        service(true).requireInvitationCreation(user);
        plan.setMaxInvitations(0);
        assertThatThrownBy(() -> service(true).requireInvitationCreation(user)).isInstanceOf(ApiException.class);
        when(packages.findByCodeAndActiveTrue("reviewed-free")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service(true).policy(user)).isInstanceOfSatisfying(ApiException.class,
                exception -> assertThat(exception.getCode()).isEqualTo("ENTITLEMENT_POLICY_UNCONFIGURED"));
    }

    @Test void teamLimitCountsUnderOwnerLockAndRequiresFeature() {
        var plan = baseline(); plan.setTeamMembersEnabled(true); plan.setMaxTeamMembers(2); configureBaseline(plan);
        var count = mock(java.util.function.LongSupplier.class); when(count.getAsLong()).thenReturn(2L);
        assertThatThrownBy(() -> service(true).requireTeamCapacity(user, count, 1)).isInstanceOf(ApiException.class);
        var order = inOrder(users, count); order.verify(users).findForUpdateById(1L); order.verify(count).getAsLong();
    }

    private void configureBaseline(SubscriptionPackage plan) {
        when(packages.findByCodeAndActiveTrue("reviewed-free")).thenReturn(Optional.of(plan));
        when(users.findForUpdateById(1L)).thenReturn(Optional.of(user));
    }
    private EntitlementService service(boolean enforce) { return new EntitlementService(subscriptions, packages, purchases, users, invitations, guests, enforce, "reviewed-free"); }
    private static AppUser user() { var value = new AppUser(); value.setId(1L); return value; }
    private static InvitationTemplate template() { var value = new InvitationTemplate(); value.setId(5L); return value; }
    private UserInvitation invitation() { var value = new UserInvitation(); value.setId(9L); value.setUser(user); return value; }
    private static SubscriptionPackage baseline() { var plan = new SubscriptionPackage(); plan.setPrice(BigDecimal.ZERO); return plan; }
    private Subscription subscription() {
        var value = new Subscription(); value.setUser(user); value.setActive(true); value.setStatus("ACTIVE");
        value.setPaymentStatus("PAID"); value.setEndDate(Instant.now().plusSeconds(3600));
        var plan = baseline(); plan.setPremiumTemplatesEnabled(true); value.setSubscriptionPackage(plan); return value;
    }
}
