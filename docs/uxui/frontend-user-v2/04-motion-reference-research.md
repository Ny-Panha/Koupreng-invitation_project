# 04 — Design & Motion Reference Research (`FUV2`)

**Checked:** 2026-11-26 (`UTC+07:00`)  
**Primary Skills Used:** `koupreng-premium-ux`, `ui-ux-pro-max`, `frontend-design`

---

## 1. Local UI/UX Pro Max Search Tool Synthesis (`search.py`)

Executed verbatim against `.agents/skills/ui-ux-pro-max/scripts/search.py` (raw outputs and exact timestamps archived in Section 2.5):

1. `python .agents/skills/ui-ux-pro-max/scripts/search.py "premium Cambodian wedding SaaS dashboard" --design-system`
   - **Selected Guidance:** Restrained high-craft hierarchy with 4.5:1 text contrast, visible keyboard focus (`--color-ring`), reduced-motion safety (`prefers-reduced-motion`), SVG-only icons (no emojis), smooth `150–300ms` functional hover transitions, and verified layout behavior across `375px`, `768px`, `1024px`, and `1440px` without cheap visual bloat. (KoupReng adapts these rules onto the Deep Botanical Atelier palette derived from official `public/branding/` logos in `03-design-direction-and-token-audit.md` rather than adopting generic black/neutral defaults.)
2. `python .agents/skills/ui-ux-pro-max/scripts/search.py "mobile navigation focus not obscured" --domain ux`
   - **Selected Guidance -> Code Implementation:** Apply `scroll-padding-top` accounting for fixed/sticky headers (`app-experience.css`: `scroll-padding-top: calc(var(--host-nav-offset, 84px) + 16px)`), dismiss overlays before focus moves behind them, restore keyboard focus onto drawer triggers on Escape close (`EventWorkspace.jsx` + `frontend-user-v2.spec.js`), and prevent persistent widgets (`ChatBot`) from overlapping auth inputs at `390px`.
3. `python .agents/skills/ui-ux-pro-max/scripts/search.py "skeleton feedback loading" --domain ux`
   - **Selected Guidance -> Code Implementation:** Keep loading skeletons geometry-matched (`PageSkeleton` / `SkeletonTable` with `aria-busy` and localized status labels), avoid flashing spinners or frozen UI, and defer below-fold assets (`loading="lazy"`) while protecting above-the-fold Hero LCP rendering.

---

## 2. Verified Reference-Family Observations (Domain & Motion)

> **Provenance Guard:** Direct web checks were performed on `2026-11-26` for `60fps.design` and the three verified Cambodian digital invitation platforms (`saambot.com`, `sarserei.com`, `khinvite.com`). Zero third-party markup, artwork, copy, or proprietary assets were copied; all KoupReng components are original React + CSS implementations. Unverified sites (`planessential.com`, `sambot.online`) remain explicitly excluded.

### 2.1 Cambodian Digital Invitation Domain (`saambot.com`, `sarserei.com`, `khinvite.com`)

