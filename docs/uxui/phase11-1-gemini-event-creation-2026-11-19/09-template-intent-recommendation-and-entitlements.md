# 09 — Template Intent, Recommendation, and Entitlements

**Phase:** `11.1`  
**Defect Resolved:** `D11.1-03` (Unresolved Premium Template Entitlement Gate)  
**Test Suite:** [Phase11_1TemplateIntent.test.jsx](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/events/onboarding/Phase11_1TemplateIntent.test.jsx)

---

## 1. Entitlement Evaluation Architecture

Templates in Koupreng are classified into two tiers:
- **Free Templates (`isFree: true`):** Accessible to all registered creators.
- **Premium Templates (`isFree: false`):** Require an active subscription or single-template purchase.

Entitlement state is resolved asynchronously via `entitlementApi` / `userProfile.subscriptions`, populating an `access` map keyed by template ID:
```javascript
access[templateId] = true | false | undefined
```

---

## 2. Vulnerability Analysis & Fix (D11.1-03)

In the initial implementation, the check for disabling the template selection button was:
```jsx
// BEFORE (VULNERABLE):
const isLocked = !template.isFree && access[template.id] === false;
<button disabled={isLocked}>Select</button>
```
**The Flaw:** When entitlements were still loading, `access[template.id]` was `undefined`. Since `undefined === false` evaluated to `false`, `isLocked` was `false`! This allowed users to select premium templates before entitlement checks completed, risking server-side 403 rejections upon creation.

**The Fix:**
```jsx
// AFTER (SECURE):
const isResolved = template.isFree || access[template.id] === true;
const isPending = !template.isFree && access[template.id] === undefined;

<button disabled={!isResolved} className={isPending ? 'btn-verifying' : ''}>
  {isPending ? 'Verifying access...' : (isResolved ? 'Select' : 'Requires Premium')}
</button>
```

---

## 3. Verification

Verified in `Phase11_1TemplateIntent.test.jsx`:
- **Test:** Premium template rendered while access check is pending.
- **Assertion:** Selection button is disabled with text "Verifying access...".
- **Result:** **PASS**.
