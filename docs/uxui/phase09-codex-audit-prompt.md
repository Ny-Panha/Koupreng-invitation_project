# KOUPRENG E-INVITATION — PHASE 09
## FULL CODEX INDEPENDENT AUDIT, QA, BUG FIXES & COMPLETION GATE
### Premium template marketplace, discovery, previews, plans, pricing and purchase-decision experience

**Execution owner:** OpenAI Codex — independent reviewer, senior React/security engineer, accessibility specialist, QA lead and regression fixer.  
**Upstream implementation owner:** Gemini, Phase 09.1.  
**Follow-on owner:** Gemini, Phase 10.1 (invitation renderer art direction), **only after this independent Phase 09 review and handoff**.  
**Repository:** `Ny-Panha/Koupreng-invitation_project` — use the user's **actual local working tree**, not the lagging remote as a replacement.  
**Program:** 27-phase whole-product premium UX/UI transformation.  
**Document role:** Full implementation-and-audit execution prompt. **Do real work**; do not stop at planning, screenshots or a report.  
**Overall starting verdict:** Phase 09.1 self-reported **PARTIALLY COMPLETE**; Phase 09 is **NOT independently accepted** until your verification.

---

## 00. Non-negotiable mission and success standard

Independently analyze Gemini's Phase 09.1 implementation in the full actual repository, reproduce or challenge its claims, deeply test every real Phase 09 route, interaction and data state, identify and repair reproducible frontend defects, measure regressions, preserve high-quality visual artistry, and deliver a carefully evidenced Phase 09 acceptance decision. This is **not** permission to replace premium UX with plain default controls for easier testing, to rewrite identity/payments/backend logic, or to make existing suites artificially green.

The product must function as a credible, Cambodian, Khmer-first premium invitation atelier: elegant and practical for visitors, clear about free/premium/owned choices, transparent about actual packages and currency, safe across authenticated and guest navigation, and honest about payments awaiting server verification. The highest-quality result combines (1) **premium design**, (2) **task completion and accessibility**, (3) **contract/security integrity**, and (4) **measured QA**. An attractive screen without working states is not completion; passing tests that suppress critical Axe rules is not completion; a server-fixture pass is not live-provider certification.

**Your responsibility:** Audit **and fix** feasible confirmed issues. For all unfixable/external/out-of-scope issues, record owner, exact reproduction and required evidence. Maintain the previous phase statuses honestly.

### Completion rubric

- **VERIFIED — LOCAL:** Actual current source + named representative interaction/browser evidence + applicable tests, with scope of certification explicit.
- **PARTIALLY COMPLETE:** Some relevant routes/states checked, but material behavior or review remains unproven.
- **REVIEW REQUIRED:** A disputed finding, aesthetic/content/legal decision, unexpected result or environment ambiguity awaits evidence/approval.
- **BLOCKED — EXTERNAL:** Cannot run physical phone/AT, native Khmer review, authorized provider sandbox, staging catalogue/DB, production RUM, etc.; name who must supply access and what to run.
- **FAILED — CONFIRMED:** Reproducible defect; repair where authorized, and preserve negative-first evidence.
- **NOT APPLICABLE:** Demonstrate by actual route/source graph, not assumption.

Do not declare all of Phase 09 complete merely because its demo browser tests pass. Independently judge product-level exit gates and state breadth.

---

## 01. Required sources, reading order and evidence hierarchy

Before editing, read these files **from the actual local workspace**, and note unavailable material without guessing:

1. `AGENTS.md`, `.agents/ROUTER.md`, `.agents/SKILLS_INDEX.md`. Select **one primary skill and at most two supporting skills**, following the router. Use specialist QA/security/front-end/accessibility skills as warranted; do not load everything.
2. `docs/uxui/MASTER_SCOPE.md` — Phase 09 **and** global preservation/completeness rules. Clarify Phase 10 boundary before modifications.
3. `docs/uxui/phase08-codex-identity-account-audit-2026-11-18/19-phase09-1-gemini-frontend-execution-handoff.md`, its README, defect register, acceptance matrix, and complete local reports/evidence as available.
4. `docs/uxui/phase09-1-gemini-marketplace-experience-2026-11-18/README.md` and all claimed 20 reports, 16 JSON evidence artifacts, exact command log, before/after image manifest, ownership/security register, F09.1 matrix, and `19-phase09-codex-independent-audit-handoff.md`. Verify their existence, hashes and links. The handoff text included with this prompt is a starting claim, **not** an independent audit result.
5. Phase 07 Codex marketing report and open gates; Phase 08 Codex identity report and open gates; Phase 06 route/shell inventory and 57-item closure ledger; previous Phase 01–05 evidence as necessary.
6. Actual source route factories, component graph, template registry, API services, server DTO/permission/payment contracts, selected tests and CSS cascading order.

**Evidence authority:** current local source and runtime behavior > preserved test/log/trace evidence from matching SHA > documented historical findings > agent self-reported PASS > remote GitHub snapshot. Do not treat `origin/main` as representative of uncommitted Phase 07–09 work.

If a path in this brief differs from current source, locate its real equivalent with `rg`/route factories and record the exact path. Do not manufacture files merely to satisfy a guessed pathname.

---

## 02. Immutable Git, dirty-worktree and scope safety protocol — P0 prerequisite

The upstream reports indicate:

- Current branch: `main`.
- Starting local `HEAD`: `2429b76545b683fad2a0a6f328bee3264875edc3`.
- Observed remote `origin/main`: `4d30a8f3bd0b0c1ab63b9111389bfbeb6ece19b4`.
- **13 locally committed Phase 06 commits** reportedly preserved ahead of remote.
- Phase 07 Gemini + Codex marketing modifications, Phase 08 Gemini + Codex identity modifications (including `C08-001` through `C08-012`), and Phase 09.1 Gemini marketplace modifications remain **unstaged/untracked** in a shared dirty tree.
- No push, commit or deployment was authorized in prior execution.

These are historical observations: **first verify today's actual state.** Record `git branch --show-current`, `git rev-parse HEAD`, `git status --short`, `git status --porcelain=v1 -uall`, `git log -20 --oneline`, `git rev-parse origin/main` (only if available), `git diff --stat`, tracked/untracked paths, staged and unstaged changes, hashes of relevant source files. Avoid network fetch if the task's environment forbids it. Check for concurrent teammate edits and do not overwrite them.

### Mandatory protection

- **NO automatic** `git reset`, `git restore`, `git checkout --`, `git checkout .`, `git clean`, `git stash`, hard reset, force push, pull/rebase/cherry-pick, broad revert, blanket file overwrite, history rewrite, commit, push, PR, deploy or production mutation.
- **Do not stage or commit** unless the human separately and explicitly authorizes it later. Produce a final command-free suggested commit plan if useful.
- Preserve all 13 Phase 06 local commits, all Phase 07 and Phase 08 dirty changes, Gemini's Phase 09.1 work, and previous reports. Preserve the Codex C08 security/privacy fixes and the open C08-013 policy gate.
- Treat `dist`, browser screenshots, browser traces, fixtures, test logs and local evidence as generated/ignored unless repository policy explicitly tracks selected manifests. Never wipe existing raw evidence.
- Make **small attributable source fixes**. Capture an immutable pre-audit worktree inventory/diff to a local ignored evidence folder **without exposing secrets**, label each new hunk `CODEX-P09`, and produce a reviewable selective rollback patch that does not revert another worker's modifications. Dry-run reverse application only after checking no unrelated hunk is included. Prefer exact manual reversal guidance over destructive rollback scripts.
- Snapshot route source and test configuration **before testing**, since rebuilding output can change `dist`. Ensure all screenshots/test outputs state the exact tested source hash or tree fingerprint; `HEAD` alone is insufficient in a dirty tree.
- Never introduce hidden provider credentials, real customer/guest information, real payment records, or production endpoints into test logs or fixtures.

