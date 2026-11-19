# 18 — light dark forced colors keyboard zoom

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

Actual routes were exercised in light/dark themes, EN/KM, keyboard operation, reduced motion and forced-colors emulation. Axe's color-contrast rule remained enabled. A measured 4.49:1 couple-name failure was repaired with a semantic theme color; later sampled reports have their actual violations/incomplete results preserved. No suppression was added to make checks green.

The drawer/profile/calendar/pagination interactions have programmatic names and visible focus; focus return/scroll lock are tested. Principal controls aim at 44px, while WCAG 2.2 AA minimum target acceptance is 24 CSS px or a valid exception. The 720px equivalent-reflow test is labeled honestly; it is not native browser 200% zoom. Physical NVDA/VoiceOver/TalkBack, text enlargement/native zoom and Windows system high-contrast review remain open.

[Axe and keyboard evidence](evidence/axe-keyboard-contrast.json) contains the bounded results. W3C [focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum) and [target-size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) guidance informed acceptance.

The added 320px long Khmer title case cycles KM/light, KM/dark, EN/dark and EN/light in all three engines. A first Chromium trial sampled intermediate theme-transition colors; the corrected steady-state inspection awaits finite animations and document fonts before Axe and screenshots. No Axe rule is disabled. The reviewed [narrow Khmer capture](visuals/after-long-khmer-320.png) supplements the viewport geometry checks.

[Report index](README.md).
