# 03 — Identity Route & State Matrix

## Comprehensive Matrix: Route × Role × State × Locale × Theme × Viewport

Every user-facing identity surface was systematically evaluated across all execution dimensions:

### 1. Route & Role Matrix

| Route | Role / Auth Requirement | Key States Handled | Viewport Targets |
|---|---|---|---|
| `/login` | Public (Anonymous only; redirects authenticated users to default `/app/events` or `redirectTo`) | Default, validation error, submitting/busy, invalid credentials, redirect continuation, social auth trigger | Mobile (320px, 390px), Tablet (768px, 820px), Desktop (1280px, 1440px) |
| `/register` | Public (Anonymous only; redirects authenticated users) | Default, typing validation, rule failure, password mismatch, duplicate phone error, redirect continuation | Mobile (320px, 390px), Tablet (768px, 820px), Desktop (1280px, 1440px) |
| `/forgot-password` | Public (Anonymous & authenticated) | Default input, invalid email, busy/loading, privacy-neutral success, phone user recovery hint, token continuation link | Mobile (320px, 390px), Tablet (768px, 820px), Desktop (1280px, 1440px) |
| `/reset-password` | Public (Requires valid `?token=...` or input) | Default (prefilled/empty), password validation, mismatch, busy/loading, reset success, invalid/expired token error | Mobile (320px, 390px), Tablet (768px, 820px), Desktop (1280px, 1440px) |
| `/app/profile` | Protected (`USER`, `ORGANIZER`, `ADMIN`) | Loading skeleton, profile display, editing full name / phone / language, password accordion open/close, save feedback | Mobile (320px, 390px), Tablet (768px, 820px), Desktop (1280px, 1440px) |
| `/app/change-password` | Protected (`USER`, `ORGANIZER`, `ADMIN`) | Default, current password required, new password criteria checklist, mismatch, submitting, success feedback | Mobile (320px, 390px), Tablet (768px, 820px), Desktop (1280px, 1440px) |
| Protected Route Guard | Any protected route under `/app/*` | `authStatus === "loading"` (spinner), `authStatus === "unauthenticated"` (redirects to `/login`), `authStatus === "error"` (accessible error card with retry) | Mobile, Tablet, Desktop |

### 2. State & Interaction Matrix

| Surface | State | Visual Treatment | Accessibility Contract |
|---|---|---|---|
| `/login` | Password obscured | Masked `••••••••`, Eye icon | `aria-label="Show password"`, `aria-pressed="false"` |
| `/login` | Password visible | Plain text, EyeOff icon | `aria-label="Hide password"`, `aria-pressed="true"` |
| `/login` | Form Error | `.auth-alert.danger` with `AlertCircle` icon | Container has `role="alert"`, `aria-live="polite"`, input marked `aria-invalid="true"` |
| `/register` | Criteria evaluation | 5 live list items with Check / Circle icons | Live green/grey icon updates, high contrast text |
| `/register` | Password confirmation | Live `.auth-match-status` pill | "Passwords match" (green) vs "Passwords do not match" (danger) |
| `/forgot-password` | Request submitted | `.auth-success-card` with CheckCircle | Privacy-neutral messaging prevents user enumeration |
| `/forgot-password` | Phone user guidance | `.auth-recovery-hint` card | Clarifies phone account recovery path via Telegram support |
| `/reset-password` | Success card | `.auth-success-card` + Login CTA | Clear instructions to log in with new password |
| Guard | Session fetch failed | `.auth-session-error-card` with `ShieldAlert` | Role `alert`, retry button with `RefreshCw` icon |

### 3. Locale & Theme Matrix
All 6 surfaces have been verified under:
- **English (`en`) + Light Theme (`data-color-mode="light"`)**
- **English (`en`) + Dark Theme (`data-color-mode="dark"`)**
- **Khmer (`km`) + Light Theme (`data-color-mode="light"`)**
- **Khmer (`km`) + Dark Theme (`data-color-mode="dark"`)**