Stop and report an environmental blocker only if continuing would endanger unrelated work; otherwise proceed with safe isolated inspection and tests.

---

## 03. Upstream Phase 09.1 claims to VERIFY, not presume

Gemini reports six vertical slices:

**A.** Route/DTO baseline: 135 route patterns (111 customer, 24 admin), 62 feature groups / 63 app-group pairs, 10 dedicated renderer families, 38 static aliases, two shared IDs and fallback.  
**B.** Public template catalog `/templates`: editorial hero, category/free-premium chips, Unicode-safe search, clear button, curated/name sort, skeleton/zero/offline demo fallback.  
**C.** Cards and detail/demo/preview: correct image crop/loading/fallback, Free/Premium/Demo/Purchased badges, no nested interactive descendants, Escape/focus return, existing trusted preview boundaries.  
**D.** Public `/pricing`: backend-driven packages, USD/KHR, absent-price handling, neutral plan labels, keyboard-scrolling comparison and mobile detail expansion.  
**E.** Guarded host browse and checkout: actual owned flags via `paymentService.paidTemplates()`, KPI totals, dark mode, server-authoritative order/entitlement/payment copy.  
**F.** Tests/documentation: six fixes `P09-001`–`P09-006`, 20 reports, 16 JSON files, selected passing tests.

### Exact upstream reported test claims

- Token sync: two application exports passed.
- Both route-inventory suites: two tests each passed.
- Phase 09 focused template tests: **10** passed; templates directory suite: **688** passed; marketing directory suite: **44** passed; auth directory suite: **97** passed.
- Both linters and frontend builds passed; stated 477 kB user and 285 kB admin emitted-index figures need exact interpretation (HTML vs asset, raw vs gzip, entry vs total).
- New Phase 09 Playwright configuration: **42 cases across six browser projects**, zero reported Axe violations with active color-contrast checks.
- Selected Phase 08 identity suite **18** passed and selected Phase 07 featured collection suite **8** passed.
- Gemini labels overall **PARTIALLY COMPLETE** and claims **25 verified / 5 partial** of F09.1-01..30.

**Critical inconsistency to audit:** The supplied **individual** F09.1-01..30 matrix marks only **four** entries as PARTIALLY COMPLETE: `F09.1-20`, `F09.1-21`, `F09.1-22`, and `F09.1-24`. It marks the remaining **26** entries VERIFIED — LOCAL. The report summary says **25 / 5**. Recount each source row, identify any missing fifth partial gate or incorrect gate disposition, and correct the machine-readable matrix + prose **with documented reasoning**. Never edit evidence merely to match a preferred count.

**Another boundary discrepancy:** Upstream narrative mentions `/templates/:slug/preview` as if a public preview route. Earlier route factories may expose `/templates/:id`, `/templates/:id/demo`, and `/templates/:id/preview` under different shells. Verify exactly which patterns are routed today and which are aliases, iframe views or internal editor paths. Do not certify an invented route.

**Self-reported repairs must be reproduced where feasible:**

- `P09-001` search clear action.
- `P09-002` host browse dark mode.
- `P09-003` pricing contrast and removal of attempted Axe rule suppression.
- `P09-004` category wrapper styles and clear-control CSS.
- `P09-005` dark public catalog legibility.
- `P09-006` unsupported “Popular choice” badge replaced with neutral copy.

For each: identify negative-first trace or source diff, verify exact fixed behavior, and retain the original evidence. An upstream report describes an **attempt to use `.disableRules(['color-contrast'])`** in `phase09-marketplace-catalog.spec.js`. Audit current test code, common helpers and config for `disableRules`, `exclude`, `withRules` omissions, skipped states or altered axe test coverage. Prove color-contrast checks are active on rendered surfaces. A test suite that hides color contrast is not acceptable even if it exits zero.

**Potential touch-target issue needing an actual check:** `.kp-search-clear-btn` is described as `22×22px` with `min-height: auto !important` and `padding: 0 !important`. A small **icon** can be 22px, but the **operable hit target** must satisfy the applicable WCAG 2.2 target-size contract (24 CSS px minimum for AA unless valid exceptions), and the product should usually achieve a **44×44 CSS px comfortable touch target** on mobile. Measure actual hit rect and spacing; do not conflate glyph size with hit target. Fix without distorting neighboring search input, losing semantics or creating an inaccessible overlay.

---

## 04. Full Phase 09 source and route/role/state ledger

Generate a **fresh source-derived route inventory** from current route factories, aliases, guards, lazy imports, and actual component use, not from report titles. Start with these candidate entry paths and resolve all actual patterns:

- Public `/templates`, catalog facets and links, landing featured template surface on `/` (touch only affected interactions).
- `/templates/browse`, `/templates/browse/:id` or equivalent guarded host browsing and selected design states; compare to actual route owner.
- `/templates/:id`, `/templates/:id/demo`, `/templates/:id/preview` (or actual slug/code variants), including iframe boundary and unsupported/unknown IDs.
- `/templates/:templateId/checkout` and any actual checkout-return route; maintain auth guard and safe continuation.
- `/pricing` and authenticated `/app/packages`, plus historical `/dashboard/packages` redirect if active.
- Existing paid templates/owned entitlement routes and sensitive payment-status/receipt handoff **only as necessary to prove Phase 09 CTA boundaries**. Full settlement remains Phase 21.
- Home featured collection and navigation CTAs; auth login/register `next`/template continuation; route-level 404/access-denied handling for malformed/deep-linked template IDs.

Inspect current `apps/frontend-user/src/app/routes/{marketingRoutes,hostRoutes,builderRoutes}.jsx`, lazy route pages and `RequireAuth`, actual catalog/detail pages, `TemplateGrid`, `PublicTemplateCard`, `usePublicTemplateCatalog`, `templatePresentation`, `templateIdentity`, `catalogPolicy`, registry resolver, pricing and package services, host browse/payments/services, checkout, selected preview/renderer tests, and CSS import order. Some paths may have moved.

For **each route/state**, record: `route ID`, path/pattern, role, source component, guard, dataset source, initial/loading/ready/empty/error/offline/403/404 state, permissions/ownership, CTA action, theme/locale, viewport, observed browser evidence, test ID, verdict and uncovered gap. The project total 135 is an inventory target, **not proof of 135 interactive workflows**. Keep all 62 groups/63 app-group pairs accounted for with Phase 09 owner-vs-unchanged classification. Audit all **active Phase 09 route patterns and meaningful states**, and run broad route smoke for preservation.

Do not silently relabel redirects as new content pages, pretend a protected browser path is public, or count a source mapping as successful runtime behavior.

---

## 05. Independent buyer and owner journey matrix

Build and test complete journeys using fictional, isolated fixture identities and server-shaped fixtures:

1. First-time anonymous visitor → home featured collection → full catalog → filter/search/sort → detail/demo → return via Back → create intent/sign in → safe return to target.
2. Returning authenticated owner → catalog → known free design → eligible create/edit action **only if server rules permit**.
3. Returning owner → premium unowned template → preview allowed → clear gated purchase/eligibility CTA → checkout or genuine backend decision.
4. Owner of verified purchased/entitled template → actual authoritative owned status → correct CTA with no purchase re-prompt, respecting event scope.
5. Owner with **pending**, **processing**, **under review**, **failed**, **cancelled**, **expired**, **refunded/revoked if supported** → distinct truthful labels and actions without inferring PAID.
6. User with expired session or forbidden role → protected browse/packages/checkout → login/denied/retry → original safe destination retained only when valid.
7. User on package list → plan comparison → unauthenticated sign-in or authenticated plan check → never infer activation from link/redirect/payment submission.
8. Unknown code, numeric legacy identifier collision, missing image, unpublished/disabled template, no catalog items, provider failure or slow network → appropriate non-deceptive recovery.
9. Language/theme/motion preference changes mid-search, mid-preview and on return; search/filter/sort state retained or reset based on a documented consistent contract.
10. Keyboard-only shopper and low-width touch shopper: all selection, detail, preview, escaping, focus restoration, horizontal comparisons and primary CTA are reachable.

