# Baseline and scope

27 October 2026, Asia/Bangkok. `git fetch origin main` confirmed both HEAD and origin/main at `7f0d293509f320fc2d1638f43fbb08aba795aa40`. Work began on `feature/royal-garden-v3-royal-motion-experience`, created directly from that ref. PR #73 was read through the GitHub connector and confirmed merged into this baseline.

The initial request was narrowed to a sample video, then the user supplied the complete V3 brief as the task. The latest correction requires an **inline pre-wedding scene, with no popup or form**. Royal Garden therefore uses an ordinary page section for video across opening styles, including existing calligraphy covers. Other templates retain their existing presentation.

Baseline commands, from apps/frontend-user:

- `npm test -- --run`: 144 files, 1,059 passed, 24.76 seconds.
- `npm run build`: passed, 1.27 seconds.

Reviewed the Golden Calligraphy QA report, the Phase 12 review archive's open gates, the template contract, shared cover/video provider, guest route, backend PreWeddingVideoPolicy, Studio persistence/media replacement, adapters, and existing Royal Garden/golden browser fixtures. No backend schema or media contract change is necessary. Existing styles remain supported; only the catalog demo explicitly selects Royal Arch. Missing old presentation data continues to resolve to its earlier opening and ivory information styling.

No production deployment, container restart, DNS change, automatic merge, payment operation or guest messaging is part of this work.
