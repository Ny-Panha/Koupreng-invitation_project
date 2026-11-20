# Split pane pointer, keyboard and storage

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

useStudioSplit clamps the preference using available pane width, applies transient drag geometry without rerendering the invitation on every pointer move, and restores the original value on pointercancel/window blur. Stored invalid ratios and denied storage are covered by existing unit tests. Keyboard arrows, Shift increments and Home/End provide alternatives to dragging.

The original N13-14 example tested clamping rather than an actual cancelled drag. The independent browser case performs real pointer down/move followed by cancellation, then checks restored aria-valuenow and persisted preference. lostpointercapture retains the existing commit behavior; this audit does not falsely describe every capture-loss event as cancellation. Modal/small-screen layouts use the existing stacked preview rather than a forced desktop splitter.

Evidence:

- [negative-tests.json](evidence/negative-tests.json)
- [test-runs.json](evidence/test-runs.json)

[Report index](README.md).
