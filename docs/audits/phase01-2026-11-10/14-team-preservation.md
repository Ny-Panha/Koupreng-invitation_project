# Team implementation preservation matrix

Starting tree was clean. No teammate changes were edited, staged or committed. Classification applies to behavior and evidence, not personal authorship; no blame or unverified attribution is assigned.

| Implementation | Classification | Evidence and preservation rule |
|---|---|---|
| Semantic tokens + sync script | KEEP / IMPROVE | Existing colors/fonts/control sizing and token tests; add roles only for demonstrated gaps |
| Customer shared Modal | KEEP | Focus/inert/iframe/Escape/scroll restoration and unit/browser tests; retain public API |
| FormField, loading/error/empty states, skeletons | KEEP / IMPROVE | Real label/description/status behavior; verify composite fields individually |
| HostNav/event-scoped workspace | KEEP | Mobile menu/actions and event routing exist; do not replace working creation CTA because a test selects a hidden duplicate |
| Event creation and template intent | KEEP | Two synthetic intent → auth → creation → refresh journeys pass; preserve request ID and compatibility |
| Owner guided/advanced invitation editor | KEEP / IMPROVE | Save/preview/date/program/error recovery tests pass; real photo/crop/publish device coverage pending |
| Dedicated Khmer/Floral/Royal/Silk/etc. renderers and art | KEEP | Lazy registry and renderer tests; no supplied source archive justifies replacement; preserve licensed mappings |
| Guest responsive cards and contextual actions | KEEP / FIX | Mobile inline guest journey works; AU-004 is a focused contrast correction |
| Ticket mobile Edit/Preview switch | KEEP | Three-engine touch follow-up proves the canvas is reachable |
| Seating mobile assignment switch | KEEP | Three-engine touch follow-up exposes guest selector; do not force desktop side-by-side presentation |
| Admin Studio data/serialization/preview trust | KEEP | Immutable catalog identity, authored JSON preservation and unsaved/load failure behavior; roundtrip passes after serving configured origin |
| Admin Studio split/toolbar/divider | FIX | AU-001–003; responsive layout and accessible control repair, not a new template data model |
| Admin user/login colors | FIX | AU-005/006 measured contrast; retain role/action semantics |
| Auth/session/admin guards | KEEP | Full backend + browser boundary tests; no broad role expansion or storage unification |
| Payment evidence/order/entitlement services | KEEP | Verified-state architecture and tests; real MySQL/provider verification still gated |
| Guest import, gift identity, reporting currency logic | KEEP | Backend tests and migration constraints; no removal of idempotency/currency boundaries |
| Local/Cloudinary storage ports and validators | KEEP | Implemented type/size/access/cleanup boundaries; no permissive MIME changes to satisfy HEIC requests |
| Existing vendor adaptations | KEEP / REVIEW | Existing provenance/notice ledger; verify exact upstream terms before new use; avoid additional frameworks |
| Large editor/stylesheet internals | REFACTOR candidate, later | Extract task sections only with preserved serialization/preview tests; file size alone is not proof that replacement is needed |
| `QueryProvider` wrappers | KEEP compatibility / optional REFACTOR | Currently pass-through; no React Query package. Removal requires graph/API review and offers no demonstrated Phase 02 user benefit |
| `BudgetPage` lazy export / legacy adapters | REMOVE CANDIDATE only | Current budget route renders ExpensesPage, but aliases/dynamic imports and historical callers need full graph proof. No deletion recommended now. |
| Historical migrations, retired catalog aliases and legacy tables | KEEP | Applied history and old invitation references can remain meaningful; no deletion or checksum edits |
| Existing design/QA documentation | KEEP | Historical evidence retained; this audit adds a separate dated report instead of overwriting it |

**REPLACE:** no entire feature or design foundation is justified for replacement by current evidence. A small unsuitable mouse-only resizer can be reimplemented within its existing contract. **REMOVE:** none authorized or performed.

Backend tests regenerated ten tracked report/export examples. They were restored to their clean baseline after the run; no pre-existing uncommitted edits existed. New audit builds/screenshots/traces were isolated under their own output directory. Final Git checks must show only new audit documents/evidence and that directory, with no tracked application/migration/lockfile differences.