| # | Observation & Context | Verified Reference(s) | KoupReng Fit & Target Surface | Accessibility & Performance Implication |
|---|---|---|---|---|
| 1 | **Personalized Guest Links & Messenger-First Share Flow:** Cambodian hosts distribute individual tracked guest URLs predominantly via Telegram, Facebook Messenger, and WhatsApp rather than email newsletters. | `saambot.com`, `sarserei.com`, `khinvite.com` | **ADAPT (`StudioGuide.jsx` Step 4 Share Atelier + `GuestTable.jsx`):** Added QR SVG card + `.svg` download, Web Share API, direct `Telegram` and `WhatsApp` share actions, and per-guest personalized invite links. | Keyboard-focusable `<a>` / `<button>` controls with `try/catch` clipboard `[role="status"]` fallback (`FUV2-N22`, `FUV2-N45`); avoids heavy third-party social SDK scripts. |
| 2 | **Bilingual Khmer / English Parity Without Glyph Clipping:** Invitations serve both local Cambodian elders (Khmer script) and diaspora/international guests (English) side by side. | `saambot.com`, `sarserei.com`, `khinvite.com` | **ADAPT (`PublishReview.jsx`, `PublicInvitationFeature.jsx`, `semantic-tokens.css`):** Bilingual access mode selector, localized `403`/`429` public gate messages, and `:root[lang=km]` leading (`line-height: 1.65–1.8`, `letter-spacing: normal`). | Eliminates Khmer vowel/subscript clipping down to `320px` (`FUV2-N16`, `FUV2-N17`); local preloaded WOFF2 fonts (`KantumruyPro`, `DMSans`) prevent external CDN blocking and FOIT. |
| 3 | **KHQR / ABA Digital Gifting & Dual-Currency Ledger Clarity:** Digital *Chong Dai* (`ចងដៃ`) QR gifting and USD/KHR tracking are standard expectations for Cambodian weddings. | `saambot.com`, `khinvite.com` | **PRESERVE + POLISH (`BudgetPages.css`, `PaymentPages.css`, `InvitationForm.jsx`):** Retained separate USD and KHR summary/gift cards and KHQR fields with dark-mode semantic tokens (`22-budget-dark-en-1440.png`). | Separate USD & KHR surfaces prevent currency conflation (`C08-013`, `FUV2-G33`) and meet `>= 4.5:1` WCAG AA contrast in both light and dark themes. |
| 4 | **Multi-Part Ceremony Timelines & Embedded Venue Maps:** Traditional morning rituals and evening receptions appear as structured schedules paired with Google Maps / directional info for local halls. | `saambot.com`, `sarserei.com`, `khinvite.com` | **PRESERVE + WIRE (`WeddingProgramEditor`, `EventDetails.jsx`, `InvitationForm.jsx`, `publishReadiness.js`):** Kept multi-day ceremony schedules, illustrated/Google map options, and mandatory `venueAddress` publish validation (`FUV2-N28`). | Progressive `<details>` sections and lazy-loaded style/map editors prevent initial-load JS bloat on mobile devices. |
| 5 | **Fast Mobile-First Entry & Ceremonial Cover Restraint:** Guests open invitations almost exclusively on mobile browsers (`Chrome`/`Safari`); ornamental flourishes stay on the invitation itself rather than cluttering planning tools. | `sarserei.com`, `saambot.com`, `khinvite.com` | **ARCHITECTURAL SPLIT (`MarketingFeature.css`, `OwnerExperience.css`, isolated template CSS):** Ceremonial templates retain independent `700ms` cover opening art isolated from Atelier management chrome (`FUV2-G03`, `FUV2-N08`). | Strict scope isolation prevents management dark mode from leaking onto ceremonial invitations; `prefers-reduced-motion` yields instant readable reveal (`FUV2-G23`). |
| 6 | **Guest Roster Import, Status Tracking & Private/Protected Access:** Organizers manage Excel-imported guest lists with attendance filters and restrict uninvited access via personal links or passcodes. | `saambot.com`, `sarserei.com` | **UPGRADE (`GuestsPage.jsx`, `GuestWorkspace.css`, `PublishReview.jsx`, `EventDetails.jsx`, `PublicInvitationFeature.jsx`):** Fixed dark filter chips/table tokens, wired `PUBLIC`/`PRIVATE`/`PASSWORD_PROTECTED` parity across Studio & Event Settings, and added `403`/`429` gate UX + stale token wipe. | Enforces `C10-001` privacy boundaries, accessible `[role="alert"]` errors, and visible bordered password inputs with Eye/EyeOff toggle at `390px` (`FUV2-N23`–`FUV2-N25`). |

*Excluded / Unverified Domain References:* `https://www.planessential.com/` and `https://sambot.online/` were **not** directly verified and are excluded from specific UI claims per the zero-fabrication rule (`NOT VERIFIED`).

### 2.2 Motion & Interaction Archive (`https://60fps.design/`)