Include a two-dimensional coverage table of **route × meaningful state** and **journey × expected server authority**. Avoid tests that “pass” solely because a fixture grants access regardless of source-verified entitlement.

---

## 06. Discovery, search, filter, sort and offline behavior audit + repair

Inspect and exercise:

- Deterministic ordering and stable keys for `Curated`, localized name ascending/descending; preserve a stable fallback for missing names and equal-sort cases; check `Intl.Collator` behavior for Khmer where applicable, and do not assert arbitrary ASCII order if product policy differs.
- Category chip mapping, unknown categories, duplicate IDs/codes, whitespace, mixed Khmer/Latin, composed/combining code points, case folding, intentionally accented names, percent-sign queries, quotes and long 500-character search; never run unsafe dynamic regex or interpolate raw HTML.
- Clear-search button visible only when appropriate; semantically named in current locale; icon/target separate; `type=button`; focus restored or retained; keyboard activation (Enter/Space), browser native `type=search` clear behavior, touch and IME composition behavior.
- Free/premium filter: distinguish published product metadata from paid eligibility; a missing price, zero price, false `premium`, `live=false`, unpublished/denied design or locally invented demo cannot be implicitly granted as free/owned.
- Pagination/virtualization if present: accessible visible count; sort/filter reset behavior; no duplicate key; content does not jump unexpectedly.
- Loading skeleton and no-results state: no layout flash, actual `aria-live`/`role=status`, no stale results masquerading as current. Retry endpoint/401/403/500/timeout/offline; aborted request on language switch/unmount; race between slow/fast responses.
- Fallback mode when public API unavailable: explicitly mark **demo-only** and **availability/price/ownership unverified**. A failed catalog fetch must not silently display a selectable paid template as if server-published. Ensure fallback card CTA goes to safe demo/try-again instead of unauthorized checkout or creation if live validation is absent.
- Empty library vs zero-filter matches vs transport outage vs denied; reset all active filters reliably.
- Responsive controls: 320/360/390/768/1024/1440/1920, 844×390 and other short landscape, zoom/reflow, long Khmer labels, safe area; no clipped or overlapping search/chips/buttons.

Fix confirmed UX defects while retaining the premium editorial composition and existing shared component conventions. Make narrow tests negative-first and add real-route browser confirmation.

---

## 07. Template card semantics, media and ownership truth

Examine `PublicTemplateCard`, host browse cards, detail screens and the actual `presentTemplate`/`templateIdentity`/server-DTO adapters:

- Stable identity resolution: slug/code precedence over DB numeric IDs, shared identifiers and fallback, 38 static aliases, all 10 dedicated renderer families. Unknown stable codes must not fall back to an unrelated numbered family. Test modern authored template and historical aliases.
- Status taxonomy: published/available, demo placeholder, free, premium, owned/verified, pending, error, unsupported. **Never compute “Purchased” from client-only cached payment request or price zero.** Trace `paymentService.paidTemplates()` semantics, request authentication, filtering and account-switch/cache invalidation before showing any owner badge.
- Cards with multiple actions: valid anchor/link nesting, no nested interactive elements, sensible tab order, descriptive accessible names and context (template title), no hover-only affordance. Distinguish “Preview”, “View details”, “Choose”, “Check eligibility”, “Continue checkout” according to real permission.
- Alt text for decorative vs informative images; correct DOM loading priority; `loading=lazy` only below fold; `decoding=async`; no forgotten `fetchpriority` misuse; correct responsive `sizes/srcset` if supported. Do not assume the first item in an array is actually above the fold for mobile.
- Real media errors: broken image/404, slow response, null thumbnail, unexpected aspect ratio, tall invitation calligraphy, low-resolution preview. Preserve artwork and avoid misleading stock fallback. Verify licensing/provenance of any newly introduced image/icon asset.
- Avoid hardcoded vanity counts and “most popular”, “bestseller”, “limited time”, fake reviews, discounts or inventory. Verify name/descriptions against real catalog DTOs; labels can be illustrative only when explicitly marked.
- Keyboard/touch/focus/motion: large enough hit targets, hover/focus-equivalent information, focus visibility, no image overlays consuming CTA hit targets, reduced motion and data-saver fallback.

**Owner status source** is a high-severity audit item: test account switch/logout while an ownership request is in flight. Ensure a late response from User A never marks User B's designs purchased; preserve already implemented Phase 08 session isolation semantics.

---

## 08. Demo, detail, preview, modal and trust boundary

Trace **real** public and authenticated preview routes and any modal/fullscreen implementation. Record their rendering owner, route guard, iframe source construction, origin validation, nonce/session validation, cleanup, and preview exit/Back behavior.

Required checks:

- Preview allowed ≠ ownership, paid template entitlements, download, publish or edit rights. Confirm negative fixtures against restricted paid designs and anonymous access.
- Click, keyboard Enter, Escape, close button, backdrop dismissal if supported, focus trap/isolation when modal, focus return, route Back/history, mobile orientation, nested scroll, no body lock leakage after close or unmount.
- Trusted iframe origin/nonce/source check intact. No wildcard `postMessage` trust, no weakening `sandbox`, no broad `allow`, no cross-origin injection, no leakage of auth token/draft/private guest data into iframe URL.
- Correct `iframe` responsive reachability at **844×390** and other short-landscape viewports. The historical ratio `.toBeInViewport({ratio:0.95})` is not valid when iframe intentionally extends beyond short viewport; test actual hit targets, scroll, keyboard and content visibility. Do not weaken an assertion by changing to `.65` merely to turn it green.
- Unknown ID, disabled/unpublished design, missing media, slow loader, no JavaScript/failed preview, interrupted navigation, repeated open/close, two rapid previews, locale/theme switch, reduced motion, full-screen and ARIA naming.
- Ten dedicated renderers + 38 aliases + two shared IDs + fallback: verify registry identity and representative visibility/paint/actions. **Do not reskin or bulk-edit renderer artwork in Phase 09**; Phase 10.1 owns per-family art direction.
- Ensure `template-to-create` continuation survives sign-in and never authorizes purchase by query string. Reject cross-origin, malformed nested next targets and token-bearing redirect URLs by existing safe redirect rules.

Fix scoped preview UI defects if found, preserving the existing protocol. A security-sensitive protocol alteration requires explicit owner review and independent negative tests.

---

## 09. Pricing, packages, currencies and actual API contract

Inspect the actual backend route/DTO source for public packages, subscription eligibility, user packages and paid templates; do not infer from frontend model names alone. Source-backed rendering is mandatory:

