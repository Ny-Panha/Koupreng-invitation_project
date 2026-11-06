# Official Koupreng logo integration

The approved Downloads package is integrated without changing the Khmer artwork,
gold colors, heart, Romdoul flower, or transparent wordmark background. All 35
original package files already present in `public/branding` matched the extracted
ZIP by SHA-256 and remain byte-identical.

## Components and sizes

`apps/frontend-user/src/shared/branding/BrandLogo.jsx` is the canonical primitive.
It supports `variant`, `size` (preset name), `className`, `priority`, `decorative`,
`label`, and optional `href`/`linkLabel`. Use the app's router `Link` around a
decorative logo for in-app navigation. The admin app has a synchronized local
copy because each frontend has its own Docker build context.

| Preset | Mobile width | Desktop width | Use |
| --- | ---: | ---: | --- |
| header | 105px at 320px; otherwise 128px | 168px | Public header |
| footer | 148px | 192px | Public footer |
| compact | 105px at 320px; otherwise 112px | 144px | Host/admin navigation, mobile menus |
| auth | 176px | 200px | Login, register, password recovery/reset |
| invitation | 148px | 176px | Template closing signature |
| hero | 240px | 300px | Celestial's no-couple/no-custom-mark opening fallback |
| welcome | 144px | 176px | Existing preloader, standalone 404 |
| icon | 40px | 40px | Desktop studio; admin uses this below 360px |

`responsiveIcon` selects the envelope with a media-specific `<source>` below
360px, so the admin header retains space for its controls. The host account is
available in the mobile drawer at that width. Studio branding is omitted on
mobile to preserve editing controls and the invitation title.

`InvitationBranding` centralizes template attribution. `showBrandMark: false`
hides it; an authored `brandMark`/`brandMarkUrl` replaces platform attribution.
Royal Garden's existing `brandStyle: text` remains text-only and localized.
Authorization, premium/custom-branding entitlements, APIs and migrations were
not changed.

## Integrated surfaces

- Public header and mobile menu, shared marketing footer (home, templates,
  pricing, contact/help, venues), host navigation and mobile header.
- Shared auth layout, standalone 404, existing welcome preloader, desktop
  invitation studio, admin header/mobile drawer/login.
- Closings: shared experience, Default, Digital Yes, Emerald Luxe, Event
  Essential, WithJoy, Bliss, Canva Khmer, Khmer Celestial, Khmer Floral Gold,
  Royal Garden, Silk Heritage and starter boilerplate. Silk's existing opening
  attribution and Celestial's fallback use the approved artwork; couple names
  and custom marks retain priority.
- Both apps' favicon/touch icons; public Open Graph/Twitter fallback image.

## Assets and performance

The master is 1968×724 RGBA (1,347,686 bytes). The supplied 4096px versions are
upscaled raster artwork. UI sources use only 128/160/192/256/320/384/480/640px
WebP, with 192/384/640px PNG fallbacks. WebP files range from 7,138 to 74,998
bytes; a 128px mobile header uses about 7KB at 1× or 20KB at 2×. Original large
package files are retained, but no logo component requests 4K assets or bundles
the legacy PNG import. Explicit dimensions/aspect ratio reserve layout space;
headers load eagerly and closing/footer images load lazily.

The package had no standalone symbol. Favicon/touch/app-size icons are derived
from the envelope/heart/rays at the original ribbon occlusion edge, preserving
their colors. The full wordmark is never squeezed into a square. Sizes include
16/32/48/180/192/512px plus ICO. The separate opaque 1200×630 social card is
83,213 bytes; transparent UI assets remain transparent.

Regenerate derivatives and synchronize the admin component from the repository
root with `python scripts/prepare-branding.py` (Pillow required). Both public
directories have `runtime-manifest.json` with checksums. Keep
`VITE_PUBLIC_APP_URL` set to the deployed public origin for absolute sharing URLs.

## Deliberate exclusions and verification limits

No new logo is repeated in the homepage hero, form fields, product cards, RSVP
form/success panel or each invitation section; shared chrome and closing
signatures provide branding. Custom couple monograms, wax seals and template
artwork are not replaced with platform logos. Existing email senders use plain
text. CSV/XLSX/calendar/vector/map/QR exports and operational print reports are
data outputs; no image branding was added. There is no existing installable PWA
manifest/service-worker flow, so app-size icons are supplied without introducing
a new PWA.

Production builds were checked locally. Browser management and guest checks use
synthetic intercepted API DTOs; they do not prove live backend/deployed routing
or modify user records. Auth retains its existing light surface, even when the
global preference is dark. The logo was inspected on actual dark marketing and
invitation surfaces. See `official-branding-verification.md` for commands,
results, modified paths and screenshot evidence.
