# Batch 11 integrated journeys

Date: 2026-11-05, ICT. Baseline: `b57b9edc58a954de650ff42e7e9ee6d042b57e33` on `main`.

## Evidence tiers

- **A:** Route content/destination smoke, or an explicitly identified guard-only check. Guard-only evidence does not verify the authenticated page.
- **B:** Functional browser/component checks using deterministic API fixtures. These are frontend contract checks, not database integration.
- **C:** Actual Spring Boot HTTP/JWT/JPA/MySQL persistence, with a separate opt-in real-browser journey. No browser API interception is used in the live journey.
- **D:** External bank/provider/device verification. Pending; no actual payments, email/Telegram broadcasts or production deployments are permitted by this batch.

The [route matrix](route-matrix.json) reconciles all 111 customer and 24 admin patterns against executed React route factories. The workspace layout and its index share one URL and are one pattern. Historical modernization status is retained separately from current evidence. No row is certified because its application shell mounted.

## Customer and guest journey

| Step | Executed evidence | Scope |
|---|---|---|
| Discovery and catalog | `marketing-pages.spec.js`, existing catalog/presentation unit tests | Fixture browser UI; catalog filtering, fallback, bilingual reflow |
| Registration and authentication | Real MySQL fixtures register disposable accounts; live browser signs in and reloads; 84 customer protected patterns reject anonymous access | Real backend plus fixture guard sweep; external OAuth pending |
| Template checkout | `phase2-payment.spec.js`, Batch 11 payment return/receipt tests | Fixture order creation, pending review, server PAID transition, identity/amount/currency; no real payment |
| Entitlements | `EntitlementIntegrityMySqlTests`, `SubscriptionIntegrityMySqlTests`, `PaymentEvidenceIntegrityMySqlTests`, Phase 7 collaboration tests | Disposable MySQL; trusted confirmation, snapshots, quotas and concurrency; test grants are explicitly nonfinancial |
| Create, save, reload, publish | Opt-in `batch11-live-journey.spec.js`; HTTP journey in `Phase7CollaborationMySqlTests` | Real built customer app and disposable server; same numeric invitation/event ID persists |
| Personalized delivery | Real HTTP prepare/share-message test, copy-only UI tests | Preparation and copying do not prove receipt. Explicit recorded shares remain server operations. Historical send markers are untouched |
| RSVP and guest pass | Real guest browser submits the personalized RSVP; HTTP test revises the same response and checks aggregates | Guest identity remains linked to the invitation; no second invitation system |
| QR and attendance | Real browser scanner submits the guest token; HTTP test checks unauthorized scan, duplicate result, totals and reversal | Server response determines attendance. A general event QR is not a guest attendance token |
| Admin reporting | Real admin login/report API and report page; HTTP report verifies guest/RSVP/check-in counts and reversal | Same persisted event ID; ADMIN required; manually recorded gifts are not bank receipts |

The live browser run is launched while the disposable Spring Boot test server is alive. The harness creates a unique `koupreng_studio_<UUID>` schema, applies the existing migrations, and drops only that owned schema in `finally`. Disposable credentials are written briefly to an ignored run-specific file and removed in `finally`. Live browser traces, screenshots and videos are disabled to keep personalized URLs and credentials out of browser artifacts. Fixture screenshots contain only fictional records.

## Redirect contracts

`InvitationScopedRedirect` preserves parameter precedence (`eventId`, `invitationId`, `id`, then query `id`/`invitationId`). Positive numeric IDs enter the existing event workspace. Missing, zero, negative, exponential and local-draft IDs enter event selection, preserving the requested module where applicable. Local draft editor routes keep their existing conditional renderer; no local draft is converted to a published server invitation.

Only `guestId`, `q`, `status`, `type`, `sort`, `page`, `tab`, `mode` and plain section anchors are forwarded by this redirect. Credential query values and arbitrary hashes are dropped. `location.state` is retained. Browser checks cover selected guest restoration, refresh, back and forward. Account aliases retain their existing account-page behavior.

The new browser alias sweep covers 25 customer aliases and ten administrative aliases. Fullscreen template editor routes are checked independently of the admin shell. Remaining conditional/local-draft and invalid/deleted-resource cases are listed in [remaining gaps](remaining-gaps.md).

## Reproduce

Build both apps first. Run the normal Playwright suites listed in [test results](test-results.md).

```powershell
python scripts/qa/run-studio-access-mysql.py --tests Phase7CollaborationMySqlTests,PaymentEvidenceIntegrityMySqlTests,EntitlementIntegrityMySqlTests,SubscriptionIntegrityMySqlTests --label batch11-real-mysql-final
python scripts/qa/run-studio-access-mysql.py --tests Phase7CollaborationMySqlTests --browser --label batch11-browser-live-verified
```

The real-browser configuration uses dedicated loopback ports 4175/4176 and the random test backend port. The test profile permits those two browser origins; production CORS configuration is unchanged. The standard browser fixture suites use 4173/4174. Docker was unavailable; the repository's existing loopback MySQL harness was used instead.
