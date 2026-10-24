# Main integration verification — 2026-10-24

Integration parents:

- Local Phase 6: `bae5d61e569c8a76f8bda788f7164bb3807139d3`.
- Incoming origin/main: `396ace82b0f896469f09c4cb1ceb583767e1f68d`
  (bilingual UI and guest sharing, plus the dashboard/inline entry commits).

An existing merge was already in progress when integration resumed. Its index,
merge metadata and 110 affected tracked paths were backed up locally before
resolving ten conflicted files. Both histories are preserved; no reset, rebase
or force push is used.

## Resolution

- Retained the configured Phase 6 entitlements/backend unchanged.
- Combined localized Studio navigation with renderer capability filtering,
  independent program dates, preserved story data and server save errors.
- Retained the Phase 5 CSV/XLSX mapping/validation/confirmation wizard and its
  uncertain-request batch receipts instead of reverting to the older importer.
- Integrated inline guest entry while preserving extra saved details and
  event-specific data isolation.
- Integrated inline gifts with the existing server save path, currency filters,
  duplicate checks and stable retry request identity. The browser test still
  verifies KHR persistence and a single record after an uncertain save/retry.
- Combined the incoming horizontal schedule with ProgramDetails in both
  layouts. Empty schedules do not mount scroll hooks with missing DOM refs.
- Preserved story whitespace and incoming Studio highlight styles together.
- Restored missing category state in the incoming custom-font dialog and made
  preview callbacks stable. Removed unused imports from the merged dashboard.
  A real Chromium check opens the font dialog, switches Khmer/Latin categories
  and verifies no JavaScript page error; no template is saved.
- Updated regression selectors for the localized UI and inline form; retained
  their underlying persistence/error assertions. A cold lazy route waits for
  the actual Studio state rather than assuming it renders within five seconds.

## Verification

| Check | Actual result |
| --- | --- |
| Frontend user full Vitest | 736 passed / 122 files |
| Frontend admin full Vitest | 116 passed / 19 files |
| User production build | Passed |
| Admin production build | Passed |
| User ESLint | Passed |
| ESLint on changed admin JavaScript/JSX files | Passed |
| Studio/address/cover/import/seating Chromium | 13 passed |
| Inline guest/gift retry and budget Chromium | 5 passed |
| Custom-font dialog Chromium | Passed (real local admin HTTP session) |

Commands:

```powershell
npm --prefix apps/frontend-user test -- --run
npm --prefix apps/frontend-admin test -- --run
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-admin run build
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user run test:e2e -- phase6-studio.spec.js invitation-publishing-address.spec.js phase5-import.spec.js phase5-covers.spec.js phase5-seating.spec.js --project=desktop-chromium --workers=1
npm --prefix apps/frontend-user run test:e2e -- phase4-workspace.spec.js phase5-management.spec.js phase2-operations.spec.js --grep 'inline|manual gift|budget' --project=desktop-chromium --workers=1
```

Browser checks use fictional intercepted HTTP fixtures. The unit environment
intentionally blocks external fonts/iframe loads and can print related resource
not-supported messages; the final run has no failed tests or unhandled test
errors. No provider verification is inferred from these tests.

There are no integration changes under `apps/backend`, `apps/telegram-bot` or
`packages`; the earlier Phase 6 backend/MySQL/provider evidence remains the
applicable baseline. These suites were not rerun for this frontend-only merge.
The existing Phase 6 review ZIP remains a historical artifact of its recorded
commit. No deployment, production database write or external message was made.
