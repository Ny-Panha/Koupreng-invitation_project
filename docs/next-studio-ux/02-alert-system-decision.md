# Feedback system decision

Use the existing React Modal, ConfirmDialog and ToastContainer through `shared/feedback/feedback.js`. No popup dependency, CDN, HTML injection path or second focus manager was added.

## Comparison

SweetAlert2 provides customizable responsive accessible popups without runtime dependencies ([official site](https://sweetalert2.github.io/), [official README](https://github.com/sweetalert2/sweetalert2/blob/main/README.md)). A React integration is a separate adapter. Its focus/portal lifecycle would still have to be reconciled with our existing iframe-aware modal stack and payment/navigation overlays.

| Consideration | Existing React infrastructure | Adding SweetAlert2 |
| --- | --- | --- |
| Focus trap, stack, background isolation, iframe Escape | Already implemented and tested | Another lifecycle to integrate and audit |
| Khmer/English copy and React content | Existing store and ordinary React text | Wrapper/adapter required |
| Confirmation defaults | Cancel receives initial focus; busy actions cannot double-submit or close mid-request | Configurable, but duplicates an existing mechanism |
| Styling | Existing local brand tokens plus the revised access dialog/card styles | Additional theme integration |
| Incremental dependency cost | Zero new dependencies | Nonzero; no speculative size claim |

Local build observation: baseline main chunk 131.61kB gzip and Studio chunk 57.92kB gzip; the reviewed implementation build reports 126.56kB and 61.72kB respectively. Chunk redistribution means this is not a controlled library benchmark. The lockfile is unchanged.

## Behavior and migration

- Success/info/warning: ordinary non-blocking toasts. A deliberate Studio save has a stable deduplication ID; autosave never creates a success toast.
- Critical feedback errors: persistent until dismissed or successfully retried. Server/field errors also remain inline.
- Validation/conflict/rate/network failures stay in the form's existing recovery UI. They do not turn into upgrade dialogs.
- Confirmations: one host queue, duplicate requests suppressed, Cancel focused, safe Escape/backdrop behavior, busy submission guard.
- Feature/quota/permission/authentication: one contextual access dialog. Generic 403 means permission help, never an inferred sales pitch.

Migrated explicit actions include Studio template/wording/reset/appearance, program removal/preset, illustrated-map reset/preset, unused media/ticket deletion, ticket reset, check-in undo, uncertain guest-import closure and event visibility changes. Existing shared confirmations for guests/team and publishing review remain. Synchronous navigation/before-unload protections stay native. Budget/gift/expense and floor-plan native confirmations remain an inventoried incremental follow-up; this phase does not replace every browser prompt indiscriminately.

The host is mounted once in App beside ToastContainer. Dialogs use plain React text. Toast severity has per-item status/alert semantics; actionable/critical errors do not depend on a disappearing-only notification. Admin's independent existing feedback system remains intact; its tests/lint/build are regression gates.
