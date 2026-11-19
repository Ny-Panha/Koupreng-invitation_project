# 06 — host navbar menu locale theme focus

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

Host chrome now uses a consistent 64px inner bar with an 80px compensated top offset, restrained rectangular rounding, left-aligned icon/text navigation and a quiet active pill. Nested numeric event routes keep My Events current. The original logo, actual account identity, theme toggle and KM/EN control remain. No notification number, fake status or new security setting was introduced.

The account menu supports ArrowUp/Down opening, initial item focus, Home/End, Escape with trigger return, Tab dismissal and outside dismissal. Account ID and navigation changes close menus; image identity is keyed by actual source. Mobile uses the existing native dialog and existing background/scroll isolation. Keyboard and locale/theme interactions are exercised in each browser engine, separately from physical screen-reader certification.

See the profile/nav tests and capture records in [commands](evidence/test-commands.json) and [accessibility](evidence/axe-keyboard-contrast.json). The first independent profile test had an ambiguous selector matching both the visible trigger and hidden drawer link; the locator was corrected to the actual button, not misreported as an application failure.

[Report index](README.md).
