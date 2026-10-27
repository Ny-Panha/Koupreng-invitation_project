# Security and entitlement boundaries

The public route still receives server-resolved cinematicOpening. Neither cinematicIntro nor informationScene can authorize playback. Public film requests still POST to the existing public cinematic-content endpoint with invite/access tokens. Owner previews use the existing authenticated owner cinematic-content endpoint. Backend PreWeddingVideoPolicy continues to validate current PRE_WEDDING_VIDEO entitlement, positive same-event media IDs, video type and poster type.

The supplied sample is public only on the template catalog demonstration. TemplateExperience excludes it whenever hostContent, a hosted invitation, a trusted editor channel or authored preview data is present. It is not an entitlement substitute on guest routes. New presentation fields cannot supply protected film URLs.

Guest names come from existing isPersonalizedGuest and guestName context. Nonpersonalized visits use a generic localized salutation. The frame does not read query-string names, cache visitor identity or inject HTML. React renders potentially hostile guest strings as text.

Presentation image sources use safeIntroMedia; scripts, SVG data, credential-bearing URLs and malformed values are rejected. Geometry and effect budgets are clamped. Existing safeDirections/map checks and trusted postMessage boundaries remain in force. No wildcard target origin was introduced. Skip is always available, and failed media never authorizes or confirms any payment operation.

The scoped backend storage/MediaService/ArchUnit command passed 37 tests, with zero failures/errors/skips. Browser entitlement and public-media flows use intercepted synthetic API responses; those are frontend integration evidence, not a live bank/storage/subscription test. No backend source, database migration or payment code changed.
