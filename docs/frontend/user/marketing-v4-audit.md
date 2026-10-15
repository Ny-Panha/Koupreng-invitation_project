# Marketing V4 baseline audit

Date: 2026-10-14. Local authority: `e249642b` (`feat: Revamp Koupreng Premium
Landing V3 with Silk & Ink Editorial design`), branch `main`. Initial
`git status --short`, `git diff --stat` and the marketing/layout diff were empty;
there were no untracked files. The V3 work is committed locally, contrary to the
brief's earlier observation. Existing V3 implementation and reports are retained.

## Source and rendered defects

- Home has a coherent folio interaction, working catalog and selection paths.
  Its long sequence repeats invitation benefits and photographs; guest management
  is described but not demonstrated. Pricing is a link with notes, and help is
  only in the FAQ. Featured templates are all eagerly loaded. Axe finds one
  `color-contrast` failure: decorative gold on the dark benefits block, 4.39:1.
- Pricing still imports the 2.52 MB banquet background and legacy glass styling.
  Anonymous visitors see a short sign-in sentence amid a mostly empty full-screen
  photograph. The formatter converts missing prices to zero and falls back to
  USD, which can misrepresent an unavailable offer. There is no comparison UI.
- Contact still uses that background, Moul headings, inline layout/color rules,
  and mixed Khmer/English text after switching to English. It defaults to an
  Enterprise plan and displays an invented fixed Pro price. Its phone, address,
  email, 24/7 claim and conflicting Telegram label/link lack authoritative public
  configuration. Busy guarding and SMTP acknowledgement are correct and retained.
- Shared chrome has a floating header and local Khmer/editorial font aliases.
  Global CSS and HTML nevertheless request three large Google Font stylesheets,
  with many unrelated invitation families. Pricing/Contact chatbot greetings
  obscure content before the visitor requests help.

## Contracts verified in source

`SecurityConfig` permits public templates, i18n and POST contact, then requires
authentication for everything else. GET `/api/v1/packages` is authenticated;
`SubscriptionController` explicitly documents this. No public package endpoint
was found. V4 keeps the boundary and uses descriptive pricing factors for public
discovery. Authenticated offers come from `SubscriptionPackageResponse`: currency,
price, duration, invitation/guest limits and explicit feature flags. No backend
authorization, checkout, payment or entitlement rule is changed.

`ContactRequest` accepts name (120), email (255), phone (30), optional free-text
plan/topic (120), and message (5000). There is no plan enum, so a general inquiry
is valid. `ContactService` limits requests to five per 15 minutes and only returns
`accepted: true, delivery: SMTP_ACCEPTED` after the mail transport accepts the
message. Configuration and transport failures remain errors. No real messages
will be sent. The owner answered the contact-details clarification with “yes”
but supplied no addresses; unverified external channels are omitted.

## Baseline evidence

`output/design-review/marketing-v4/before/` contains all three public routes in
Khmer/English at 390/1440, targeted 320 renders, and additional authenticated
pricing fixtures. Render source is the local production build with intercepted
API data, not live packages or contact delivery. `render-audit.json` records zero
document overflow in these cases and the Home contrast failure in both languages.
V3 captures in `output/design-review/landing-v3/` were inspected as context.

Equivalent cold Chromium lab runs (4x CPU, 1.6 Mbps, 150 ms latency; three runs)
give baseline median Home LCP 4976 ms at 390 and 4964 ms at 1440. CLS is about
0.0174 / 0.00185. These are local lab values, not field p75 or field INP.

The StyleSeed manifest selects `operations-console`, productivity/list/product-ui.
It has no matching public marketing artifact. Its dashboard bundle is left intact;
V4's bounded public contract is recorded in the art-direction document.
