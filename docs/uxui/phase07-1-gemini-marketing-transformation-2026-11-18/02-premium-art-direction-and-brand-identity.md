# 02 — Premium Art Direction & Brand Identity

## 1. Brand Concept: Digital Invitation Atelier

The brand expression for Koupreng is **KoupReng Digital Invitation Atelier**: a harmonious union of traditional Cambodian ceremonial reverence and contemporary editorial digital craftsmanship.

Rather than treating digital invitations as ephemeral web forms or generic SaaS landing pages, Koupreng positions them as bespoke ceremonial keepsakes that set the emotional tone for a wedding celebration.

---

## 2. Core Palette System

The color architecture directly incorporates Koupreng's canonical tokens (`--ui-theme-*`), enriched with high-contrast ceremonial roles:

| Role | Token Fallback | Hex (Light) | Hex (Dark) | Description |
|---|---|---|---|---|
| **Canvas** | `--ui-theme-canvas` | `#FBF6EE` | `#172019` | Warm ivory paper canvas; obsidian forest in dark mode |
| **Surface** | `--ui-theme-surface` | `#FFFFFF` | `#202A24` | Elevated cards, dialog backgrounds, and panel containers |
| **Ink** | `--ui-theme-ink` | `#1F2421` | `#F0F3EE` | Deep charcoal/forest ink with >= 7:1 contrast on canvas |
| **Muted** | `--ui-theme-muted` | `#59615C` | `#B9C7BA` | Secondary details, captions, and helper annotations |
| **Gold Ink** | `--ui-theme-gold` | `#926C34` | `#D9B879` | Ceremonial champagne gold for eyebrow kickers and accents |
| **Border** | `--ui-theme-border` | `#E6DCCB` | `#425447` | Subtle structural division evoking deckled paper edges |
| **Brand Action**| `--ui-theme-action` | `#2E433A` | `#B7D2B8` | Deep evergreen action buttons with crisp white/obsidian text |

---

## 3. Typographic Hierarchy

1. **Khmer Heading Display:**
   - Font: `Moul`, `Kantumruy Pro`, serif (`--ui-font-display`).
   - Line height: Minimum 1.6 to 1.8 to prevent Khmer superscript vowels (`ិ`, `ី`, `ឹ`, `ឺ`) and subscript consonants (`្ក`, `្ខ`, `្គ`) from clipping.
   - Letter-spacing: Strictly normal (`0`); never apply artificial tracking to Khmer script.
2. **English Heading Display:**
   - Font: `Koupreng Editorial` (locally served Cormorant Garamond OFL), `DM Sans`.
   - Tight line-height (1.1 to 1.17) and subtle negative tracking (`-0.02em`) for editorial sophistication.
3. **Body & Microcopy:**
   - Bilingual body: `Kantumruy Pro` (Khmer) and `DM Sans` (Latin) via `--ui-font`.
   - Base font-size: 16px with comfortable 1.75–1.8 line height.
   - All interactive controls enforce a minimum hit area of 44×44px.

---

## 4. Anti-Patterns Explicitly Avoided

- **No generic purple/blue SaaS gradient:** The marketing domain uses natural botanical evergreen, ivory, and champagne gold.
- **No excessive neon glassmorphism:** Frosted glass is used selectively for the floating header (`backdrop-filter: blur(16px)`), never as unreadable translucent cards over busy photography.
- **No fake counters or fabricated metrics:** All metrics displayed (10 artisan themes, 100% bilingual support, 7 adaptive viewports) represent source-verifiable system properties.
- **No fabricated reviews or stock testimonials:** Section content focuses on verified workflow capabilities (guest RSVP tracking, Telegram/Messenger sharing, interactive folios).
- **No global route curtains:** All pages paint structural HTML and readable content immediately without motion-blocking curtains.
