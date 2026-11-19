# 14 — a11y loaded axe forced colors keyboard and focus

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

Axe ran on loaded populated form/photo and review in EN/KM light/dark, invalid form, template error and premium-denied states. No rules were disabled; color contrast remains enabled. Early runs found real 4.23:1 gold text and 1.16:1 dark-control contrast defects plus picker/selected-template name mismatches. Scoped repairs were rerun across three engines.

Keyboard-only tests activate the stepper, edit title, open the native chooser with Space, choose a design and submit through local Next actions. File selection/removal has a deliberate focus destination. The mobile invalid-title assertion checks focus and viewport bounds; forced-colors images preserve the error journey. Inline errors and top summary controls retain field relationships; dangling helper references were corrected.

The first Firefox forward cycle through the end of page failed and is retained as a trial. The verified local route uses nearby Next controls, with corrected picker focus. One Windows EBUSY trace-artifact failure is retained separately from UI assertions and repeated under frozen source.

This does not certify VoiceOver/TalkBack, native magnification or every app control. [Raw finding summaries](evidence/axe-contrast-results.json), [browser limits](evidence/browser-coverage.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
