# 11 — accessibility and responsive QA

Reproduce after building with `node evidence/audit-responsive.mjs` from this directory's repository root path. Tracked [results](evidence/responsive-a11y-results.json) record Chromium 156.0.8078.4, five fixture groups × 19 widths (95 rows), three short-landscape geometries and eight axe scans.

| Check | Result | Limit |
|---|---|---|
| Document horizontal overflow | PASS, 0/95 | Fixture routes only |
| Axe rule violations | PASS, 0/8 scans | Home light, auth dark, dashboard dark, guests light, RSVP light, organization detail dark, admin dashboard light, admin Studio dark; automated rules only |
| Named table keyboard focus and scroll | PASS, unit + 2 browser projects | Organization-detail fixture at 320px; ArrowRight moved scroll position |
| Admin report action type/refresh | PASS, 2 browser projects | Fictional read-only route data |
| Studio Edit/Preview pointer/Enter | PASS, 2 browser projects at 844×390 | Does not establish all actions or saved changes |
| Geometry clipped-control flags | REVIEW REQUIRED, 16 dashboard widths | Eight offscreen host-menu controls per flagged row; the probe sees offscreen drawer DOM, so a focused tab-order check is needed |
| Physical touch, native Khmer and screen reader | NOT TESTED | Requires devices/AT/copy review |

The short-landscape audit found the Studio outer scroll range and both panel switches reachable, but this is narrower than the full QA-NEW-03 behavior contract. The old iframe ratio assertion remains red in the baseline; it was not weakened. The 44px target is met by the changed action/table focus contracts where stated, not certified across all route controls.

The expanded first axe pass found RSVP kicker contrast 4.41:1 (below 4.5:1) and two organization dark-mode text targets at 1.14:1 and 2.73:1. Scoped role-color fixes brought all eight final scans to zero reported violations; the new browser spec tests those exact targets in both Chromium projects. Automated scans still leave native AT and full visual contrast sampling open.
