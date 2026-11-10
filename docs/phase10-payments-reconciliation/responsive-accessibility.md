# Cross-Device Responsiveness & Mobile Accessibility

## 1. Complete Viewport Support Matrix (280px to 2560px)

Koupreng's payment and gift interfaces are engineered with a mobile-first responsive architecture supporting all mainstream and edge form factors:

| Viewport Width | Form Factor | Testing Focus | Verified Behavior |
|---|---|---|---|
| **280px** | Galaxy Fold (Cover Screen) | Extreme narrow width | Fluid container padding (16px total margin), stacked QR layout, zero horizontal overflow. |
| **320px–360px** | iPhone SE, small Android | Narrow mobile | Minimum 44px touch targets, QR code scales to 100% width, buttons stack vertically. |
| **375px–430px** | iPhone 14/15/16, Galaxy S24 | Standard smartphone | Full high-contrast QR display, countdown timer, clear action buttons. |
| **768px–820px** | iPad Mini, iPad Air, Surface Go | Tablet portrait | 2-column summary metrics, fluid table wrapping with horizontal scroll indicators. |
| **1024px–1280px** | iPad Pro, MacBook Air, Laptops | Laptop / Tablet landscape | Full 2-column checkout card (QR left, order info right), full data tables. |
| **1440px–1920px** | Desktop monitors | High-resolution desktop | Constrained max-width (860px for checkout, 1180px for gifts), subtle shadows, centered layout. |
| **2560px+** | 4K Ultra-wide displays | Large monitors | Proper viewport clamping, crisp vector SVG QR codes, no blurry raster scaling. |

---

## 2. iOS Safari & Mobile WebKit Compatibility

In accordance with P0 iOS Safari compatibility guidelines:
1. **Zero Text Zooming on Focus:**
   Form input fields (`input`, `select`, `textarea`) in `PaymentPages.css` and `GiftsFeature.css` enforce `font-size: 16px` minimum. This eliminates the automatic viewport zoom on iOS Safari when tapping inputs.
2. **Safe Area Inset Handling:**
   Container paddings incorporate `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to ensure sticky payment action bars and navigation buttons clear the iPhone home bar and dynamic island.
3. **Clipboard API Resilience:**
   Copy buttons for order codes and payment links handle mobile clipboard permissions gracefully with visual fallback messages when clipboard access is restricted.
4. **App Switcher & Back Navigation:**
   When returning from the ABA Mobile app to Safari, the page state retains the pending order without state clearing or unintended re-creation.

---

## 3. WCAG 2.2 AA Accessibility & Bilingual UX

1. **Color Contrast:**
   - Gold accent text on cream background meets minimum 4.5:1 contrast for normal text (`--kp-gold-700: #7d6443` on `#fcf8f2`).
   - High-contrast pure black-on-white SVG QR rendering with high error correction margin.
2. **Accessible Landmarks & ARIA Labels:**
   - `<main>`, `<header>`, `<section>`, and `<table role="region">` landmarks with descriptive `aria-label`.
   - Dynamic status changes communicated via `role="status"` and `role="alert"`.
   - Modals use `role="dialog"`, `aria-modal="true"`, and autofocus trapping.
3. **Bilingual Khmer & English Support:**
   - Seamless language switching via `useLanguageStore` and `useAdminLanguage`.
   - Culturally authentic Khmer terms:
     - "ការផ្ទៀងផ្ទាត់ការទូទាត់" (Payment Verification)
     - "ស្ថានភាពការទូទាត់" (Payment Status)
     - "ចងដៃមង្គល" (Wedding Gifts)
     - "កំណត់ត្រាដោយដៃ" (Manual Record)
