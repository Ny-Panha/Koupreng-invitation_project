# Phase 10 engineering report

Implementation completed on the isolated `feat/phase10-studio-heritage` branch from clean `main` / `origin/main` at `516923b651b33dafc8ee47ecca45fee6b55bb8ce`. The original checkout's concurrent security-modernization work was preserved. See [baseline](00-repository-baseline.md) for the transfer and initial verification.

## Delivered behavior

The Studio defaults to a 60/40 form/preview split, supports pointer/touch capture, keyboard adjustments and 70/50/40 presets, and safely persists its layout. Dragging retains the iframe, opening state and zoom. Both editing modes and the existing mobile preview workflow remain available. [Behavior and proof](03-resizable-studio.md).

An opt-in click-to-edit mode focuses supported Studio sections through the existing origin/source/session-validated preview channel. Fixed section IDs exclude arbitrary selectors; interactive guest controls keep their ordinary behavior. Existing save queues, conflict handling, undo history, template data and publication confirmation remain in use. [Usability](09-studio-usability.md).

The source-generated [compatibility matrix](01-studio-template-contract-matrix.md) covers 36 registered aliases, nine dedicated renderer groups, 11 catalog designs plus Event Essential, and 70 Studio state properties. Broken appearance propagation, authored wording, family/closing mappings, Golden Khmer parent normalization, Royal Lotus font variables and canonical RSVP handling were repaired. Unsupported renderer sections now explain that their saved data is retained. [Defects, source locations and regressions](02-integration-defects.md).

All catalog templates receive representative edit → preview → save → reload → fixture-publication → actual guest DOM coverage. Populated React probes and source contracts cover shared fields; native HTTP/MySQL verifies the shared Settings, Studio, program/calendar, Premium-film and ticket journey. Independent real-HTTP execution of every one of the 840 field/template combinations is not claimed. The matrix records this distinction instead of treating a serialized value as proof of rendering.

Locally hosted OFL Khmer and matching default Latin fonts remove a reproduced route-blocking remote CSS dependency. Long Khmer names, shaping, safe line heights and retained saved font values are checked across catalog renders with Google font hosts blocked. New WOFF2 assets total 488,380 bytes and load on demand. [Typography](04-template-typography-audit.md).

Khmer Celestial retains its established jade/ivory/gold identity and botanical images, with original non-figural corner vectors, a Romduol-inspired six-petal emblem, crisp names, bounded motion presets, reduced-motion/Save-Data handling and offscreen/hidden pausing. Cultural research and font rights are documented; figural Apsara imagery remains deferred for qualified review. [Art direction](05-khmer-celestial-art-direction.md), [provenance](06-artwork-sources-and-licenses.md), [implementation](07-khmer-celestial-implementation.md).

Event Settings groups its real controls with section anchors and sticky save actions. Native validation, owner-only access changes and sensitive-change confirmation remain authoritative. Real save/reload, shared Studio values and an actual stale-writer 409 were verified. Studio now preserves the Settings RSVP deadline through subsequent saves. [Settings verification](08-event-settings-ux.md).

## Compatibility and verification

No endpoint, DTO/schema extension, historical migration, payment reconciliation path or backend production source changed. Existing content/design JSON stores the optional appearance preferences. Both apps received patched dependencies after the local audit identified advisories; Happy DOM 21.0.4 is test-only. Both complete npm audits report zero vulnerabilities.

The user suite passes 926 tests, admin 121, backend 620 with four documented skips, and Python worker 72. Existing Phase 7/ticket browser checks pass 72, Phase 8 passes 45 with four historical-capture skips, and Phase 9 passes 51. Final Phase 10 engine results, native journey results, scoped axe coverage and exact commands are recorded in [test results](10-test-results.md) and the retained evidence JSON. The final font build's main JS is 444.89kB / 130.52kB gzip versus 443.36kB / 129.81kB before. No invented Lighthouse, CPU or CLS scores are used.

The [visual manifest](evidence/manifest.json) records image dimensions, hashes and fixture/native provenance. Before captures use the untouched initial build with the same fictional fixtures; after captures cover all six tabs, split presets, Settings, public templates, long Khmer names and Celestial/calendar/concept studies. This is a reviewed before/after evidence set, not exhaustive animation-frame pixel certification. [Visual review](11-visual-regression.md), [security/accessibility/performance scope](12-security-accessibility-performance.md).

## Integration record

Focused application commits: `38c0f32d` (dependency patches), `51d7a77b` (Phase 10 implementation and contracts), and `707289b4` (canonical deadline preservation and browser readiness/pacing). Documentation/evidence commit `2bbbe4d7955b5e77b0339274b89daf9f68262f04` was fast-forwarded into local `main` after fetching an unchanged `origin/main`; no merge conflict or history rewrite occurred.

Post-integration verification passed again: user/admin 926/121, both lint/build gates, nine three-engine Studio/Settings smoke cases, and eight bilingual generic-event cases. [Main verification](evidence/main-verification.json) records exact commands, excerpts and hashes. The subsequent documentation corrections use Git blob bytes for stable license/source digests across checkout line endings; all 98 artifact digests and local report links passed verification. These documentation-only changes do not alter the verified application. The remote push receipt is appended after synchronization.

## Release recommendation

Suitable for code review and staging after the recorded local gates pass. Physical iPhone/Android testing, manual screen readers, Khmer editorial/cultural review, real mobile-network performance and live Cloudinary/payment/SMTP/OAuth/Telegram integrations remain release gates. Docker engine/private-volume restore operations were not performed. [Exact limitations](13-known-limitations.md). Pushing code does not grant production deployment approval.
