# Packages and truthful account state

`SubscriptionResponse.source` now distinguishes `DEMO_ADMIN_GRANT` from an ordinary
`SUBSCRIPTION_ORDER`. It exposes no administrator identity, bank evidence or token.
History renders `NOT_REQUIRED` demo grants as nonrevenue access with no checkout
action. It no longer presents them as awaiting payment. Paid activation still
requires the existing server `ACTIVE`, `active=true`, `paymentStatus=PAID` state.
No settlement, price, webhook or activation rule changed.

The package screen compares the actual catalog response, including duration,
account/event guest-record limits, team capacity including the owner and individual
feature flags. Missing limits are described as unspecified; explicit null retains
the existing unlimited meaning. Guest records are distinguished from seats and
attendees. Usage progress has accessible labels. The comparison table scrolls in
its own keyboard-focusable region on narrow screens. Current-plan and purchased
benefit snapshots remain server-owned.

Admin recent invitations now render supplied records or an honest empty state.
The previous four fictional weddings and fabricated default template name were
removed. This is a dashboard correctness fix, independent of payment accounting.

## Verification

- User subscription Vitest: 17 passed in two files. Existing assertions were updated
  for the new record-unit wording and more cautious payment-review wording.
- Admin recent-invitation Vitest: two passed, including empty and supplied records.
- Targeted ESLint for both frontends: passed.
- Backend `SubscriptionServiceTests,ArchitectureRulesTests,OpenApiIntegrationTests`:
  48 passed, no failures/errors/skips. The checked-in OpenAPI extension matches the
  runtime document. Existing frozen-benefit, payment and ownership tests pass.
- No live bank/provider requests or real transactions were performed. Browser,
  responsive and real-HTTP package validation remain part of the final QA gate.

The team-availability notice is deliberately retained until the team authorization
and acceptance increment is implemented and tested.
