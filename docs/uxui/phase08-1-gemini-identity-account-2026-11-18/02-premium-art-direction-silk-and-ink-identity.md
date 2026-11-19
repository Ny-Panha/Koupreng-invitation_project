# 02 — Premium Art Direction: Silk & Ink Identity

## Calm, Trustworthy, and Task-First Identity Foundations

### 1. The Design Philosophy: Identity is Task-First
While KoupReng's wedding invitation templates celebrate Cambodian heritage with ornate gold leaf, ceremonial floral motifs, and rich cinematic wax seals, the authentication and account management surfaces demand an intentionally distinct art direction: **Silk & Ink**.

Identity UX must feel:
- **Calm & Reassuring:** Users managing passwords, entering verification codes, or fixing session timeouts should experience clarity, simplicity, and low cognitive friction.
- **Trustworthy & Secure:** Subtle borders, precise tactile inputs, authoritative feedback states, and clear privacy protections reassure users that their credentials and wedding data are protected.
- **Rooted in Cambodian Luxury:** Subdued parchment creams (`#FBF9F4` in light mode), deep warm obsidian inks (`#181613` in dark mode), subtle metallic accents, and refined typography preserve brand coherence without theatrical distraction.

### 2. Semantic Token System Parity
All auth and profile components now leverage KoupReng's canonical semantic tokens (`--ui-theme-*`), ensuring seamless adaptation between light and dark modes:

```css
/* Light mode defaults */
:root {
  --ui-theme-bg-canvas: #fcfbf9;
  --ui-theme-bg-surface: #ffffff;
  --ui-theme-bg-surface-elevated: #ffffff;
  --ui-theme-text-primary: #1b1917;
  --ui-theme-text-secondary: #57534e;
  --ui-theme-text-muted: #78716c;
  --ui-theme-border-subtle: #e7e5e4;
  --ui-theme-border-strong: #d6d3d1;
  --ui-theme-accent: #8b7355;
  --ui-theme-accent-focus: #7a6348;
  --ui-theme-status-success: #166534;
  --ui-theme-status-danger: #991b1b;
}

/* Dark mode overrides */
:root[data-color-mode="dark"] {
  --ui-theme-bg-canvas: #0c0a09;
  --ui-theme-bg-surface: #181613;
  --ui-theme-bg-surface-elevated: #211d18;
  --ui-theme-text-primary: #f5f5f4;
  --ui-theme-text-secondary: #d6d3d1;
  --ui-theme-text-muted: #a8a29e;
  --ui-theme-border-subtle: #292524;
  --ui-theme-border-strong: #3f3b37;
  --ui-theme-accent: #c4a87a;
  --ui-theme-accent-focus: #d4bc8f;
  --ui-theme-status-success: #4ade80;
  --ui-theme-status-danger: #f87171;
}
```

### 3. Eliminated Anti-Patterns
- **No hardcoded inline hexadecimal colors:** Stripped legacy colors (`#2E433A`, `#695D50`, `#1a1a1a`, `#ffffff`) from `ForgotPasswordFeature.jsx`, `ChangePasswordFeature.jsx`, and `ProfileFeature.jsx`.
- **No inline `<style>` tags:** Both `ChangePasswordFeature.jsx` and `ProfileFeature.jsx` previously injected raw `<style>` blocks into the DOM on every render. These were replaced with dedicated scoped stylesheets (`ChangePasswordFeature.css` and `ProfileFeature.css`).
- **Dark mode Google Sign-in button:** Updated `.auth-social-btn.google` to invert background and text colors in dark mode, preventing glaring unstyled white blocks on dark backgrounds.
- **Ambient background blobs:** Integrated soft, non-distracting CSS background blobs (`.auth-ambient-blob-1` and `.auth-ambient-blob-2`) using `backdrop-filter: blur(80px)` with reduced motion compliance (`animation: none` under `prefers-reduced-motion: reduce`).
