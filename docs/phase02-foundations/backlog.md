# Backlog after Phase 02

This updates status without rewriting the [historical Phase 01 backlog](../audits/phase01-2026-11-10/10-modernization-backlog.md). No new P0 was confirmed. Emulation and fictional contracts remain the verification boundary.

| IDs | Phase 02 disposition / next acceptance gate |
|---|---|
| AU-001 | Fixed adaptive editor/preview and short-landscape layout; all required widths plus neighbors tested. Physical keyboard/safe-area verification continues under V-003. |
| AU-002 | Fixed persistent EN/KM accessible preview-link name; no destination/trust change. |
| AU-003 | Fixed keyboard/pointer/simple-button split resizing and semantic focus/bounds. Real touch/stylus and screen-reader announcements continue under V-003/A11Y-013. |
| AU-004, AU-005, AU-006 | Fixed semantic contrast for guest notes, admin subtitle/account badge and login footer. Broad accessibility work remains separate. |
| QA-001 | Fixed visible-control, active-panel and locale-aware route assertions; all 135 route leaves retained. Six affected Khmer groups explicitly checked across narrow/desktop widths and engines. |
| QA-002 | Fixed source-built iframe origin prerequisite and motion synchronization; independent normal-motion tap/mouse/keyboard opening. Historical failures and intermediate corrections retained in test ledger. |
| DS-001 | Completed bounded canonical token extension/sync and scoped responsive primitives. Existing brand/type/artwork and component contracts preserved. |
| V-001 | **Open, release gate.** Disposable real backend/storage owner creation → save/reload → publish → public read → RSVP/access-denial journey; synthetic passes do not close it. Repeat in Phases 04/08/09. |
| V-002 | **Open, release gate.** Run fresh/upgrade/integrity/concurrency gates against task-owned MySQL 8; historical 82 backend skips unresolved. No migration edits or database reset performed. Phase 14 final verification. |
| V-003 | **Open.** Physical iPhone/Android, virtual keyboard, app switching, safe areas, browser/in-app versions and evidence. Include repaired editor during device access; repeat each feature phase and Phase 14. |
| SEC-001 | Deferred isolated dependency chore/Phase 14. Historical moderate development advisory entries require current reachability/patched-version review. No new dependencies were introduced; no fresh advisory count is claimed here. |
| QA-003 | Deferred Phase 11. Passing admin unit suite still emits existing localhost/network/DOM stderr; isolate offending fixtures without suppressing useful failures. |
| PERF-001 | Bundle baseline/delta captured in Phase 02; controlled idle/real-device LCP/INP profiling remains open for Phases 03/08/13. Concurrent Phase 01 lab timings are not improvement evidence. |
| LIC-001 | Phase 02 introduced no upstream code/assets. Exact license/source/dependency/notice review remains mandatory for future component adoption. Existing ledger unchanged. |
| UI-003 | **Phase 03 next, not started.** Landing, navigation and auth: preserve validated next-route/role behavior; verify touch/keyboard, EN/KM and live OAuth cancellation/return. Foundation gates can be reused. |
| UI-004 | Phase 04: evidence-based creation UX, all event types, draft/retry/idempotency/intent and disposable live integration. |
| UI-005 | Phase 05: owner dashboard; any calendar requires product/API/date-time requirements, not fabricated data. |
| UI-006 | Phase 06: marketplace catalog/registry/free-premium-owned integrity with live catalog coverage. |
| UI-007, MED-001, REF-001 (owner) | Phase 07: advanced owner editor/media/crop/save races; preserve unknown JSON, upload validation and unsupported HEIC guidance. Only bounded extractions after contract coverage. |
| UI-008 | Phase 08: public invitation/device/in-app media/maps/calendar and performance; preserve ceremonial design and user-controlled media. |
| UI-009 | Phase 09: real guest/import/RSVP/deadline/duplicate/pagination/privacy journeys. No outbound messages authorized by this phase. |
| PAY-001, PAY-002, OPS-001 | Phase 10/14: sandbox provider and Telegram evidence replay/concurrency, pending/claimed/verified distinctions, USD/KHR accuracy; existing worker tests need provisioned pytest environment. No real transaction verified. |
| UI-011, CMS-001, REF-001 (admin) | Phase 11: full admin/CMS list/form refinement and isolated real mutations; product decision before a general CMS; preserve template schema/roles. Phase 02 fixes do not constitute full admin redesign. |
| UI-012, AI-001 | Phase 12: reports/team/settings accuracy; define any AI provider/business scope before changing existing assistance. |
| A11Y-013 | Phase 13: manual AT, zoom/text spacing, focus-not-obscured, target/drag alternatives, low-end/device performance; scoped axe is not full AA certification. |
| REL-001 | **Open, Phase 14 release gate.** Deployment TLS/origins/cache/rate limits, backup/restore and provider configuration require isolated real-environment evidence. |

Phase 03 can build on the repaired responsive/token/test foundations after its separate authorization. Production readiness remains blocked by the open verification gates, independently of the frontend pass counts. No work from Phases 03–14 was executed here.
