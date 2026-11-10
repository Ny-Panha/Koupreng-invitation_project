# Visual Invitation Studio Modernization

## Overview

The Visual Invitation Studio (`/app/events/:eventId/invitation` and legacy `/dashboard/invitations/:id/edit`) serves as the creative command center for event hosts to customize their wedding, engagement, or social gathering digital invitations. 

In Phase 07, the Studio was modernized to deliver seamless editing on mobile touchscreens, responsive adaptability on large desktop monitors, real-time focal point positioning, and automatic synchronization of the owner's event photo into compatible template covers.

---

## 1. Architectural Layout & Viewport Adaptability

The modernized Studio employs a responsive split-view architecture that shifts seamlessly between mobile, tablet, and desktop environments:

### Desktop & Ultrawide Layout (>= 1024px)
On desktop screens, the Studio adopts a 3-region responsive workspace:
1. **Left Navigation & Section Sidebar (320px–360px):**
   - Collapsible accordion of invitation sections (Cover & Hero, Couple Details, Ceremony & Reception Timeline, Location & Maps, RSVP & Guest Book, Gift Registry, Photo Gallery).
   - Fast section anchors with completion badges and validation warnings.
2. **Center Live Canvas Viewport (Flexible Width):**
   - High-fidelity interactive preview container with responsive viewport toggles: **Mobile Phone (390px)**, **Tablet (768px)**, and **Full Desktop Width**.
   - CSS transform scaling preserves pixel-perfect typography and aspect ratio rendering without layout jitter.
   - Live synchronization of field edits without triggering full-page remounts or DOM flashes.
3. **Right Controls & Theme Panel (320px–360px):**
   - Typography pairing selectors (Khmer Traditional `Moul` + `Kantumruy Pro`, Modern Elegance `Cinzel` + `Inter`).
   - Color palette overrides with WCAG 2.2 AA contrast compliance.
   - Cultural adornments (Kbach borders, floral corner motifs, gold foil accents).

### Mobile & Tablet Experience (< 1024px)
- **Top Sticky Command Bar:** Displays event title, unsaved changes status dot, quick preview trigger, and the primary "Save" action button.
- **Single-Column Touch-Optimized Form:** Grouped cards with standard 48px touch targets, generous spacing, and native date/time/select pickers.
- **Bottom Sheet / Mobile Drawer Preview:** A floating preview action opens an instant fullscreen preview overlay with iOS-safe bottom insets (`env(safe-area-inset-bottom)`), allowing users to preview animations (envelope wax seal opening, floral unsealing) directly on real mobile devices.

---

## 2. Interactive Focal Point Alignment

When an event photo or custom cover is applied to an invitation, focal point alignment ensures the subject's face or central interest is preserved regardless of aspect ratio:

```jsx
// Focal point configuration controls in InvitationForm.jsx
<div className="form-group invitation-form__focal-group">
  <label className="form-label">{t("coverFocalPoint") || "Cover Photo Focal Point"}</label>
  <div className="invitation-form__focal-controls" role="radiogroup" aria-label="Cover photo alignment">
    {["top", "center", "bottom"].map((align) => (
      <button
        key={align}
        type="button"
        role="radio"
        aria-checked={formData.coverFocalPoint === align}
        className={`invitation-form__focal-btn ${formData.coverFocalPoint === align ? "is-active" : ""}`}
        onClick={() => handleFocalChange(align)}
      >
        {align === "top" ? "Top (Faces)" : align === "center" ? "Center" : "Bottom"}
      </button>
    ))}
  </div>
  <p className="form-hint">
    Adjusts how the cover image centers when cropped on different screen sizes.
  </p>
</div>
```

### Visual Focal Mechanics:
- **`top` (object-position: 50% 15%):** Best for standing full-length portraits and couple portraits where heads/faces sit in the upper third.
- **`center` (object-position: 50% 50%):** Standard default balance for landscape photography, venue shots, and group photos.
- **`bottom` (object-position: 50% 85%):** Ideal for low-angle perspectives, seated ceremonies, or decorative foreground floral arrangements.

---

## 3. Real-Time Template Synchronization & Dynamic Switching

When a user selects a template or switches templates in the Studio:
1. **Photo Reuse Without Loss:** The Studio inspects `formData.couplePhoto` and `formData.coverUrl`. When transitioning between compatible templates (e.g., from `khmer-floral-gold` to `bliss-editorial-wedding`), the couple's portrait is automatically retained and reformatted to the new template's portrait container.
2. **Decorative Art Protection:** When switching to heritage templates (`silk-heritage` or `cover-khmer-golden-wedding`), the traditional artwork is preserved as the default hero layer, preventing user photos from distorting intricate traditional tapestries or Kbach border frames.
3. **Optimistic Dirty State Tracking:** Edits toggle an unsaved status badge and trigger a browser `beforeunload` warning if navigation is attempted without saving.

---

## 4. Typography & Cultural Design Standards

The Studio enforces Koupreng Cambodian design tokens:
- **Khmer Heading Font:** `Moul, serif` for traditional ceremonial titles.
- **Khmer Body Font:** `Kantumruy Pro, sans-serif` for legible details, dates, and names.
- **English Accents:** `Cinzel, serif` and `Playfair Display, serif` paired with `Inter, sans-serif`.
- **Primary Color Palette:**
  - Gold Foil Primary: `#c3a26b` (`--kp-gold`)
  - Deep Bronze: `#8c6b32`
  - Royal Cream Background: `#fbf6ee`
  - Deep Forest Night: `#142820`
