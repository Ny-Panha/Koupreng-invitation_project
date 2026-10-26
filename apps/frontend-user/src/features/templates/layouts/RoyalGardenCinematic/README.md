# Royal Garden Cinematic — reference-inspired invitation

**Status:** First implementation, ready for local QA (not asserted pixel-perfect). The supplied 79.87-second screen recording shows a Khmer/English burgundy-and-gold floral wedding invitation, a garden opening, a save-the-date shot, a monogram reveal, and a long invitation page. The reference does **not** include reusable source assets, source code, or animation configuration, so this branch supplies original CSS/SVG illustrations rather than claiming a 100% identical copy.

## Architecture

- Canonical slug/preset: `royal-garden-cinematic` / `ROYAL_GARDEN_CINEMATIC`.
- Dedicated layout: `RoyalGardenCinematicLayout.jsx`, lazy-registered in `src/features/templates/registry/templateRegistry.js`.
- Metadata and editability: `template.json`.
- Scoped visual CSS and animated bird art: `royal-garden-cinematic.css`, `public/templates/royal-garden/*.svg`.
- Demo identity: `ROYAL_GARDEN_CINEMATIC_TEMPLATE` in `templatesData.js`.
- Opening background: **must** use the existing shared `CoverBackground`. No separate opening-media resolver is introduced.
- Backend remains the sole authority for invitation ownership, template purchases, RSVP submissions, and payment verification.

## Features and customization

The opening button transitions **cover → save-the-date → ornamental monogram → invitation body**. Reduced-motion and embedded previews skip staged transitions. The body supports editable bride/groom names, families, guest, title, message, dates, times, venue, map link or illustration, schedule, gallery, gift QR images, enabled sections, section order, color/font overrides, and background music. A floating menu scrolls among sections, a music toggle controls audio, and a gallery lightbox supports Escape and keyboard arrows. The existing backend-connected RSVP element is rendered from the `children` slot; this layout deliberately does **not** create an isolated fake RSVP database or a fake payment-confirmation UI.

Some original footage-specific artwork—photorealistic lakeside roses, gilded Khmer lettering, 3D ornamentation, audio and particle footage—is not present as licensed standalone assets. Replace original illustration slots with assets owned/licensed by the project when available.

## How to preview

From `apps/frontend-user` run:

```bash
npm install
npm run dev
```

Open `http://localhost:5173/templates/royal-garden-cinematic`. The template has a local demo fallback. When the backend contains any active templates, **the public gallery lists only backend catalog entries** by design; a static fallback alone is **not** enough to offer this design for purchase or permanent event creation. Add/activate a real backend template through **Admin → Templates** using exact code `royal-garden-cinematic`, category `WEDDING`, desired supported event types/languages, active status, and appropriate price/access policy. Preserve the existing backend IDs and purchase records; do not reuse numeric IDs.

For host customization, use the existing `/app/events/new?template=royal-garden-cinematic` flow after the code has a real active catalog record. The builder stores the owner data; this layout renders it and respects disabled sections. Only genuine gift QR images supplied by the owner are displayed. Display/download is **not** proof of a verified transaction.

## QA commands

From `apps/frontend-user`:

```bash
npm run lint
npx vitest run src/features/templates/layouts/RoyalGardenCinematic/RoyalGardenCinematicLayout.test.jsx src/features/templates/registry/templateRegistry.test.jsx
npm run build
```

Manual acceptance: mobile 320/375/430px and desktop, Khmer glyphs and wraps, opening without auto-audio, keyboard navigation, music block/autoplay failure, reduced motion, lightbox close/arrow keys, no gallery leakage from demo into hosted invitations, QR absent without real owner data, venue without URL, missing background art, preview update messages from a trusted channel only, and live published RSVP using its existing backend service. Verify network and bundle budget with Playwright before publishing.

## Production asset replacement

Original asset slots in `template.json`: `--asset-hero`, `--asset-frame`, `--asset-ornament`. The default `garden.svg`, `wallpaper.svg`, and `hummingbird.svg` are intentionally original vector substitutes. Only replace with graphics, photographs, recordings, fonts, or music for which the project has rights.