- `subscriptionService.publicPackages()` status and active filtering; status semantics from backend; no optimistic unavailable package display as currently offered.
- `packagePrice()` and package limit formatting: actual currency ISO code, numeric/decimal precision, zero vs null, missing amount, negative, malformed string, unsupported currency, large values, KHR vs USD formatting and locale. **Never convert USD to KHR without approved FX source; never label missing price “free”.**
- Package features/limits: feature flags true/false/unspecified, guest counts, invitation limits and duration days; desktop/mobile semantic parity. Display every actual significant value, not visually simplified but omitted details.
- Payment states: draft/pending/under review/verified/failed/expired/denied/receipt as supported, clear distinction between link click, return URL, client acknowledgment and verified server settlement. **Only trusted backend state may unlock entitlement**. No payment success banner merely on ABA redirect.
- Plan comparison: column/row headings, accessible table or equivalent, mobile details/disclosure names, keyboard horizontal scroll named region only when necessary, no trap on arrow keys, no duplicate/hidden semantic data, print/zoom if relevant.
- Marketing badges: “Full-featured tier” is safer than “Popular choice” but ensure it is factually supported by actual server feature flags; do not invent superlatives or package availability. Check Khmer equivalents with native reviewer pending.
- Host `/app/packages`: loading/error/403, own active plan and eligible upgrade, prices, past/inactive plans, post-return state, graceful degradation, no unauthorized plan purchase.
- Checkout summary: actual template identity, verified server quote/pricing, malformed checkout ID, direct deep link, back/cancel, login, wallet/receipt return, server error/retry and idempotent UI behavior. Full ABA webhook/settlement integration remains Phase 21; do **not** simulate payment success in a real account.
- Event-specific entitlements and unknown JSON/draft fields remain preserved. No DTO schema rewrite for visual convenience.

Use server-shaped mock/fixture data for state tests; clearly distinguish fixture correctness from live MySQL/provider certification. When backend policy cannot be verified, record the exact source and review owner instead of silently choosing client policy.

---

## 10. Premium visual direction, motion and brand preservation

Assess the entire Phase 09 experience as a coherent premium product, not isolated screenshots:

- Maintain the Cambodian invitation atelier identity: cream/ivory, forest/ink, refined gold; readable expressive headings with appropriate Khmer local fonts; ceremonially inspired detail without generic over-decoration. Preserve the public marketing Phase 07 visual improvements and identity Phase 08 design.
- One canonical management token authority in `apps/frontend-user/src/shared/styles/semantic-tokens.css`, synchronized admin mirror using `scripts/sync-design-tokens.cjs --check`. No competing global CSS reset, duplicate root theme, second focus manager or new design-system dependency without reviewed need.
- Review CSS precedence and namespaces: `MarketingPages.css`, `templates.css`, host browse CSS, global marketing chrome and admin/owner components. Inspect computed style, not merely selector existence. Check dark mode, contrast, hover, focus, disabled/busy, selected, empty/error/denied states.
- Check cards/imagery ratio, text wrapping, Khmer headline/label line breaks and diacritics, safe area, decorative ornaments, border/stroke levels, content density, CTA hierarchy and scroll continuity.
- Motion: reuse Phase 05 canonical motion tokens; no global route curtain; subtle hover/press transitions that clarify actions; `prefers-reduced-motion:reduce` must not hide or postpone content; avoid unnecessary 3D/webGL/permanent ambient effects. Do not inflate bundle for gratuitous effects.
- Compare real before/after views with **matching fictional data, locale, theme, viewport, deviceScaleFactor, motion preference and source**. Review dynamic content/animation separately from static pixel parity.
- Preserve originals and document objective fixes vs subjective editorial decisions. Do not remove premium craft just to maximize screenshot similarity; do not impose global marketing typography on authored guest invitations.

---

## 11. Khmer/English localization, typography and cultural claims

Test all Phase 09 routes with English and Khmer switched at key transition points. Include long and mixed-script template names, Khmer numerals and punctuation, Unicode normalization/search, price/currency placement, UI labels, screen-reader accessible names, tooltip text, errors and empty/loading states.

- Source application strings from current translation infrastructure; avoid hardcoded English exceptions in newly designed controls.
- Ensure correct Khmer fonts and line heights, avoid missing-glyph fallbacks, clipped combining marks/diacritics and Latin-only fallback where Khmer is required.
- Check filters and sort semantics: “name A–Z” may be misleading for Khmer; use locale-accurate phrasing or neutral localized ascending/descending names after reviewing policy.
- Show actual product claims; template names, Khmer ceremonial meaning, package descriptions and pricing status must not be invented. Native Khmer linguistic approval is a distinct manual gate.
- Never silently change the three historical Phase 02 Khmer/Studio assertions `QA-NEW-01/02/03`. Current content may be right while old assertions are stale. Preserve original red traces; only a separately approved native-copy/QA maintenance patch may change those expectations, and it must test behavior rather than arbitrary iframe visible ratio.

---

## 12. Accessibility: full interaction audits, not only an Axe headline

Run native semantic inspection and appropriate Axe/Playwright scans for every distinct route/state category. Use **zero rule suppressions** for named WCAG-critical checks unless an explicit justified approved exception is documented; a removed rule silently voids any zero-violation claim.

Minimum manual/automated checks:

1. Single primary page H1 in actual page, sensible heading hierarchy across cards and modals.
2. Named filter groups, pressed/selected state, clear/search accessible label, live results count announcement without excessive spam.
3. Actual **24 CSS px WCAG 2.2 AA minimum** target-size contract (or legitimate spacing/exception) and **44px comfortable target policy** for primary mobile actions. Explicitly measure Gemini's 22px search clear control hit rect.
4. Keyboard focus indicators, logical tab order, dynamic focus after filter reset, no focus loss on unmount.
5. Dialog focus isolation, initial focus, Escape, route history and restore; no backdrop click trap.
6. Real disabled/busy state and buttons using correct `type`, aria names and error relationships.
7. Dark/light/forced-colors/contrast computed at rest/hover/focus/selected/error, all text and icon statuses. Perform actual forced-colors CSS emulation and label it emulation; OS-level forced-colors remains separate.
8. Responsive zoom/reflow, 320px width, 200/400% equivalent CSS reflow; explicitly **do not certify native browser zoom** from viewport substitution.
9. Reduced-motion media query retains all visible content and essential task flow.
10. Screen-reader semantic tree, landmarks, `aria-current`, live regions, table headers and status text; VoiceOver/TalkBack speech/gestures require physical device/AT owner.
11. Screenshot/check both English and Khmer on light and dark, including contrast over actual imagery, transparency/gradient layers and overlays.
12. Ensure status badges are not conveyed by color alone and owned/paid indicators are backed by server data.

If Axe fails, preserve full evidence, fix the source where appropriate and rerun **the unmodified enabled rule**. Do not use `disableRules(['color-contrast'])`, skipped tests or artificially mocked computed colors to claim resolution.

---
## 13. Performance, network, caching, image and bundle evaluation

Use the existing Phase 05/06/07/08 matched-run methodology where applicable, but establish what observations can actually be attributed to Phase 09 changes. Label measurements **local lab** versus actual production field telemetry. No field INP is available by implication. No performance claim follows merely from successful bundling or `loading="lazy"`.

**Measure at minimum:**

- Current frontend user and admin build assets: raw and gzip (and Brotli if pipeline generates it), JS/CSS/HTML by route chunk, precise dependency changes and network waterfall/initial request bytes. Separate dist entry assets from aggregate emitted files.
- Catalog landing and pricing: cold/warm load, FCP/LCP/CLS, image decoded-ready, count of original/decoded bytes, rejected/missing image fallback, and interaction delay for live search, filter, sort and modal open/close. Check LCP candidate: hero/first card image should not be lazily deferred when above fold.
- Checkout and authenticated browse: how prefetch/retries behave across auth switch, 401/403 and response races; no repeated payments/ownership calls from gratuitous rerenders.
- Network fixture caching: stable isolated origin, cache mode, seed, browser version, device emulation, timestamp, host resource conditions. Collect at least three **matched valid repeats** for each critical comparison and preserve ranges/medians, excluding only with explicit documented error reasons.
- Representative widths 390 and 1440, normal/reduced motion, light/dark where they affect paint, fast and throttled network. Avoid interpreting a few local timing samples as field CWV or p75 INP.
- Accessibility/performance interaction: fonts, contrast effects, hover, sticky overlays, skeleton layout shift and oversized images; check loss of usability under slow network/offline.