| # | Interaction Pattern & Context | Observed Mechanism on `60fps.design` | KoupReng Fit & Target Surface | Accessibility & Performance Implication |
|---|---|---|---|---|
| 1 | **Drawers & Mobile Navigation Sheets** | Smooth directional enter/exit easing paired with clear backdrop separation and touch-friendly close handling without background scroll bleed. | **ADAPT (`EventWorkspace.jsx` + `Modal.jsx` + `EventNavigation`):** Mobile navigation drawer at `< 1024px` (`320px`, `390px`) with crisp `--ui-duration-overlay: 200ms` framing. | `Escape` closes drawer and deterministically returns focus to `"Toggle modules menu"` (`FUV2-N05`); `inert`/scroll lock blocks background tabbing and `reduced-motion` zeros duration. |
| 2 | **Geometry-Matched Skeleton Loaders** | Placeholder skeletons preserve exact row/card geometry so loaded content settles in place without visual jumps or blank flashes. | **ADAPT (`PageSkeleton` in `EventWorkspace.jsx` & `InvitationSeatingPage.jsx`; `SkeletonTable` in `GuestsPage.jsx`):** Layout-matched skeletons for `dashboard`, `studio`, `chart`, and `table` states. | Prevents Cumulative Layout Shift (`CLS`) and passes `aria-busy` + localized status feedback (`FUV2-G21`). |
| 3 | **Filter Chips & Status Pills** | Snappy selection transitions (`~120–160ms`) clarify active filters and counts without snapping or overflowing narrow strips. | **ADAPT (`GuestsPage.jsx`, `GuestWorkspace.css`, `EventsFeature.css`, `templates.css`, `BudgetPages.css`):** Status filter buttons, period tabs, and category chips with instant `aria-pressed` feedback. | Preserves `>= 4.5:1` active pill contrast in dark mode (`06-templates-dark` & `15-guests-dark` `axe=0`) and `0px` horizontal overflow down to `320px`. |
| 4 | **Segmented Controls & Radio Cards** | Crisp active track/border state switches views cleanly with minimal latency and unmistakable selected contrast. | **ADAPT (`PublishReview.jsx`, `StudioGuide.jsx`, `InvitationSeatingPage.jsx`):** Visibility radio cards (`PUBLIC`/`PRIVATE`/`PASSWORD_PROTECTED`), Guided/Advanced mode toggle, and `List | Floor plan` tabs. | Native `<input type="radio">` + `role="radiogroup"` and `aria-pressed` buttons ensure full keyboard arrow/Space navigation and screen-reader state fidelity. |
| 5 | **Card Hover & Tactile Press Micro-Feedback** | Subtle compositor-only elevation (`translateY(-1px..-2px)` + soft shadow) rewards pointer hover and tap without layout thrash. | **ADAPT (`variants.js`, `workspace-ui.css`, `OwnerExperience.css`, `EventsFeature.css`):** Replaced flat shadow killers with subtle elevation and `--ui-duration-press: 120ms` button press feedback. | Animates strictly `opacity` and `transform` (zero `width`/`height` reflow), avoids continuous ambient loops on data tables, and honors `<MotionConfig reducedMotion="user">`. |
| 6 | **Sticky Rail & Scroll Continuity** | Desktop workspace navigation stays anchored across tall data pages while compact laptop screens scroll nav groups independently. | **ADAPT (`HostShell.css`, `OwnerExperience.css`, `EventWorkspace.css`):** Desktop sticky `.event-workspace-sidebar` (`top: calc(var(--host-nav-offset, 84px) + 12px)`) + `.event-navigation-body` `overflow-y: auto`. | Zero scroll-event JS overhead; `overflow-x: clip` avoids double scrollbars (`FUV2-N04`) and `scroll-padding-top` upholds WCAG 2.2 Focus Not Obscured (`FUV2-N07`). |

---

## 2.5 Exact Raw `search.py` Outputs & Timestamps

**Executed:** `2026-11-26T13:20:13+07:00` to `2026-11-26T13:20:16+07:00` (`Exit Code: 0`)  
**Workspace:** `D:\Koupreng-invitation_project`

### Query 1 — `python .agents/skills/ui-ux-pro-max/scripts/search.py "premium Cambodian wedding SaaS dashboard" --design-system`

