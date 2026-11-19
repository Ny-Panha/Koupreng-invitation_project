# Chapter 07 — Detail, Demo, Preview & Trusted Iframe Audit

## 1. Preview Trust Protocol

- **Route:** `/templates/:id` and `/templates/:id/preview`
- **Isolation:** Rendered within an isolated, sandboxed `<iframe>` element.
- **Message Validation:** Origin, session token, and nonce verification enforced before accepting state synchronizations. Wildcard postMessage trust is strictly forbidden.
- **Security Tests:** `previewSecurity.test.jsx` verifies that an unauthenticated or unauthorized preview session cannot inject host credentials or bypass payment entitlements.

## 2. Interaction & Focus Architecture

- **Keyboard Support:** Enter activates preview; Escape key dismisses fullscreen modal and restores focus to trigger.
- **History Preservation:** Browser Back button returns to the previous catalog view, preserving scroll offset without jumping to the top of the page.
- **Short Landscape:** Verified at 844x390; preview container scrolls internally while top navigation remains reachable.
