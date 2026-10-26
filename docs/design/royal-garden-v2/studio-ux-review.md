# Invitation Studio V2 review

The existing six editing groups, guided workflow, split-view resize, mobile preview dialog, keyboard focus restoration, preview protocol and persistence remain in place. This change extends that product rather than introducing another editor.

## Implemented

- A dedicated **Cinematic intro** panel in Media & Opening, available only for Royal Garden's renderer capability. It controls enablement, style, authored text, slideshow uploads/order/crops, duration, transitions, shade, text position, Save the Date, music behavior and reduced-motion preview.
- Accessible move/remove buttons and per-image descriptions. The 24-image and 5 MB upload limits show validation errors before committing invalid selections.
- Shared canonical names/date, cover-media uploads, music, multi-day ceremony editor, gallery editor and map editor remain linked to the same preview.
- Map presentation selection supports uploaded sketches, interactive maps or venue details, while keeping saved alternate map media.
- Royal Garden appearance consumes the existing palette, font, element-font, size/alignment and portrait controls, plus ornament visibility/scale.
- Unsupported story, party, FAQ, dress-code and separate couple-photo controls are omitted through capabilities. They remain saved if the owner switches templates.
- The advanced editor's workflow mode and workspace split selector now share one row; this removes an extra full-width toolbar without removing functionality. Section disclosure styling, active navigation and upload cards have been refined.
- Mobile retains a section select, a sticky toolbar, existing Preview/Return to editing flow, keyboard-safe controls and a single editing column. Slideshow rows adapt down to 320px.
- Saved `gallery` data now initializes Studio's editable photo list, preventing destructive round-trips from legacy/public gallery-only content.

## Retained reliability behavior

Server-confirmed save status, failed-save retry, 409 conflicts, expired sessions, unsaved-draft export, undo/redo and navigation guards still belong to `useStudioPersistence`. Every offered intro control changes persisted form state. No simulated upload/save success or second persistence store was added.

## Deliberate boundaries

Wishes remain private RSVP text because no moderated public-feed endpoint exists. The public placeholder explains that limitation. Tickets, RSVP access, map/monogram premium access and payments retain their existing permissions. Live catalog activation and database verification remain deployment/administrative steps; browser fixtures do not establish production availability.

Visual evidence includes desktop and mobile Studio screenshots. This is an incremental refinement of the existing Studio; it does not claim a full application redesign or a new independent design system.
