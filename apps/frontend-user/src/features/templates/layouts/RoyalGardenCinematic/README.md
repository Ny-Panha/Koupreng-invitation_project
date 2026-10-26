# Royal Garden Cinematic V2

Dedicated renderer: `royal-garden-cinematic`, preset `ROYAL_GARDEN_CINEMATIC`.

The local demo is `/templates/royal-garden-cinematic`. It uses the supplied sample families and ceremonial wording, with the invalid December 32 corrected to Thursday, December 31, 2026 at 17:00 Asia/Phnom_Penh. Sample names never replace cleared owner fields. Demo photographs are the repository's documented Pexels assets; the supplied reference recording is not shipped.

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
