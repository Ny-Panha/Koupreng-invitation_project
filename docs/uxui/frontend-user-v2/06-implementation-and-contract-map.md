# 06 — Implementation & Contract Map (`FUV2` + Phase 15)

## 1. CSS Cascade & Scroll Model Resolution (`FUV2-02`)

**Prior Defect:** `HostShell.css` imposed `height: 100dvh; overflow: hidden;` while `EventWorkspace.css` applied `position: relative` and `OwnerExperience.css` later overrode `.event-workspace-sidebar` back to `position: static; height: auto;` and `.event-navigation-body` to `overflow: visible`. That caused two failures: desktop sidebar scrolled off the viewport (`-612px` at `scrollY=700`), and short viewports (`600px` height) clipped/overflowed sidebar lists.

**Implemented Model (Single Document Scroll + Sticky Viewport-Pinned Rail, Zero `!important`):**
- `HostShell.css` & `OwnerExperience.css`: `.dash-wrapper--event` and `.dash-main-scroll` use `overflow-x: clip; overflow-y: visible;` (`clip` avoids breaking CSS `position: sticky` while blocking horizontal spill).
- `EventWorkspace.css` & `OwnerExperience.css` (`@media (min-width: 1024px)`):
  - `.event-workspace:not(.is-studio)` aligns `start` with `overflow: visible`.
  - `.event-workspace-sidebar` uses `position: sticky; top: calc(var(--host-nav-offset, 84px) + 12px); height: calc(100dvh - var(--host-nav-offset, 84px) - 24px); max-height: calc(100dvh - var(--host-nav-offset, 84px) - 24px);`.
  - `.event-navigation-body` keeps `flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior-y: contain; scrollbar-gutter: stable;` so desktop lists stay scrollable inside `600px`-high screens without ever detaching the header/footer.
- **Preserved Team Commit (`53896aa7`):** Desktop nav bar centering grid (`grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)`) in `OwnerExperience.css` remains completely intact.

---

## 2. Modified Files & Preserved Contracts

| File | Purpose of Change | Contracts Preserved |
|---|---|---|
| `apps/frontend-user/src/shared/styles/semantic-tokens.css` (+ synced `apps/frontend-admin/src/styles/application-tokens.css`) | Digital Ceremony Atelier tokens (`#f7f5f0`, `#fffefb`, `#1c3a32`, `#8c6628`, dark `#111a17`/`#182520`/`#d8b875`), `--ui-rail-*`, fluid spacing/typography scales | `semanticTokens.test.js` 6-digit hex format & contrast ratios (`>=4.5` text, `>=3.0` focus); admin token sync parity |
| `apps/frontend-user/public/color-mode.js` | Pre-hydration sync of `data-color-mode`, `.dark`, and `colorScheme` | Unset key still defaults safely to `'light'` (`DisplayPreferences.test.jsx`) |
| `apps/frontend-user/src/app/providers/ThemeProvider.jsx` | Synchronizes `.dark`, `dataset.colorMode`, `colorScheme`, and `<MotionConfig reducedMotion="user">` | Cross-tab `StorageEvent` listener and zero form-state reset |
| `apps/frontend-user/src/shared/motion/variants.js` | Restrains management motion (`120-240ms`), preserves ceremonial timing (`700ms`) | Backwards-compatible exports (`fadeUp`, `staggerContainer`, `pageTransition`) |
| `apps/frontend-user/src/shared/styles/app-experience.css` & `workspace-ui.css` | `scroll-padding-top` focus safety, tactile button press, dark overview muted contrast fixes | Template/invitation art isolation preserved |
| `apps/frontend-user/src/layouts/{HostShell.css,OwnerExperience.css}` & `EventWorkspace.css` | Unified sticky sidebar cascade, Atelier rail styling, mobile heading alignment, placeholder `object-fit: contain` | Exact desktop `Collapse navigation`/`Expand navigation`/`Toggle modules menu` labels & `koupreng.eventNavigation.<userId>` persistence |
| `apps/frontend-user/src/features/guests/GuestWorkspace.css`, `ErrorState.css`, `ConfirmDialog.css`, `templates.css`, `PaymentPages.css`, `MarketingFeature.css`, `LandingHero.jsx` | Replaced hardcoded white/pink overrides in dark mode; fixed `.tp-price-pill.is-active` dark contrast & `.kp-mini-kicker` contrast; sped up LCP hero fade (`0.12s`) | All guest workflow actions, table semantics, pricing figures, and template identities unchanged |
| `apps/frontend-user/src/features/invitations/studio/{publishReadiness.js,PublishReview.jsx,StudioGuide.jsx,StudioChrome.css,useStudioPersistence.js}`, `InvitationForm.jsx` & `apps/frontend-user/src/features/events/onboarding/EventDetails.jsx` | **Phase 15:** Added `visibility` (`PUBLIC`/`PRIVATE`/`PASSWORD_PROTECTED`), `accessPassword` save payload + server hash hint + post-save password clearing via `useStudioPersistence` `acknowledge` transform (and stripped from `downloadEdits`), `previewUrl`, missing-password server recovery, `QRCode` SVG card & download, Telegram/WhatsApp/Web Share, and Studio `Unpublish invitation` confirmation across both Studio and Event Settings | Exact `Review publication` modal title, `Confirm publication` gating, `expectedUpdatedAt` conflict guard, server-authoritative publish confirmation |
| `apps/frontend-user/src/features/wedding-site/PublicInvitationFeature.jsx` & `InvitationPages.css` | **Phase 15:** Styled `.protected-gate-card`, added show/hide password toggle, localized `403`/`429` messages, cleared stale `sessionStorage` accessToken on `403`, applied semantic tokens to `PublicUnavailableView` | Strict `403` / `404` / `UNPUBLISHED` security gates; owner CTA shown only when `isOwner` verified |
| `apps/frontend-user/public/manifest.webmanifest` & `index.html` | Added verified Web App Manifest + theme-color meta tags pointing to verified `/branding/icons/icon-192.png` and `512.png` | Deliberately avoided unsafe Service Worker caching (`FUV2-G41`) |
