# Device simulation and preview dialog

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

The phone content viewport is 440×860 and desktop content viewport 1200×800, inside outer frames of 456×972 and 1216×816. These are scaled simulations, not physical Safari/VoiceOver certifications. The functional suite opens the real preview modal, exercises desktop/phone and zoom, checks actual iframe innerWidth, closes with Escape and verifies logical focus return.

An added assertion initially confused the desktop outer frame with its content width and failed in all engines. The original caption was correct; the test expectation was corrected against source and actual geometry. The failed run is retained. Short viewport editing is measured independently from an iframe visibility percentage. Native 200/400% browser zoom, browser toolbar/safe areas and physical keyboard behavior remain external review, even though narrow reflow and the visualViewport branch are tested.

Evidence:

- [negative-tests.json](evidence/negative-tests.json)
- [visual-manifest.json](evidence/visual-manifest.json)
- [f13-independent-54-gates.json](evidence/f13-independent-54-gates.json)

[Report index](README.md).
