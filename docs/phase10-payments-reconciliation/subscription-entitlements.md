# Subscription Packages, Pricing Policy & Entitlement Enforcement

## 1. Commercial Baseline & Historical Seed Scope

Per `docs/OWNER_ENTITLEMENT_DECISION.md`, Koupreng preserves the historical migration seed catalog and strict entitlement rules:

| Package Plan | Inactive / Public | Invitations | Guests / Event | Team Members | Seed Price | Currency |
|---|---|---|---|---|---|---|
| **FREE** | No final-chain row | — | — | — | Unresolved free plan | — |
| **BASIC** | Active | 1 | 40 | 1 | USD 0.01 | USD |
| **PRO** | Active | 20 | 500 | 5 | USD 199.00 | USD |
| **PREMIUM** | Active | 999 | 5,000 | 25 | USD 499.00 | USD |

### Enforcement Policy Mode:
- By default, `ENFORCE_PACKAGE_POLICY=false` (compatibility mode).
- Strict package policy can be enabled by the owner once commercial free-tier quotas are finalized.
- In both compatibility and strict modes: **Paid templates and paid feature access strictly require verified settlement**. Compatibility mode does not make premium templates free.

---

## 2. Invariant: Pending Orders Never Unlock Entitlements

In `SubscriptionService.java` and `TemplatePaymentService.java`:
1. When a user creates a subscription order (`POST /api/v1/subscriptions/purchase`), the subscription entity is created with:
   - `status = "PENDING_PAYMENT"`
   - `paymentStatus = "PENDING"`
   - `active = false`
2. **Access Control Check (`EntitlementService.java`):**
   ```java
   public boolean hasActiveSubscription(Long userId) {
       return subscriptionRepository.findActiveForUser(userId).isPresent();
   }
   ```
   Only subscriptions with `active = true`, `status = "ACTIVE"`, `paymentStatus = "PAID"`, and `startDate <= now < endDate` are returned.
3. Neither `PENDING`, `REVIEW_REQUIRED`, `FAILED`, nor `EXPIRED` orders can activate entitlements:
   - Zero quota increase.
   - Zero premium template unlocking.
   - Zero team capacity expansion.
   - Zero QR check-in unlocking.

---

## 3. Atomic Activation & Mutual Exclusion

When a subscription payment is confirmed (via Telegram detection or manual admin confirmation):
1. **Deactivation of Previous Subscriptions:**
   ```java
   private void deactivateActiveSubscriptions(Long userId, Instant now) {
       List<Subscription> activeSubscriptions = subscriptionRepository.findActiveFlagForUserForUpdate(userId);
       for (Subscription subscription : activeSubscriptions) {
           subscription.setActive(false);
           subscription.setStatus(subscription.getEndDate() != null && !subscription.getEndDate().isAfter(now)
                   ? STATUS_EXPIRED : "REPLACED");
       }
   }
   ```
2. **Atomic Transition:** The newly confirmed subscription is set to `active = true`, `status = "ACTIVE"`, `paymentStatus = "PAID"`, and timestamps are locked.
3. Existing entitlements from prior paid purchases are preserved without premature revocation.
