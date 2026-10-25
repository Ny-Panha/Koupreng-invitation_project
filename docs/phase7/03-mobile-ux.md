# Mobile editing and responsive verification

The decorated wedding Studio uses a fixed action row on narrow screens with safe-area bottom/side padding. Actions retain 44px targets. The row hides while a focused input and reduced visual viewport indicate a software keyboard. This uses the existing toolbar rather than duplicate save/publish state. Full-screen preview returns to the previous editor field and scroll position; event navigation remains available through the toolbar.

Generic invitations reuse the five-step guide with wrapping controls and one-column fields. Guest pages use cards, bounded paging and per-record selection on phones. Analytics and package comparison tables scroll inside named, keyboard-focusable regions; the page itself does not overflow. Khmer labels wrap with the existing font/palette rather than truncating authored text.

Viewport captures/checks cover 320, 375, 390, 430, 768, 1024, 1366, 1440 and 1920 CSS pixels in KH/EN for generic invitations, guest dashboard and analytics; decorated Studio additionally covers 360px. Existing import and floor-plan regressions cover the same nine requested widths. Keyboard/reflow tests cover 640/320 CSS-pixel layouts as equivalents of a 1280px desktop at 200%/400% zoom, increased text spacing and doubled root text size. Those are automated reflow/text-size checks, not a claim of physical browser pinch-zoom testing.

`m7-keyboard-final.log`: 18 passing checks across Chromium, Firefox and WebKit, including preview focus containment/return, Escape, navigation dialogs, reflow and retained edits when navigation is cancelled. `m6-publish-browser.log` verifies mobile action positioning and save/preview preservation. `final-gift-browser.log` verifies the existing Khmer inline gift form and separate currency summaries at 320px.

No physical Android/iPhone or software keyboard was available. Actual keyboard occlusion, touch ergonomics and iOS browser chrome/safe-area behavior remain device-validation items. Playwright WebKit coverage is not physical Safari certification.
