# Chapter 20 — Open Gates, Owners & Final Phase Status

## 1. Summary of Remaining Open Gates

The following items cannot be closed by frontend local implementation alone and require named external owners:

1. **Native Khmer Linguistic & Diacritic Approval (BLOCKED — EXTERNAL):**
   - *Owner:* Native Khmer copy reviewer / Cultural advisor.
   - *Prerequisite:* Formal review of wedding ceremonial terms, tone, and diacritic rendering on real devices.

2. **Physical Mobile Device Testing (BLOCKED — EXTERNAL):**
   - *Owner:* Mobile QA.
   - *Prerequisite:* Testing on real iOS Safari and Android Chrome devices under low-bandwidth conditions.

3. **Screen Reader Assistive Technology (BLOCKED — EXTERNAL):**
   - *Owner:* Accessibility QA.
   - *Prerequisite:* End-to-end VoiceOver (iOS) and TalkBack (Android) audit.

4. **BCrypt 72-Byte Server Password Ceiling (C08-013):**
   - *Owner:* Backend Security & Product Policy Owners.
   - *Prerequisite:* Reconcile accepted password length, error handling, and hashing compatibility.

5. **Live ABA PayWay Sandbox Settlement (BLOCKED — EXTERNAL):**
   - *Owner:* Payments & Reconciliation QA.
   - *Prerequisite:* Authorized ABA PayWay sandbox with test merchant credentials.

6. **Production Real-User Telemetry (BLOCKED — EXTERNAL):**
   - *Owner:* DevOps / Performance Engineering.
   - *Prerequisite:* Field RUM data for p75 LCP, INP, and CLS.

---

**Final Phase 09.1 Implementation Status:** **PARTIALLY COMPLETE (LOCALLY VERIFIED ACROSS AUTHORIZED SCOPE)**. Ready for independent Codex audit.
