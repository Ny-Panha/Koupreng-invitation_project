# Remaining verification limits

- Real banking, ABA, Telegram, SMTP, OAuth and live Cloudinary credentials/providers were not exercised. Existing regression tests and Cloudinary mocked-HTTP contract tests are not live provider evidence.
- The Docker CLI is installed, but its Linux engine pipe is unavailable. Image builds, container recreation, mounted-volume permissions and volume restore must be rehearsed in staging. Local directory persistence and Compose configuration are verified separately.
- Windows bundled WebKit rejected the actual MP4 fixture. Its recovery path is checked; native Safari/iOS decoding and physical device playback are not claimed. Chromium/Firefox playback is covered. Other browser/codec combinations require supported source encodings or graceful fallback.
- Cinematic playback downloads a Blob only after opening. It does not provide adaptive streaming or transcoding. Large/slow films may hit the no-progress recovery; the maximum remains 50 MB.
- Physical devices, human screen readers, hardware/on-screen keyboard combinations, browser chrome zoom, Khmer editorial/family review and user-authored film captions remain manual checks.
- Route inventory/source review and representative rendered families do not mean every provider-dependent state of every route was physically exercised. Historical reference captures without their opt-in baseline server are reported as skipped.
- Release backend/frontends together and back up both media volumes. Old backends cannot interpret newly introduced media enum values. Production rollout and rollback/restore remain separately authorized operations.
