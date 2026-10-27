# Performance — actual local lab

Measured 27 October 2026. Reproduce with `node scripts/design/measure-royal-garden-v3.mjs` against the production preview. Raw navigation/resource/event measurements are in [performance.json](evidence/performance.json).

Environment: Windows, headless Chromium 156.0.8078.4, 390×844 CSS pixels, DPR 1, 4× CPU slowdown, 1.6 Mbit/s downstream, 750 Kbit/s upstream and 150ms configured latency. The server is local Vite production preview; catalog APIs return synthetic data. This is one cold lab sample, not production field data or a physical-device benchmark.

| Measurement | Observed | Target / interpretation |
| --- | ---: | --- |
| LCP | 9,776 ms | **Does not meet** the 2,500 ms aim under this slow profile |
| CLS | 0.0006203 | Below 0.1 in this sample |
| Largest recorded Event Timing duration after Open | 40 ms | An individual lab event, **not field INP** |
| Initial encoded resource bytes | 1,341,732 | Includes shared scripts, CSS, fonts and entrance art |
| Film download before Open | None | Film mounts after user interaction |
| Sustained device FPS / field INP | Not measured | Physical-device and field collection remain open |

Profiling caught a duplicate artwork request for the decorative mask. Royal Arch now highlights the existing responsive image with opacity/translation rather than fetching a second mask image. The measured initial transfer dropped from 1,674,832 encoded bytes in the initial lab to 1,341,732; final resource evidence contains only one calligraphy image entry. Original calligraphy/oval behavior is preserved separately.

Source art remains outside the web payload. Responsive image variants are selected by the browser; film and information assets mount only when needed. The sample MP4 is 6.46 MB and remains 576×1024, with H.264 video frames retained, AAC-LC audio and a faststart index. Protected videos continue through the existing bounded upload/authorized blob flow.

The remaining slow-profile LCP is a release gate. Further route/font/asset budget work should be measured against the whole initial page before claiming the mobile target. Passing CLS or a single interaction sample does not compensate for the LCP miss. No 60 FPS, physical iPhone performance, production Core Web Vitals or field INP claim is made.
