# Visual regression evidence

Chromium captured program, Save the Date, program editor and date editor at **320, 375, 390, 430, 768, 1024, 1366, 1440 and 1920px**, in Khmer and English: 72 captures. Overflow assertions cover both invitation sections and the overall Studio document. Additional text-reflow captures and scoped axe checks run in Chromium, Firefox and WebKit.

Four opt-in comparisons use the same fictional input against the already-running, unmodified Phase 7 frontend on 4286 and current source on 4288, at Khmer 390px and English 1440px. Eight before/after section captures retain the botanical artwork and demonstrate the new date grouping/calendar. No screenshot baseline was regenerated to hide a failure. These are direct captures and manual review, not a claimed automated pixel-diff threshold.

Visual inspection caught and corrected English month fallback in Khmer mode and cramped horizontal editor labels. The inspected final images have Khmer month/weekday labels and stacked form labels. Public captures retain template artwork. Full runs are in `output/playwright/phase8/`; representative portable copies are in `docs/phase8/evidence/`.

- [Khmer Save the Date, 390px](evidence/save-date-kh-390.png)
- [Khmer multi-day program, 390px](evidence/program-kh-390.png)
- [Desktop date editor, 1440px](evidence/date-editor-en-1440.png)
- [Desktop program editor, 1440px](evidence/program-editor-en-1440.png)
- [Phase 7 program comparison](evidence/before-program-kh-390.png)
- [Phase 8 program comparison](evidence/after-program-kh-390.png)

Calendar/program behavior is covered across all catalog renderers by the 97-case matrix. Complete manual pixel review of every template/width combination, physical phones and hardware Safari remains outside this local evidence.
