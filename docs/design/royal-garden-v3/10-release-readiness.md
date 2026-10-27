# Release readiness

This implementation is for a **draft code review**, not production deployment approval. The user-supplied sample plays inline in the catalog demonstration. Royal Arch combines a photographic entrance, gold artwork, authorized guest text, video/error/skip flow, fixed information background, canonical wedding sections and live Studio settings. Existing styles and protected-media contracts are retained.

Release gates that remain:

- Native macOS/iOS Safari verification of protected MP4 blob playback. The installed Windows WebKit can play the HTTP sample but rejects a standalone valid MP4 blob with MEDIA_ERR_SRC_NOT_SUPPORTED. Its protected-film tests verify the authorized request and graceful fallback; they do not certify native Safari decoding. This platform inference is consistent with [Playwright's guidance to use macOS for the closest Safari video behavior](https://playwright.dev/docs/browsers#webkit).
- Mobile performance budget acceptance. The deliberately slow throttled lab does not meet the 2.5-second LCP goal; exact measurements and environment are in the performance report. Field INP and sustained physical-device frame rate are unverified.
- Live backend/provider save/reload/publication and protected playback acceptance. Browser save/publication assertions use synthetic HTTP fixtures. The existing backend architecture/media tests run separately, without a new production upload or database mutation.
- Native Khmer editorial/honorific and cultural review, physical iOS/Android touch and power behavior, complete screen-reader journey and third-party rights confirmation for supplied/inherited media.

Optional decorative birds are not enabled or shipped. Skip remains mandatory. No endpoint, entitlement, migration, payment or production infrastructure change is included. No automatic merge or deployment is authorized.

The implementation can be reviewed and tested locally while these gates remain explicit. Passing local automation is not a statement that all production readiness conditions in the brief have been met.
