# 08 — Event Cards & Editorial Visuals

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Card Anatomy, Media Fallbacks, Provenance Badging, and Action Controls  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Card Anatomy & Visual Structure

Every event card rendered by `EventCard.jsx` adheres to the Koupreng luxury editorial standard:
1. **Media Frame (Top):** 16:9 aspect ratio media container displaying the resolved cover photo or template artwork with subtle hover zoom.
2. **Provenance Badge (Overlaid on Media):** Tone-coded pill indicating publication, draft, sync status, or sharing.
3. **Card Body:**
   - Subtitle / Event Type: e.g. "Wedding" / "អាពាហ៍ពិពាហ៍" or "Birthday" / "ខួបកំណើត".
   - Event Title: Heading level 2 truncated to 2 lines for layout balance.
   - Host / Couple Line: Displays couple or celebrant names.
   - Schedule & Venue Meta: CalendarDays icon with formatted local date, Clock icon with reception time, and MapPin icon with venue name.
4. **Action Footer:**
   - Primary Action Button: "Manage event" (for server events) or "Resume draft" (for local drafts).
   - Secondary Actions: "Preview" button and "More options" dropdown (Delete, Edit).

---

## 2. Cover Photo Fallback Hierarchy

To eliminate placeholder flickers and ensure intentional media presentation:
1. **Event Cover Photo (`draft.coverUrl` / `draft.coverImage`):** User-uploaded custom celebration photo.
2. **Invitation Cover (`draft.invitationCoverUrl`):** Authored invitation cover image.
3. **Template Art (`draft.templateThumbnailUrl`):** High-resolution artwork for the chosen template (e.g. `royal-garden.svg`).
4. **Authored Empty Fallback (`/facebook/all/06-card/cover-card.jpg`):** Professional Koupreng monogram background; never a generic stock couple photo.

---

## 3. Responsive Touch Targets

On mobile screens (320px–393px):
- All buttons have a minimum touch target of 44x44px.
- Primary and secondary buttons expand to fill width comfortably on single-column layouts.
- Focus outlines use `--ring` (gold accent) with high contrast for keyboard accessibility.
