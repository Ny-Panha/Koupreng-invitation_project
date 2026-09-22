# Khmer Celestial Video Audit

Audit performed from the working tree at `caea808` on 2026-09-22. Representative frames were extracted at 10%, 30%, 50%, 70%, and 90% into `.video-audit/sheets/`.

| Source | Duration | Resolution | Codec / FPS | Bitrate | Audio | Size | Orientation | Visual audit | Decision |
| --- | ---: | ---: | --- | ---: | --- | ---: | --- | --- | --- |
| `assets/butterfly_effect.MP4` | 16.11 s | 1920x1080 | H.264 High / 25 fps | 1,504 kb/s | Yes, AAC stereo | 3,030,979 B | Landscape 16:9 | Stable lime chroma background, approximately RGB `(66,234,53)` / `#42ea35`. Multiple colorful butterflies enter and leave against a clean field; first frame is mostly green with edge butterflies, final frame is green with one small butterfly. | **Rejected for runtime.** The final direction uses original inline SVG butterflies instead of green-screen media. |
| `assets/flower_animation.mp4` | 30.32 s | 736x414 | H.264 / 30 fps | 299 kb/s | Yes, HE-AAC stereo | 1,136,239 B | Landscape 16:9 | Pink blossom branch on a black background with drifting petals. First and last frames retain the branch and black field. Black extraction would require screen-style compositing and could halo around pale petals. | Rejected for runtime. Strong as a visual reference, but the keyed petal source is cleaner and safer. |
| `assets/flowereffect.mp4` | 17.20 s | 540x960 | H.264 / 30 fps | 592 kb/s | Yes, HE-AAC stereo | 1,274,598 B | Portrait 9:16 | Dense pink petals on a stable lime chroma background, approximately RGB `(26,242,46)` / `#1af22e`. First and last frames contain sparse petals over green. | **Rejected for runtime.** The final transition uses SVG petals and butterflies; no chroma key is shipped. |
| `assets/firstpage_vdo.mp4` | 9.13 s | 720x1280 | H.264 / 30 fps | 3,737 kb/s | Yes, HE-AAC stereo | 4,267,371 B | Portrait 9:16 | Opaque burgundy ceremonial curtain and hanging ornaments. It is a full background composition rather than an isolated decoration; no green screen. | Rejected. The existing optimized burgundy opening film already supplies this role and this source is too heavy for first load. |
| `assets/firstpagevideo.mp4` | 5.01 s | 720x1280 | H.264 / 30 fps | 671 kb/s | Yes, HE-AAC stereo | 420,975 B | Portrait 9:16 | Opaque pale blue botanical corner frame, visually static across the sample points. No green screen. | Rejected for motion. It duplicates a framing role already covered by the current botanical composition. |
| `assets/From_Klickpin_com_Aesthetic_holiday_table_setting_ideas_that_feel.mp4` | 8.67 s | 720x1280 | H.264 / 30 fps | 1,466 kb/s | Yes, HE-AAC stereo | 1,588,328 B | Portrait 9:16 | Opaque table-setting / botanical reference footage; no chroma background. | Rejected. Filename indicates third-party origin and usage rights are unconfirmed; it is not shipped. |

## Final runtime decision

No chroma-key settings or alpha-video derivatives are used in the final build. The temporary keyed experiments were removed after visual comparison. Original source videos remain untouched and are not referenced by the runtime. Decorative motion is now original inline SVG driven by CSS and Framer Motion, with reduced-motion and save-data fallbacks.

The final decorative system is documented in `CelestialLiveGarden.jsx` and its butterfly, flower, petal, and vine primitives. No green-screen butterfly or flower video is used.
