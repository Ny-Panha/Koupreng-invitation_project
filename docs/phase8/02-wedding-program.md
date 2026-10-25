# Wedding program

The existing `WeddingProgramEditor` now edits arbitrary program days and ceremonies. It provides custom date/headings, bilingual ceremony text, multiline descriptions, optional end/period, day and row visibility, explicit add/remove controls and keyboard-accessible up/down buttons. Native confirmations protect removal and replacement of authored content. Buttons have a 44px minimum touch target. Existing Studio preview/save/history/unsaved-change controls remain available.

Optional traditional, two-day, one-day, reception and blank presets populate only an explicitly selected draft. Existing authored schedules require confirmation before replacement. Sample timings and ceremonies are editable starting points; they are not a universal Khmer ceremonial sequence. Family/editorial review of wording and order remains appropriate.

`ProgramTimeline` groups dates, shows a time column and thin vertical line/circular markers, wraps long Khmer text and inherits template typography. Gold accents and burgundy/green headings come from specific template tokens. Modern templates keep their own palette. Existing program markup remains the legacy path until day metadata is introduced, preserving earlier invitation identity.

Normalization/editor/renderer checks and the all-template matrix are recorded in [test results](07-test-results.md). The genuine HTTP/MySQL test verifies three days, stable IDs, extensions, disabled rows, publication, stale writes and authorization. The live browser test creates and publishes its own fictional wedding through the actual UI.
