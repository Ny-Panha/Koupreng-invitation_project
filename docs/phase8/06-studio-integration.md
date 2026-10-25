# Studio integration and persistence

The five-step guide is unchanged. Program remains in Design & Content; the existing countdown section is labeled “Save the date & calendar” in both Studio navigation modes. Advanced controls expose the same stored data. Existing preview/dialog focus handling, toolbar save, save status, history, local recovery and optimistic revision token remain in use.

`useStudioPersistence` was reused unchanged. New fields participate in the form snapshot and queue. Explicit serialization now includes the additive fields and preserves original root content extensions. Disabling program/date visibility changes flags only. Date inputs use the same canonical event values as event information, preview and public adapters. Event settings update the canonical JSON date copies too.

Browser verification exposed a pre-existing problem: a real 401 redirected through the shared HTTP interceptor before the queue could preserve edits. Invitation updates now accept request options; Studio saves use the existing `suppressAuthRedirect` option. The queue reaches its expired state, keeps edits, exposes private draft download and suspends writes. This does not authorize a request or bypass server expiry. Normal non-Studio request redirects remain unchanged.

401/409/503, offline/retry, visibility disable/re-enable, guided/advanced switching, iframe preview and actual save/reopen/publish flows were checked. The HTTP/MySQL test also verifies stranger/viewer denial and stale revisions. Fixture browser writes are explicitly distinguished from the genuine browser/API/SQL run in [test results](07-test-results.md).
