# Royal Garden Cinematic V3

Dedicated renderer: `royal-garden-cinematic`, preset `ROYAL_GARDEN_CINEMATIC`.

The local demo is `/templates/royal-garden-cinematic`. V3 adds a photographic royal arch, the user-supplied pre-wedding film as an inline scene (no popup or form), and a fixed blue/gold information background. The sample film is catalog-only; hosted invitations retain protected entitled media IDs. Existing oval, minimal and Golden Calligraphy styles remain available. Sample names never replace cleared owner fields. The demo retains the valid December 31, 2026 sample date and the repository's documented demo photographs.

See [V3 engineering and QA reports](../../../../../../../docs/design/royal-garden-v3/README.md) for scene contracts, source assets, evidence and release limits.

The oval opening uses shared `CoverBackground`, explicit sequence states, owner-managed portrait slides, pause/skip, reduced motion and background-tab suspension. Main sections reuse the shared canonical date/calendar, program, family and illustrated-map components. Gallery supports touch, keyboard, adjacent loading and the existing accessible Modal. Public wishes remain private RSVP messages because no public moderation/feed API exists.

The Studio's Media & Opening group exposes the new cinematic editor through renderer capabilities. Existing save/undo/retry/conflict and trusted preview infrastructure is retained. Data flows and catalog activation are documented in [data-contract.md](../../../../../../../docs/design/royal-garden-v2/data-contract.md).

From the repository root:

```powershell
npm --prefix apps/frontend-user run lint
npm --prefix apps/frontend-user test
npm --prefix apps/frontend-user run build
npm --prefix apps/frontend-user run test:e2e -- --config=playwright.royal-garden.config.js
```

See `docs/design/royal-garden-v2/` for reference analysis, rights, evidence and actual QA results. Backend catalog activation and live database verification are explicit outstanding deployment checks; no pricing, ownership, permissions or production data are changed by this implementation.
