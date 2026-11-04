# Khmer Floral Gold — delivery and verification

The dedicated `khmer-floral-gold` renderer uses the existing invitation engine, canonical editor state, authorized media APIs, backend template catalog and public RSVP service. `V51__register_khmer_floral_gold_template.sql` registers a new ACTIVE, nonpremium, 0 USD Wedding template with KH/EN/BOTH classifications. IDs are allocated by the database. An existing record is preserved rather than silently activated or repriced.

## Access and persistence

No production authorization implementation was changed. The existing free-template branch in `EntitlementService` grants template use without a purchase. Account quotas, ownership, publication checks, paid-template policies, protected design tools and guest RSVP rate limits continue to apply. The decorative initials are a basic scalar field, and the diagram is an uploaded image; neither invokes the paid vector-monogram or Map Studio payload.

The real-service H2 integration test creates a Free owner and real persisted template, creates/reopens/publishes an invitation, submits an RSVP and reads it back from JPA. It also rejects a duplicate public response, anonymous access, a stranger's edit and a second invitation beyond the configured quota. The disposable MySQL test upgrades V50→V51, verifies free metadata/classification, and re-executes the guarded SQL after changing the new row to confirm an existing admin decision is preserved. The test schema is dropped afterward. The normal local database and production data are untouched.

Browser scenarios use explicitly intercepted API contracts and synthetic IDs/accounts. They exercise public catalog → demo → sign-in → creation → studio edit/save → publication → guest rendering → RSVP. Separate fixtures cover FREE/BASIC/PRO/PREMIUM/CUSTOM. Actual server persistence is established by the backend integration test; this is not a claim that browser fixtures contacted a production service or real payment system.

## Commands and evidence

Final executed results are recorded in `RESULTS.json`. Primary commands:

```powershell
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user run test -- --maxWorkers=2
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-user run test:e2e -- khmer-floral-gold.spec.js khmer-floral-media.spec.js template-identity.spec.js --workers=2
npm --prefix apps/frontend-admin run lint
npm --prefix apps/frontend-admin run build
```

Backend, from `apps/backend`:

```powershell
.\mvnw.cmd test '-Dtest=KhmerFloralGoldMigrationMySqlTests,EntitlementServiceTests,InvitationDesignPolicyTests,TemplateCatalogServiceTests,TemplateCheckoutPolicyTests,RsvpServiceTests,PublicRsvpRateLimitFilterTests,ArchitectureRulesTests'
.\mvnw.cmd test '-Dtest=KhmerFloralGoldIntegrationTests'
```

The MySQL test requires `RUN_FLYWAY_INTEGRATION=true` and disposable `FLYWAY_TEST_DB_URL`, `FLYWAY_TEST_DB_USERNAME`, `FLYWAY_TEST_DB_PASSWORD`. Validation used a separate loopback-only MySQL 8 process on port 3308 with a task-owned temporary data directory. No credentials are committed.

Early failures were corrected: missing human-readable demo-date metadata and order-sensitive static fixtures; an English gallery projection; host image defaults; the map content mirror; inaccessible portrait controls in the inherited form flow; and selected RSVP contrast. A default highly parallel unit run hit existing five-second rendering timeouts; the complete suite was rerun with two workers. An overlapping Playwright server lifecycle caused connection refusals; the final runs use one test runner at a time. Happy DOM emits existing disabled-iframe messages during the unit suite, and Maven emits Java/Lombok deprecation warnings; these are not hidden test passes or failures.

## Manual verification

1. Use the project's development backend configuration with a development MySQL database, Java 25 and the existing free package policy. From `apps/backend`, start the backend with `.\mvnw.cmd spring-boot:run`. Flyway applies V51 through the normal startup process. Check `/api/v1/templates` for code `khmer-floral-gold`, ACTIVE, zero USD, nonpremium and database-assigned ID. An existing inactive or paid record must be reviewed through the existing Admin API rather than overwritten.
2. Run `npm --prefix apps/frontend-user run dev -- --host 127.0.0.1 --port 5173`. Open `http://127.0.0.1:5173/templates/khmer-floral-gold` or `/templates/khmer-floral-gold/demo`. Switch Khmer/English, open, inspect every section, download the calendar and navigate both gallery modes. The static demo can render while the backend is unavailable; selectable catalog inventory still requires a real active record.
3. Open `/templates`, choose this design and sign in. Create a Wedding under Free, then repeat with the configured paid packages. Edit names, initials, wording, family, date/time/timezone, agenda, venue, closing and translations. Media & Opening → Couple photos supplies groom, bride and main couple uploads. Schedule & Venue → Venue & map supplies the diagram. Design & Cover supplies initials and supported appearance fields.
4. Save, refresh and reopen the editor. Check portraits, map, gallery and text in the phone preview. Remove a photo and verify that no demo person appears. The host's basic content remains editable without opening paid map/monogram tools.
5. Review publication, publish and open the actual returned `/w/<slug>` or `/i/<slug>` URL in a guest session with the required guest/access credential for private invitations. Switch language without losing its query credentials. Submit attendance; verify the response in the host's existing RSVP view. Retry a duplicate and simulate a service error; success must follow backend confirmation.
6. Test keyboard opening, gallery arrows/Tab/Escape and focus return, map enlargement, reduced motion, 360/390/430/768/1024/1440 widths, and owner audio play/pause/navigation cleanup. No audio track is shipped by this template; use a recording the host is entitled to upload.

## Scope and limits

New source: the dedicated layout/model/artwork/gallery/CSS/test, template metadata, V51 migration, migration and persistence tests, browser tests, asset bundle and this design record. Integration edits: registry/capabilities/catalog mapping, template experience content, studio form/flow, draft adapter, public locale/ticket integration, floral presentation of the existing RSVP form, admin preset and entitlement tests. `CHANGED_FILES.txt` records exact paths.

Authentication, payment processing, entitlement service implementation, RSVP service implementation, existing templates, applied migrations V1–V50, deployment files and production data are intentionally left unchanged. User-owned deletions and unrelated build artifacts are excluded from the template commit. The branch is `main`; pushing is authorized by the user's standing instruction. No deployment is performed.

Licensed demo photography is different from the reference people. Original generated watercolor and SVG ornaments approximate its botanical stationery composition. The demo map is illustrative, and no soundtrack from the video is copied. Physical-device Safari checks and a production rollout remain outside the local evidence. Asset sources, dimensions, transformations and licensing are in `ASSETS.json`; actual screenshots and the fidelity matrix are in `VISUAL_QA.md`.