If a credible before-Phase09.1 source build is not safely available because the working tree is dirty, **do not reset or fabricate a before benchmark**. Use preserved Phase 09.1 evidence only after confirming its source fingerprint/method, or explicitly record `BEFORE NOT REPRODUCIBLE`; produce a fresh current-source baseline and compare Codex's fixes against that. Never attribute preexisting Phase 06 timing volatility or concurrent-run variance to Gemini without a controlled isolation experiment.

Carry forward Phase 07's large marketing background asset review (~2.40 MiB as earlier reported), relevant only if catalog UX loads it or if bundle changes materially affect homepage discovery. Do not broadly re-optimize unrelated media without evidence and ownership review.

---

## 14. Security, privacy, legal and domain preservation — highest-risk guardrails

**Domain/source-of-truth invariants:**

- Authentication/session/role and safe `next`/return intent are server/validated-client governed. No anonymous bypass to `/app/packages`, host template browse or checkout; no cross-account owned status. Preserve Phase 08 C08-001..012 privacy/account-switch protections.
- **C08-013 remains OPEN:** Spring Security BCrypt encoder rejected passwords over 72 UTF-8 bytes in the prior isolated probe although DTO/UI described up to 100 code units. Do not “solve” this by arbitrary 72-character truncation or change crypto/DB schema in Phase 09. Preserve the backend identity/security owner's remediation gate and compatibility concerns.
- Server template publishing/active state, subscription/package visibility, free/premium classification, account entitlements, event ownership, verified payments, order status and currency must remain authoritative.
- ABA/Telegram/payment: do not create real orders, send transfers, call production webhooks or auto-approve entitlements. A checkout redirect or acknowledgement is **not** paid/verified.
- Preserve USD/KHR separation; no exchange rate assumptions or fake discount/availability/inventory urgency.
- Preserve all **48 historical Flyway migrations**, backend/Telegram services, existing upload protections, route guards, API contracts, unknown authored JSON, ownership/guest privacy, invitation renderer code and assets unless a minimal reviewed frontend fix absolutely requires a targeted dependency adjustment. Any backend security fix must be separately authorized, not silently bundled into Phase 09.
- Preserve renderer registry slug/code precedence, 10 bespoke families, 38 aliases, two shared IDs and callable fallback contract. Do not alter `postMessage` source/origin/nonce preview validation or iframe sandbox for convenience.
- Check for unsafe raw HTML and URL construction, cross-origin image trackers/new unlicensed media, link targets (`noopener/noreferrer` for `target=_blank` where applicable), and sensitive query/redirect leakage.
- No real account/customer data, bank details, provider secrets or token-bearing screenshots. Fixtures must use fictional isolated identities, non-spendable orders and no uncontrolled outbound communications.
- Check legal rights and factfulness for template photos, cultural motifs, icon packs, fonts, marketing package claims and any newly introduced imagery; unknown rights stay `REVIEW REQUIRED` until source/license confirmed. Asset reuse is not license certification.

Generate a **protected file diff register** and explicit source/body hashes for sensitive boundaries before and after. Investigate any unexpected change; do not claim “zero backend changes” solely from a Gemini prose statement.

---

## 15. Cross-phase carryover closure: preserve every owner, do not bulk-complete

The upstream Phase 08 audit had **57 original historical carryover IDs** with a reported disposition distribution **29 CLOSED — VERIFIED, 2 CLOSED — NOT APPLICABLE, 6 REVIEW REQUIRED, 16 BLOCKED — EXTERNAL, 4 DEFERRED — DOMAIN OWNER**; it also maintained **five separate AUTH items**, **nine Phase 07 partial gates**, and **C08-013**. The Phase 09.1 report claims these remain intact. **Read the actual current ledgers, count real IDs and preserve their provenance**; do not overwrite them by writing a new 57-row empty table.

For every relevant existing ID and any new Phase 09 item:

1. Preserve stable ID, originating phase, original evidence/owner/disposition.
2. Reevaluate only if Phase 09 code or tests genuinely exercise it; mark `VERIFIED — LOCAL` solely with new source + test + result, not citation to past report alone.
3. Explicitly carry high-interest review items forward: historical renderer pixel variation and blank-frame root cause, template catalog/dynamic published dataset verification, local vs production performance, default Playwright-worker stability, forced-colors and native zoom, 24/44px interaction targets, physical devices/VoiceOver/TalkBack, native Khmer copy, licensed photography and venue facts, backend/MySQL provider integrations, original 6 Phase 02 known assertion failures, auth/session breadth, and C08-013.
4. Assign deferred domain work to the correct owner: Phase 10/16 guest renderer fidelity/media, Phase 11 creation wizard, Phase 21 payments, Phase 25 admin template Studio, Phase 26 accessibility/performance/device, Phase 27 release regression.
5. If Phase 09 has a relevant specialized component/state variant previously deferred from Phase 04, implement and verify it **now**, not blanket defer everything to Phase 26.
6. Track Phase 07's nine partial acceptance gates and Phase 08's 26-gate independent verdict without conflating acceptance-gate counts with the 57 original historical IDs.
7. Distinguish **fix implemented**, **fixture verified**, **manual/field certified**, **review required** and **blocked**. A valid browser simulator cannot close hardware/AT/live-payment gates.

Produce a machine-readable merge/diff for old and updated ledgers: no lost IDs, no duplicated IDs, no change without source/test/owner. Include counts and discrepancy explanations. Report unresolved `C08-013` with correct actual byte-vs-code-unit detail; it must not be inadvertently hidden by Phase 09 pricing tests.

---

## 16. QA setup, execution order and exact mandatory gates

Run commands from the repository root in a correctly configured, isolated fixture environment. Verify the actual `package.json` scripts, Vite preview origin, Playwright configs and webServer ports **before** copying commands. Preserve all failed/intermediate runs and diagnostics. Do not claim to have executed commands that were only described by Gemini. If a command doesn't exist, discover and record its nearest current equivalent; do not fabricate pass counts.

### Stage A — Baseline and source/static gates

```bash
git branch --show-current
git rev-parse HEAD
git status --porcelain=v1 -uall
git diff --stat
node scripts/sync-design-tokens.cjs --check
npm --prefix apps/frontend-user test -- src/app/batch11RouteInventory.test.jsx
npm --prefix apps/frontend-admin test -- src/app/batch11RouteInventory.test.jsx
```

Read route factories/registry and verify all Phase 09 source imports/guards before running any browser suite. Record source fingerprint and artifact origin configuration.

### Stage B — Phase 09 source, contracts and unit tests

```bash
npm --prefix apps/frontend-user test -- src/features/templates/Phase09Templates.test.jsx
npm --prefix apps/frontend-user test -- src/features/templates/
npm --prefix apps/frontend-user test -- src/features/marketing/
npm --prefix apps/frontend-user test -- src/features/auth/
```

Add focused tests for real gaps: search IME/case/Khmer, 22px icon vs usable target, account-switch owned statuses, fake/unpublished price, missing/null currency, malformed template ID, disabled/pending template, server race/stale retries, historical aliases and preview boundary. Follow repository test style and avoid re-testing only implementation details. Confirm Gemini's reported 10/688/44/97 counts against actual **fresh results**, including whether a suite includes nested tests and whether test totals changed after fixes.

### Stage C — Build and cross-app quality

