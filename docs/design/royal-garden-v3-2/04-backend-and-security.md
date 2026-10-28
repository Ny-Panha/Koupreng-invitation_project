# Backend and security

No endpoint, schema or migration was added. `InvitationContentPolicy` continues to validate 30 program days, 200 rows, stable day references, bounded text, calendar settings, IANA timezone and event end ordering. Applied Flyway files are untouched. Video entitlements and protected POST media access remain in the existing provider.

The audit found that all three `RsvpService.publicWishes` overloads could return private RSVP messages and guest identity. They now retain invitation access validation and return an empty compatible list without reading message rows. The authorized organizer `wishes` method still requires `MANAGE_RSVP` and returns those messages. No stored RSVP, attendance, message or moderation behavior was deleted. This privacy correction applies to every template because the underlying messages have no public-consent model.

Royal passes `showPublicWishes=false` to the existing `PublicRsvpForm`, avoiding a public-feed request/wall while preserving guest-token restoration, existing-response editing, submission, confirmation and authorized QR passes. Server protection remains necessary independently of that presentation setting. Per-day RSVP remains deferred because there is no persisted per-program-day attendance contract.

Gift KHQR remains display/share only. No scan, enlargement or clipboard action creates a paid/payment-confirmed state. USD/KHR are never summed. Public export fields are explicitly allowlisted and contain neither gift account details nor protected media URLs. Directions use the existing HTTPS Google host allowlist; media uses `safeIntroMedia`. React renders authored text without untrusted HTML. Preview origin/channel validation remains unchanged.

Verification: targeted Maven RSVP, content-policy and ArchUnit run passed 22 tests, 0 failures/errors/skips. Final broader execution evidence and integration limits are in `07-qa-results.md`.
