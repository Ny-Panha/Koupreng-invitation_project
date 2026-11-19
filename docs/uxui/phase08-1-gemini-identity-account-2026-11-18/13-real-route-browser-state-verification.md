# 13 — Real Route Browser State Verification

## 1. Browser Verification Scope

Tested in Playwright across Desktop Chromium (1280x720) and Mobile Chromium (Pixel 5 emulated, 393x851) using `tests/e2e/phase08-identity-account.spec.js`:

| Route / State | Viewport | Assertion Checked | Result |
|---|---|---|---|
| `/login` — Initial | Desktop & Mobile | Single H1, email/phone input, password input, show/hide button present. | PASSED |
| `/login` — Password Reveal | Desktop & Mobile | Toggle changes input type `password` -> `text` while retaining focus. | PASSED |
| `/login` — Validation Error | Desktop & Mobile | Empty/invalid submit exposes error alert linked via `aria-describedby` & `aria-invalid`. | PASSED |
| `/login` — Safe Return | Desktop & Mobile | Preserves `?redirectTo=%2Fapp%2Fevents%2Fnew` on register and forgot links. | PASSED |
| `/register` — 5-Criterion Rules | Desktop & Mobile | Typing evaluates length, uppercase, lowercase, digit with real-time pass/fail icons. | PASSED |
| `/register` — Confirm Mismatch | Desktop & Mobile | Mismatched confirmation displays warning; matching displays green check. | PASSED |
| `/forgot-password` — Form & Hint | Desktop & Mobile | Email input, `.auth-recovery-hint` for phone accounts, privacy-neutral success. | PASSED |
| `/reset-password` — Token Prefill | Desktop & Mobile | `?token=test-reset-token` auto-populates token field; password toggles work. | PASSED |
| `/app/profile` — Authenticated | Desktop & Mobile | Section landmark, input fields, change-password accordion with toggles. | PASSED |
| `/app/change-password` — Direct | Desktop & Mobile | Standalone route, 3 password fields with independent eye toggles. | PASSED |
| `RequireAuth` — Anonymous Guard | Desktop & Mobile | Direct visit to `/app/profile` redirects to `/login?redirectTo=%2Fapp%2Fprofile`. | PASSED |
| Bilingual & Dark Mode | Desktop & Mobile | Language switcher toggles `km`/`en`; `:root[data-color-mode="dark"]` transforms palette. | PASSED |
| Accessibility (Axe) | Desktop & Mobile | WCAG 2.2 AA scan on `/login`, `/register`, `/forgot-password` yields 0 violations. | PASSED |