```bash
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build
npm --prefix apps/frontend-user test
npm --prefix apps/frontend-admin test
```

Run the full user/admin suites as regression blast radius requires; Phase 09 is connected to shared catalog, checkout and auth logic, so full runs are expected unless demonstrably blocked. Include backend **targeted read-only/isolated** contract tests when verifying actual package/entitlement DTOs, and state exactly what was exercised; do not touch production databases or merchants.

### Stage D — Dedicated Phase 09 browser tests

Gemini reported a custom config; verify this file exists and inspect six project definitions, testMatch, fixture ports and Axe setup:

```bash
npm --prefix apps/frontend-user run test:e2e -- --config playwright.phase09.config.js --workers=2 --reporter=line
```

If the project requires `--config=playwright.phase09.config.js`, use the correct actual flag. Confirm **42 is the expected number for this exact invocation** rather than confusing project multiplied cases with unique workflows. Run focused new negative tests in desktop/mobile Chromium, WebKit and Firefox where supported, observing browser-specific focus/history/iframe behavior. Firefox mobile emulation is a viewport/touch proxy, **not physical Firefox mobile certification**.

### Stage E — Existing cross-phase browser regressions

Locate and run current tests, using actual config/project selection:

```bash
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase04-components.spec.js tests/e2e/phase05-motion.spec.js tests/e2e/phase06-layout-navigation.spec.js --workers=2 --reporter=line
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase08-identity-account.spec.js --workers=2 --reporter=line
npm --prefix apps/frontend-user run test:e2e -- tests/e2e/phase02-foundations.spec.js --workers=2 --reporter=line
```

Discover and execute real Phase 07 marketing suites (including featured collection) and the broader Phase 07/08 six-project configs where feasible. Run current **135-route/270-case content sweep** or equivalent, and 132-case Phase 06 shell/navigation matrix if it remains an applicable gate. The historical Phase 02 suite previously reported **26 pass / 6 known fail** across its observed projects: `QA-NEW-01/02/03` are unsuitable/stale assertions pending copy and QA approval. Preserve them unchanged and investigate **any additional failure**; do not reclassify new regressions as known baseline.

### Stage F — Concurrency and reliability

Use an **isolated run** of the unchanged default worker configuration, log host CPU/memory/browser process count, server readiness/origin, console/network failures, timeouts, and compare to controlled `--workers=2`. Phase 06 previously suffered default-worker instability; Phase 08 later reported **68/68 default**. Neither isolated prior result proves reliability on the current Phase 09 tree. Do not adjust default workers/timeouts or introduce sleeps solely to disguise races; fix actual app/harness defects and retain old traces.

### Stage G — A11y, geometry, visual and performance

- At least **320, 360, 390, 768, 1024, 1440, 1920** widths plus **844×390**, **820×430** and **768×390** short landscape where task relevant; also current breakpoint-adjacent widths if source uses them.
- EN/KM × light/dark × normal/reduced motion representative matrix; forced-colors emulation; 200%/400% equivalent reflow labeled correctly. Include typeahead/search and checkout/drawer states, not only first paint.
- Axe with all pertinent rules active plus targeted manual keyboard/target/contrast tests. Explicit evidence for the search-clear 22px button and computed pricing label contrast. Review both light and dark card/hover labels, statuses and modal backdrops.
- Before/after route captures with stable fictional data and matching device/source identities. File manifest must include accurate SHA/fingerprint and actual PNG path; do not Git-link ignored images as though committed.
- Matched lab performance with ranges/medians; build payload and actual initial request transfer bytes separately. Preserve baseline where absent.

### Stage H — Final gate

Rerun all tests that previously failed after any source fix, **plus the relevant full suites**, record final statuses at the final **dirty source fingerprint**, and verify protected file changes and documentation links. Require no uninvestigated new regressions. Conclude the Phase 09 acceptance judgment with limitations.

---

## 17. Focused negative-test scenarios (mandatory high-value additions)

For every scenario, retain pre-fix reproduction if it fails and post-fix rerun:

| ID | Negative / edge scenario | Required verified outcome |
|---|---|---|
| N09-01 | Type Khmer + composed mixed Latin in search; switch language mid-query | No crash, stable focus, coherent results, source-backed labels |
| N09-02 | Search clear icon 22px on mobile | Actual operable target/spacing meets applicable contract; correct semantic name |
| N09-03 | Slow catalog A response arrives after fast B response | Newer request wins; no stale price/catalog or accidental live status |
| N09-04 | Catalog offline while demo fixture exists | Demo clearly marked; **not** presented as purchasable/owned product |
| N09-05 | Filter for free when price is null/unknown | Unknown is **not** silently free; eligibility still server verified |
| N09-06 | Premium template unowned vs pending vs verified owned | Distinct truthful CTA and server-authoritative badge |
| N09-07 | User A paid-templates promise resolves after logout/User B login | User B cannot inherit A's owned badges or private data |
| N09-08 | Disabled/unpublished design deep-linked by slug or numeric ID | No leaked private content or unauthorized checkout; safe recovery |
| N09-09 | Legacy numeric ID collides with current dynamic backend ID | Stable slug/code wins; renderer family does not switch incorrectly |
| N09-10 | Unknown stable code with numeric known alias | No false fallback to unrelated bespoke art |
| N09-11 | `preview` opened by anonymous user for paid design | Preview remains possible only per existing policy; no unlocked publish/edit/ownership |
| N09-12 | Iframe forged origin/nonce/source messages | Message rejected; no guest token/data leak; protocol preserved |
| N09-13 | Short landscape / iframe taller than viewport | Reachable internal scroll, controls, focus and hit testing; not ratio padding |
| N09-14 | Return from checkout via redirect without settlement verification | Payment remains pending/unverified until trusted backend confirms |
| N09-15 | Package price null, 0, invalid decimal, KHR/USD variants | No invented price, no FX mixing, no false free/purchased indicator |
| N09-16 | Package feature missing/false/true in mobile accordion | Same truthful details as desktop; clear semantic labels |
| N09-17 | Login redirection with legitimate query and malformed/external URL | Legitimate same-origin continuation retained; unsafe targets rejected |
| N09-18 | Broken/oversized card image, slow server, lost connection | Accessible placeholder, predictable layout and retry; no misleading fallback |
| N09-19 | Dark hover, focus, selected, disabled, error, empty | Computed legible contrast; all controls operable in KM/EN |
| N09-20 | Axe config suppresses color-contrast | Audit fails the gate until rule enabled and real CSS corrected |
| N09-21 | Repeated modal open/close + Back on WebKit and mobile | Escape/return/inert/history/scroll restore consistently |
| N09-22 | Localized sort with missing and duplicate names | Stable deterministic order, no dropped/misidentified templates |
| N09-23 | `prefers-reduced-motion` with slow media | All actions visible immediately; no nonessential blocking curtain |
| N09-24 | Direct `/app/packages` unauthorized/expired session | No data leak or misleading action; retry/sign-in safely preserves target |

Add relevant existing domain scenarios rather than replacing the 24 above with source-only unit assertions. For sensitive fixtures, test server-shaped decisions and explicit denials.

---

## 18. Independent acceptance ledger: all thirty F09.1 gates

Create an **independent** `F09.1-01..30` table. Start from Gemini's gate descriptions, then record real **current** evidence, verdict, first-failed test, repair, residual blocker and owner. The checks below are **acceptance criteria**, not preapproved verdicts:

