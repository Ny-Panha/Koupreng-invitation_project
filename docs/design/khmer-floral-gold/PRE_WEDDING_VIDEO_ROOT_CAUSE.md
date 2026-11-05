# Pre-wedding video root cause — V2

## Reproduced frontend disconnect

At baseline `a082d3d0` / starting main `5e0ad75c`, Floral's capability mapping
explicitly set `preWeddingVideo: false`, so the canonical Studio hid its editor.
More importantly, the dedicated Floral open handler only set a boolean and played
music. It never invoked `useCinematicOpening`, although TemplateExperience already
wrapped dedicated layouts with the authorized shared provider. A valid server
`cinematicOpening` could therefore never appear after this cover. This was a
renderer/editor integration defect, not evidence that server entitlements should
be relaxed or public media URLs exposed.

The editor also retained the old event's media list while loading a different
event. It now keys the loaded library by event identity and ignores an upload
completion belonging to a previous event. A new draft with no event ID is safe.

## Fix and lifecycle

Floral now calls the shared stage after its cover and welcome sequence. Reduced
motion/data saver bypasses optional automatic film playback. Immediate opening
Skip/Continue reaches the details. The player is loaded on demand, so dismissing
its dialog before import completion can legitimately avoid the media request.
Once loaded it uses the existing owner/public blob loader, AbortController and
object URL cleanup. Errors/403s/unsupported codecs fall through to the invitation.
Skip, Escape, ended and replay use the existing provider completion policy.

Floral films are muted throughout; the selected wedding song uses one existing
audio controller started by the opening gesture. This avoids concurrent song and
film sound. Music failure exposes the existing retry button. Cover-background
video is distinct from the Premium post-cover film and now renders through the
existing shared CoverBackground; it pauses on page hiding/unmount and uses a
poster/static fallback for reduced motion or data saver.

The content schema remains `{preWeddingVideo:{enabled,videoMediaId,posterMediaId}}`.
Presentation styles are a separate additive object. PreWeddingVideoPolicy still
checks current owner benefits, media type, exact invitation ownership and poster
ownership. The public film endpoint still requires publication, guest access,
current Premium and the selected owned media ID. Local private files stay outside
the static upload root. No production backend policy was weakened.

## Executed evidence

- `PreWeddingVideoEditor.test.jsx`: prior-event library isolation, late upload
  discard, non-Premium/no-event-ID handling.
- `phase9-video.spec.js`: compatible layouts, immediate keyboard dismissal,
  reduced motion and actual browser codec/playback recovery. Early Skip accepts
  zero or one fetch because the player is lazy; real playback is tested separately.
- `floral-motion-v2.spec.js`: actual protected MP4 fixture decoding in Floral,
  muted playback, no competing sound control, Skip, replay and error recovery.
- `KhmerFloralGoldIntegrationTests`: real Free authoring, JPA style persistence,
  publication, guest RSVP, duplicate response/stranger/quota boundaries.
- `Phase9MediaMySqlTests`: **5 passed**, real HTTP/JWT/Flyway/MySQL/local storage,
  including Floral-specific Premium publication, Free/Pro refusal, expired
  benefits, selected ownership, private guest tokens and protected-byte access.
- `LocalCinematicStorageTests` and `CloudinaryCinematicContractTests` were run.
  Cloudinary tests mock the provider contract; no live Cloudinary verification is
  claimed. Browser API fixtures do not substitute for the real MySQL test.

The disposable MySQL instance used its own temporary data directory on loopback
port 3416 and was shut down after validation. The existing development service on
8080 and its data were only read for catalog inventory.
