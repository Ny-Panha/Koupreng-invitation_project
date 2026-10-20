# Studio and ticket verification

Date: 2026-10-20. Branch: `feature/invitation-studio-tickets`. This report separates real application/H2 integration checks from browser-only API contract fixtures. Application code uses the existing real APIs; fixtures are confined to `tests/e2e/support`.

## Commands and results

Commands ran in the indicated project directories. Logs were captured under the ignored `.cache/` directory. Repeated focused checks are subsets of the suites, not additional unique passing tests.

| Directory | Command | Actual result |
| --- | --- | --- |
| `apps/frontend-user` | `npm run lint` | Passed |
| `apps/frontend-user` | `npm run build` | Passed |
| `apps/frontend-user` | `npx vitest run` | 540 passed, 100 files; 14.47s |
| `apps/frontend-admin` | `npm test` | 80 passed, 16 files; 30.21s |
| `apps/backend` | `cmd /d /c ".\mvnw.cmd test -Dstyle.color=never > ..\..\.cache\studio-backend-final.log 2>&1"` | 538 run: 508 passed, 30 skipped, zero failures/errors; BUILD SUCCESS, 1m27s |
| `apps/backend` | `cmd /d /c ".\mvnw.cmd test -Dtest=TicketIntegrationTests,ArchitectureRulesTests -Dstyle.color=never > ..\..\.cache\studio-ticket-final.log 2>&1"` | 16 passed (11 ticket integration, 5 architecture); 33.734s |
| `apps/frontend-user` | `npx playwright test studio-tickets.spec.js event-workspaces.spec.js ux-ui-redesign.spec.js critical-routes.spec.js khmer-celestial-scroll.spec.js khmer-celestial-guest-banner.spec.js --workers=2` | 56 passed, 4 opt-in live-backend scenarios skipped; 4.6m |
| `apps/frontend-user` | `npx playwright test studio-tickets.spec.js --workers=2` | Final rerun: 14 passed; 1.1m |
| `apps/frontend-user` | `npx vitest run src/features/templates/layouts/KhmerCelestial/KhmerCelestialLayout.test.jsx` | 20 passed; 3.56s |
| `apps/frontend-user` | `npx vitest run src/features/invitations/InvitationForm.test.jsx src/features/invitations/studio` | Final rerun: 21 passed, 3 files; 6.16s |
| repository root | `python -m pytest apps/telegram-bot/tests -q` | 72 passed, 2 deprecation warnings; 1.70s |
| repository root | `python scripts/validate-agent-routing.py` | Passed, zero errors/failures |
| repository root | `powershell -ExecutionPolicy Bypass -File .\scripts\setup-ai-skills.ps1 -VerifyOnly` | Passed; zero missing references/checksum errors |
| repository root | `git diff --check` | Passed |

`scripts/qa/capture-studio-baseline.mjs` captures the old editor from the recorded Git revision without replacing working files. Browser export fixtures are committed under `tests/e2e/support/fixtures`; a clean checkout does not depend on a generated `.cache` image. The backend test independently decodes that fixture.

Frontend unit output includes Happy DOM warnings for external Google font/map loading; assertions pass. Existing worker warnings concern FastAPI/AnyIO deprecations. The build retains the existing unresolved cover SVG warning. None is claimed as provider verification.

During development, initial checks exposed missing OpenAPI examples/drift, an icon named `Map` shadowing the JavaScript collection in the save path, and browser-back listener ordering. These were corrected. A generic ZXing finder was intermittent on an axis-aligned generated QR fixture; the backend bitmap test now uses its explicit pure-barcode decoder mode, while independent browser jsQR checks decode the full exported files. Final results below supersede those intermediate runs.

## Coverage and evidence

- Editor and ticket designer: Khmer/English, widths 320, 375, 390, 430, 768, 1024, 1440 and 1920, desktop Chromium and mobile Chromium. Document overflow and runtime errors are asserted. Reduced motion is exercised.
- Autosave sends persisted invitation payloads, stays on the canonical event route, retains dirty state on failure, supports retry/undo and blocks rejected navigation/back. Wording/appearance changes, saved empty collections, nested media references and event-detail prefilling have targeted assertions.
- Backend tests exercise real H2 repositories/services and MockMvc, with current-user identity/entitlement decisions mocked at their existing boundaries. Ownership denial, global STAFF denial, exact guest/event association, invalid tokens, package denial, media ownership/type validation, revision conflicts, event-delete cleanup and private response headers are covered.
- Ticket GET leaves guest/RSVP counts unchanged. Generated guest QR payloads pass through the existing real check-in service, including duplicate and wrong-event cases. Existing check-in unit tests remain in the backend suite.
- Every layout exports at 2×/3×. The PNG is loaded back into a browser canvas and independently decoded with jsQR; dimensions and the complete expected URL are asserted. The synthetic fixture uses a realistic long slug and UUID-shaped token. All evidence contains synthetic identities/credentials.
- Public guest ticket modal opens without an RSVP mutation, closes with Escape and restores trigger focus. Native OS share sheets and camera hardware are not simulated as verified hardware.

