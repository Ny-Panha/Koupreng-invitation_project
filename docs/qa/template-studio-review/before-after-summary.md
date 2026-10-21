# Before/after evidence guide

Baseline: `81b14f50`. The isolated baseline server loads all frontend source from that revision without resetting working files. After captures use the updated local application. Matching filenames use the same browser, fixture records, language and viewport. Full-page height may differ because the layout changed; screenshots are not artificially cropped to match.

| Area | Before | After |
| --- | --- | --- |
| Assigned template | Celestial label with mounted Bliss iframe | Exact Celestial route and mounted renderer; public agrees |
| Studio header | Event header, editor toolbar, history row | One focused toolbar and an additional-actions disclosure |
| Desktop studio | 220px rail, 527px controls, capped 440px preview at 1440 | 208px rail, 418px controls, 780px flexible preview |
| Main controls | Event details buried after long appearance controls | Event information first; appearance/music have focused sections |
| Phone | Small scaled frame; inaccurate logical-height caption | Larger available stage; stable 440 × 860 content; fit/zoom/fullscreen |
| Mobile | Crowded header and wrapping save text | Edit/Preview, section selector, distinct actions and readable save status |
| One event | Cascade could force a vertical, oversized image card | Compact horizontal card with meaningful event details |
| Multiple events | Small metadata and actions | Responsive cards, readable metadata, aligned actions and actual type filter |
| Sidebar | Existing grouped route navigation | Stronger active state, accessible collapsed labels/tooltips and retained mobile disclosure |

Within the archive:

- `screenshots/before/` and `screenshots/after/`: 52 main captures each, English/Khmer at 390 and 1440px, plus four matched premium-access captures per phase at 320/1440px. They include one/multiple events, expanded/collapsed sidebar, overview, studio, live/fullscreen/mobile preview, guests, tickets, QR, delivery and packages.
- `screenshots/responsive/`: 54 captures, English/Khmer, nine requested widths, My Events plus edit/preview.
- `screenshots/audit/`: 64 captures of the additional route audit.
- `screenshots/template-tests/`: exact mismatch before/after, public agreement, Garden Royal editor and Silk Heritage preview.
- `metadata/viewport-results.json`: route, viewport, geometry, fixture provenance and captured errors for each main/responsive/audit image.
- `metadata/manifest.json`: actual file inventory, dimensions, byte sizes and hashes. Only existing files are packaged.

All screenshots use synthetic browser API fixtures. They show actual React application rendering, not static mockups. The public catalog identity evidence uses real local backend HTTP. No screenshot is represented as an authenticated capture of event 61. Native fullscreen captures the fullscreen viewport; other pages retain their full rendered page.

No push, merge, deployment, production database write or DNS change was performed.
