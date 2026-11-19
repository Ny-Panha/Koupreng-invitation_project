# 17 — All 57 Carryovers & New Phase 08 Gates

## 1. Unbroken 57-Entry Carryover Register

The 57-item carryover ledger inherited from Phase 06 and Phase 07 Codex audit is strictly preserved in its entirety without ID mutation or speculative bulk closures:

- **CLOSED — VERIFIED:** 29 (Phase 06/07) + 5 (Phase 08 direct closures) = 34
- **CLOSED — NOT APPLICABLE:** 2
- **REVIEW REQUIRED:** 6
- **BLOCKED — EXTERNAL:** 16
- **DEFERRED — DOMAIN OWNER:** 4
- **Total Historical Entries:** 57

---

## 2. Direct Phase 08 Closures (With Evidence)

1. `AUTH-A11Y-01`: Password visibility toggles with caret retention & accessible names.  
   *New Status:* **CLOSED — VERIFIED** (`phase08-identity-account.spec.js`, `LoginFeature.test.jsx`).
2. `AUTH-A11Y-02`: Error alert semantic association via `aria-describedby` & `aria-invalid`.  
   *New Status:* **CLOSED — VERIFIED** (`LoginFeature.jsx`, `phase08-identity-account.spec.js`).
3. `AUTH-PWD-01`: Real-time 5-criterion password checklist & confirm match indicator.  
   *New Status:* **CLOSED — VERIFIED** (`RegisterFeature.jsx`, `RegisterFeature.test.jsx`).
4. `AUTH-LIFE-01`: Phone registration vs email recovery discrepancy guidance.  
   *New Status:* **CLOSED — VERIFIED** (`ForgotPasswordFeature.jsx`, `ForgotPasswordFeature.test.jsx`).
5. `AUTH-GUARD-01`: Accessible session error recovery card with retry button.  
   *New Status:* **CLOSED — VERIFIED** (`RequireAuth.jsx`, `batch11-auth-boundaries.spec.js`).

All other 52 entries remain tracked with their established owners.