```text
Created At: 2026-11-26T13:20:13+07:00
Completed At: 2026-11-26T13:20:16+07:00
Command exited with code 0.

╔═════════════════════════════════════════════════════════════════════════════════════════╗
║  TARGET: PREMIUM CAMBODIAN WEDDING SAAS DASHBOARD - RECOMMENDED DESIGN SYSTEM           ║
╚═════════════════════════════════════════════════════════════════════════════════════════╝
┌─────────────────────────────────────────────────────────────────────────────────────────┐
├─── PATTERN ─────────────────────────────────────────────────────────────────────────────┤
│  Name: Scroll-Triggered Storytelling                                                    │
│     Conversion: Keep the narrative understandable without scroll-driven effects. Use    │
│     progress indicator. Mobile: simplify animations. Keep DOM reading order complete;   │
│     disable parallax and scroll-scrub under reduced motion. Pause scroll animation      │
│     when offscreen or hidden and render each chapter in its final readable state under  │
│     reduced motion.                                                                     │
│     CTA: End of each chapter (mini) + Final climax CTA                                  │
│     Sections:                                                                           │
│       1. Intro hook                                                                     │
│       2. Chapter 1 (problem)                                                            │
│       3. Chapter 2 (journey)                                                            │
│       4. Chapter 3 (solution)                                                           │
│       5. Climax CTA                                                                     │
├─── STYLE ───────────────────────────────────────────────────────────────────────────────┤
│  Name: Liquid Glass                                                                     │
│     Mode Support: Light supported | Dark supported                                      │
│     Keywords: dynamic material, optical glass, translucency, lensing, refraction,       │
│     fluid morphing, system navigation                                                   │
│     Best For: Apple-platform navigation, controls, and system-aligned app chrome        │
│     Performance: cost:moderate|drivers:animation,blur | Accessibility:                  │
│     risk:conditional|requires:contrast-text-4.5,keyboard,visible-focus,reduced-motion   │
├─── COLORS ──────────────────────────────────────────────────────────────────────────────┤
│     Primary:           #1C1917    (--color-primary)                                     │
│     On Primary:        #FFFFFF    (--color-on-primary)                                  │
│     Secondary:         #44403C    (--color-secondary)                                   │
│     On Secondary:      #FFFFFF    (--color-on-secondary)                                │
│     Accent/CTA:        #A16207    (--color-accent)                                      │
│     On Accent/CTA:     #FFFFFF    (--color-on-accent)                                   │
│     Background:        #FAFAF9    (--color-background)                                  │
│     Foreground:        #0C0A09    (--color-foreground)                                  │
│     Card:              #FFFFFF    (--color-card)                                        │
│     Card Foreground:   #0C0A09    (--color-card-foreground)                             │
│     Muted:             #E8ECF0    (--color-muted)                                       │
│     Muted Foreground:  #475569    (--color-muted-foreground)                            │
│     Border:            #D6D3D1    (--color-border)                                      │
│     Destructive:       #DC2626    (--color-destructive)                                 │
│     On Destructive:    #FFFFFF    (--color-on-destructive)                              │
│     Ring:              #1C1917    (--color-ring)                                        │
│     Notes: Premium black + gold accent [Accent adjusted from #CA8A04]                   │
├─── TYPOGRAPHY ──────────────────────────────────────────────────────────────────────────┤
│  Cormorant / Montserrat                                                                 │
│     Mood: luxury, high-end, fashion, elegant, refined, premium                          │
│     Best For: Fashion brands, luxury e-commerce, jewelry, high-end services             │
│     Google Fonts:                                                                       │
│     https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Mon  │
│     tserrat:wght@300;400;500;600;700&display=swap                                       │
│     CSS Import: @import url('https://fonts.googleapis.com/css2?family=Cormorant:wgh...  │
├─── KEY EFFECTS ─────────────────────────────────────────────────────────────────────────┤
│     Lensing and refraction, adaptive translucency, and fluid morph transitions aligned  │
│     to Apple platform behavior                                                          │
├─── AVOID ───────────────────────────────────────────────────────────────────────────────┤
│     Cheap visuals + Fast animations                                                     │
├─── PRE-DELIVERY CHECKLIST ──────────────────────────────────────────────────────────────┤
│     [ ] No emojis as icons (use SVG: Heroicons/Lucide)                                  │
│     [ ] cursor-pointer on all clickable elements                                        │
│     [ ] Hover states with smooth transitions (150-300ms)                                │
│     [ ] Light mode: text contrast 4.5:1 minimum                                         │
│     [ ] Focus states visible for keyboard nav                                           │
│     [ ] prefers-reduced-motion respected                                                │
│     [ ] Responsive: 375px, 768px, 1024px, 1440px                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Query 2 — `python .agents/skills/ui-ux-pro-max/scripts/search.py "mobile navigation focus not obscured" --domain ux`

```text
Created At: 2026-11-26T13:20:13+07:00
Completed At: 2026-11-26T13:20:16+07:00
Command exited with code 0.

## UI Pro Max Search Results
**Domain:** ux | **Query:** mobile navigation focus not obscured
**Source:** ux-guidelines.csv | **Found:** 3 results

### Result 1
- **Category:** Accessibility
- **Issue:** Focus Not Obscured (Enhanced)
- **Platform:** Web
- **Description:** WCAG 2.2 AAA requires keyboard focus to remain fully visible
- **Do:** Keep the entire focused component unobscured by author-created content
- **Don't:** Present this enhanced AAA criterion as an AA requirement or allow persistent UI to hide any part of focus
- **Code Example Good:** close persistent overlay before focus moves behind it
- **Code Example Bad:** sticky footer covers half the focused button
- **Severity:** Medium

### Result 2
- **Category:** Accessibility
- **Issue:** Focus Not Obscured (Minimum)
- **Platform:** Web
- **Description:** WCAG 2.2 AA requires keyboard focus to remain at least partially visible
- **Do:** Offset sticky UI with scroll-padding and dismiss or move persistent overlays
- **Don't:** Let headers footers banners or chat widgets fully cover focus
- **Code Example Good:** scroll-padding-top: var(--header-height)
- **Code Example Bad:** fixed overlay covers :focus
- **Severity:** High

