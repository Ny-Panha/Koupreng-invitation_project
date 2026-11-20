# Responsive geometry and reachability

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

Nine sizes are independently exercised: 1920, 1440, 1280, 1024, 844×390, 768, 393, 375 and 320. Each journey scrolls to a real input, edits it, reaches Save, and opens/closes preview. The JSON records viewport, document width, toolbar/workflow/nav/field geometry and actual locale/theme. No whole-device certification is inferred from an image filename.

At 844x390 the measured header changes from 72px to 69.19px and the title field from y=429.98 to y=352.77. The editor body starts at y=228.19, leaving about 161.81px of body intersection; the complete first field still needs scrolling. Commands are 44px high. This is a density improvement, not a 54px actual header or 330px usable-editor claim. Real scroll/edit/Save/preview journeys pass. The visualViewport branch no longer hides mobile actions and is tested with a simulated shrink. A simulated viewport/320px reflow is not physical 200/400% zoom. Safe-area/browser-toolbar/native keyboard interactions stay open to device QA. Original Phase 02 admin Studio iframe containment failures are separate from this creator workbench.

Evidence:

- [visual-manifest.json](evidence/visual-manifest.json)
- [negative-tests.json](evidence/negative-tests.json)
- [f13-independent-54-gates.json](evidence/f13-independent-54-gates.json)

[Report index](README.md).
