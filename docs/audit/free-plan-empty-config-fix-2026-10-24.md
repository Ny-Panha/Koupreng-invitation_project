# Empty Free package configuration regression

The regular development application at `localhost:5173` proxies to API port
8080 and the existing `koupreng_db` on MySQL port 3306. Its legacy root `.env`
sets `FREE_PACKAGE_CODE=`. Spring's placeholder default only covers an absent
property, so this explicit empty value reached the evaluator as an empty code.
The configured, active, zero-price `FREE` package already existed.

A new synthetic registration reproduced HTTP 503 with
`ENTITLEMENT_POLICY_UNCONFIGURED` from `/api/v1/me/entitlements`; the packages
page consequently displayed "Plan could not be verified". A private database
snapshot was taken before validation writes. Existing accounts, subscriptions
and configured benefits were preserved.

`EntitlementService` now normalizes null/empty/whitespace Free codes to `FREE`.
Explicit nonblank configured codes retain their behavior. Effective access
still comes from the configured package; quota checks remain enforced even
with the legacy enforcement switch disabled. No synthetic subscription/payment
row is created for Free. `.env.example` documents the supported defaults.

Verification:

- The four new parameterized cases failed before the correction and pass after
  it, exercising current benefits and quota enforcement.
- `mvnw.cmd -f apps/backend/pom.xml test -Dtest=EntitlementServiceTests,SubscriptionServiceTests,ArchitectureRulesTests`:
  47 passed, zero failures/errors/skips.
- `npm --prefix apps/frontend-user test -- --run src/features/subscriptions/SubscriptionPackagesPage.test.jsx src/features/subscriptions/subscriptionService.test.js`:
  15 passed across two files.
- The running development backend picked up the compiled correction; the same
  pre-fix registration now receives HTTP 200 / `FREE`.
- Another fresh registration through the regular Vite API proxy receives Free
  immediately with empty subscription history. Real Chromium verifies the
  current plan, selected Free card and actual usage in English at 1440 pixels
  and Khmer at 390 pixels, with no document horizontal overflow.

Sanitized before/after browser evidence and test logs are retained in the
private local verification directory. No deployment or provider payment was
performed.
