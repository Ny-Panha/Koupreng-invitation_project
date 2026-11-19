# Venue directory, dialog and media

Source HEAD: `2429b76545b683fad2a0a6f328bee3264875edc3` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.

Four local static venue records are an editorial starting point, not booking inventory. Capacities, price symbols, popularity/service tags and image identity are not independently verified venue facts. A visible disclaimer requires direct confirmation; photos are explicitly illustrative. The new contact CTA says Contact Koupreng rather than implying a booking partnership. Rights/factual review stays open.

Gemini's extraction removed the inline style block and emitted a route CSS asset; initial JSX did not contain the claimed async decoding. Codex retained the stylesheet/art direction, namespaced generic tag/overlay/gold classes, made the search controlled with focusful reset, supplied missing-ID recovery and a fixed-size failed-photo fallback, and made selected photos eager/async while keeping cards lazy.

The initial custom role=dialog did not make background inert. Native showModal now owns modality; closed dialogs stay hidden until the open state exists, preventing an early Escape race; explicit trap/Escape and return paths remain. URL :id now owns selection. Card navigation pushes history, Back returns to directory, and direct close replaces to `/venues` with search focus. A first repair's duplicated state exposed a WebKit stale-dialog failure; source-derived selection fixed the reproduced failure. The original venue unit test was wrapped in the real `/venues/:id?` route; assertions were retained. This is fixture realism, not a weaker expected result. Old Phase02 assertions were untouched.

No ScrollReveal entrance hides the venue task while waiting for viewport intersection. Reduced motion avoids card/dialog transforms. Search min-width and modal safe-area/vertical flow prevent clipped primary actions. Failed and slow-photo paths run locally without remote venue fetches. [after capture](../../../output/phase07-codex-2026-11-18/after/venues-_venues_1-direct-390-en-dark-reduce.png) / [after capture](../../../output/phase07-codex-2026-11-18/after/venues-_venues-empty-390-en-dark-reduce.png).
