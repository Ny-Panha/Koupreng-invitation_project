# Premium brand and three art directions

**Platform thesis:** an invitation atelier with operational clarity. Management chrome can start from current cream `#fbf6ee`, ink `#1f2421`, forest `#2e433a` and gold `#926c34`. Those are baseline tokens, not imposed on template-owned visuals. No original artwork is replaced in Phase 02. These concepts need Cambodian cultural and asset-rights review before adoption.

| Direction | Rationale and content sample | Layout and multilingual type | Motion character / intended surfaces |
|---|---|---|---|
| A — Khmer Ceremonial Heritage | Warmth, family and place; sample: “សូមគោរពអញ្ជើញ” / “You are warmly invited” with real host/event facts. Motifs and any Kbach/floral cue require local review and provenance. | Ivory field, textile or floral frame used sparingly, strong title/date hierarchy; licensed Khmer display face paired with legible Khmer body and compatible Latin. Long Khmer names get 1.6–1.9 line-height and flexible wrap. | Gentle reveal only after explicit Open; static cover fully legible. Khmer Floral Gold, Silk Heritage, Khmer Celestial and Golden Canva are candidate family-level directions, each distinct. |
| B — Modern International Editorial | Fine-art photograph and strong typographic rhythm; sample: couple name, date, place, then a clear RSVP action. Avoid invented photography. | Asymmetric 12-column desktop composition and one-column phone reading order; generous whitespace, restrained dark/cream palette, separate Khmer/Latin typographic metrics and no Latin-only script for Khmer body. | Short fades and image transitions; no mandatory preloader. Bliss Editorial, WithJoy and aspects of Emerald Luxe are candidates. |
| C — Cinematic Immersive | A deliberate ceremonial moment for an invited guest who opts in; sample: envelope/curtain opening leading to event essentials. | Layered 2D/2.5D scene with semantic static content underneath, scene bounds fit mobile safe areas; optional 3D only if measured. | Skippable, repeatable, pausable opening; audio off until consent; static reduced-motion path. Digital Yes, Royal Garden and Celestial may opt in independently. |

**Current → proposed mapping:** the source registry keeps ten existing dedicated components and 38 aliases. Direction labels are design review lenses, not a generic replacement. `TemplateBoilerplateLayout` remains an authoring starter; `TemplateExperience` shared identifiers and `DefaultTemplateLayout` fallback require readable, honest behavior rather than invented bespoke artwork. [Renderer ledger](08-template-experience-tiers.md) lists each assignment.

## Proposed design tokens and hierarchy

| Role | Proposed range / rule | Review gate |
|---|---|---|
| Management surfaces | cream/ivory near `#fbf6ee`, ink near `#1f2421`, forest near `#2e433a`; gold near `#926c34` as accent, not body text | Check actual foreground/background WCAG contrast in light/dark states. |
| Spacing | 4px base rhythm; 8/12/16/24/32/48px common intervals | Test at 320px and 200% zoom; no clipped authoring controls. |
| Type | Khmer body minimum 16 CSS px where practical, line-height 1.65–1.9; Latin body 1.45–1.7; fluid headings without overflow | Validate project font rights/coverage, long names, diacritics and fallback on Windows/iOS/Android. |
| Grid | 1 column phone; 4–8 column tablet; 12 column desktop; content max width by task | Admin data and guest story have different density; source order equals reading order. |
| Shape/depth | Management control radius roughly 8–12px; cards 12–20px; shadows subtle and tokenized | Avoid foggy contrast, nested card excess and 3D in dense forms. |
| Iconography | Existing icon set with text or accessible name; culturally specific symbols only after review | Meaning must work without icon alone; no misleading status icon. |
| Photography/media | Authored/approved photos with crop focal metadata, responsive formats, alt/credit and fallback | Record source, license, attribution, event consent and redistributability before use. |

## State treatments

Primary action uses strong contrast and obvious focus; secondary action is visually subordinate without looking disabled. Pending payment uses a neutral warning treatment, not celebratory gold; PAID uses explicit server-derived text. Error uses text and icon in addition to color. Success motion is brief and never hides the next step. Loading keeps geometry stable. Template-specific palettes may use different hues if contrast and brand/rights review pass.

## Text concept boards, not shipped screenshots

1. **Public/owner management:** cream canvas, forest header, compact gold accent, service facts and one obvious CTA; event cards show status and next task before metrics.
2. **Ceremonial invitation:** art-directed frame, family/couple title, event facts, skippable cover, RSVP visible in static reading order.
3. **Editorial invitation:** full-bleed licensed photo with separate readable text plane, asymmetric desktop story, phone one-column composition.
4. **Cinematic invitation:** opt-in depth scene, immediate Skip, pause/audio controls, static facts accessible before effect completes.

No external reference asset was imported and no moodboard is represented as an implemented screen. Future reference records must include URL, author, license, credit, exact permitted use and whether it can appear in exported invitation templates. The generic Liquid Glass design-system search run during this phase was considered inspiration only; it conflicts with Khmer-first management clarity as a default and is not adopted.