| Gate | Codex must establish before local acceptance |
|---|---|
| F09.1-01 | Dirty Git state fully documented; 13 commits + Phase 07/08 changes demonstrably preserved; no unsafe Git action |
| F09.1-02 | Source-resolved full Phase 09 route/component/state graph, real path distinction and route inventory parity |
| F09.1-03 | Art direction consistently premium and culturally appropriate without wiping authored renderer identity; subjective/native limits named |
| F09.1-04 | Public catalog truthful against DTOs and outages; demo items not represented as live purchasable inventory |
| F09.1-05 | Search/category/free-premium/sort work for Khmer, Latin, empty, error and race states |
| F09.1-06 | Clear filters and zero-match recovery work with keyboard/touch/focus and adequate target hit area |
| F09.1-07 | Card identity, media, names/descriptions and stable keys accurately follow actual catalog or labeled demo |
| F09.1-08 | Free/premium/owned/unknown/pending statuses backed by real policy; no cross-account stale owned badge |
| F09.1-09 | Real registered detail/demo/preview path, controls, loading and failure behavior; accessible Escape/Back/return |
| F09.1-10 | Trusted iframe/source/origin/nonce/session/sandbox contracts negative-tested; no paid access from preview |
| F09.1-11 | Ten bespoke renderer families, 38 aliases, shared IDs/fallback identity/boundary preserved; representative visual checks |
| F09.1-12 | Catalog-to-create and safe auth continuation retain legitimate intent and reject unsafe/sensitive redirect paths |
| F09.1-13 | Public package list and content source from real backend API/DTO; inactive/restricted/error truthful |
| F09.1-14 | Currency precision, null/zero/invalid price, USD/KHR and feature limits accurately represented |
| F09.1-15 | Desktop/mobile plan comparison semantically equivalent, keyboard/reflow friendly |
| F09.1-16 | Public pricing CTA routes to authenticated/unauthenticated package flow safely with correct plan code |
| F09.1-17 | `/app/packages` role, active/pending/denied, current entitlement and retry states validated by fixtures |
| F09.1-18 | Checkout quote, direct link, failed/cancel/return and entitlement pending states truthful; no simulated paid |
| F09.1-19 | Unauthorized/expired/access negative tests; no leakage to other user or admin realm |
| F09.1-20 | KM/EN visible and accessible strings, typography, search/sort semantics checked; human ceremonial terms approval remains explicit |
| F09.1-21 | Computed light/dark contrast including hover/selected/error, no suppressed Axe rules; forced-color caveats explicit |
| F09.1-22 | Actual tested desktop/mobile/short-landscape/reflow states; no horizontal overflow/clipped critical controls; hardware caveat |
| F09.1-23 | Reduced motion retains immediately operable controls and no global blocking transitions |
| F09.1-24 | WCAG 2.2 AA automation, keyboard, hit targets, focus/dialog/table semantics; actual VoiceOver/TalkBack separately blocked |
| F09.1-25 | Matched lab performance/payload/initial bytes and unresolved review triggers, with no fake field INP claim |
| F09.1-26 | Licensed assets and factually supportable claims, no invented offers/reviews/urgent scarcity; pending rights explicitly named |
| F09.1-27 | Backend/Flyway/payment/privacy/role/registry/renderer protected diff verified; all sensitive contracts unchanged or explicitly approved |
| F09.1-28 | Fresh full/targeted unit, build, lint, routes, Phase 02–09 E2E and concurrency results, including failures/denominators |
| F09.1-29 | All original 57 IDs + five AUTH items + nine Phase 07 partial gates + C08-013 reconciled and carried without dropped owners |
| F09.1-30 | Complete portable evidence, exact commands/fingerprints, selective rollback, findings and Phase 10.1 handoff without release overclaim |

**Counting invariant:** Exactly 30 unique IDs, each with exactly one current verdict; counts must sum to 30. The uploaded Gemini table visually indicates **26 verified and 4 partial**, contradicting its prose **25 verified and 5 partial**. Reconcile this explicitly, then **set your own verdicts** based on independent evidence. Never copy upstream “VERIFIED” across all rows by default. If one gate has both local pass and external AT block, choose a bounded status that reflects the intended acceptance definition and specify the sub-gates; do not hide the block in an all-green banner.

---

## 19. Finding severity, repair discipline and regression defense

Classify findings:

- **P0:** Credential, payment or authorization compromise; severe data loss. Do not attempt live exploit or destructive action; notify owner, isolate and stop risky writes.
- **P1:** Wrong paid/owned access, cross-account data bleed, checkout misstatement with financial consequence, blocked essential workflow, critical preview trust break or repeatable damaging regression.
- **P2:** Broken category/search/preview navigation, serious accessibility or unreadable controls, misleading demo/live copy, incorrect price/feature display, mobile inaccessibility, recovery failure.
- **P3:** Editorial hierarchy, minor polish, unnecessary layout shift or low-impact quality issue.

For each confirmed finding, document `ID (C09-###)`, title, severity, user consequence, actual source/path/line, reproduction steps, negative-first test/trace, root cause, minimal fix, before/after evidence, affected routes, tests, preservation risk, remaining caveat and rollback hunk. Do not invent a bug merely to inflate a defect count. Preserve prior Gemini `P09-001`–`P09-006` IDs as upstream findings and link your independent verdict to them, rather than renumbering their historical evidence.

**Repairs are mandatory** when frontend source is within this phase and risk/fixtures allow safe change. Prefer surgical fixes to upstream existing components; retain Gemini's successful premium style and localized copy. Do not add a new global state store, alternate template registry, outsourced design package or custom payment service for a small display issue. Add tests that would fail before the fix. Where backend policy is ambiguous or approval required, isolate as a named external/security review item rather than silently editing backend.

Keep failed initial and intermediate test logs, screenshots and traces. `0 tests failed` in the final summary is meaningful only when earlier failures and their resolution remain traceable.

---

## 20. Required documentation deliverables (generate real files)

Write a complete audit report package under:

`docs/uxui/phase09-codex-marketplace-audit-2026-11-18/`

If the current local date or repository convention differs, use an accurately dated directory and retain a stable link in the final response. Produce **README + the following 22 numbered Markdown reports** (or a rigorously equivalent and fully indexed set), based on actual evidence:

1. `01-git-dirty-baseline-source-fingerprint-and-attribution.md` — local/remote SHA, statuses, preserved work, source baseline, high-risk paths.
2. `02-gemini-claims-test-counts-and-acceptance-discrepancies.md` — six slices, 42 six-project count, 25/5 vs 26/4, Axe suppression history, false/imprecise claims.
3. `03-complete-phase09-route-feature-state-and-consumer-matrix.md` — real routes/aliases/permissions, 135-route context, significant states.
4. `04-premium-editorial-identity-responsive-layout-review.md` — artistic quality, brand fidelity, desktop/mobile layout, real screenshots.
5. `05-public-template-discovery-search-filter-sort-audit.md` — UTF-8/Khmer search, category, offline, zero/error/retry, races.
6. `06-template-cards-media-and-ownership-status-audit.md` — actual IDs, free/premium/demo/owned, account-switch protections, images.
7. `07-detail-demo-preview-and-trusted-iframe-audit.md` — registry/route/iframe/modal behavior, negative trust cases.
8. `08-public-pricing-packages-and-currency-contracts.md` — API DTOs, real limits, USD/KHR, absent price and comparative UI.
9. `09-guarded-host-browse-entitlement-and-checkout-decisions.md` — access, server-owned purchase status, manual payments, unauthorized states.
10. `10-khmer-english-language-typography-and-copy-review.md` — bilingual copy/term state, font rendering, native review limits.
11. `11-a11y-contrast-targets-forced-colors-and-keyboard.md` — active Axe rule proof, 22px icon target, all states and gaps.
12. `12-responsive-cross-engine-focus-navigation-and-safe-area.md` — browser matrix, 844×390 preview, safe areas, native zoom caveat.
13. `13-motion-images-network-payload-and-performance.md` — matched lab samples, chunk/bytes, before comparison limits.
14. `14-security-license-privacy-registry-and-backend-preservation.md` — protected diff, template trust and factual claims.
15. `15-confirmed-defects-negative-tests-repairs-and-reproduction.md` — linked `C09-###` register and prior `P09-001..006` independent review.
16. `16-exact-commands-results-failures-and-reliability.md` — executable commands, counts, fingerprint, logs/traces, default workers.
17. `17-independent-f09-1-01-to-30-acceptance-matrix.md` — every gate independently judged with evidence.
18. `18-cross-phase-57-plus-auth-plus-phase07-plus-c08-013.md` — IDs, old/new disposition, owner and next action.
19. `19-file-change-attribution-diff-hunks-and-safe-rollback.md` — no-reset selective patch, dry-run safety.
20. `20-open-gates-owners-product-approvals-and-final-status.md` — external, domain owner, remaining P1/P2/UX decisions.
21. `21-phase10-1-gemini-complete-template-art-execution-handoff.md` — next GEMINI implementation owner, not a Codex 10 audit prompt yet.
22. `22-evidence-manifests-reproducibility-and-coverage-index.md` — portable evidence directory, exact source hashes and data limitations.

