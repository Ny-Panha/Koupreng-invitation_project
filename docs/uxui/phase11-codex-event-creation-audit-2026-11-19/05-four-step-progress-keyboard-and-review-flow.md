# 05 — four step progress keyboard and review flow

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

The real four stages remain Type, Essentials (including cover), Design and Review. This audit did not reshape source to match invented upstream stages. Desktop exposes grouped sections; mobile progressively shows the active section. Direct wayfinding preserves input and the in-memory photo; submission independently validates required data.

Progress now explicitly names navigation. Detail completion uses complete required validation plus photo; premium-design completion requires verified access. A reached fourth step does not mean a successful server save.

The original mobile browser reproducibly focused a hidden input before the details section appeared. Focus now runs after DOM visibility changes, with reduced-motion-aware scrolling and a top error summary whose controls reveal/focus the relevant field. The native file chooser returns focus to Change Photo; removal returns it to the picker. Keyboard creation uses reachable local Next controls rather than cycling through browser chrome.

[Negative tests](evidence/negative-tests-register.json), [loaded browser coverage](evidence/browser-coverage.json). Physical screen-reader announcements remain separate.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
