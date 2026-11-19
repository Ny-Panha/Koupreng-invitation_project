# Phase 07.1 — Security, Privacy, and Functionality Preservation

## 1. Security Boundaries & Authorization Guards

Phase 07.1 modifications adhere strictly to the security, privacy, and architectural invariants defined across the repository:

1. **Route Guard Integrity:**
   - Marketing routes (`/`, `/contact`, `/venues`, `/pricing`, `/about`, `/help`) remain open public routes.
   - Protected application routes (`/app/*`, `/admin/*`) retain their authentication guards.
   - Call-to-action buttons targeting protected endpoints (e.g. `/app/events/new`) seamlessly leverage the existing return-intent login flow without bypass.

2. **XSS & Injection Safeguards:**
   - All dynamic text rendering utilizes standard React JSX escaping.
   - Zero use of `dangerouslySetInnerHTML`.
   - Contact form fields enforce strict length constraints and sanitized string values prior to state submission.

3. **Zero Third-Party Trackers:**
   - No external trackers, telemetry beacons, unvetted analytics scripts, or CDN dependencies were introduced.
   - Font assets remain locally hosted woff2 files in accordance with `docs/design/THIRD_PARTY_UI_LICENSES.md`.

---

## 2. Backend & Data Layer Preservation

- **Zero Backend Touches:** No Java Spring Boot controllers, entities, repositories, or services were altered.
- **Flyway Migration Immutability:** The 48 applied Flyway migrations remain completely untouched.
- **USD / KHR Separation:** Pricing descriptions respect strict USD/KHR dual-currency standards without runtime conversions.
- **RSVP & Guest Privacy:** Guest data models and wedding guest registries remain isolated from public marketing surfaces.
