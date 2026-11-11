# Responsive, accessibility and Khmer/English specification

**Target:** WCAG 2.2 AA, verified with automated and manual checks in owning implementation phases. A fixture-level axe result or one browser sweep is not certification. All screen and interaction contracts apply to both management apps and every guest renderer where relevant.

## Width and height evidence matrix

| Width / context | Design and later test requirement |
|---|---|
| 320, 360, 375, 390, 414, 430px | One-column task priority, wrapped Khmer labels, safe-area CTA, menu and Edit/Preview accessible; inspect descendant bounding boxes and hit targets, not only `scrollWidth`. |
| 600px and 599/601 adjacency | Verify card/grid and navigation switch without orphan controls or unexpected horizontal scroll. |
| 768, 820px and 767/769 adjacency | Tablet task rail/panel switch; Studio device preview and five sections remain reachable. |
| 1024px and 1023/1025 adjacency | Split-panel Studio/owner layouts; resize keyboard alternative and stable focus. |
| 1280, 1440, 1920px | Dense admin tables and marketing editorial composition; no overwide reading line or hidden primary action. |
| 844×390, 820×430, 768×390 short landscape | Studio has internal vertical scroll; toolbar, device toggles, Edit/Preview and preview content reachable by scrolling. The entire tall iframe need not fit simultaneously. Test visual viewport, safe areas and keyboard. |
| Dynamic browser toolbar / virtual keyboard | Use `dvh`/safe-area-aware layout with fallbacks; active field/CTA scrolls above keyboard and does not jump under chrome. Physical devices remain required. |

For each breakpoint, record document and nested scroll extents, actual descendant geometry, focus sequence, pointer hit testing at target centers, accessible name and action, text wrapping, zoom/reflow and screenshots. A `documentElement.scrollWidth <= innerWidth` assertion catches only one overflow class. Short landscape must allow both outer Studio and inner preview scrolling without trapping the user; [QA triage](11-qa-new-01-to-03-triage.md) records current fixture geometry.

## WCAG 2.2 AA manual and automated checks

| Contract | Verification |
|---|---|
| Semantics/name/role/value | Landmarks and headings follow task order; icon-only preview/export/import actions have contextual names; dialog and status roles are accurate. Inspect accessibility tree and use keyboard/AT. |
| Keyboard and focus | All buttons/links, Studio section tabs and resize alternative, forms, media, map/RSVP and seating list can be used without pointer; focus visible and not obscured; closing modal restores focus. |
| Pointer/touch | Minimum 24×24 CSS px or applicable spacing/exception; 44px design goal for primary mobile tasks. Stable target during movement; no drag-only assignment. |
| Reflow and text | 320px, 200% and 400% zoom, text spacing overrides, long Khmer names/diacritics; no loss of information or functionality. Avoid fixed-height clipping of essential content. |
| Contrast and motion | Check actual foreground/background, dark/light states, focus indicators, non-text contrast; `prefers-reduced-motion` static equivalent and no flashing/auto-audio. |
| Feedback/forms | Required and invalid states use text, described errors, focus to first error and one announcement; loading/busy status does not lie about server writes. |
| Calendar/dialog/preview | Date/timezone announced, focus trapped only in modal, restored on close; iframe title and keyboard access; preview `postMessage` trust unchanged. |

## Khmer/English content system

Use a shared action dictionary with a single approved term per task, subject to native-language review. Current source uses `បន្ត` for wizard Next and `បើកគំរូសំបុត្រអញ្ជើញក្នុងផ្ទាំងថ្មី` for Studio external preview; tests currently expect older strings. Product copy should be reviewed for nuance, then exact assertions updated in a test-only maintenance phase. Do not use machine-translated fallback as a silent production decision. `lang` attributes and accessible names must match the rendered language; authored invitation language may remain distinct from account UI locale.

| Concept | Khmer baseline/proposal | English | Content rule |
|---|---|---|---|
| Next step | បន្ត | Next | Current mobile wizard label; same visible and accessible name. |
| Back / Cancel | ថយក្រោយ / បោះបង់ | Back / Cancel | Back retains draft; Cancel names consequence. |
| Edit / Preview | កែសម្រួល / មើលជាមុន | Edit / Preview | Panel labels and `aria-pressed` agree. |
| Save draft | រក្សាពង្រាង | Save draft | Acknowledged save only; unsent shown separately. |
| Open external preview | បើកគំរូសំបុត្រអញ្ជើញក្នុងផ្ទាំងថ្មី | Open template preview in a new tab | Exact accessible name; target is preview, not ownership. |
| Pending / Paid | កំពុងរង់ចាំ / បានបង់ប្រាក់ | Pending / Paid | Backend order status only. |

Check available Khmer fonts, diacritic clipping, line height near 1.65–1.9, wrap at long compound names, fallback glyphs, punctuation and numeral preferences. Date and time display must include event timezone and avoid ambiguous numeric date order. USD/KHR amounts come from server with currency code and rounding policy; never sum mixed currencies without explicit conversion provenance. Test native screen-reader pronunciation with `lang` spans for embedded English names where appropriate. Keep translation status/source version with the content decision.

## Performance acceptance plan

Future field p75 targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. These are targets, not current measured results. Phase 26 should compare controlled lab cold/warm cache, throttled low-end CPU/network, normal/reduced motion, hero/media and each renderer, then field RUM with consent and percentile/sample reporting. Current Phase 01 single-run LCP values cannot establish a field baseline or INP. Lazy-load nonessential media and 3D; preserve size/aspect boxes; check guest RSVP latency separately from visual transition duration.
