# 20 — motion performance bundle and browser reliability

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

No runtime dependency was added. Standard feedback uses existing duration/easing tokens, color/opacity/transform where needed, and a complete reduced-motion result. The response snapshot does not animate a fabricated history. The countdown refresh is once per minute rather than once per second. Native controls and a small CSS response track avoid a chart bundle and animation loop.

Final emitted route chunk raw/gzip bytes and hashes are recorded. The baseline build's formatted output remains, but an exact raw byte inventory was not copied before rebuilding; no false precise baseline inventory is invented. Build times varied with concurrent lab workload, so they are not presented as a speedup. No field INP/RUM or physical low-end device result is claimed.

Browser reliability logs retain a port collision, incorrect admin preview origin, interrupted unfrozen runs and genuine assertion failures. Correctly configured/frozen reruns are separate. [Performance evidence](evidence/performance-before-after.json) and [commands](evidence/test-commands.json) give the actual results.

[Report index](README.md).
