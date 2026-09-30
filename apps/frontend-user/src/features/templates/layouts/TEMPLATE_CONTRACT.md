# Template Architecture Contract (TEMPLATE_CONTRACT.md)

This document formalizes the technical specification and architectural rules for all digital wedding invitation templates in Koupreng.

---

## 1. Architectural Core Principles

1. **Shared Universal Cover:**
   Templates **MUST** use the shared `<CoverBackground>` component (`apps/frontend-user/src/features/templates/shared/Openings/CoverBackground.jsx`).
   > [!IMPORTANT]
   > **Never write bespoke per-template cover code.**
   > All cover-opening backgrounds (user-uploaded images, videos, and default art) are resolved through `<CoverBackground>`.

2. **Design Tokens:**
   All colors, typography, and theme variables are declared once in scoped CSS variables under the template's root class (e.g., `.tpl-<slug>`).
   **No hardcoded color hex values** may appear in template JSX components.

3. **Asset Slots:**
   Every decorative graphic, frame, or motif is referenced via designated CSS variables (`--asset-hero`, `--asset-frame`, `--asset-ornament`).
   A missing asset **must gracefully degrade to empty space** (e.g. `none`), never breaking or collapsing the layout.

---

## 2. Template Manifest Specification (`template.json`)

Every template layout folder under `apps/frontend-user/src/features/templates/layouts/<TemplateName>/` MUST provide a `template.json` manifest.

### Schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "slug": "template-slug",
  "name": "Human Readable Template Name",
  "version": "1.0.0",
  "category": "WEDDING",
  "cover": {
    "type": "image",
    "src": "/path/to/default-cover.jpg",
    "poster": "/path/to/default-poster.jpg",
    "autoplay": true,
    "loop": true,
    "muted": true,
    "objectFit": "cover"
  },
  "tokens": {
    "--tpl-primary": "#d4af37",
    "--tpl-secondary": "#f3e5ab",
    "--tpl-bg": "#0d0f12",
    "--tpl-surface": "rgba(22, 26, 33, 0.75)",
    "--tpl-surface-elevated": "rgba(30, 35, 45, 0.85)",
    "--tpl-border": "rgba(212, 175, 55, 0.25)",
    "--tpl-text-primary": "#f8fafc",
    "--tpl-text-secondary": "#cbd5e1",
    "--tpl-text-muted": "#94a3b8"
  },
  "assetSlots": {
    "--asset-hero": "none",
    "--asset-frame": "none",
    "--asset-ornament": "none",
    "--asset-hero-ratio": "4 / 5"
  },
  "sections": [
    "hero",
    "couple",
    "invitation",
    "schedule",
    "countdown",
    "venue",
    "gallery",
    "closing"
  ],
  "editable": {
    "coverBackground": true,
    "heroPhoto": true,
    "gallery": true,
    "music": true,
    "colors": ["primary", "secondary", "background"]
  }
}
```

---

## 3. Fixed Cover Media Resolution Contract

When rendering an invitation cover, the `<CoverBackground>` component evaluates sources in the following strict hierarchy:

| Priority | Source Field | Type | Description |
|---|---|---|---|
| **1st** | `content.coverBackgroundImage` | Image | Custom photo uploaded by the couple in the editor. Displays full-bleed with an automatic contrast scrim. |
| **2nd** | `content.coverVideoUrl` / `content.openingVideoUrl` | Video | Custom video chosen/uploaded by the user. Autoplays muted, looped with playsinline. |
| **3rd** | `templateDefault.src` (from `template.json`) | Image / Video | Default artwork defined by the designer. Keeps the template's original aesthetic intact. |

---

## 4. Checklist for Adding a New Template

When creating a new template:
1. Duplicate `TemplateBoilerplate` to `apps/frontend-user/src/features/templates/layouts/<NewTemplate>/`.
2. Update `template.json` with the new slug, default cover, and token values.
3. Keep `<CoverBackground>` in the opening gate component.
4. Register the new template in `apps/frontend-user/src/features/templates/registry/templateRegistry.js`.
5. Verify in browser simulator and run test suites.
