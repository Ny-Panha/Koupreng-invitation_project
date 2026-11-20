# Phase 14 Codex Audit — Report 15: Video, Music, and Entitlement Privacy

## 1. Video & Audio Specifications
- **Video:** MP4 / WebM up to 50 MiB.
- **Audio:** MP3 / WAV / OGG up to 15 MiB.
- Contract correction: Audio allowlist strictly enforces `.mp3`, `.wav`, `.ogg` (`audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/ogg`). Erroneous `.m4a` claims in Gemini documentation were corrected.
- Previews feature `preload="none"` for audio and `preload="metadata"` with `muted` for video. Autoplay is strictly disabled to respect bandwidth and motion preferences.

## 2. Entitlement and Privacy Protection
- Free tier accounts attempting video upload encounter an accessible upgrade dialog (`t('entitlementNotice')`, verified in `N14-37`).
- Pre-wedding video endpoints (`/cinematic-content`) enforce bearer authentication for owners and require validated access tokens or invite tokens for public guest viewing (verified in `N14-38`).

- [Visual: Video Preview](visuals/12-video-preview.png)
- [Visual: Audio Preview](visuals/13-audio-preview.png)
