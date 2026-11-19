# KOUPRENG — PHASE 10.1: Security Architecture, Guest Privacy & Preview Sandbox Isolation

**Execution Date:** 18 November 2026, Asia/Bangkok  
**Role:** Creative Director, Cambodian Wedding Art Director, React 19 Frontend Engineer  
**Audit Reference:** Phase 10.1 Dedicated Invitation Art, Renderer UX/UI & Frontend Execution  
**Status:** VERIFIED — LOCAL  

---

## 1. Security Invariants
- **Origin Validation:** Preview postMessage uses `isTrustedPreviewMessage` with strict origin and nonce checks.
- **Guest Privacy:** Guest tokens are segregated; no PII leakage in public preview simulations.
- **Sanitization:** All user strings rendered via React JSX text nodes, preventing DOM XSS injection.
