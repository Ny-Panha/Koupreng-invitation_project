# Ten react ui library license usage matrix

Audit started 18 November 2026; continued 19 November 2026 (Asia/Bangkok). Independent local fixture/source evidence only.

All ten references were evaluated; no new component source, npm dependency, secondary motion engine or CSS reset was copied/installed. Seven pre-existing vendor directories exist, with different actual names/components from Gemini’s claims. Their source headers/historical pins and official current terms are recorded separately in [the complete matrix](evidence/vendor-license-matrix.json).

| Reference | Actual existing source | Current terms / decision |
| --- | --- | --- |
| Animate UI | apps/frontend-user/src/shared/ui/vendor/animateui | MIT + Commons Clause; No new reuse; keep existing outside renderer tree pending exact component provenance audit |
| Badtz UI | No directory; evaluated only | MIT with significant modification restriction; Original interaction principles only; no install |
| Lightswind UI | No directory; evaluated only | Conflicting MIT repository / restrictive builder and template site terms; Original interaction principles only; no install |
| Kokonut UI | apps/frontend-user/src/shared/ui/vendor/kokonutui | MIT free core; Pro separate; No new reuse; keep existing outside renderer tree pending exact component provenance audit |
| Untitled UI React | apps/frontend-user/src/shared/ui/vendor/untitledui | MIT free core; Pro separate; No new reuse; keep existing outside renderer tree pending exact component provenance audit |
| shadcn/ui | apps/frontend-user/src/shared/ui/vendor/shadcn | MIT; No new reuse; keep existing outside renderer tree pending exact component provenance audit |
| React Bits | apps/frontend-user/src/shared/ui/vendor/reactbits | MIT + Commons Clause; tools/exports distinct restrictions; No new reuse; keep existing outside renderer tree pending exact component provenance audit |
| Aceternity UI | apps/frontend-user/src/shared/ui/vendor/aceternity | Custom end product / source and marketplace restrictions; No new reuse; keep existing outside renderer tree pending exact component provenance audit |
| Magic UI | apps/frontend-user/src/shared/ui/vendor/magicui | MIT free core; Pro separate; No new reuse; keep existing outside renderer tree pending exact component provenance audit |
| Skiper UI | No directory; evaluated only | Free usage requires attribution; general terms reserve rights; Original interaction principles only; no install |

Official current references, checked during this audit: [Animate UI](https://raw.githubusercontent.com/imskyleen/animate-ui/main/LICENSE.md), [Badtz](https://raw.githubusercontent.com/badtzx0/badtz-ui/main/LICENSE.md), [Lightswind](https://lightswind.com/license), [Kokonut free core](https://raw.githubusercontent.com/kokonut-labs/kokonutui/main/LICENSE), [Untitled free core](https://raw.githubusercontent.com/untitleduico/react/main/LICENSE), [shadcn](https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md), [React Bits](https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md), [Aceternity](https://ui.aceternity.com/licence), [Magic free core](https://raw.githubusercontent.com/magicuidesign/magicui/main/LICENSE.md), [Skiper usage](https://skiper-ui.com/docs/quick-start) and [site terms](https://skiper-ui.com/docs/terms-of-service).

These pages do not establish the license at each old source revision or customer-output permission. The restricted/custom cases need exact artifact/source matching and rights-owner interpretation. No templates import the vendor directories directly in the inspected renderer tree. Keep existing notices and boundaries; freeze new restricted reuse rather than declaring legal clearance from a folder name. New original controls reuse project Modal and installed Lucide/React/CSS, adding no dependency bytes.
