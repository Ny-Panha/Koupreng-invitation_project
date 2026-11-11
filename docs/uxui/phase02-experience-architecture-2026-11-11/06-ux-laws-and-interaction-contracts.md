# Applied UX laws and interaction contracts

These are implementation contracts for Phases 03–27. The criterion in each row is a future acceptance test, not a claim of current compliance.

| Rule and rationale | Screen / behavior | Measurable acceptance |
|---|---|---|
| Nielsen 1, visibility of status | Event save, publish, RSVP, order status | Show submitting → acknowledged or failed from server; no success before response; screen reader receives one status announcement. |
| Nielsen 2, match to real world | Gift and payment histories | “Recorded manually,” “pending,” “under review,” and “paid” reflect distinct backend states; currency and timezone explicit. |
| Nielsen 3, user control | Invitation ceremony, editor, checkout | Skip/pause/stop opening; cancel payment without losing order reference; back from dirty editor prompts save/discard. |
| Nielsen 4, consistency | All shells and admin Studio | Same action/status vocabulary and semantic button/field roles; template art may vary without changing task semantics. |
| Nielsen 5, error prevention | Wizard, import, publish, seating, purchase | Validate date/amount/capacity; show review before consequential action; one submission creates at most one record. |
| Nielsen 6, recognition | Event switcher and catalog | Current event/template/price/status visible; users do not recall a previous screen to finish. |
| Nielsen 7, flexibility | Owner and admin workspaces | Keyboard shortcuts only as optional accelerators; all actions available through visible controls and touch. |
| Nielsen 8, minimal design | Marketing and Studio | One primary action per task section; advanced controls progressively disclosed; no decorative motion on critical path. |
| Nielsen 9, error recovery | 401/403/404/409/429/503, offline | Plain cause and safe retry/return; preserve unsaved data when lawful; payment denial never implies PAID. |
| Nielsen 10, help | Invalid token, complex import, permission denial | Contextual help next to failure and a safe support route; no dead end. |
| Jakob | Catalog, filters, dialogs, breadcrumbs | Familiar search/filter/back/close semantics, browser Back matches expected route history. |
| Hick | Template selection and five-section Studio | Show essential choice set first, group advanced options; no large undifferentiated list. |
| Fitts | Mobile save, Preview, RSVP, scan | Stable target with practical 44px design goal; WCAG 2.2 minimum/exception checks; no moving CTA under pointer. |
| Gestalt grouping | Owner task cards and admin forms | Labels, help, errors and actions visually/semantically grouped under one task heading. |

## Component state contracts

| Family / current owner | Required variants | Focus, feedback and recovery owner | Later phase |
|---|---|---|---|
| Navigation / `MarketingShell`, `AuthShell`, `HostShell`, `AdminLayout` | default, active, expanded, 401/403, empty, mobile drawer | Shell manages current location, Escape/return focus and safe deep link; server enforces role. | 06/08/24 |
| Button/link and icon action | default, hover, focus, pressed, disabled with reason, busy, success/fail | Semantic `<button>`/`<a>`; accessible name, target and no duplicate action. | 04 |
| Field, select, date/time, upload | hint, required, invalid, pending, server error, read-only | Label and described error; preserve entered value; focus first invalid field. | 04/11/14 |
| Modal/dialog/drawer | opening, open, submitting, failure, close | Existing `Modal`/shared focus pattern; initial focus, Escape policy, focus restore, background inert. | 04 |
| Table/card/list/search | loading, empty, filtered empty, partial error, denied | Keep headers/counts, clear filter path, keyboard row action, no whole-card click ambiguity. | 04/17/24 |
| Toast/alert/feedback host | info, warning, success, error, retry | One accessible live region; persistent consequential failure; no status based only on redirect. | 04 |
| Studio Edit/Preview and preview iframe | edit, preview, loading, stale, failed, conflict | Current admin Studio owns panel/device/gate; visible section tabs, trusted `postMessage`, safe return. | 13/25 |
| Guest renderer/media | static, opening, playing, paused, skipped, unavailable | Renderer owns art; accessible static facts and consent controls persist. | 10/16 |
| Chart/export/financial card | empty, loading, partial, stale, error, verified | Explicit timestamp/source, currency, export state; no fake settled amount. | 21/22/24 |

## Feedback timing and persistence

Use immediate pressed/busy feedback; tell the user when a write is actually acknowledged. A timeout means **unknown**, so provide server status lookup instead of retrying a purchase blindly. Destructive confirmation names the affected record and consequence; no confirmation theater for ordinary reversible navigation. Errors remain visible until corrected or dismissed, and assistive technology hears them once. Keep focus on the affected action after retry; route transitions place focus at the new main heading. Any draft cache is marked local/unsent, bounded, and cleared only after acknowledged synchronization or deliberate discard.