**Machine-readable required files** under `evidence/` (names adaptable only if indexes updated):

- `source-and-git-baseline.json`; `changed-files-attribution.json`; `protected-path-preservation.json`.
- `route-state-matrix.json`; `journey-matrix.json`; `template-registry-comparison.json`.
- `gemini-claim-reconciliation.json`; `independent-acceptance-matrix.json` (all 30 uniquely keyed).
- `defect-register.json`; `negative-first-results.json`; `test-command-results.json`.
- `accessibility-matrix.json`; `contrast-and-target-results.json`; `responsive-browser-matrix.json`.
- `visual-before-manifest.json`; `visual-after-manifest.json`; `capture-diff.json`.
- `performance-comparison.json`; `asset-and-license-review.json`; `cross-phase-carryover-updated.json`.
- `rollback-selection.json`; `evidence-validation.json`.

Screenshots/trace/video/binary artifacts can remain ignored under a uniquely named `output/playwright/...` or `output/phase09-codex-...` folder; ensure portable manifest metadata and regeneration commands exist. Do not declare linked binary screenshots available in Git if they are ignored. Documentation **must be internally consistent**: no invented path, counts, green badges or unstaged files said to be committed. Validate Markdown links and JSON schemas/counts.

---

## 21. Phase 10.1 Gemini handoff — scope and strict boundary

At the end, write a **full practical Phase 10.1 Gemini implementation handoff**, not an early Phase 10 Codex audit prompt. Phase 10.1 owns **ten bespoke invitation renderer families, shared identities, aliases and their complete visual/interaction craft**, with independent per-family design direction, culturally appropriate Khmer typography and artwork, mobile/desktop/reduced-motion fidelity and guest integration. It will need to preserve Phase 09 marketplace identity/entitlement/preview trust and all prior dirty changes.

Include:

- Final local Phase 09 source fingerprint, actual branch/worktree and **no automatic push/commit/deploy** rule.
- Complete renderer registry/alias inventory and actual source paths, which Phase 09 template selection/preview interfaces feed into dedicated renderers, and the distinct editorial art directions already approved.
- All open renderer-specific and artwork/photo rights gates; especially historical pixel variation and blank historical frame cause. Do **not** conflate renderer demo fixture with live authored/public guest DTO fidelity.
- Art and media consent, animation skip/reduced-motion, page performance, native Khmer/AT/real phones, long wedding-name and multi-event data state coverage.
- The exact Phase 09 review outcomes and regressions Gemini must not undo; 57+AUTH+Phase07+C08-013 cross-phase ledger preserved.
- Explicit off-limits boundaries: server data ownership, payment status/entitlement, guest privacy/RSVP, trusted preview protocol, 48 Flyway migrations and other still-unapproved domain work.
- Requirements for Gemini to provide actual implementation, tests, before/after, source diff and a **separate Phase 10 Codex audit handoff**. Do not begin Phase 10 production implementation in this phase.

Phase 10.1 must follow the same overall process: **Gemini implements → user supplies results → Codex independently audits, fixes and verifies in Phase 10**.

---

## 22. Final Codex response contract (MANDATORY)

Finish only after actual audit/fixes/tests/docs or give the fullest safe bounded result possible if blocked. Respond with a compact, precise report containing:

1. **Actual Phase 09 status:** `VERIFIED COMPLETE` only for fully evidenced scope, otherwise `PARTIALLY COMPLETE`, `REVIEW REQUIRED` or `BLOCKED` as appropriate. Separate local implementation completion from external/production certification.
2. **Git state:** branch, local HEAD, observed remote, preserved 13 commits, staged/unstaged/untracked changes, no push/commit/deploy unless separately authorized. Name the actual final **dirty source fingerprint**.
3. **Independent Gemini claim review:** verified/corrected/rejected statements, especially 25/5 vs 26/4 and Axe suppression history.
4. **Repairs:** count and severity (`P0/P1/P2/P3`), IDs, exact files, cause and verification. Also name any unresolved P1/P2 findings and owner.
5. **Exact QA results:** current full user/admin units, route inventory/sweep, Phase 09 six projects, Phase 02/04/05/06/07/08 relevant browser regressions, lint, build, token parity, a11y scans, responsiveness, performance, default worker reliability. Report pass/fail/skip and original red baseline without hiding anything.
6. **Complete 30-gate matrix tally** with true sum 30, plus any external/manual sub-gates.
7. **Cross-phase tally:** original 57 entries unchanged/updated by ID, five AUTH items, nine Phase 07 partials and backend C08-013 assigned, plus newly discovered Phase 09 items.
8. **Preservation/rollback:** protected category diff evidence, source-specific selective patch check, no destructive clean/reset/rebase instructions.
9. **Evidence package links:** `README`, defect register, exact QA, acceptance matrix, open gates, attribution, Phase 10.1 handoff. Use real local paths; no fake committed links to ignored PNGs.
10. **Next action:** State that the **Phase 10.1 Gemini prompt** should be generated only after this independent review results are sent back to the project coordinator/user, following the established two-stage protocol.

### Hard-stop conditions and honesty clauses

- If you encounter a genuine bypass of paid/owned access, wrong-account ownership, unsafe redirect or preview trust violation, treat this as high severity, avoid live abuse, add safe negative regression and escalate review as warranted.
- If Phase 09 source contains `disableRules(['color-contrast'])`, skipped contrasting states or suspicious Axe omission, flag the gate **not verified** until independently enabled and measured; do not merely rely on the former 42/42 green report.
- If Gemini's 22px clear icon has a measured 22px click/touch rect with no qualifying exception/spacing, fix the operable target (prefer about 44px) while keeping the visual glyph small.
- If a preview route or API is absent, record actual source behavior and do not claim implemented functionality from a prose promise.
- If real payment, Google/Telegram, MySQL, published catalog, device, screen reader, OS forced colors, native zoom, human Khmer or field CWV access is missing, keep those gates **external/unverified**, never fabricate access, transaction, score, screenshot or result.
- Phase 02's **six historical assertion failures** are not license to tolerate a seventh. Preserve the unsuitable original assertions until approved maintenance; still verify intended behavior in stronger separate tests.
- **No loss of working functionality or premium design** in pursuit of green tests.

**Execute the Phase 09 independent audit, targeted fixes, complete verification and documentation NOW against the user's real local dirty repository. Do not stop at a plan.**
