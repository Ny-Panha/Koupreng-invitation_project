# 19 — responsive geometry mobile landscape

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

Independent list/overview geometry is recorded at 1920×1080, 1440×900, 1280×720, 1024×768, 768×1024, 393×851, 360×800, 320×568 and 844×390 in the after engine matrix. The baseline is Chromium at those same viewports. Rectangle positions, content widths, sidebar dimensions and explicit scroll hosts accompany screenshot hashes. Zero horizontal document overflow is a measured property, not the sole visual-quality claim.

Human pixel review inspected desktop, narrow mobile and Khmer dark full-page composition. The 320px review caught the duplicate FAB covering filter content, leading to its removal while preserving the header action. The new sidebar shares the document scroll; the modal retains its necessary independent scroll region and focus isolation. Short landscape/200%-equivalent layout and focused controls are separately tested.

[Geometry matrix](evidence/geometry-matrix.json), [comparison](comparison.html) and selected [1440px overview](visuals/after-overview-chromium-1440x900-en-light.png) provide evidence. Physical browser bars, virtual keyboards and real device responsiveness remain external.

[Report index](README.md).
