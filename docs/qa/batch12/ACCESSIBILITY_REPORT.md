# Accessibility verification

Axe 4.14.0 checks WCAG 2A/2AA/2.1AA/2.2AA tags on rendered production builds. The gate rejects serious/critical findings and attaches complete violation arrays. Rules were not excluded to manufacture a pass.

Package controls changed from clickable divs to named native switches with aria-checked. The native dialog provides inert background, Escape, Tab wrapping, initial focus and explicit trigger restoration, including WebKit pointer-focus behavior. Basic and all four quota fields have associated labels; the close control is 44px. Light/dark helper, tab, status and billing contrast defects were corrected. Invitation section buttons have explicit localized names after WebKit exposed unreliable text-derived names.

Automated keyboard checks cover Space/Enter, Shift+Tab/Tab containment, Escape and focus return. Template Back dismissal preserves edited data; acceptance discards it. Failed/malformed loads expose a retry alert without a save action. Reduced-motion invitation opening and content render run in all three engines.

English/Khmer package basic states are scanned in light/dark mode; quota and feature panels have additional scans. English/Khmer wedding content is scanned after opening. Widths: **320, 375, 390, 430, 768, 1024, 1440px**. Package close controls and template save controls stay in the viewport; document overflow checks pass. Chromium captures every package language/theme/width combination; representative contact sheets are retained.

These are automated browser keyboard/rendered-state checks, not full WCAG conformance. Human NVDA/VoiceOver/TalkBack, Khmer pronunciation and line-breaking review, real zoom/safe-area/browser-toolbar checks and physical touch devices remain operational acceptance work. Axe cannot establish those outcomes.
