# Koupreng V7 — Soft-Luxe Design System & Tokens
**Theme:** Koupreng Atelier (Soft-Luxe Product Studio)  
**Palette Foundation:** Warm Ivory, Deep Evergreen Ink, Cambodian Temple Gold, Titanium Dark

---

## 1. Design Direction: Direction A (Atelier Floating Device)

To elevate Koupreng from an ordinary template directory into an art-directed Cambodian SaaS platform, three creative directions were evaluated:

1. **Direction A — Atelier Floating Device (Selected):** Centered around an interactive, titanium-trimmed smartphone mockup with bounded 3D perspective tilt (±5.5°), soft pill controls (`border-radius: 9999px`), floating glass header (`backdrop-filter: blur(16px)`), and an editorial split-screen authentication suite.
2. **Direction B — Invitation Gallery Stage:** Pure paper folio aesthetic with extensive wax seal animations. Rejected because it lacked digital SaaS feel and failed to showcase mobile guest responsiveness.
3. **Direction C — Split-Screen Product Story:** Tech-heavy feature grid. Rejected because it diminished the cultural romance and ceremonial warmth essential for Cambodian weddings.

---

## 2. Core Token Architecture

### Radii Hierarchy
```css
:root {
  /* Soft-luxe pill geometry for all interactive CTAs, chips, and filters */
  --kp-radius-pill: 9999px;

  /* Card and elevated container surfaces */
  --kp-radius-card: 24px;
  --kp-radius-modal: 26px;
  --kp-radius-header: 20px;

  /* Form controls */
  --kp-radius-input: 14px;
  --kp-radius-button-sm: 9999px;
}
```

### Color Palette Tokens
| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| `--kp-bg` | `#FAF7F2` | Warm ivory canvas background |
| `--kp-surface` | `#FFFFFF` | Primary card and surface background |
| `--kp-paper` | `#F2ECE2` | Tactile textured paper backing |
| `--kp-deep` | `#2E433A` | Deep evergreen ink; primary branding & CTA background |
| `--kp-deep-hover`| `#22332C` | Darkened evergreen on hover |
| `--kp-gold` | `#C3A26B` | Cambodian temple gold accent |
| `--kp-gold-ink` | `#77572C` | Warm ceremonial gold for eyebrows and kickers |
| `--kp-ink` | `#262622` | Rich dark charcoal for body copy & headings |
| `--kp-muted` | `#695D50` | Refined warm neutral for descriptions & metadata |
| `--kp-border` | `#E5DED2` | Subtle structural borders |

### Elevation & Lighting Tokens
- **Pill CTA Elevation:** `box-shadow: 0 4px 14px -3px rgba(46, 67, 58, 0.25);`
- **Pill CTA Hover Elevation:** `box-shadow: 0 8px 22px -4px rgba(46, 67, 58, 0.35); transform: translateY(-2px);`
- **Card Soft Shadow:** `box-shadow: 0 16px 48px -12px rgba(46, 67, 58, 0.12), 0 0 0 1px rgba(229, 222, 210, 0.7);`
- **Floating Header Glass:** `background: rgba(250, 247, 242, 0.88); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);`

---

## 3. Smartphone Hardware Mockup Anatomy

The `PublicTemplateDevicePreview` component embodies an authentic luxury smartphone:
1. **Outer Shell:** Dimensions `330px × 660px`, `border-radius: 46px`, titanium dark matte frame (`#1C2321`) with metallic bevel mask gradient (`rgba(255, 255, 255, 0.6)` to `rgba(195, 162, 107, 0.4)`).
2. **Physical Hardware:**
   - Power button right side (`width: 3px`, `height: 48px`, `#4A5652`)
   - Volume rocker left side (`width: 3px`, `height: 90px`, `#4A5652`)
   - Dynamic Island / camera pill (`width: 96px`, `height: 24px`, `#000000`) with circular camera lens reflection
3. **Specular Glass Sheen:** Diagonal highlight gradient (`linear-gradient(115deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 35%, transparent 55%)`) layered above screen content with `pointer-events: none`.
4. **Ceremonial Status Bar:** Live time display (`9:41`) and live pulsing wedding melody indicator (`.kp-music-pulse` with infinite keyframe scaling).
5. **Interactive 3D Stage:** Tracks cursor position to rotate smoothly up to ±5.5° on X and Y axes, returning to level when the cursor leaves. Includes an accessible *"Reset 3D view"* keyboard trigger.

