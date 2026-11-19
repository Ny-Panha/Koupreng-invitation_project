# 07 — Social Identity: Google & Telegram Contracts

## Social Authentication Boundaries and Architecture

### 1. Architectural Guardrails
KoupReng supports Google One-Tap/OAuth and Telegram Widget authentication. During Phase 08.1, the frontend contracts and security boundaries established in earlier phases were strictly preserved:
- No mocking of real provider credentials or tampering with OIDC discovery endpoints.
- Server-side validation of JWT tokens and HMAC signatures remains authoritative.
- Social identity linking requires an authenticated, validated session before linking to an existing account.

### 2. Styling and Dark Mode Alignment
- **Google Sign-In Button (`.auth-social-btn.google`):**
  - Previously, the Google sign-in button retained a solid white background regardless of the active theme, resulting in excessive glare in dark mode.
  - In `AuthPage.css`, the button now features specific dark mode rules:
    ```css
    :root[data-color-mode="dark"] .auth-social-btn.google {
      background: var(--ui-theme-bg-surface-elevated, #211d18);
      color: var(--ui-theme-text-primary, #f5f5f4);
      border-color: var(--ui-theme-border-strong, #3f3b37);
    }
    :root[data-color-mode="dark"] .auth-social-btn.google:hover:not(:disabled) {
      background: #2a251f;
      border-color: var(--ui-theme-accent, #c4a87a);
    }
    ```
- **Telegram Widget Boundary:**
  - Preserved standard Telegram OAuth script injection protocols.
  - Safe fallbacks maintained for LAN/local testing where Telegram domain whitelists are inactive.