Evidence: [screenshots and exports](studio-tickets/) and [machine-readable results with PNG dimensions/hashes](studio-tickets/verification-results.json). Desktop screenshots number 32 (two screens × two languages × eight widths), plus two baseline captures. Export evidence includes 16 PNG files (four layouts × two scales × two browser projects). Before captures load the original editor/simulator source from `715b85ef` through an isolated Vite loader; surrounding current application navigation is retained. Working source files were not reverted for capture.

Representative comparison: [before desktop](studio-tickets/before-editor-1440.png), [after desktop](studio-tickets/editor-en-1440.png), [before mobile](studio-tickets/before-editor-390.png), [after mobile](studio-tickets/editor-en-390.png), [designer](studio-tickets/designer-en-1440.png), [Gold PNG](studio-tickets/exports/gold-2x-desktop-chromium.png).

## Release gates and known limits

The 30 existing MySQL-gated backend checks are not equivalent to H2 coverage. V38/V39 need actual MySQL 8 Flyway/schema/cascade verification. Existing opt-in browser checks against a separately running local backend are skipped unless their documented flags are supplied. Cloud storage CORS, bank/payment providers, social login, Telegram delivery and native sharing need their real environments. No provider credentials, real account privileges, payments or production services were modified deliberately. No deployment, push or merge was performed.

PDF is deferred. Fixed-order invitation templates retain fixed ordering and their own unsupported appearance settings. The current wording presets edit the existing invitation text model rather than adding a parallel translation store. This branch is suitable for local code review and automated demonstrations; staging/production certification requires the gates above.

## Manual verification

1. Use an isolated local/staging database, review V38/V39, then start the updated backend with the normal project configuration. Verify the Flyway history and schema validation. Start the user frontend with `npm --prefix apps/frontend-user run dev`.
2. Sign in as an existing QR-entitled event owner. Create a wedding with names/date/venue and choose Khmer Celestial. Open its exact event workspace and Invitation tab. Confirm the saved event fields are prefilled.
3. Change a palette, heading/body font, wording, schedule date/description/order and gallery order. Confirm the same template updates in Cover/Full preview. Test desktop width/zoom/reset/fullscreen and mobile Edit/Preview.
4. Wait for Saved to server, refresh and compare the values. Upload JPEG/PNG/WebP cover/background/gallery/story/brand images; save/refresh. Confirm a background upload does not replace the canonical cover. Delete all items in an optional collection and verify they remain empty after reopening.
5. Disconnect the network or reject a save, edit again and confirm the page reports failure/offline. Reject a route change and browser Back; changes must remain. Reconnect, retry, test Undo/Redo and confirm Reset. Publish explicitly; save alone must not publish.
6. Add a real guest once. Open Ticket designer in the same event. Choose each layout, a saved guest, frame/colors/text/media/field flags, save, refresh and compare. Preview a guest's ticket from the Guests row.
7. Download 2× and 3× PNGs. Check dimensions, long Khmer names, date/venue/table, borders and QR quiet area. Decode the complete exported PNG. Try copy-link, native share/file fallback and the user-initiated Telegram link.
8. Publish the invitation and open its personalized guest link in a signed-out browser before submitting RSVP. Open/download the ticket, close with Escape, then submit RSVP normally. Confirm there is still one guest/RSVP identity. Test the ticket with RSVP disabled as well.
9. Scan the guest QR while authenticated as its owner or an already authorized ADMIN with the existing check-in entitlement. Expect one check-in; rescan for duplicate feedback. Try another event, invalid token, anonymous request, other owner and global STAFF: mutations must be rejected. A general invitation QR must not identify a guest.
10. With a physical Android/iOS device, verify camera permissions, actual QR recognition, native sharing, downloaded-image offline viewing and online check-in feedback. Repeat media exports against the configured storage provider's CORS policy before staging approval.
