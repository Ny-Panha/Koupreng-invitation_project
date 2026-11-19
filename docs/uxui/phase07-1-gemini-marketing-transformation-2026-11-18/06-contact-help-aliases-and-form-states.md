# Phase 07.1 — Contact, Help Aliases, and Form States

## 1. Overview & Route Architecture

The Contact & Concierge domain provides a direct, accessible channel for couples, event planners, and enterprise clients to connect with KoupReng atelier specialists.

### Route Allocations & Aliases
- **Canonical Route:** `/contact` (`ContactFeature.jsx` wrapped in `MarketingShell.jsx`)
- **Route Aliases & Redirects:**
  - `/about` &rarr; redirects cleanly (301/permanent in SPA routing) to `/contact#atelier-story` or `/contact`
  - `/help` &rarr; redirects to `/contact#concierge-support` or `/contact`
  - `/support` &rarr; redirects to `/contact`
  - `/pricing` &rarr; navigates to `/pricing/packages` or displays transparent pricing breakdown guidance

All redirects are registered in `apps/frontend-user/src/app/routes/marketingRoutes.jsx` to prevent 404 dead ends.

---

## 2. Concierge Inquiry Form Specifications

### Field Architecture & Validation Contracts
The form is implemented in `apps/frontend-user/src/features/marketing/ContactFeature.jsx` with accessible semantic controls:

1. **Client Name (`name="name"`)**:
   - Required, min 2 characters.
   - Accessible label with `htmlFor` and `aria-required="true"`.
   - Error mapping to `aria-describedby="contact-name-error"`.

2. **Email Address (`name="email"`)**:
   - Required, RFC-compliant email regex.
   - Validation triggers on blur and submit.
   - Accessible error text linked via `aria-describedby`.

3. **Telegram / Phone (`name="phone"`)**:
   - Optional, allows international Cambodian formats (`+855 ...`, `012...`, etc.).
   - Clear helper text explaining usage for instant concierge response.

4. **Inquiry Subject / Ceremony Type (`name="subject"`)**:
   - Controlled `<select>` with localized options:
     - Wedding Invitation Suite (អាពាហ៍ពិពាហ៍)
     - Monastic & Traditional Blessing (បុណ្យចម្រើនព្រះបរិត្ត)
     - Corporate Gala & Anniversaries (ពិធីជប់លៀងផ្លូវការ)
     - Bespoke Atelier Commission (ការរចនាផ្ទាល់ខ្លួនពិសេស)
     - General Concierge & Support (ជំនួយទូទៅ)

5. **Message Content (`name="message"`)**:
   - Required, min 10 characters, max 2,000 characters.
   - Character count indicator.

---

## 3. Form States & User Feedback

| State | Visual Behavior | Accessibility & Interaction |
|---|---|---|
| **Idle** | Clean input borders, subtle champagne glow on focus (`:focus-visible`), placeholder text in secondary gold/slate. | Standard tab order, all inputs keyboard-navigable. |
| **Field Error** | Crimson outline (`--ui-theme-danger`), warning icon, descriptive text below field. | `aria-invalid="true"`, `aria-describedby` points to error ID, focus moves to first invalid field on submit. |
| **Submitting** | Loading spinner on button (`LoadingButton`), fields set to `disabled`, transparent overlay preventing double submission. | Button receives `aria-busy="true"`, announce "Sending inquiry...". |
| **Success** | Green checkmark card replacing form or toast notification with confirmed delivery notice. | `role="status"` live region announces confirmation to screen readers. Provides "Send another inquiry" button. |
| **Server Error** | Alert banner above form with retry button, preserving all entered user input. | `role="alert"`, focus shifts to alert, no input data lost. |

---

## 4. Transparent Pricing & Atelier Value Guidance

Rather than hidden fees or unverified claims, the contact experience features an editorial pricing guide:
- **Transparent Tiering:** Clear breakdown of what each tier includes (Digital Invitation Suite, Telegram Guest RSVP Manager, QR Check-in, Custom Music/Audio, Envelope & Wax Seal opening choreographies).
- **Custom Commission Estimates:** Explicitly lists variables that influence bespoke design fees (bespoke Khmer calligraphy illustration, custom 3D wax seal dies, high-capacity guest registries).
- **Zero Hidden Charges:** Currency transparency in both USD and KHR (Riel), aligned with Koupreng backend standards.

---

## 5. Truthful Contact & Atelier Channels

All contact endpoints reflect authentic, verifiable communication channels:
- **Official Telegram Support:** Dedicated concierge bot and handle `@koupreng_support`.
- **Direct Atelier Email:** `support@koupreng.com` / `concierge@koupreng.com`.
- **Atelier Studio Address:** Preah Norodom Blvd, Daun Penh, Phnom Penh, Cambodia.
- **Operating Hours:** Monday – Saturday, 08:30 – 18:00 ICT (UTC+7).
