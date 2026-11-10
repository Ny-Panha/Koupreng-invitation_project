# Final audit limitations and coverage

## What was inspected

Repository router/index/companion guidance; clean Git starting state; both frontend manifests/build/test/router/shared UI/auth/storage/state/template/feature paths; every declared leaf route; backend POM, module layout, endpoint/security/transaction/table/lock annotation inventory; critical auth/invitation/RSVP/payment/media/guest/collaboration/reporting flows; 48 migration files/checksums; Telegram service/test inventory; Compose/Nginx/CI and operational helper locations; existing design/license documentation. Automated metadata scanning covered 1,619 files/225,868 lines. **This is systematic inventory plus targeted semantic review, not a line-by-line proof of all code.**

Fifty feature categories and all 135 declared leaf route patterns are in report 03. Source-location evidence is in the bug/architecture/backend reports and JSON inventories. Some small wrappers/aliases were verified through their route rather than individually reread. No dead-code deletion claim was made from a single import search, and no unused-dependency graph tool was run.

## What was tested

- Both frontend Vitest suites, lint and separate-output production builds.
- Targeted and full offline-cache Maven tests; 122 suite results, with explicit skip reasons.
- 484 initial fixture route/viewport/engine probes, selected axe/geometry/target/font measurements and screenshots. Raw failed assertions are retained.
- Twelve synthetic desktop/mobile owner/editor/guest/payment journey cases; additional 52 browser regressions (48 pass/four fail), followed by two successful preview-origin retests and six successful direct normal/reduced-motion public taps in Chromium/Firefox/WebKit.
- Physical-coordinate/touch checks of mobile create, ticket preview and seating assignment controls; admin clipping/divider geometry in three engines.
- Single-route-sample performance observers with explicit CPU/network settings; full and production-only npm advisory queries.

No real user data or financial operation was necessary. All fixture writes stayed inside test handlers. No outgoing share/email/Telegram message was intentionally sent.

Legacy tests still emitted a read-only packages proxy failure to the absent backend, and the admin unit suite logged localhost:3000 connection/DOM warnings. These limitations remain visible in the QA report; not every legacy test is fully network-isolated even though its assertions pass.

## Failures, blocks and unverified claims

| Requirement | Status / exact limit | Next verification |
|---|---|---|
| Confirmed mobile functional/a11y defects | FAIL AU-001–006; no code fixes applied | Approved Phase 02 repair and before/after regression |
| Broad route assertion failures | 26 initial failures across 484 probes; hidden inactive controls and English-vs-Khmer contracts | QA-001 changes, rerun intended matrix without weakening assertions |
| Extra browser regression | Four failed cases; two origin retests pass; direct taps explain two animation stability failures | Harmonize test config/origins/motion, rerun named intended suite |
| Live complete owner/guest/admin journeys | BLOCKED without isolated running backend/database; only tested subsets can PASS | V-001 disposable environment and live persistence/RSVP confirmation |
| MySQL/Flyway/entity/runtime consistency | 82 tests gated off; no live schema inspected | V-002 task-owned MySQL fresh/upgrade/lock/collation checks |
| Docker/deployed production stack | Docker named pipe absent; no service started | Provision isolated stack; validate actual prod TLS/origin/cache/rate-limit settings |
| Telegram pytest | `No module named pytest` in Python 3.15.1 | Prepared compatible Python test environment; no silent install performed |
| Real devices | None available/used | Android and iPhone, OS/browser/app versions recorded |
| Safari/Chrome Android/WebView | Desktop engine emulation only | Real platform checks; no certification claimed |
| Edge/macOS Safari | No separate runs | Run on available actual browsers |
| Telegram/Facebook/Messenger/WhatsApp | No real in-app sessions | Open staging shared invitation; test back/keyboard/media/map/payment-return separately |
| Physical keyboard/viewport zoom/safe areas | Selected short viewports and calendar text/reflow checked; OS keyboard/chrome not simulated | Real device keyboard, zoom, text enlargement, screen reader and focus-not-obscured matrix |
| OAuth/media/provider callbacks | Source/mocks/tests only | Staging identities, controlled storage fixtures and provider sandbox/mocks; no real payment |
| Public RSVP end-to-end | Service/component tests and owner read fixtures; full public submission not exercised | General/personalized/private/deadline/duplicate/confirmation path |
| All template layouts/media permutations | Registry/unit coverage and selected renderers; not every active catalog item on every engine/device | Renderer-specific opening/scroll/media/edit/published parity matrix |
| Full WCAG AA | Selected automated rules and keyboard flows only | Manual assistive-tech, zoom/text spacing/dragging/target exception review |
| Performance | Single synthetic lab sample; no field INP/CrUX/Lighthouse score/memory device data | Idle repeated lab + actual deployment and real-device profiling |
| Backend CVEs/SAST/secrets scan | CI definitions inspected, not all executed locally | Existing release scanning in controlled environment; redact reports |
| UI/UX Pro Max | Available and used; raw queries saved; Khmer-specific match absent | Retain repository fonts; don't attribute fallback judgment to the database |
| Ten libraries | Official identities/docs/licenses/maintenance signals researched; no full upstream device audit or paid-source access | Pin/check exact components before adoption; restrictions remain binding |
| Source UI reference ZIP | Requested `source UI.zip` not found in repository search | Compare directly if later supplied; no invented screenshot/video observations |

## Preservation and acceptance accounting

No application source, manifest, dependency lockfile, schema or applied migration was edited. Ten tracked export/report samples regenerated by backend tests were restored to their original clean state. No package installation, real transaction, production database action, file deletion/move, commit or push was performed. New files are these audit documents/evidence and the separate `output/playwright/phase01-audit-20261110/` artifact tree.

This package fulfills the reporting and repository-specific planning handoff with explicit evidence limits. **The acceptance conditions that require live end-to-end, MySQL, real devices or unavailable references remain open.** Do not label all features responsive, all integrations secure, the full system exhaustively audited, or production release approved. The next implementation phase remains unexecuted until explicit user approval.
