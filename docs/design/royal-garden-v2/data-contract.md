# Royal Garden V2 data contract

Stable identities: `royal-garden-cinematic` and `ROYAL_GARDEN_CINEMATIC`. No database ID or migration is introduced.

The existing `useStudioPersistence` remains authoritative for autosave, revision conflicts, retries, undo/redo, server acknowledgement and navigation guards. `cinematicIntro` and `venueMapMode` are additive presentation fields carried by `invitationFeatureFields` through the current form → content JSON → public adapter → draft → template content → dedicated layout pipeline. The older builder payload adapter also forwards these fields. Existing fields retain their meaning.

```json
{
  "cinematicIntro": {
    "version": 1,
    "enabled": true,
    "style": "oval",
    "heading": "",
    "subtitle": "",
    "slides": [{ "id": "stable-id", "src": "/saved-upload.webp", "alt": "Our portrait", "x": 50, "y": 50 }],
    "duration": 4.3,
    "transition": "ken-burns",
    "overlay": 0.3,
    "textPosition": "bottom",
    "showSaveTheDate": true,
    "music": true,
    "reducedMotion": false
  },
  "venueMapMode": "auto"
}
```

Bounds: 24 slides, JPEG/PNG/WebP upload under 5 MB each; 2–12 seconds per slide; focal coordinates 0–100; overlay 0–0.75; heading 300 and subtitle 500 characters. Slideshow media accepts relative local paths and HTTP(S), with no credential-bearing URLs, protocol-relative URLs, HTML data URLs or JavaScript URLs. Temporary JPEG/PNG/WebP data/blob previews use the existing inline-reference upload and replacement mechanism before saved server acknowledgement. Production never embeds the private reference recording.

Absent `slides` means follow the owner gallery. `slides: []` means no slideshow. Empty headings/subtitles stay empty. Explicitly disabling music, intro, schedule, gallery or calendar is respected. Canonical names, event date/time/timezone and music remain in their existing fields; intro settings do not store a second date, set of names or audio URL.

`venueMapMode` supports `auto` (existing diagram, sketch, then interactive map), `sketch`, `embed`, and `details`. The directions CTA remains available when its Google Maps URL passes the existing strict validator. A sketch preserves its source proportions. The shared illustrated map retains its existing premium entitlement checks.

`studioStyle` already persists palette, body font, message size/alignment, portrait focal point and motion. Royal Garden adds `patternOpacity` (0–1) and `ornamentScale` (0.6–1.5) inside that existing object. Supported per-element fonts use the current `elementFonts` mapping.

Imported `gallery` metadata is now normalized into Studio `photos`; this prevents an older saved gallery being dropped on a subsequent Studio save. Explicit empty arrays remain empty.

Backend inspection: `InvitationService` stores the supplied JSON strings; `InvitationDesignPolicy` preserves unknown JSON fields while enforcing its current map/monogram entitlements and 50,000-character JSON limit. `LocalizedInvitationPolicy` continues to own approved public translations. No backend allowlist change is needed. Owner data is rendered as React text, and the existing trusted origin/session preview protocol is reused without wildcard messaging.

The shared upload-backed pre-wedding video provider remains separate from the portrait slideshow; it takes precedence when configured and resumes selected music afterward. Music starts only after a guest gesture. Changing locale reuses the public route's approved-language projection and preserves guest query parameters.

## Catalog activation

Frontend registration is complete, but a populated backend catalog remains authoritative. An administrator must create or activate a template through the existing Admin Templates flow with exact code `royal-garden-cinematic`, preset `ROYAL_GARDEN_CINEMATIC`, WEDDING support and the intended language/status/pricing configuration. Use the database-assigned ID. Do not reuse another template ID or alter purchase/ownership rows. No live catalog was modified during this change.

Live local backend health returned HTTP 503 (`status: DOWN`); therefore real database save/publish verification is blocked. Browser save/reload/publish tests use the existing synthetic API fixtures and are identified as such.
