# Final Royal Garden repair

This folder supersedes the preceding repair's audio and video layout contract. The latest user brief requires an uninterrupted background song, a permanently muted film, full-stage imagery, default gold calligraphy and a locked information gate. Earlier reports above this folder are historical iterations, not final verification for this policy.

Starting main for this brief: `0a3f167bd7973ac54bb7ab4b8fe0b19f1f85bce6`. Earlier work started at `32e95466a2a55ba1cd53701012903a702c06e10b`. Both concurrent commits `db69ae91` and `0a3f167b` were preserved. No branch, PR, force push or production deployment is used.

The supplied original blue/gold archive and its derived full-source images remain unchanged. The existing natural 3:1 guest band and circular 48px SVG Open button remain: the verified `butto_invitation.webp` is a wide rectangular artwork and conflicts with this lower safe region, so the brief's allowed circular control is retained.

## Final behavior

- New catalog/default selections use the original gold title art with one accessible semantic heading, restrained reveal/shimmer and an Open pulse. Explicit owner text/artwork choices and cleared artwork stay respected.
- Opening calls the selected song's `play()` directly in the guest gesture, before timers or protected video loading. One persistent audio element continues through cover, film, exit and information. Actual playback events/promise results drive its UI. A denied attempt leaves a working Play music control. Pausing during film stays paused after completion.
- The user explicitly confirmed public-distribution permission for the existing `ថ្ងៃដែលរង់ចាំ` song on 27 October 2026. The catalog and new defaults use `getMusicTrack('waiting-day')`; this records user authorization rather than an independent license certification. Owner-selected tracks, explicit empty sources and music-off settings win over the new default.
- Royal video is always muted, including legacy saved `sound: 'on'`, Replay, volume-change attempts and language changes. Other templates retain their existing audio/player behavior. Studio explains the shared soundtrack and exposes fit plus bounded horizontal/vertical focal position rather than independent film sound/resume options.
- The film fills the stage by default with cover and editable focal position. An explicit saved contain preference is preserved, with the approved poster as a static background fill where available. The original footer overlays the bottom at its natural 3:1 ratio; it no longer consumes a separate navy row. Skip/pause and optional paused Replay are compact corner controls. The Royal progress bar and redundant Continue/bottom rows are removed.
- Wedding details and section navigation are unmounted during preparation, playback and exit. There are no page-3 anchors, controls or forms to reach through wheel, touch, hash or focus. The player stays inside the same framed shell, with its scroll area locked and no extra trailing information footer.
- The provider permits one terminal transition. It pauses the film, keeps the background song untouched, shows a 750ms gold-light exit over the last media frame, then reveals information and focuses its starting region. Reduced motion/immediate preferences bypass the decorative delay. Errors/timeouts use the same safe exit; absent video goes directly to information without an empty player.
- The original information frame remains fixed while enabled sections scroll inside its source-derived safe region. The saved fixed-frame opt-out remains supported. Language changes update standard UI without changing saved JSON, private guest identity, audio position or the active video node.

## Evidence and reproduction

The original [reference audit](../reference-vs-current.md) and [source crops](../references/crop-metadata.json) remain the layout specification. The available local comparison images have no colored annotations; this repair applies the written full-green-area and remove-red-controls requirements and does not invent marked-image evidence.

Browser checks live in `apps/frontend-user/tests/e2e/royal-garden-v3.spec.js`. The new soundtrack cases record actual native audio playback, transient user activation, mute enforcement, wheel/keyboard/hash/tab gating, duplicate completion, time continuity, blocked-play retry and guest pause persistence. Protected POST/blob eligibility and real Studio save/reload/public fixtures remain covered separately.

Use the Royal Playwright config from `apps/frontend-user`, then the existing capture and comparison scripts. Detailed visual reviews, commands, final results and known limits are recorded alongside the completed evidence.
