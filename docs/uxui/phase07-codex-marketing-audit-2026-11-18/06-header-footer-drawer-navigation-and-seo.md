# Header, footer, navigation and SEO

Source HEAD: `2429b76545b683fad2a0a6f328bee3264875edc3` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.

The actual skip link is `.host-skip-link` → `#marketing-content`; neither Gemini's `#main-content` nor `#nav-menu` claim matches current source. Header's native `#public-mobile-navigation` retains Escape, Tab wrap, return focus, body scroll lock, route close and desktop resize behavior. Six-project Phase06 tests exercise Back/scroll, owner/admin drawers and Studio reachability separately.

A fresh page-end check reproduced the fixed support launcher covering the Khmer credit in four WebKit/Firefox cases (Chromium passed). Marketing-only footer bottom space now clears the launcher; all six project cases pass. Matched page-end captures distinguish this from intermediate scrolling: [before capture](../../../output/phase07-codex-2026-11-18/before/home-_-footer-end-320-km-dark-reduce.png) / [after capture](../../../output/phase07-codex-2026-11-18/after/home-_-footer-end-320-km-dark-reduce.png).

Header discovery/create/login or signed-in Dashboard destinations and footer home/templates/pricing/venues/contact/login are source-preserved and fixture-tested. About/Help use client-side Navigate replace to Contact. No dedicated About/Help page, permanent server redirect, address, concierge email or office hours was manufactured.

Contact now has a route title, scoped description/social copy and canonical without query/fragment. Marketing tags restore previous values on unmount, protecting guest metadata ownership. Removed the app-level generic title writer which overwrote direct route titles. [App.jsx:27](../../../apps/frontend-user/src/app/App.jsx#L27) and [MarketingMetadata.jsx:7](../../../apps/frontend-user/src/features/marketing/MarketingMetadata.jsx#L7).

**SEO limit:** static index still contains generic invitation-oriented social fallback, and client tag updates do not certify non-JavaScript social bots, crawl rendering, HTTP redirect codes or HTTP404 deployment behavior. Deployment/SEO owner must validate server response/canonical/social-card origin and rights on staging. No backend or Nginx change was made to manufacture certification. [after capture](../../../output/phase07-codex-2026-11-18/after/contact-_about-alias-390-en-dark-reduce.png) / [after capture](../../../output/phase07-codex-2026-11-18/after/home-_phase07-missing-404-390-en-dark-reduce.png).
