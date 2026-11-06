# Floral Gold V4 baseline and implementation plan

Started from `main` / freshly fetched `origin/main` at
`6c76759def65463cce68c0acbff64d5602f6799b` on 2026-11-06. Fourteen commits
follow the V2 implementation `00dd0054`; their later Studio, public invitation,
media, delivery and release-hardening changes are retained. The existing dirty
tree is the previous authorized official-logo integration, kept as a separate
logical delivery. No other tracked work was present at the start.

That branding work subsequently landed in `origin/main` as `33549ab5` during this
task and is retained as the V4 parent. V4 restores its mobile Navigation accessible
name while preserving the official artwork and centralized logo system.

The original Downloads recording is accessible: 128.10 seconds, HEVC/PQ.
Ten fresh tone-mapped frames were decoded under local `output/floral-v4/reference`.
Original subjects and source frames are not runtime assets. V2 documentation,
capabilities, the style architecture, film root cause and ten-library decisions
were read before implementation.

## Observed baseline

- User Vitest: 1,331 passed / 1 failed in 187 files (28.57s). The failure was the
  mobile dialog's accessible name changed by the uncommitted logo work; its
  existing `Navigation` contract is restored while keeping the logo.
- Admin Vitest: 191 tests in 33 files passed (29.28s).
- Fresh seven-width capture and scrolled Studio-preview audit: 2 Chromium
  browser tests passed (28.7s). Captures are in `screenshots/v4/before`.
- The large blank V2 Studio capture reproduces as an element screenshot extending
  outside the constrained editing scrollport. Scrolling the actual cards into
  view renders the date/program/guest/monogram previews. This is a capture
  artifact, not evidence that the editor needs rebuilding. V4 uses viewport
  captures of each visible picker and checks actual preview contents.
- Docker daemon is unavailable. Native MySQL was initialized with a new owned
  data directory on loopback port 3420. The live QA backend uses its own
  `floral_v4_live` database on 8088; opt-in integration tests use a separate
  `phase12_disposable` schema. Neither connects to the application's normal DB.
- The actual fresh backend catalog has four ACTIVE Free entries: Khmer
  Celestial, Silk Heritage, Khmer Floral Gold and Event Essential. Other local
  renderers are not claimed selectable from this catalog.
- Chromium, Firefox and WebKit binaries are installed. Physical mobile devices
  and live Cloudinary credentials have not been verified.

## Design plan

Keep the reference's narrow stationery canvas, gold Khmer ceremonial hierarchy,
diagonal portraits, existing curved agenda, owner-authored content, diagram and
12 licensed romantic photographs. The palette stays paper `#fffdf8`, engraved
gold `#876326`, pale gold `#d5b77a`, ink `#463b31`, botanical blush `#edd3d9`.
Moul carries Khmer display; Kantumruy Pro carries readable body text; the existing
serif carries English. No new font or motion engine is needed.

1. Refine the independently drawn initials ornament and use the existing beveled
   gold plaque for the cover action, matching the reference's silhouette.
2. Pace the family/portrait entrance and soften the photograph/countdown seam,
   with restrained movement and static reduced-motion/data-saving fallbacks.
3. Improve gallery loading/transitions, fullscreen swipe and cleanup while
   retaining keyboard arrows, thumbnails, focus restoration and owner collections.
4. Preserve the agenda's curves and every saved ceremony. Keep the detailed
   diagram/directions and paid Map Studio boundaries; inspect real embed options
   independently before deciding whether adding one is justified.
5. Exercise actual registration, Free creation, uploads, save/reopen, publication,
   generated guest URLs and RSVP against the disposable backend. Test entitled
   and refused film behavior with the existing server policy.
6. Run risk-based browser suites in available engines, full frontend/backend
   suites where feasible, capture seven-width after/comparison evidence, record
   exact failures/limits, then commit/fetch/integrate/push without deployment.

UI/UX Pro Max's design-system search returned generic landing-page/Latin-font
advice that does not fit this Khmer reference; it was not adopted. The narrower
navigation search supports visible active anchors, keyboard-accessible controls
and restrained section motion. Existing vendor/source-license records remain
the authority for copied code; no new library adoption is assumed.