### Result 3
- **Category:** Navigation
- **Issue:** Sticky Navigation
- **Platform:** Web
- **Description:** Fixed nav should not obscure content
- **Do:** Add padding-top to body equal to nav height
- **Don't:** Let nav overlap first section content
- **Code Example Good:** pt-20 (if nav is h-20)
- **Code Example Bad:** No padding compensation
- **Severity:** Medium
```

### Query 3 — `python .agents/skills/ui-ux-pro-max/scripts/search.py "skeleton feedback loading" --domain ux`

```text
Created At: 2026-11-26T13:20:13+07:00
Completed At: 2026-11-26T13:20:16+07:00
Command exited with code 0.

## UI Pro Max Search Results
**Domain:** ux | **Query:** skeleton feedback loading
**Source:** ux-guidelines.csv | **Found:** 3 results

### Result 1
- **Category:** Feedback
- **Issue:** Loading Indicators
- **Platform:** All
- **Description:** Loading feedback should match the expected wait and avoid flashing for near-instant work
- **Do:** Follow platform and component guidance; preserve layout focus and accessible busy status
- **Don't:** Apply one timing threshold to every operation or leave long waits unexplained
- **Code Example Good:** Stable skeleton or progress with aria-busy
- **Code Example Bad:** Flickering spinner or frozen UI
- **Severity:** High

### Result 2
- **Category:** Animation
- **Issue:** Loading States
- **Platform:** All
- **Description:** Show feedback during async operations
- **Do:** Use skeleton screens or spinners
- **Don't:** Leave UI frozen with no feedback
- **Code Example Good:** animate-pulse skeleton
- **Code Example Bad:** Blank screen while loading
- **Severity:** High

### Result 3
- **Category:** Performance
- **Issue:** Lazy Loading
- **Platform:** All
- **Description:** Load content as needed
- **Do:** Lazy load below-fold images and content
- **Don't:** Load everything upfront
- **Code Example Good:** loading='lazy'
- **Code Example Bad:** All images eager load
- **Severity:** Medium
```

---

## 3. Motion System Derived (`apps/frontend-user/src/shared/motion/variants.js` + `ThemeProvider.jsx`)

- Replaced heavy `650ms` hero `fadeUp` & `0.6s` hero `FadeContent` block with `120–240ms` crisp functional timings (`--ui-duration-press: 120ms`, `--ui-duration-feedback: 160ms`, `--ui-duration-overlay: 200ms`, `--ui-duration-reveal: 240ms`) and reserved `700ms` strictly for ceremonial opening scenes.
- Wrapped application tree with `<MotionConfig reducedMotion="user">` in `ThemeProvider.jsx` alongside CSS `@media (prefers-reduced-motion: reduce)` overrides (`0ms`).

---

## 4. Evaluation of All Ten Canonical React UI Libraries

| # | Library | Pattern Evaluated | Decision | License & Provenance Guard |
|---|---|---|---|---|
| 1 | **Animate UI** | Press & micro-button feedback | `ADAPT ORIGINALLY` (timing model via `framer-motion`) | Original CSS/Framer variants in `variants.js`; zero external copy |
| 2 | **Badtz UI** | Editorial asymmetry / subtle depth | `REJECT` wholesale import; `INSPIRE` restraint | Avoid author asset copying; tokens remain ours |
| 3 | **Lightswind UI** | Glow / soft borders | `ADAPT ORIGINALLY` (border/focus glow rules) | Must pass WCAG 2.2 AA & reduced motion |
| 4 | **Kokonut UI** | Compact form controls & segmented tabs | `INSPIRE` (`PublishReview` radio card selector) | Original semantic `<input type="radio">` cards |
| 5 | **Untitled UI React** | Dense SaaS rail & data table spacing | `ADAPT ORIGINALLY` (Atelier Executive Rail + metrics strip) | Paid pro license restricted -> 100% original code |
| 6 | **shadcn/ui** | Dialog/focus-return/card primitives | `PRESERVE + ADAPT` (existing accessible `Modal.jsx` + `ConfirmDialog`) | No second CSS reset introduced |
| 7 | **React Bits** | Select marketing text/fade reveal (`FadeContent`) | `KEEP SELECTIVE + CONSTRAIN` (`duration={0.12}` on hero LCP) | Prevent slow fade blocking LCP/axe |
| 8 | **Aceternity UI** | Cinematic layering & surface polish | `INSPIRE` only | Rejected heavy decorative JS blobs in workspace |
| 9 | **Magic UI** | Micro-feedback badges / shimmer hints | `INSPIRE` only | Omitted continuous GPU animations on data tables |
| 10 | **Skiper UI** | Card framing & preview reveal | `INSPIRE` only | Kept clean CSS transforms honoring `reduced-motion` |
