# Royal Garden Cinematic V3

Photographic gold arch → inline pre-wedding film → fixed blue/gold information. The film is part of the page flow, with no popup or form. It starts after Open and supports sound, pause, replay, Skip and safe failure recovery.

The catalog sample is `/templates/royal-garden-cinematic?lang=en`. Owner invitations continue to use entitled, same-event protected media. Studio edits entrance, film, information and motion through the existing save/preview infrastructure. Older opening styles remain available.

- [Baseline and scope](00-baseline-and-scope.md)
- [Reference analysis](01-reference-analysis.md)
- [Assets and provenance](02-asset-manifest.md)
- [Motion architecture](03-motion-architecture.md)
- [State transitions](04-scene-state-machine.md)
- [Data and Studio contract](05-data-and-studio-contract.md)
- [Security and entitlements](06-security-and-entitlements.md)
- [Performance](07-performance-report.md)
- [Actual QA results](08-qa-qc-results.md)
- [Visual comparison](09-visual-comparison.md) and [gallery](review.html)
- [Release gates](10-release-readiness.md)

From apps/frontend-user, use `npm run build`, then `node node_modules/@playwright/test/cli.js test --config playwright.royal-garden-v3.config.js`. Local lab reproduction from repository root: `node scripts/design/measure-royal-garden-v3.mjs`, with a production preview listening at 127.0.0.1:4186.
