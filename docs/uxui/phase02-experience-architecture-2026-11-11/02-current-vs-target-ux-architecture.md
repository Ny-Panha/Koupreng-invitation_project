# Current and target experience architecture

## Product thesis

KoupReng should feel like a Cambodian invitation atelier when a couple creates or a guest opens an invitation, and like a dependable operating workspace when owners and staff manage guests, payments and admission. The platform brand can be coherent across management shells while ten bespoke invitation families retain separate palettes, composition and motion. Premium quality means credible content, precise status, readable Khmer, smooth task completion and emotional moments chosen by the user.

**Current source:** separate customer/admin React apps, three user shells, one admin shell, event workspace, template catalog and Studio, bespoke renderer registry, and server-backed account/payment/event domains. **Target:** a task-led IA and shared interaction language around those existing boundaries. This document does not assert the current UI already meets the target.

| Surface | Current source-backed structure | Target task hierarchy | Main risk / phase |
|---|---|---|---|
| First visit | Homepage, template/venue catalog, pricing/contact routes | Understand service → inspect real template → know price/access → start with preserved intent | Claims and LCP; 07–09 |
| Account | Auth/recovery and profile routes | Explain sign-in need, preserve intended destination, recover expiry safely | Wrong role/session and lost intent; 08 |
| Owner | Event list/workspace, create wizard, editor, operations | Find event → see next actionable task → edit/save/preview/publish → operate guests | Data loss and hidden actions; 11–23 |
| Guest | Public `/w` and `/i` entry with renderer resolution | Open or skip ceremony → read essentials → directions and RSVP → confirmation | Media consent, token privacy, deadlines; 10/16/18 |
| Finance | Template/plan purchase, payment return, gift/budget/report | Show server amount and order status, distinguish manual records from verified settlement | False PAID/entitlement claim; 21–22 |
| Admin | Independent guarded shell, template Studio, operational pages | Fast review/edit/preview with permission-aware actions and audit trail | Dense controls, role errors, preview trust; 24–25 |

## Task-priority framework

P0 is a **confirmed** security or data-integrity blocker; none is confirmed by the current Phase 01/02 evidence. P1 means an essential task is unreachable or payment/ownership truth is wrong. P2 is measurable usability, accessibility, localization or performance debt. P3 is a gated enhancement. Every decision in [dependency map](13-full-product-improvement-dependency-map.md) is tagged with phase and acceptance evidence. A source-backed route is not itself proof of a live end-to-end task.

## Whole-product experience rules

1. A screen states where the user is, what they can do next, what was saved, and what the server has confirmed. Status wording must never infer purchase or contribution success from a redirect or local timer.
2. Primary action is visible and remains usable on phone, tablet, desktop, keyboard and touch. Secondary authoring controls are progressively disclosed; dense admin controls stay reachable by scroll and focus.
3. Every task supplies loading, empty, validation, denied, conflict, offline, timeout and safe return states when relevant. An expired session returns to the intended safe route after successful authentication.
4. Invitations may be expressive, but essential facts, map and RSVP never wait for animation/audio. Preview is visually labeled as preview and cannot grant ownership or bypass access.
5. Management tokens apply to shells and shared primitives. Renderer-owned art is isolated; any global CSS/token change is checked against all ten families and fallback.
6. Long Khmer labels and names wrap at meaningful boundaries. English/Km UI locale can differ from authored invitation language; switching account locale does not silently rewrite authored content.
7. Proposed analytics describe observable task outcomes and recovery, with privacy/consent review before instrumentation. No existing event pipeline is assumed.

## Text wireframe: owner and guest

**Owner phone (320–430px):** compact event switcher and status, screen title plus one primary action, task cards in sequence (invitation, guests, RSVP, seating, check-in, finance), alert/recovery inline, persistent authoring Edit/Preview switch when in Studio, bottom action area above safe-area and keyboard. **Tablet:** task rail plus main work area; avoid squeezed two-column form. **Desktop:** event navigation, main task canvas and contextual inspector; preserve source guard and URL.

**Guest phone:** template-specific cover with explicit Open and Skip when ceremonial, event title/date/place immediately readable in static mode, program/directions/RSVP as clear sections, audio off until consent, confirmation with ability to revise if policy permits. Errors identify invalid/expired/private access without leaking guest details. The ten renderers must be evaluated individually rather than illustrated by one universal mockup.

## Guardrails

Preserve route identity and aliases, role guards, backend access, payment verification, draft JSON/revisions, guest token privacy, preview `postMessage` origin/session checks, 48 historical Flyway migrations, asset rights and current original artwork. Optional owner calendar, general CMS, live AI, venue booking and refunds remain product proposals requiring separate API/security/data decisions.
