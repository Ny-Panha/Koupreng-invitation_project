# Before/after UI audit

Batch one, 2026-11-04, based on source and freshly rendered production previews. Earlier project audits are historical references; their prior completion claims were not imported into the new coverage matrix.

| Surface | Revalidated previous behavior | Implemented change | Evidence |
|---|---|---|---|
| Shared customer confirmation | Close target measured about 23.19×23.19px; fixed `vh` maximum; no dedicated close focus ring; event confirmation displayed raw `confirmBtn` translation key | 44×44px minimum close control, focus styling, safe-area/dynamic viewport sizing, contained body scroll, wrapping footer and the existing localized `confirmDeleteBtn` action | [Before](../qa/premium-modernization/before/confirmation-en-390.png), [after](../qa/premium-modernization/after/confirmation-en-390.png); measurement JSON beside each |
| Admin desktop shell | Unnamed icon destinations; inert record-search input; fake notification dot; decorative background washes | Named route rail, working page search, real template creation link, quieter token-based chrome | [Before](../qa/premium-modernization/before/admin-dashboard-1440.png), [after](../qa/premium-modernization/after/admin-dashboard-en-1440.png) |
| Admin mobile navigation | Off-screen mounted drawer remained in keyboard order; no modal focus containment or scroll restoration | Unmounted closed drawer; named modal, filtered destinations, 44px controls, focus/scroll restoration | [Before](../qa/premium-modernization/before/admin-drawer-390.png), [after](../qa/premium-modernization/after/admin-drawer-en-390.png) |
| WithJoy music | Duplicated audio code; title-only icon; suppressed playback errors; spinning glyph | Shared native-media controller/player, truthful play/pause state, named button, visible retry feedback, static icon | [Before](../qa/premium-modernization/before/withjoy-modern-portal-390.png), [after](../qa/premium-modernization/after/withjoy-modern-portal-390.png) |
| Bliss music | Unnamed icon; duplicated inline styling/audio logic; suppressed errors | Same shared player with authored charcoal color and invitation-language labels | [Before](../qa/premium-modernization/before/bliss-editorial-wedding-390.png), [after](../qa/premium-modernization/after/bliss-editorial-wedding-390.png) |

## Boundaries

These captures use synthetic browser sessions and controlled service responses, not production customer data. Public template fallback photographs/content are existing assets; sparse names/content in the fixture are not a completed content audit. Admin dashboard panels themselves, every template's full RSVP/gallery, builder controls, finance tables and all other route-specific states still require their own modernization work.

The WithJoy capture also exposes an existing readability problem: white ceremonial copy crosses bright parts of the fallback photograph. Its hero contrast and name/content mapping remain explicit work for the dedicated template pass; the audio integration does not resolve or certify those sections.

No real payments or production deployments were performed. The test harness initially targeted a custom checkout's nonexistent shared close selector; that harness was corrected to open the real event-deletion confirmation. Only the corrected baseline/current runs count as visual evidence.

Build entry measurements are stored in `docs/qa/premium-modernization/{before,after}/bundle-sizes.json`. They measure emitted asset size, not LCP/INP/CLS or device rendering speed. Build timing varies with contention; a faster build is not a runtime performance claim.
