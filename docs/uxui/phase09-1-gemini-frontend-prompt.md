# KOUPRENG — PHASE 09.1: GEMINI FULL UX/UI & FRONTEND IMPLEMENTATION PROMPT

## Complete premium template marketplace, discovery, preview, plans, pricing and purchase-decision experience

**Agent:** Gemini (frontend implementation / creative product design specialist)  
**Next agent:** Codex (independent Phase 09 source audit, QA, repair and completion decision **only after Gemini's report is supplied**)  
**Program:** KoupReng E-Invitation — 27-phase whole-product premium UX/UI transformation  
**Scope anchor:** `docs/uxui/MASTER_SCOPE.md`, **Phase 09**; Phase 08 Codex handoff `docs/uxui/phase08-codex-identity-account-audit-2026-11-18/19-phase09-1-gemini-frontend-execution-handoff.md`  
**Execution status at writing:** **NOT STARTED.** This file directs future local repository work; it does not claim work already performed.  
**Expected working tree:** `main`, local HEAD `2429b76545b683fad2a0a6f328bee3264875edc3`, observed `origin/main` `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`, **13 preserved local Phase 06 commits and unstaged/untracked Phase 07/08 Gemini + Codex changes**. Re-check these values from the actual local workspace rather than treating them as current immutable facts.

> **YOUR RESPONSIBILITY IS TO IMPLEMENT THE REAL PREMIUM FRONTEND, NOT WRITE ANOTHER PROPOSAL.** Own every active frontend route and meaningful state assigned to Phase 09. Deliver attractive, original, polished, working screens, reliable responsive interactions, localized copy, tests, and reproducible before/after evidence. Do not self-certify the whole phase or perform the later independent Codex audit. Never confuse a fixture PASS with live payment, entitlement, catalog, device, or provider certification.

---

## 01 — Non-negotiable mission and completion standard

Transform **the complete active template marketplace, selection, plan comparison and pre-purchase experience** into a coherent, Cambodian-first, modern luxury product. Its emotional job is to help someone imagine a beautiful wedding invitation. Its practical job is to help them discover an appropriate actual design, understand whether it is free/premium/available/owned, preview it honestly, sign in safely, choose a package if applicable, and proceed toward a server-verified purchase or creation without confusion or data loss.

Produce a **visual transformation with implementation depth**, not a collection of superficial color overrides. Preserve the existing canonical cream/forest/ink/champagne semantic system for management/marketplace chrome while showcasing the distinct aesthetics of the actual invitation families. Responsive composition, hierarchy, imagery, density, skeletons, meaningful states, navigation and microinteractions all need attention. The app should remain stable at low-end device conditions, reduced motion, virtual keyboard, error responses and long Khmer text.

Phase 09.1 is an **implementation stage**. Codex owns the later **Phase 09 independent audit and fixes**. Record limitations without claiming full completion. The previous phases remain partially complete where outstanding evidence is not available; do not reclassify them based on the existence of this prompt or on screenshots alone.

**Do not:** create invented inventory, gift/venue booking, favorites/watchlists, recommendations, discounts, countdown urgency, subscription entitlement grants, fake paid confirmation, payment success mockups presented as real, new auth methods, or an unapproved redesign of the ten guest renderer artworks. No feature flag should silently unlock a server-protected purchase or Studio feature.

## 02 — Read the live repository and honor skill routing before editing

From the **actual local repo root** inspect, in order:

1. `AGENTS.md`, `.agents/ROUTER.md`, and the one primary skill selected by the router (with no more than two relevant supporting skills). Use the premium UX/frontend path, and use QA rules when validating; do not bulk-load every skill.
2. `docs/uxui/MASTER_SCOPE.md`: full mission, Phase 09 text, all cross-phase invariants, and boundaries for Phases 10, 11, 13, 15, 16, 21 and 25.
3. The complete `docs/uxui/phase08-codex-identity-account-audit-2026-11-18/` report package: `README.md`, `19-phase09-1-gemini-frontend-execution-handoff.md`, security/route reports, and machine evidence when available. Also review Phase 07 Codex marketing and Phase 06 shell handoff because this change crosses discovery, marketing shell and authentication continuation.
4. Relevant current source files, route factories, component/UI imports, tests, state stores and domain DTO adapters. **Your local files supersede the older published GitHub branch.** Verify names, file locations and API semantics before assuming these examples still exist.
5. Existing Phase 09/marketplace/pricing/checkout documentation as historical hints only; do not confuse the older program's `phase09-*` with the current 27-phase sequence.

Known source candidates at the prior public baseline (all require local revalidation):

- `apps/frontend-user/src/app/routes/marketingRoutes.jsx`, `hostRoutes.jsx`, `lazyRoutePages.jsx`, relevant auth guards and safe continuation helpers.
- `apps/frontend-user/src/features/templates/components/TemplateGrid.jsx`, `PublicTemplateCard.jsx`, `templates.css`.
- `apps/frontend-user/src/features/templates/hooks/usePublicTemplateCatalog*`, `model/catalogPolicy*`, `model/templatePresentation.js`, `model/templateIdentity*`, `data/templatesData*`, `registry/templateRegistry.js`.
- `apps/frontend-user/src/features/marketing/PricingFeature.jsx`, `MarketingPages.css`, `model/usePackageCatalog.js`, `model/packagePresentation.js`.
- Actual `/app/packages` page and services; template detail/demo/preview and checkout components (find their **true** local names by route and import graph).
- `apps/frontend-user/src/features/auth/useTemplateContinuation*`, `safeRedirect*`, `RequireAuth*`, state/store modules and canonical CSS tokens.
- Existing Playwright tests (`phase02-foundations`, `phase04-components`, `phase05-motion`, `phase06-layout-navigation`, Phase 07 marketing, Phase 08 identity, template/catalog/payment regressions) and user/admin unit suites.

**Verify behavior from source**: an older default-branch file may define `/templates/:id` while the present handoff also names `/templates/:slug/preview` and `/templates/browse/:id`. The route **factory and current local runtime decide**, not a convenient guessed route. Preserve legitimate aliases and classify matching conflicts explicitly.

## 03 — Git and dirty-worktree preservation: STOP any destructive automation

The prior independent audit reports an intentionally dirty `main`: 13 local Phase 06 commits ahead of observed origin, and numerous **uncommitted** Phase 07 marketing + Phase 08 identity repairs, including Codex-attributed security/privacy fixes. This is **not permission to discard, autoformat wholesale, stage, or absorb someone else's changes**.

Before any edit, capture:

```powershell
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git status --short
git diff --stat
git diff --name-status
git diff --cached --name-status
git ls-files --others --exclude-standard
```

Save complete file-level provenance/sha256 or an equivalent non-destructive snapshot and a route-specific before tree. Identify which changed files predate Phase 09.1, which are shared with Phase 07/08, and which changes you add. Untracked files may be **the only copy** of prior work. **NEVER** use `git reset`, `git checkout .`, `git restore .`, `git clean`, destructive `git stash`, force push, rebase, pull/merge over dirty files, broad file replacement or unreviewed `git revert`. Do not stage, commit, push, PR, release, deploy, update production data or mutate real payments. No automatic network operations to credentials or providers.

If a needed Phase 09 file is already dirty, do a careful hunk-by-hunk update preserving existing content. Generate an **attributed changes ledger** with the before/after file hash, status and rationale. A selective future rollback must reverse **only the new Gemini 09.1 hunks**, not remove Codex's Phase 07/08 work. Avoid publishing secrets, auth tokens, real payment data, profile photos or private guest DTOs in evidence.

If you encounter unrelated teammate work, read and preserve it. Resolve only proven in-scope conflicts; document all uncertain overlaps. Do not let an old public GitHub `origin/main` supersede the actual local source.

## 04 — Exact Phase 09 route and component contract; enumerate before changes

Reconcile the source ledger that previously counted **135 routes (111 user + 24 admin), 62 feature groups, 63 app/group pairs**, with **10 dedicated renderer families, 38 static aliases, two named shared renderer IDs (`event-essential`, `koupreng-demo-wedding`) and one callable fallback**. These are the previously reported baseline, not a license to hard-code new fixtures or assert universal runtime certification.

Required route families to inspect (exact path/spelling/guard must be sourced from the current router):

| Family | Known/potential pattern(s) | Required decision |
|---|---|---|
| Public discovery | `/templates`, `/templates/browse` | Determine actual public vs authenticated guards; preserve working relationships and redirects. The handoff identifies `/templates/browse` as **guarded**, so do not casually make it public. |
| Catalog detail | `/templates/browse/:id`, `/templates/:id` or `:slug` | Determine if the latter is an invitation demo, data detail, or alias in each context. Do not duplicate page behavior or collapse identities. |
| Preview/demo | `/templates/:id/demo`, `/templates/:slug/preview`, owner preview variants | Preserve sandbox/origin/nonce/frame contracts, controls, close/Back/focus behavior, and restricted data. |
| Template checkout | `/templates/:templateId/checkout`, actual local aliases | Leave route guard, eligibility, server authority and idempotency intact. Improve *decision and state UX*, not settlement. |
| Public packages | `/pricing` | Use backend-owned public package catalog/limits/prices; do not fabricate. |
| Account packages | `/app/packages`, `/dashboard/packages` canonical/alias paths | Preserve auth guard and intended-package continuation. |
| Entry/continuation | `/` featured designs, login/register `next` flows, owner create from template | Improve in-scope handoff presentation, not the Phase 07 homepage or Phase 11 creation wizard. |
| Exceptions | unknown/unpublished templates, catalog 403/offline/zero, purchase denied, expired session, broken previews | Real recovery, no dead-end CTA, no accidental false entitlement. |

Produce a **route × component × ownership × meaningful states × acceptance evidence** ledger. Every active Phase 09 route must have a named status: `UPGRADED`, `PRESERVED + VERIFIED`, `REVIEW REQUIRED`, `BLOCKED — EXTERNAL`, or `DEFERRED — NAMED DOMAIN OWNER`. Aliases count as route leaves but **not** independent browser-verified user journeys. The dynamic published backend catalog has **not** been certified; never enumerate it by assuming only static known templates exist.

Do not turn Phase 09 into Phase 10 template-renderer art direction or Phase 21 purchase settlement. Update the master inventory only with source-backed changes; preserve existing 135/62/63 contracts unless the real source changed, explaining every drift.

## 05 — Design brief: a prestigious Cambodian digital-invitation atelier

The visual goal: a **luxury editorial atelier** that respects Khmer cultural detail and works for contemporary weddings. Think quiet confidence and craftsmanship, not a generic SaaS dashboard or effects-heavy landing page.

Art direction requirements:

- **Distinct content hierarchy:** strong page title, short truthful orientation copy, clear availability/status and fast paths to explore a design, preview, create or review a package.
- **Product chrome:** canonical semantic cream/ivory paper, deep forest/ink, restrained champagne-gold metallic accent; dark mode as a genuinely designed nocturnal experience, not inverted colors.
- **Visual rhythm:** full-width considered hero/intro where justified, editorial grids with generous but efficient space, legible comparison sections, cohesive card shape, gentle edge lighting/shadows, balanced asymmetric layout on large screens.
- **Real artwork:** template covers visually dominate cards but remain artistically independent; avoid a global tint/grayscale/crop/typography override that changes a wedding renderer's identity.
- **Typography:** properly shaped Khmer and high-quality Latin hierarchy. Honor local licensed font choices, existing font loading, proper Khmer line height/diacritics and contrast. No forced Latin uppercase/letter spacing on Khmer.
- **Premium interactions:** decisive, immediate state feedback; motion used only to explain navigation/selection, no delayed reveal of price, plan access or primary CTA.
- **Clarity over decoration:** badges must mean something real, comparisons must use real entitlements, and empty/error states must help a person continue.

Deliver a **short design-direction note** (palette roles, type scale, content hierarchy, card grid, imagery principles, normal/reduced motion, dark mode, Khmer constraints) and implement it. If a design choice harms legibility, real pricing or keyboard use, redesign it. Do not add an unapproved library or global CSS reset.

## 06 — Real user journeys to implement and verify

Do not consider a route complete because its opening screenshot renders. Implement and test the meaningful flows:

1. First-time visitor → marketing featured set → public `/templates` → category/search → preview → back to same catalog context.
2. Visitor → free design → determine actual eligibility → authentication if required → preserved validated template-to-create intent → correct owner creation entry. **Do not create a new event in this phase.**
3. Visitor → premium design → see honest premium status and price (only if sourced) → preview → sign in → eligible checkout decision or explicit not-yet-available state.
4. Authenticated owner → current account package/entitlement → browse → owned/eligible vs premium-unowned states → correct CTA without premature unlock.
5. Anonymous visitor → compare public packages → choose plan → sign in with safe `next` → preserved selected package context at `/app/packages`.
6. Owner → plan status/limit → view actual feature comparison → change selection/return; no entitlement mutation before backend confirmation.
7. Catalog fetch slow → skeleton → results; fetch fails → clear demo/fallback labeling and retry; returns empty → accurate no-inventory state.
8. Search yields zero → clear filters and maintain focus; change category/price filters; navigate and back with reasonable state preservation, without persistent stale state leakage.
9. Direct unknown/unpublished template URL → truthful unavailable state and useful routes; never silently show a different paid design.
10. Demo/preview on keyboard/touch → load and progressive media fallback → Escape/close → correct focus and scroll return; reduced motion can proceed.
11. Checkout pending, unverified, canceled/denied, network error, stale session or unauthorized → truthful status and recovery; no false "paid" confirmation.
12. Change language/theme mid-flow and orientation/virtual keyboard/zoom → stay on meaningful current task with labels and controls intact.

A fixture may model server states but must never be presented as a live provider result. Specify exactly which routes and states were browser tested versus source mapped.

## 07 — Public collection information architecture and discovery UX

Audit the existing `TemplateGrid`, catalog hook, card and search/filter policy before introducing anything. Preserve the existing distinction between **live server catalog** and limited **local/demo fallback**. Do not silently replace real remote inventory with static cards or merge prices across sources.

Implement the most suitable **source-compatible** discovery system:

- Search by legitimate localized design name/style/description with sensible trim, Unicode/KM handling, appropriate case behavior, and no brittle accent assumption. Reuse existing `matchesTemplateSearch` or document a tested enhancement.
- Category navigation grounded in **actual category values**; unrecognized codes remain represented with honest fallback names, not dropped. Support "All", active styles and dynamic category availability without losing accessible names.
- Free/premium filter based on **backend authoritative price/entitlement metadata** (or properly identified presentation DTO) with distinct `unknown/unavailable` handling. Avoid classifying an absent amount as free. `isPremium` is a display hint, never authorization.
- Sorting options only where compatible with available DTOs. Name/category and clear deterministic ordering may be supported client-side; **do not invent popularity, recency, rating, discount or trending rank.** Use source-stable ordering for ties. If the existing catalog lacks a truthful sortable field, omit or mark the option unavailable rather than pretending.
- Clearly placed mobile search and filters, predictable wrapping of long Khmer chip names, intuitive reset, visible result count where derivable, practical filtering feedback, accessible selected states (`aria-pressed`/appropriate radio/combobox semantics).
- Deep-linked filter/query state only if it fits existing routing and preserves clean canonical URLs, privacy and Back navigation; do not unnecessarily expose sensitive account data. Test browser Back/Forward and direct link restoration.
- Differentiate `loading`, `refreshing`, `ready`, `zero-inventory`, `zero-match`, `restricted`, `error`, `offline`, `demo-only`, and `unavailable media`. A retry must call an actual retry mechanism; a button must not be decorative.
- Desktop grid with intentional image ratios and information density; one-column mobile cards with touch-first action layout; prevent sideways document scroll at 320px and in long Khmer.
- Featured home gallery remains a curated **view of the same truthful catalog policy**, not a fake second inventory source. Preserve the Phase 07 work when updating shared cards.

Use the existing `usePublicTemplateCatalog` data boundary and identity helpers where they apply. Debounce only if evidence warrants; do not create loading flicker or keyboard focus loss. Preserve SPA route integrity and lazy-loading benefits.

## 08 — Template cards: beautiful, semantic, truth-preserving

Bring each actual catalog card to a premium standard:

- Cover image or recognizable designed media with stable aspect ratio, loading priority (first visible important cover vs below-fold lazy), error fallback, explicit alt decisions, and no distorted crop of meaningful invitation text.
- True localized title and short style description, category, compatible event type if present, free/premium/owned/unknown state. A badge must **not** claim paid access or "live" status from static display data.
- CTA hierarchy: **Preview design** for available demo, **Use/Create with this design** only when truly permitted, **Check access / Review purchase** for applicable premium designs, and **Unavailable / Contact support** when source data is absent. Do not make nonworking actions look actionable.
- Real route URLs from current router, stable identity through slug/code/preset priority; raw numeric database ID collision must never select another renderer.
- Proper card-click and nested-action interaction: avoid nested anchors/buttons, pointer-only hidden controls, focus loss, hover-only descriptions, and inaccessible overlay hit areas.
- Disabled, loading, unavailable and transient state semantics readable in both themes. No `opacity: 0` that conceals a required status for motion.
- Cautious use of micro-motion (subtle cover zoom, icon alignment, edge glow) respecting `prefers-reduced-motion` and low-end browser frame budget.

**Note:** The previous `presentTemplate` presentation helper maps `thumbnailUrl` and localized names/descriptions, and infers some premium presentation from fields. Verify its current local contract; presentational fields must never authorize ownership. Do not globally modify ten authored renderer styles to make a card fit.

## 09 — Template detail, public demo and preview interactions

Determine the actual routes, components, data fetch and rendering contracts first. Reuse the **existing** preview renderer and dedicated family machinery. The 10 dedicated families and 38 aliases are **not** one replaceable universal template theme.

For each supported template detail/preview context provide:

- A clear design name, media sample with author/rights review, meaningful structured preview information and source-backed inclusion/availability.
- Prominent actual **View preview** and secondary appropriate **Select/Use/Check access** actions; disclosure of what a preview does **not** grant.
- Direct-link and back-to-catalog context; preserve search/filter context and focus when returning. Handle errors/unknown aliases without misleading redirect.
- Reliable iframe/demo lifecycle if already used: origin/nonce/session validation unchanged, visibility/hit-test, skeleton/failed loading, Escape, keyboard close, focus restoration, scroll locking and standalone/embedded behavior.
- Full-screen preview only where an existing mechanism exists or can be safely implemented with accessible close/focus and no changes to trust protocol; no automatic cross-origin `postMessage` trust relaxation.
- Mobile touch safe areas, 320px and 390px, short landscape `844×390` / `820×430` / `768×390`, modal scroll and onscreen keyboard. Do not rely on `toBeInViewport({ratio: .95})` to certify reachable controls.
- Minimal cover/title media fallback when external images fail; different event titles, RTL-like layout expectations not assumed for Khmer, and realistic long program descriptions.
- **Preview is not ownership.** Never pass a preview flag into checkout entitlement logic or update a real account/package state from preview.

The ten renderers' **authored typography, artwork, motion, music/consent, content bindings and identity** remain dedicated. Phase 10 will own major art-direction changes. Verify no unexpected global CSS selectors leak into the renderer root; any small shared preview-shell fix must have evidence and not become an undocumented renderer reskin.

## 10 — Pricing / packages: real commercial transparency

`/pricing` must be a credible, elegant plan comparison, not fictional e-commerce. Read the live `usePackageCatalog`, `packagePresentation`, entitlement/limits service and package DTOs. In the prior published baseline, the helper deliberately returned `null` when amount/currency were absent or invalid. Preserve this critical property.

Requirements:

- Accurate **source-provided amounts, currencies and package codes**. Format `USD` and `KHR` per actual currency; **never convert or merge them without an authorized rate/contract**. Do not synthesize conversion, discounted prices or zero-dollar promises from missing data.
- Source-provided package features: invitation count, guests per invitation, duration days, premium access, seating, QR check-in and any other *actually supported* limit. Render explicit included/excluded/not-specified semantics. `0`, `false`, `null` are not interchangeable.
- Plan cards and comparison area with visual hierarchy and screen-reader-correct associations (`dl`, heading lists, actual `table` with headers for comparison if appropriate). On mobile, preserve comparison completeness instead of hiding features. Keyboard-scrollable wide tables when necessary.
- Names/descriptions may be dynamic server content; wrap Khmer/English naturally. No hardcoded "best", "most popular" or "recommended" badge unless a trustworthy source-backed policy explicitly supports that ranking. Revisit any pre-existing `STANDARD` "Popular choice" badge: verify evidence or replace it with neutral descriptive language.
- Honest difference between **subscription/package access** and **purchase of an individual premium template**, including real account eligibility and expiry/usage limits where the API supports them.
- Clear CTA wording conditional on price, logged-in status and server eligibility. If amount is absent, show unavailable/contact; if backend is unavailable, show state and retry, never static price fallback masquerading as live.
- No optimistic entitlement activation. `PENDING`, `REVIEW`, `VERIFIED`, `FAILED`, `CANCELED` etc. retain **the backend's exact semantics**. Only server-authorized confirmation unlocks premium use.
- FAQ/disclosure must be factual, accessible and consistent with actual supported payments. No invented refund policy, real-time settlement guarantee, discount, provider support, taxes or recurring billing assumptions.
- Loading/error/restricted/empty states must remain accessible and functional with preserved prior selection only where safe.

If approved marketing content is absent, use modest factual labels and flag content review instead of inventing sales claims.

## 11 — Authenticated package management and pre-checkout UX

Phase 09 also owns the **presentation and selection experience** at `/app/packages` and its legitimate aliases, while Phase 21 owns actual payment/settlement integration. Inspect current package state/services, role guard, package history, eligibility and available actions.

Implement clear distinction among: public plan, currently owned/active plan, expired/limited plan, upgrade/renewal inquiry, pending order, denied access and package without a price. Do not change the data model to invent unsupported statuses. Respect account switching and session expiry: late catalog responses from a different identity must not repaint the selected package or re-enable a protected CTA.

Preserve the safe selected package code (e.g. a known `?package=` parameter) through `/pricing` → login → packages, but reject malformed, external, duplicate, sensitive or unauthorized return targets according to the existing Phase 08 continuation helpers. Do not introduce new open redirects or put secrets in query parameters. Check direct URLs, Back, refresh and two-account scenario with fictional fixtures. Expose honest consent, terms or purchase guidance **only when actually available in the code/product policy**.

When a selected design and selected plan interact, preserve their identity separately; a package purchase does not automatically identify a particular template unless the server says so. Do not introduce a second client-side entitlement cache independent from the server.

## 12 — Checkout and payment-return decision surfaces (frontend-only boundary)

Examine the current protected template checkout path, payment status/return routes and receipt experience. Implement **clarity and consistency**, not payment settlement. The owner must be able to understand:

- What exact template/package they are checking out and whether it is currently owned, available, ineligible or already pending.
- Which amount/currency the backend returned, and when price is unavailable or changed since selection.
- What step occurs on a provider link/return, and which on-screen state is confirmed versus awaiting review.
- Where to recover from a canceled/denied/expired/offline payment flow without losing valid purchase context.
- That submitting proof, following an ABA link or returning from a provider is **not equal to `PAID` or entitlement granted**.

Keep backend APIs and server-side decisions authoritative. Do not touch webhook signatures, ABA PayWay configuration, Telegram merchant alerts, receipts, transaction mutation, refund/capture/replay/idempotency, Flyway or verification rules. Never simulate successful server payment with a frontend local flag. Any real financial test is out of scope unless a safe authorized sandbox is provided and separately approved; use fictional read-only mocked responses for Phase 09.1 UI verification. No bank details, tokens or real account data may appear in artifacts.

## 13 — Discovery-to-auth and discovery-to-creation continuity

Map actual intent mechanisms: `useTemplateContinuation`, `safeRedirect`, `RequireAuth`, source template code/slug, package selection and owner creation entry. Phase 08 Codex repaired path/query sanitization and profile/account race behavior. **Do not simplify those protections to make a stylish CTA work.**

Required checks:

- A user with an active search/selection follows **Use design**; if authentication is required, `next` remains a validated same-origin target with no token/private data attached.
- After sign-in, registration or provider sign-in, restore the actual permitted destination. If entitlement is absent, show the correct next step instead of entering protected Studio/checkout.
- A failed or canceled provider does not lose safe intent where existing contract supports it, nor loops indefinitely between guards.
- Event creation consumes template identity using the existing supported entry path and respects server data; no speculative new draft serializer or event creation side effects.
- Alias redirects preserve safe search/hash where expected, and unknown stable codes do not collapse onto another paid design via a numeric key.
- Outbound preview and in-app navigation must use genuine semantic links/buttons; keyboard/touch return is deterministic.

The prior open `C08-013` password encoder discrepancy is **outside this marketplace implementation's security ownership**; do not change its hashing rules or make speculative password-limit edits. Preserve the Phase 08 state exactly and carry the open gate to Codex/backend policy owners.

## 14 — States are the product: comprehensive interaction matrix

For every affected route/component, inventory and implement, where truly supported:

| Dimension | Required representative cases |
|---|---|
| Auth | anonymous, authenticated eligible, authenticated ineligible, logged out during request, expired/bootstrap error, switching identity |
| Catalog source | loading, ready, no catalog items, no filtered matches, offline/network error, 401/403, partial metadata, slow/deleted item |
| Item | free, premium, owned, no entitlement, price unknown, active/published, unknown or unavailable, missing thumbnail |
| Search | initial query, whitespace, Khmer mixed-script, no matches, category switch, clear, Back/Forward, keyboard focus |
| Package | absent price/currency, USD, KHR, 0 actual price, feature false/unknown, empty catalog, pending/expired/active if API supports |
| Preview | initial loading, media error, modal open/close, direct entry, Escape, focus return, landscape, reduced motion, renderer unknown |
| Checkout | unauthenticated, denied, pending, review, canceled, failed, verified **only when server says so**, multiple submissions |
| Content | English, Khmer, long names/numerals, missing translation, UI dark/light, 200/400%-equivalent reflow proxy |
| Motion/input | normal/reduced, mouse, keyboard-only, touch emulation, low bandwidth, WebKit/Firefox where supported |

Create a **route-state matrix** with `SOURCE-MAPPED`, `IMPLEMENTED`, `FIXTURE VERIFIED`, `REVIEW REQUIRED`, `BLOCKED`, `NOT TESTED` evidence qualifiers, not blanket claims from a single desktop screenshot. Build representative correct DTO fixtures; mark unsupported live backend states as blocked instead of fabricating persistent data.

## 15 — Responsive system, safe areas, and mobile interaction craftsmanship

At a minimum visually inspect and functionally probe **320, 360, 390, 430, 600, 768, 820, 1024, 1440 and 1920 CSS px**, plus breakpoint neighbors and **short landscape 844×390, 820×430, 768×390**. Include long Khmer chips/headings, high font sizes, browser zoom equivalents and actual keyboard simulation as available. Avoid claiming native browser menu zoom or real mobile keyboard verification when only emulation exists.

No document-level horizontal overflow or clipped critical CTA; local horizontal scrolling is allowed for a properly labeled comparison table. Maintain usable touch targets (prefer at least 44×44 CSS px where space permits), safe-area insets, sticky filter/header stacking, modal scroll isolation, focus visibility, viewport when address bars shrink, and orientation rotations.

Preserve Phase 06 verified `ScrollToTop` Back restoration, native drawer focus/`inert`, breadcrumb navigation, short-landscape Studio reachability and `ResponsiveTable` keyboard behavior. Do not install a second global focus manager, body scroll locker or route animation curtain. The marketplace's search/filter focus must survive typing, results updates, theme/locale switch and Back where supported. The card CTA should never become offscreen or visually hidden because an entrance animation failed.

## 16 — Khmer/English, semantic content and typography

Audit **all newly introduced copy and relevant existing marketplace labels in both languages**. Ensure:

- Real locale store and correct translation source used; do not embed unreviewed English-only action names in Khmer screens.
- Khmer type shaping/diacritics, generous line height, wrapping and dynamic card/button heights; Latin-only display fonts never become Khmer fallback without valid glyphs.
- Search category/preview/ownership/plan/discount/price words convey their actual product meaning. Avoid claiming live inventory, verified sales numbers or instant payment.
- Numbers/dates/currencies formatted from actual data with `Intl` or existing helpers, respecting USD vs KHR precision and not making a conversion claim.
- Screen-reader labels on icon-only clear/filter/preview/fullscreen/close controls. Error and status announcements understandable; avoid duplicate noisy live regions.
- Locale changes preserve current catalog selection and valid form input. Document values that cannot be safely preserved.

**Formal native Khmer linguistic/diacritic approval is still BLOCKED — EXTERNAL.** Automated Khmer route render and computed font probes are evidence of geometry, not linguistic approval. Provide a review-ready phrase list with context and screenshots.

## 17 — Accessibility requirements: WCAG 2.2 AA as actionable checks

Use meaningful landmarks, heading hierarchy, `aria-labelledby` and clear button names; ensure cards/demos/dialogs follow native semantics. Keyboard navigation must work without pointer gestures. Test Tab/Shift+Tab, Enter/Space, Escape, focus return, modal trap/inert behavior, image alt, field feedback, selected filter groups and table comparison labels. Avoid nested interactive nodes and tooltip-only prices.

Check normal and high-contrast dark mode; pressed/selected/disabled/focus states; text contrast and meaningful icon contrast. Include `prefers-reduced-motion`, forced colors and text spacing probes, reporting any computed forced-colors failures as **review**, not pretending axe alone proves compliance. Existing Phase 08 forced-colors finding remains explicitly open until independently resolved.

Run **axe on actual rendered interactive states**, not just initial root mounts: populated catalog, filtered zero state, preview open, package comparison, error/retry, checkout pending/denied, auth continuation. Measure which scenes and browser projects were inspected. Device/VoiceOver/TalkBack/natively zoomed testing is blocked without actual hardware/authorized runtime; never equate emulation with physical certification.

## 18 — Motion, media and selective 3D: luxury without obstruction

Reuse Phase 05 motion tokens/React animations where possible. Premium marketplace feedback may use subtle stagger, reveal, cover motion, elegant filter transitions and preview entry, but **never** make pricing, purchase state, keyboard focus or a primary action wait for animation completion.

Reduced motion must render important content immediately, allow preview close/Skip, remove unnecessary parallax and preserve the same actions. Do not autoplay guest media or music from catalog cards. Lazy-load large preview media outside critical home/catalog path; provide poster/thumbnail fallback; respect media denial and no network. Use image aspect ratios, `decoding=async` selectively, and prioritize LCP hero images intentionally rather than lazily loading the initial critical image.

No new unreviewed Three.js/GSAP/shader bundle or speculative 3D recommendation. An optional effect requires named user benefit, original/licensed assets, frame/memory/payload evidence, low-power fallback, reduced-motion alternative and scope approval. Invitation family cinematics remain Phase 10/16 owners, not a universal marketplace effect.

## 19 — Image/content/IP rights and marketing truth

Treat project assets as potentially licensed for limited purposes. For each newly introduced photo/graphic/font/icon, record origin, license, attribution if required, redistribution conditions and exact file path. Prefer existing project-cleared assets and original CSS shapes; do not import a popular design library's proprietary assets or a third-party illustration without rights evidence. No external stock images implying a real designer/template or venue that is not the actual source.

Preserve Phase 07's open **venue-photo provenance/facts** and oversized **2.40 MiB marketing background** review gates without silently removing or falsely resolving them. Do not rewrite the Phase 07 marketing homepage wholesale or introduce fake trust proof. If image license is unresolved, do not add it; mark `REVIEW REQUIRED`. Preserve legal privacy/account URLs, contact/help aliases and existing SEO metadata repairs.

## 20 — Implementation boundaries and security/preservation contract

The following must remain true before and after Phase 09.1:

1. **Backend-owned** template publication, price, currency, plan active status, owner entitlement, purchase status, payment proof and account/role decisions remain authoritative.
2. `USD` and `KHR` do not mix; never turn missing price into `0` or `FREE`; never render `PAID` for mere return or proof submission.
3. All **48 historical Flyway migrations** and backend services are untouched by this frontend stage. Do not change Java config, migration SQL, webhook handler, Telegram worker, payment integration or data model.
4. All **10 dedicated guest renderer families, 38 static aliases, two shared IDs and fallback behavior** remain intact. The resolver's stable code/slug/preset precedence outranks a potentially colliding numeric database ID.
5. Trusted preview iframe origin, nonce/session and message protocol are not weakened or bypassed.
6. Unknown JSON fields, draft persistence and creator-authored content are not rewritten/stripped for prettiness.
7. Existing role separation between customer and admin apps remains. Public demo does not grant premium Studio access.
8. Phase 07 marketing and Phase 08 identity/account patches (especially `C08-001..012` fixes) remain preserved. Safe continuation and reset token privacy cannot regress.
9. Open `C08-013` BCrypt 72-**byte** encoder constraint remains `OPEN — BACKEND POLICY OWNER`; no frontend-only masking by imposing an arbitrary character limit or rewriting hash logic.
10. Tests use fictional data and intercepted read-only DTOs; avoid real provider/network writes. No secret in committed/logged screenshots or JSON.

Add targeted negative tests around the most likely accidental violations: unknown slug chooses wrong family, preview leaks entitlement, stale/account-switched CTA reflects another identity, missing currency displays free, pending checkout looks verified, unsafe `next` path accepted, bad image and failed media crash UI.

## 21 — Explicit carryover recovery: preserve the complete prior work ledger

**Do not shrink the project to Phase 09.1.** The previous Codex Phase 08 audit reports:

- **57 historical cross-phase IDs:** 29 `CLOSED — VERIFIED`, 2 `CLOSED — NOT APPLICABLE`, 6 `REVIEW REQUIRED`, 16 `BLOCKED — EXTERNAL`, 4 `DEFERRED — DOMAIN OWNER`.
- **Five additional AUTH items** separate from those 57; **nine Phase 07 partial acceptance gates** also require continued tracking.
- Phase 08 independent 26 gates: **11 `VERIFIED — LOCAL`, 11 `PARTIALLY COMPLETE`, 2 `REVIEW REQUIRED`, 2 `BLOCKED — EXTERNAL`**.
- **C08-013** unresolved server encoder policy mismatch, plus previous external/native gates.
- Historical Phase 02 browser suite **26 PASS / 6 known assertion FAIL** (three named assertion types × two projects) under the controlled baseline. Do not change the historical test's Khmer exact labels or a 95% iframe visibility assertion merely to get green; approval must come from the named native copy/QA owners. Keep replacement behavioral tests distinct.
- Phase 07 venue photo rights/content and server SEO fallback, native Khmer review, real iOS/Android/AT/zoom, live providers/SMTP/MySQL/catalog, field CWV/INP, default-worker reliability and Phase 08 forced-colors issue are not closed by marketplace screenshots.

Read the **actual local JSON ledgers** `evidence/57-carryover-updated.json`, the separate AUTH register, Phase 07 acceptance matrix and Phase 08 acceptance matrix. Copy **each ID unchanged** to a newly dated Phase 09.1 carryover report with previous disposition, current evidence and named next owner. Close only a directly verified item; do not claim source mapping is a live test. Reopen prior closed items if a real regression appears, with negative-first evidence. A deferred Phase 10/16 template media journey is not automatically Phase 09 work; a marketplace use of a shared component may warrant scoped repair but not a broad reskin.

**Special direction:** The BCrypt 72-byte failure was an actual explicit encoder rejection using the installed version, **not** proven truncation or credential compromise. Report it exactly. Backend identity/security and product policy owners must resolve it with backward-compatible validation/hashing design and tests; Gemini frontend should not attempt this policy change.

## 22 — Work in complete, reviewable vertical slices

Execute the following sequence with a working app and a short verification log after each slice; you may reorganize based on discovered source dependencies, documenting why.

**Slice A — Before snapshot and real contracts.** Record Git tree, route-ownership matrix, current UI/copy/media assets, DTOs, account/entitlement boundaries, prior unit/E2E baselines; capture consistent fictional before scenes for public catalog, detail/demo, pricing, account packages and checkout decisions at desktop/mobile, Khmer/English and light/dark.

**Slice B — Design system and catalog.** Upgrade structural typography, intro, search, filter, sort (only supported fields), result/empty/error/demo states and responsive grid using existing semantic tokens. Ensure no price/identity/regression issue before proceeding.

**Slice C — Cards and detail/preview.** Upgrade card content/actions, media fallback, focused selection and full demo/preview interactions; verify stable renderer identities, exact trusted preview protocol, focus/Back state and reduced motion.

**Slice D — Pricing and plans.** Implement truthful package comparisons and CTA routing; test currency/amount/limits and missing value semantics in both languages, light/dark, empty/restricted/error.

**Slice E — Authenticated ownership and checkout decisions.** Integrate existing authenticated account packages and preview-to-purchase/creation entry without granting anything on the client. Exercise pending/denied/expired/offline and safe sign-in continuation.

**Slice F — Unified finishing and regressions.** Consolidate real route states, responsive/a11y/motion/performance, negative permission tests, before/after visual review and evidence. Fix actual defects found inside the authorized frontend scope; document unresolved external/backend gates precisely.

At no point should you stop after design mocks and claim implementation. Likewise, do not implement outside primary Phase 09 domain simply to inflate changed file counts.

## 23 — Testing: reproducible commands, unchanged baselines and honest counts

Run from repository root; use actual package scripts and Playwright configuration. These commands are starting points — verify paths and live test names locally:

```powershell
# Integrity and route factories
node scripts/sync-design-tokens.cjs --check
npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx
npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx

# Marketplace, package and checkout focused tests (discover actual test filenames)
npm --prefix apps/frontend-user test -- src/features/templates/
npm --prefix apps/frontend-user test -- src/features/marketing/

# Full frontend unit, lint, production bundles
npm --prefix apps/frontend-user test
npm --prefix apps/frontend-admin test
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build

# Controlled history / cross-phase browser checks with aligned local preview origins
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --reporter=line --workers=2
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --reporter=line --workers=2
```

Reconcile and also run actual locally available **Phase 07 marketing** and **Phase 08 identity** tests, route-content sweep, and existing catalog/demo/checkout tests. Add **dedicated Phase 09.1 Playwright cases** under a uniquely named spec and target **real route behavior**, not only snapshots or static AST selectors. Prefer browser tests in Chromium, Firefox and WebKit at relevant viewports, while respecting local runner capacity and origin alignment.

Evidence must include:

- **Before/after** source SHA/worktree fingerprint; the Phase 08 report's 1,562 user + 202 admin tests, 29 backend, 132 shell, 252 marketing, 168 identity and 270 route checks are **historical reported baselines**, not guaranteed current values.
- Each command text, execution location, start/end/source fingerprint, exit code, exact pass/fail/skip counts, actual test file, trace/screenshot/log location and whether a failure was fixed, flaky, known historical or newly introduced.
- In the prior report the controlled browser group passed **144**, separate Phase 06 **132**, Phase 07 **252**, Phase 08 **168**, route sweep **270**, default **68/68**, Phase 02 **26/6**. Do not quietly change denominators or combine overlapping suites into fictional independent coverage.
- If default-worker execution differs from controlled `--workers=2`, report both, host resource observations and whether it reproduces. Never hide a failing default run by presenting only the controlled result.
- At least one dedicated negative test each for missing price/currency, unknown slug collision, premium preview not granting access, purchase pending, return after safe sign-in, error/retry, reduced motion, keyboard Escape/focus restore and Khmer text wrapping.
- API fixtures must be deterministic and fictional, versioned; no backend writes, no real ABA/Telegram/Google calls or production catalog modifications.
- Do not weaken or delete Phase 02 QA-NEW-01/02/03 expectations, bypass permission guards, suppress `console.error` globally, or increase test timeouts as a substitute for diagnosing a defect.

A genuine failing product contract should receive a negative-first reproduction, scoped fix, targeted rerun and broader regression. If permissions for a sensitive repair are absent, document the blocker and owner rather than improvising policy.

## 24 — Browser visual coverage, accessibility and UX inspection matrix

Capture paired screenshots from the **same fictional route/state/viewport/theme/locale/motion and data seed**, before and after, including:

1. `/templates` initial populated catalog and category/price/search selected.
2. Zero-match and empty-live-catalog state; server error/retry and demo fallback correctly labeled.
3. Free/premium/owned/unknown/unavailable cards, broken cover media, hover/focus/touch actions.
4. Actual detail/demo and preview open/closed; normal/reduced motion; keyboard/short landscape.
5. `/pricing` filled backend DTO in USD and KHR, unknown amount, feature comparison and restricted/error/empty states.
6. `/app/packages` guarded eligible/denied/expired/pending account context, where real source supports it.
7. Protected checkout decision and backend-confirmed vs pending/failed statuses, with mocked responses clearly identified.
8. Auth continuation before/after sign-in with safe `next`, plus returning to filtered catalog.
9. Long Khmer and English, light/dark, widths 320/390/768/1024/1440/1920 and at least one 844×390 landscape case.
10. Template fallback and selected representative dedicated families only as **preservation checks**, not a claim to have certified the full live registry.

For each visual finding classify `PASS`, `FIXED`, `REVIEW REQUIRED`, `KNOWN BASELINE`, `BLOCKED`, `NOT TESTED` with actual image pair path and source hash. Do not call a screenshot pixel-identical when it visibly differs. Timed artwork may legitimately vary; diagnose paint/reveal differences, not arbitrarily force screenshot equality by deleting animation. Store large raw binaries in the configured ignored `output/` folder, and tracked manifests/markdown/JSON under the new Phase 09.1 report directory. A local `D:/` path is not a publicly usable link.

Axe zero findings for named scenes are **not** a WCAG device/AT certificate. Supplement with focus/keyboard, forced-colors, color contrast, touch target, RTL-independent Khmer font, reflow, and manual visual review evidence.

## 25 — Performance and bundle criteria (diagnostic, not invented production SLAs)

Measure baseline vs after using equivalent production builds and **correct final asset hashes**. Use the prior project's Date-only wall-clock fixture technique if still appropriate; do not override browser native navigation/performance entries with a frozen full Playwright clock. Control browser version, CPU/network, build origin, fonts, caching, viewport, motion, sample count and resource interception. Never compare a Phase 05 baseline to a Phase 09 after build without noting the intervening local work.

Record relevant **cold/warm** navigation, FCP, LCP element, CLS, route request transfer bytes, emitted gzip/Brotli totals, resource count, bad image media loads and interaction responsiveness where measurable. Distinguish entire emitted bundle from initial route transfer. Include at least catalog, pricing, detail/demo and checkout decision and the marketing home route as a regression sentinel. Measure after the **final** CSS edit, not a pre-fix build.

Diagnostic review triggers may reuse the Phase 05 lab's matched-condition rule: **load/FCP/LCP increase by both >100 ms and >20%; initial transfer increase by both >20 KiB and >10%; CLS increase >0.02**. These are **change review conditions**, not proof of field Core Web Vitals. If sample variance crosses a threshold, mark review pending and rerun with more trials; investigate render-blocking fonts, image priority, duplicate requests, lazy-chunk delays and unmounted preview work. The canonical field goals (p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1) must not be reported as achieved without approved field telemetry. No real-user INP is available from this frontend local task.

Avoid loading ten dedicated renderer bundles, full video/audio, remote UI libraries or all pricing media eagerly on `/templates` when only cards are required. Prevent gratuitous animation bundles and global CSS leakage. Report new package dependencies exactly (ideally **none**) and justify any one with license, tree-shaking and measured route impact.

## 26 — Required documentation and evidence package

Create a new, clearly named directory, e.g.:

`docs/uxui/phase09-1-gemini-marketplace-experience-2026-11-18/`

If the execution date differs, use its actual date; do not overwrite an older phase's report directory. Deliver at minimum these **20 complete Markdown reports** plus machine-readable evidence:

| Filename | Required content |
|---|---|
| `README.md` | Executive summary, **PARTIALLY COMPLETE/COMPLETE only with bounded meaning**, routes, diffs, tests, blocked gates, navigation index. |
| `01-git-baseline-local-dirty-worktree-and-attribution.md` | Branch/HEAD/origin, 13 local commits preservation, modified/untracked source fingerprint, per-file patch ownership. |
| `02-source-route-state-and-component-inventory.md` | Full Phase 09 route list, guards/aliases, 135/62 reconciliation, actual imports, direct and transitive consumers. |
| `03-original-ux-art-direction-and-design-system.md` | Brand concept, design decisions, tokens, type, Khmer editorial compositions and dark mode. |
| `04-template-discovery-search-filter-sort-implementation.md` | Catalog fetch contract, real filters/search/category/sort, state and keyboard behavior. |
| `05-premium-template-cards-identity-and-media.md` | Card architecture, identity resolution, free/premium/owned status display, missing image fallback, asset provenance. |
| `06-template-detail-demo-preview-and-navigation.md` | Real renderer protocols, close/focus/Back, unknown keys, embedded/standalone; no entitlement leak. |
| `07-pricing-public-package-comparison.md` | Source DTO amounts/currency/feature limits, missing data and server error behavior. |
| `08-authenticated-package-selection-and-entitlements.md` | `/app/packages`, status/ownership presentation, package-to-auth continuation, identity switch. |
| `09-checkout-return-and-honest-payment-state-ux.md` | Pending/review/denied/cancel/unavailable vs verified, no server mutation, flow evidence. |
| `10-khmer-english-copy-and-content-truth.md` | Localized copy, glossary, terms requiring native review, no unsupported claims. |
| `11-responsive-safe-area-keyboard-and-focus.md` | Tested widths/landscape/scroll, focus management, Back state, mobile touch/keyboard proxies. |
| `12-accessibility-contrast-theme-and-reduced-motion.md` | Axe scene details, manual keyboard checks, forced colors, theme/locale and limits. |
| `13-performance-payload-media-and-rights.md` | Comparable build hash/timing/bytes, image priorities, licensing review, caveats. |
| `14-exact-test-commands-and-failure-register.md` | Every actual command, counts, exits, flaky/fixed/baseline/blocked descriptions and trace links. |
| `15-confirmed-defects-fixes-and-reproduction.md` | Only verified defects, cause, negative-first reproduction, source repair, tests and outstanding risks. |
| `16-independent-review-ready-phase09-1-acceptance-matrix.md` | Gate-by-gate implementation claims with **honest** evidence; independent Codex status left pending. |
| `17-cross-phase-carryover-57-plus-auth-and-marketing.md` | Every historical ID unchanged, extra AUTH/Phase 07/08 gates, C08-013 and owner. |
| `18-changed-files-preservation-and-selective-rollback.md` | Per-hunk attribution, protected source proof, safe reverse-only new changes and dry-run. |
| `19-phase09-codex-independent-audit-handoff.md` | Precise new-changes inventory, known defects, contested claims, audit routes/fixtures/commands, security risks. **Do not execute Codex Phase 09.** |
| `20-open-gates-owners-and-final-status.md` | External/manual/device/provider/catalog/password/field rights/content decisions, next owner and evidence prerequisites. |

Machine-readable artifacts to provide under `evidence/`: `git-worktree-baseline.json`, `changed-files-attribution.json`, `route-state-matrix.json`, `template-catalog-source-map.json`, `renderer-preservation.json`, `acceptance-matrix.json`, `57-carryover-updated.json`, `additional-auth-and-phase07-gates.json`, `defect-register.json`, `test-command-results.json`, `screenshot-manifest.json`, `accessibility-matrix.json`, `performance-comparison.json`, `asset-license-review.json`, `security-preservation.json`, `evidence-validation.json`. Generate only what you can actually populate; absent data must be `NOT TESTED`, not invented JSON.

Link all reports with correct local relative paths. Document reproduction scripts for ignored screenshots where feasible; run link verification. A previous `StyleSeed` lock was unavailable—do not invent a valid lock or conceal dependency/license uncertainty. Preserve existing reports and their evidence unchanged.

## 27 — Acceptance gate specification: F09.1-01 through F09.1-30

Use these **30 mandatory gates** in the implementation acceptance matrix. Each must have `status`, `source`, `actual_test`, `evidence`, `limitations`, `next_owner`. Allowed statuses: `VERIFIED — LOCAL`, `PARTIALLY COMPLETE`, `REVIEW REQUIRED`, `BLOCKED — EXTERNAL`, `FAILED`, `NOT TESTED`, `N/A — PROVEN`. A `VERIFIED — LOCAL` result is **not** the final Codex independent Phase 09 sign-off.

| Gate | Exact requirement |
|---|---|
| **F09.1-01** | Dirty Git/13 local commits and all Phase 07/08 uncommitted patches preserved; no push/commit/deployment. |
| **F09.1-02** | Current local Phase 09 route and component graph completely reconciled; aliases and guards preserved. |
| **F09.1-03** | Premium coherent editorial art direction implemented; template artwork remains independent. |
| **F09.1-04** | Public catalog displays truthful source data with correct loading/error/demo/empty states. |
| **F09.1-05** | Localized search, category/filter and only source-supported sort work on keyboard/touch. |
| **F09.1-06** | Filter clear, zero-results, Back/Forward and focus/context retention work. |
| **F09.1-07** | Cards represent real IDs, localized content and correct image/fallback, never false entitlements. |
| **F09.1-08** | Free/premium/owned/unknown/unpublished display states distinguish known and unknown source data. |
| **F09.1-09** | Template detail/demo/preview controls are functional, responsive and accessible, including direct URL. |
| **F09.1-10** | Trusted preview origin/nonce/session protocol unchanged and tested for representative negative cases. |
| **F09.1-11** | All 10 dedicated renderer families, 38 aliases, two shared IDs/fallback identity precedence preserved. |
| **F09.1-12** | Safe return to catalog and template-to-create/auth continuation, no broken `next` semantics. |
| **F09.1-13** | Public pricing uses only backend-owned packages, amount, currency and limits. |
| **F09.1-14** | USD/KHR formatting and missing/zero/invalid amount semantics are correct and tested. |
| **F09.1-15** | Feature comparison complete and accessible at mobile/desktop, with true/false/unknown. |
| **F09.1-16** | Public package/authenticated package transitions preserve validated package context. |
| **F09.1-17** | Actual `/app/packages` eligible/unavailable/pending account UI source states accounted for. |
| **F09.1-18** | Checkout selection, status, return and recovery are truthful; provider return not treated as verified. |
| **F09.1-19** | Session/role/entitlement/unknown ID negative cases do not leak owner-only behavior. |
| **F09.1-20** | EN/KM copy and typography render without geometry loss, with native linguistic gate explicit. |
| **F09.1-21** | Light/dark contrast, focus/disabled/error states and forced-colors review recorded. |
| **F09.1-22** | Responsive 320–1920 and short-landscape plus keyboard/safe-area evidence attached. |
| **F09.1-23** | Reduced-motion/media consent and preview fallback do not block essential actions. |
| **F09.1-24** | Named axe/browser interactions pass or failures are documented; physical AT/zoom remains truthful. |
| **F09.1-25** | Matched final-build performance, request payload and assets measured with variance; field CWV not claimed. |
| **F09.1-26** | No new unlicensed image/graphic/font/library, no invented commercial content or unapproved feature. |
| **F09.1-27** | Preserved backend, migrations, account privacy, payment decisions, unknown JSON, renderer trust. |
| **F09.1-28** | Full unit/build/lint/token and applicable Phase 02–08 browser regressions with exact counts. |
| **F09.1-29** | All 57 historical IDs + five AUTH + Phase 07/08 partial gates/C08-013 accurately carried forward. |
| **F09.1-30** | Complete documentation, screenshot/trace provenance, selective rollback and Phase 09 Codex handoff. |

If any gate is partially implemented or cannot be meaningfully tested, give a **specific** missing action/evidence and owner. No blanket 30/30 PASS merely because lint/build passed or all routes rendered. The later Codex audit will challenge these statuses independently.

## 28 — Final delivery format and independent Codex handoff

Finish in the *current execution response* with a precise summary:

1. **Overall status** — `COMPLETE LOCALLY` or `PARTIALLY COMPLETE`, with unfinished gates named. Never claim release-certified/production-complete without external evidence.
2. **Git status** — branch, starting/current local SHA, observed remote SHA, local commit preservation, exact modified/untracked totals, whether any tracked/committed/staged/pushed changes occurred (expected **none**).
3. **What actually changed** — vertical slices by route, major components, screenshots, accessibility and design decisions; distinguish source edits from documentation.
4. **QA matrix** — exact tests with denominator and failures: new Phase 09.1, old Phase 02 known-red, Phase 04–08, route factory and sweep, user/admin unit, lint/build/token checks. Include new failures or resource limitations, not just green rows.
5. **Acceptance gates F09.1-01..30** — counts per status and link to evidence matrix.
6. **Cross-phase ledger** — retain all 57 prior IDs plus 5 AUTH, 9 Phase 07 partial gates, Phase 08 pending gates and `C08-013`, with closure proof only where direct.
7. **Security preservation** — named source categories unchanged, protected hash/diff results, API/entitlement boundaries.
8. **Unfinished and external** — native Khmer, real phones/AT/native zoom, server-rendered metadata/catalog rights, provider/SMTP/MySQL, payment settlement, backend BCrypt policy and field metrics. Explicit owners and prerequisites.
9. **Rollback** — selective hunk-level reversal only for Gemini Phase 09.1; do not use destructive broad checkout or delete prior untracked reports.
10. **Delivery paths** — README, all reports and machine evidence and the **`19-phase09-codex-independent-audit-handoff.md`**.

**Important distinction:** Your self-verification is Phase **09.1 Gemini** only. **Do not write or run the full Codex Phase 09 prompt and do not declare independent certification.** The user will supply your final report, changes, screenshots, Git state and handoff to ChatGPT. Only then will a separate Phase **09 Codex Full Audit + QA + Fix** prompt be produced, tailored to what you actually implemented and what remained broken. The same Gemini-then-Codex cycle continues through Phase 27.

---

# Final quality rule

**Make it genuinely beautiful, genuinely usable and genuinely truthful.** The expected result is a polished premium marketplace that helps Cambodians choose an invitation, compare real plans and navigate the existing secure purchase path—not a fake concept, not a static design-only mock, not a universal re-skin of unique wedding art, and not a "green" report obtained by deleting tests, loosening security or hiding external blockers.
