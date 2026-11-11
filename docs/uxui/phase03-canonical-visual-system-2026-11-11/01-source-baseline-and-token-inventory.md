# Source baseline and token inventory

At starting HEAD `c4af9e8`, source inspection found two independent application palettes: user `--app-*` in `app-experience.css` and admin `.dark` values in `styles/index.css`. The user `semantic-tokens.css` already supplied `--ui-*` light compatibility variables and a deterministic two-export sync. Auth's centered page used fixed light backgrounds even when customer appearance was dark. Admin loaded a remote Google stylesheet at the top of its CSS and another broad font catalog in `index.html`.

| Owner/source | Examples | Used by | Decision |
|---|---|---|---|
| Canonical `semantic-tokens.css` | `--ui-theme-canvas`, `--ui-theme-ink`, status, font, spacing, Studio chrome | Both apps after sync | Authoritative management source |
| Legacy `--ui-*` in same file | `--ui-canvas`, `--ui-action`, `--ui-font` | Older UI and renderer-adjacent paths | Keep values stable; migrate component by component |
| User `app-experience.css` | `--app-*`, `--ws-*` | Marketing, owner and event modules | `--app-*` now aliases canonical roles; local `--ws-*` remains a bridge |
| User `styles/index.css` | `--kp-public-*` | Public marketing shell | Core canvas/surface/text/border/action aliases mapped; decorative recipe remains scoped |
| User `AuthPage.css` | auth card, field, link and CTA | Login/register | Scoped role overrides repair dark surface and contrast |
| Generated admin `application-tokens.css` | exact source mirror | Admin build | Regenerate, never hand edit |
| Admin `styles/index.css` | Tailwind `--background`, `--primary`, `.dark` | Admin shell and login | Aliases map canonical role; `.dark` only keeps legacy warning bridge |
| Admin `TemplateStudio.css` | `--ui-studio-*` | Authoring chrome, outside iframe | Tokenized selected controls and frame, artwork untouched |
| Invitation CSS / `[data-theme=wed]` | authored display fonts, palettes, media | Public invitation renderers | Intentionally independent; no blanket rewrite |

The actual import order is user font CSS → canonical CSS → Tailwind in `src/styles/index.css`, and admin Tailwind → generated canonical CSS → local font faces and aliases in `src/styles/index.css`. Scoped stylesheet ordering and high-specificity component rules still matter. A text search alone is not evidence that a selector is dead; the 52 capture manifest and current route contracts establish active samples. Complete selector migration remains Phase 04 and domain phases.

Baseline read-only builds and captures live under ignored `output/playwright/uxui-phase03-2026-11-11/before/`. Each manifest record contains starting SHA, route, fixture, locale, viewport, mode, browser, motion, font requests and computed samples. Baseline `--app-canvas` was `#f6f7f3` in light and `#111a16` in dark, while admin dark `--background` was `#09090b`. Auth dark still computed a light heading color `rgb(31,36,33)` before the fix.
