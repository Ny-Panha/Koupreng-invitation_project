# Responsive, accessibility and bilingual baseline

The current mobile Chromium suite passes AU-001–006 targeted checks: Studio panel access, accessible preview name, keyboard separator and three contrast cases. The same six targeted checks pass in mobile WebKit and Firefox (18/18 across engines). The broader Chromium suite fails three assertions (details in [11](11-confirmed-bugs-and-reproduction.md)). The Khmer screenshots show real text wrapping and an active `បន្ត` button; the old expected label is stale. The current preview link has a Khmer `aria-label` in `AdminTemplateEditFeature.jsx:1648`; a separate test expects older copy. Neither stale string alone is an accessible-name failure.

| Area | Current evidence | Still required |
|---|---|---|
| Phone 320/390px | Seven representative routes captured in Chromium at both widths; 135 route-specific renders pass at 390. AU focused checks pass in three engines. | Every route family at 360/375/414/430, short height, safe-area and virtual keyboard. |
| Tablet/desktop 768/1440px | Seven representative routes captured at both widths; Studio responsive test attempted more widths, then failed at short landscape before completing. | 600/820/1024/1280/1920 and breakpoint neighbors across both apps. |
| Keyboard and semantics | AU-003 keyboard/pointer assertion passes; separator source has name/current/min/max. | Full focus order, restore, screen reader, 200/400% reflow, touch target exceptions. |
| Contrast | AU-004–006 fixture assertions pass in mobile Chromium. | Actual state/hover/light/dark surfaces and every template; axe across broad flows. |
| Khmer/English | Local font families and bilingual control text exist. | Long authored names, numerals/dates, fallback glyphs, translation parity and language-dependent action text. |
| Motion | Reduced-motion tokens are present. | Each cinematic layout, pause/skip and native low-power testing. |

WCAG 2.2 AA certification is **NOT TESTED** here. A passing targeted axe/contrast test is only evidence for its selected fixture. Physical iPhone Safari, Android Chrome, hardware keyboard, screen readers and Telegram/Facebook/Messenger/WhatsApp in-app clients are **BLOCKED** until device/client access is available. Manual script: open each representative route with a fictional account; switch EN/KM and light/dark; run keyboard-only entry, form error, dialog and back/forward; zoom/text-scale to 200/400%; rotate and open the soft keyboard; complete a guest RSVP and Studio preview, recording viewport, OS/browser, exact failing element and screenshot.
