# Reference Research & Competitor UX/UI Audit

## 1. Local Source UI Research (`D:\source UI`)

The repository includes a comprehensive set of real-world design captures in `D:\source UI`, consisting of 21 high-resolution screenshots and 1 screen recording (`Screen Recording 2026-11-05 152332.mp4`).

### Key Screen Captures & Observed Interactions:
- **`Screenshot 2026-11-05 150650.png`:** Onboarding event category selection in Khmer (អាពាហ៍ពិពាហ៍, ខួបកំណើត, ពិធីបុណ្យផ្សេងៗ, ពិធីបើកដំណើរការ) with generous card touch targets and progress indicators.
- **`Screenshot 2026-11-05 150827.png`:** Couple names (កូនកំលោះ និង កូនក្រមុំ) and parents setup with toggle between immediate entry and deferred configuration.
- **`Screenshot 2026-11-05 151115.png`:** Social login and phone authentication sheet with Telegram and Google OAuth integration.
- **`Screenshot 2026-11-05 151327.png`:** Event list item featuring countdown badge ("ក្នុងរយៈពេល 56 ថ្ងៃ"), event date/time, and status pills.
- **`Screenshot 2026-11-05 151709.png`:** Guest management dashboard from `goevent.online` displaying attendance counters, response percentage rings, and personalized invitation link generation with social sharing copy.
- **`Screenshot 2026-11-05 151743.png`:** Table arrangement ("បញ្ជីឈ្មោះភ្ញៀវ", "តុ១", "Honored Guest") demonstrating 10-seat table groupings.
- **`Screenshot 2026-11-05 151854.png`:** Mobile invitation multi-step preview:
  1. `ក្របមុខ` (Front Cover): Auspicious wedding title ("សិរីមង្គលអាពាហ៍ពិពាហ៍"), ornate circular monogram crest, "សូមគោរពអញ្ជើញ", honored guest name badge ("ភ្ញៀវកិត្តិយស"), and swipe-up opening gesture `^ ^`.
  2. `ចលនាបើកធៀប` (Opening Animation): Animated smooth transition revealing the main card.
  3. `មាតិកាចម្បង` (Main Content): Parents' names arranged in dual columns, monogram emblem, groom/bride names with arched portrait framing.
- **`Screenshot 2026-11-05 151915.png`:** Crimson and gold royal invitation template (`AMT001`) with ornate Kbach corner borders, golden monogram badge, and venue time/hall details.

---

## 2. Competitor UX/UI Research Matrix

| Platform | Observed Capabilities | Mobile UX Quality | Key Pattern | Adaptation for Koupreng | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TheapKa** (`theapka.com`) | Telegram/Messenger direct link sharing, guest name personalization, KHQR digital envelope, bilingual Khmer/EN toggle. | High: Clean cards, responsive mobile forms, fast image loading. | Pre-configured chat share templates with guest name injection. | Adopt structured guest link sharing with automatic token injection. | Cambodian wedding invitations are primarily distributed via Telegram & Messenger chat groups. |
| **Bandith Card Store** (`bandithcardstore.com`) | Premium luxury paper & digital hybrids, 3D wax seal opening, embossed gold lettering, countdown timer, Google Maps pin. | High: Strong cultural aesthetic, rich tactile feel on mobile touchscreens. | 3D wax seal and envelope opening gesture before full invitation reveal. | Integrated in `DigitalYes` (wax seal) and `KhmerFloralGold` (floral unsealing) with skip option. | Respects traditional ceremonial dignity while preventing guest frustration through accessible skip controls. |
| **E-Theap** (`e-theap.com`) | Real-time RSVP with dietary notes, countdown timer, background ceremonial music, pre-wedding photo gallery with lightbox. | Very High: Smooth scroll, lightweight assets, low data consumption. | Floating music control pill with visible state and user-gesture activation. | Unified floating audio controller with `no autoplay` policy and error recovery. | Mobile Safari & Chrome strictly block unprompted audio autoplay; user gesture ensures 100% reliable playback. |
| **GoEvent** (`goevent.online`) | Interactive 3-stage preview (Front Cover, Opening Animation, Main Content), table/seat badge, wish wall, QR check-in pass. | Exceptional: Clear section hierarchy, minimal latency, instant QR generation. | Front cover guest badge ("ភ្ញៀវកិត្តិយស") and personalized QR check-in pass. | Integrated in `PublicRsvpForm.jsx` and `TemplateOpeningGate.jsx`. | Guests immediately know their table/seat upon RSVP confirmation, speeding up banquet arrival check-in. |

---

## 3. React UI Library Evaluation & Adoption Decisions

We evaluated ten modern React UI libraries against React 19 JSX requirements, Koupreng design tokens, WCAG 2.2 AA accessibility, bundle footprint, and licensing:

| Library | Components Evaluated | Decision | Rationale |
| :--- | :--- | :--- | :--- |
| **shadcn/ui** | Accordion, Dialog, Dropdown | **Adopted (Core)** | Headless Radix UI foundations, MIT license, zero runtime CSS overhead, full ARIA keyboard accessibility. |
| **Untitled UI** | Empty states, Table layouts, Metric cards | **Adopted (Selected)** | Enterprise UX clarity, clean SVG icons, MIT licensed. |
| **Magic UI** | NumberTicker, Particles, BorderBeam | **Adopted (Selected)** | High-performance canvas-based number counting for RSVP statistics and countdowns. |
| **Kokonut UI** | BentoCard, Glassmorphism cards | **Adopted (Selected)** | Modern card grids with accessible border lighting, adapted to Koupreng gold/cream palette. |
| **Animate UI** | AnimatedTabs | **Adopted (Selected)** | Fluid animated tab indicators for bilingual language and section switching. |
| **React Bits** | FadeContent, SplitText | **Adopted (Selected)** | Lightweight scroll-reveal transitions, respects `prefers-reduced-motion`. |
| **Aceternity UI** | CardHoverEffect | **Adopted (Selected)** | Elegant subtle hover glow for desktop viewports, disabled on touch devices for performance. |
| **Badtz UI** | Navigation drawers | *Rejected* | Redundant with existing accessible mobile drawer implementations; added unnecessary bundle size. |
| **Lightswind UI** | Glass cards | *Rejected* | CSS-in-JS dependencies conflicted with Vite static compilation and Koupreng CSS variables. |
| **Skiper UI** | Carousel components | *Rejected* | Non-standard touch event handling interfered with native iOS Safari swipe gesture navigation. |

---

## 4. Skills Applied

- **`koupreng-premium-ux`:** Primary skill. Enforced Cambodian wedding typography (`Moul`, `Kantumruy Pro`), gold/cream color palette (`#c3a26b`, `#fbf6ee`), ceremonial opening patterns, and cultural respect for traditional Kbach and silk tapestries.
- **`ui-ux-pro-max`:** Applied principles of visual hierarchy, cognitive load reduction, and mobile-first touch ergonomics.
- **`wcag-audit-patterns`:** Evaluated color contrast ratios ($\ge 4.5:1$ text, $\ge 3.0:1$ UI components), screen reader announcements, and keyboard accessibility.
- **`playwright` & `test-master`:** Structured end-to-end and component regression verification across multiple viewport widths.
