# Performance payload cold warm and motion lab

Audit started 18 November 2026; continued 19 November 2026 (Asia/Bangkok). Independent local fixture/source evidence only.

The current build was emitted locally and every dist file is hashed/measured. Raw and gzip bytes use consistent units; source/build fingerprints accompany the final captures. [Payload and lab data](evidence/performance-and-payload.json).

| Chunk | Raw bytes | gzip bytes |
| --- | --- | --- |
| AuthLayout-C-UGiQKK.js | 1845 | 751 |
| BlissEditorialLayout-BLNavExS.js | 14645 | 4380 |
| CanvaKhmerWeddingTemplate-D9zEnoCl.js | 25293 | 7772 |
| DefaultTemplateLayout-CGjQXtXq.js | 5834 | 2141 |
| DigitalYesLayout-C4Wjz8ir.js | 36154 | 9783 |
| EmeraldLuxeLayout-6ByELHal.js | 20144 | 6149 |
| EventEssentialLayout-DI94-NTF.js | 3370 | 1663 |
| index-zdcCp0d6.js | 477847 | 142131 |
| KhmerCelestialLayout-B0F00I8c.js | 31985 | 10285 |
| KhmerFloralGoldLayout-CyAWiR_y.js | 51622 | 17580 |
| RoyalGardenCinematicLayout-D_0cCyWI.js | 70536 | 21892 |
| SilkHeritageLayout-DW_WtCCg.js | 24294 | 7946 |
| TemplateBoilerplateLayout-BekyNUki.js | 18850 | 5923 |
| TemplateExperience-Doh7fNAa.js | 126996 | 33840 |
| WithJoyPortalLayout-DERVnQA7.js | 20432 | 5689 |

| Family | Cache | Repeats | Median route ready ms | Median LCP observation ms | Median CLS observation |
| --- | --- | --- | --- | --- | --- |
| silk-heritage | cold-context | 3 | 869.0 | 576 | 0.003712 |
| silk-heritage | warm-same-context | 3 | 719.6 | 452 | 0.003733 |
| the-digital-yes-wedding | cold-context | 3 | 1335.5 | 700 | 0.002975 |
| the-digital-yes-wedding | warm-same-context | 3 | 1038.7 | 540 | 0.00313 |
| khmer-floral-gold | cold-context | 3 | 1087.9 | 716 | 0.004299 |
| khmer-floral-gold | warm-same-context | 3 | 923.7 | 528 | 0.012996 |

Family chunks are not total route cost: the shared main bundle, TemplateExperience, motion runtime, styles, fonts and requested media also load. Several family gzip sizes are below 15kB, so the old blanket range was false. No dependency was installed; the new shared lightbox is reused rather than duplicated.

The local lab separates fresh browser-context navigation from warm same-context navigation, three repeats for Silk/DigitalYes/Floral, fixed 390×844 reduced motion and mocked API/external request blocking. Readiness wall time, browser frame observation, resource bytes, paint/LCP/CLS and long tasks are observations, not field CWV or INP. Earlier and later samples with differing readiness/source/concurrency are not a valid causal before/after improvement claim. There is no agreed all-family numerical performance budget, low-power GPU certification or field population. Performance QA must set the budget and collect field p75/INP before release.
