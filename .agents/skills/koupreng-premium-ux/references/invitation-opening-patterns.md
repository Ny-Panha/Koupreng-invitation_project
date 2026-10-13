# Invitation Opening Choreography Reference

## 1. Registry & Layout Mapping

Templates are registered in `apps/frontend-user/src/features/templates/registry/templateRegistry.js`.

### Opening Mechanics

1. **Wax Seal & Envelope Unfolding (`DigitalYesLayout`):**
   - Initial state: Centered digital envelope with customized wax seal monogram.
   - User interaction: Tap/click on seal breaks the seal with audio feedback (if enabled).
   - Envelope flaps fold open via CSS 3D transforms (`rotateX`).
   - Inner invitation card slides upward smoothly (`translateY(-20%)`).
   - Falling petal particle canvas triggers gently in the background.

2. **Velvet Curtain Parting (`EmeraldLuxeLayout`):**
   - Deep emerald velvet drape texture parted via bilateral translation (`translateX(-100%)` / `translateX(100%)`).
   - Unveils golden dual-sided invitation card with 3D flip animation on user swipe or tap.

3. **Cambodian Royal Framing (`KhmerCelestialLayout`):**
   - Cinematic entry with golden Kbach frame border shimmering into place.
   - Bilingual couple presentation with smooth fade-in and scale-in choreography.
   - Sequential reveal of wedding program timeline, reception details, and map coordinates.

## 2. Interaction Invariants

- **Guest Re-entry:** The opening animation must only trigger automatically on the first visit of a session. If the guest refreshes or navigates back from RSVP, preserve the opened state via session storage or local state.
- **Audio Consent:** Background wedding music must never autoplay with sound unprompted if restricted by browser policy. Always provide a floating audio toggle with visible playing/muted visual status.
- **Escape Hatch:** Provide a clear "Skip to Invitation" / "រំលង" option so guests with urgency can immediately access event details and location map.

