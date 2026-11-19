# 07 — Account Switch and Sensitive State Isolation

**Phase:** `11.1`  
**Defect Resolved:** `D11.1-01` (Cross-Account Draft Storage Leak)  
**Test Evidence:** [Phase11_1DraftLifecycle.test.jsx](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/events/onboarding/Phase11_1DraftLifecycle.test.jsx) (TC-RACE-01)

---

## 1. Vulnerability Analysis (D11.1-01)

In the initial implementation, `useState` for draft data was initialized once on component mount:
```jsx
// BEFORE (VULNERABLE):
const [formData, setFormData] = useState(() => loadDraft(user?.id));
```
When User A logged out and User B logged in within the same browser session without a hard page unmount, `user.id` changed from `'userA'` to `'userB'`. However, `formData` in React memory retained User A's wedding details ("Kosal & Bopha"). When User B edited any input, the auto-save effect executed:
```jsx
sessionStorage.setItem(`koupreng_event_draft_${user.id}`, JSON.stringify(formData));
```
This wrote User A's private wedding details directly into User B's storage partition!

---

## 2. Architectural Remediation

To eliminate cross-account contamination, a `prevUserIdRef` guard was introduced:

```jsx
// AFTER (SECURE):
const prevUserIdRef = useRef(user?.id);

useEffect(() => {
  if (prevUserIdRef.current !== user?.id) {
    prevUserIdRef.current = user?.id;
    // Wipe memory state and reload specifically for the new user ID
    const freshDraft = loadDraft(user?.id);
    setFormData(freshDraft.formData);
    setCurrentStep(freshDraft.currentStep);
    setSelectedTemplateId(freshDraft.selectedTemplateId);
  }
}, [user?.id]);
```

---

## 3. Negative Race Condition Verification

The fix was rigorously verified in `Phase11_1DraftLifecycle.test.jsx`:
- **TC-RACE-01:** Renders component as User A (`user-123`), enters title "Wedding of Kosal & Bopha". Updates auth context to User B (`user-456`).
- **Assertion:** Title input resets to blank (or User B's draft); User A's title is never written into `koupreng_event_draft_user-456`.
- **Result:** **100% PASS**.
