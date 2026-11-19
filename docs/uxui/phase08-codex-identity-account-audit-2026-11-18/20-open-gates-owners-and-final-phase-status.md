# Open gates and final status

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

| Gate | Owner | Next evidence |
| --- | --- | --- |
| Live Google/Telegram cancellation/linking/nonce/account lifecycle | Identity backend + provider sandbox owner | Isolated owned sandbox identities; approved no-production exchange traces |
| SMTP delivery and phone-only recovery | Account/backend + support/product owner | Isolated mail fixture, actual delivery, approved recovery method for accounts without email |
| Profile storage/signature/permissions and isolated MySQL | Backend/storage QA | Authorized isolated data, signature/size/denial and migration integration evidence |
| Native Khmer and provider diagnostic localization | Native copy/typography reviewer | Approve exact recovery/security/provider phrases and glyph/diacritic rendering |
| iOS/Android, in-app browsers, AT and real zoom/scaling | Device/accessibility QA | Physical keyboard/VoiceOver/TalkBack/OS scaling and native200/400% zoom task videos |
| Forced-colors computed axe result | Accessibility QA | Inspect actual OS high-contrast palette; retain raw axe finding and readable current PNG |
| Cookie browser-mode and exhaustive route/state permutations | Auth/frontend QA | Separate isolated cookie build and complete permission/error journeys; no all-state claim |
| Performance and default-worker reliability | Performance/CI host owner | Matched baseline assets/throttling, independent default-worker repeat and approved field p75/INP |
| QA-NEW-01/02/03 | Copy + QA owner | Approve current labels and reachability contracts before changing historical assertions |
| Nine marketing partial gates and57 historical items | Named retained domain owners | Unchanged historical ledger and Phase07 ownership; no auth-based bulk closure |


**PARTIALLY COMPLETE.** Bounded source repairs and reproducible local evidence are delivered. Physical/native/live-provider and material breadth/performance review gates remain. Independent F counts: `{'VERIFIED — LOCAL': 11, 'PARTIALLY COMPLETE': 11, 'BLOCKED — EXTERNAL': 2, 'REVIEW REQUIRED': 2}`. A locally passing subset is not a release certificate.

Open C08-013 — actual password encoder boundary: the local BCryptPasswordEncoder bean in shared/config/SecurityConfig.java:312 uses installed spring-security-crypto7.1.1. A standalone no-account/no-network probe accepted72 ASCII bytes and rejected73/100 ASCII bytes as well as26 UTF-16 units containing74 UTF-8 bytes, with IllegalArgumentException: password cannot be more than72 bytes. This is an explicit rejection, not evidence of silent truncation or credential compromise. The 8–100 UI/DTO/service predicate tests do not establish full server acceptance. See [probe evidence](evidence/password-encoder-probe.json) and [regenerator](evidence/probe_encoder.py).

Backend identity/security and product policy owners must reconcile accepted Unicode/byte bounds and password hashing with old-hash compatibility, registration/change/reset/login tests, server error handling and native-reviewed guidance. This audit does not authorize a hashing/migration change or invent a72-character frontend limit. F08.1-06/08/16 and AUTH-PWD-01 therefore remain partial. No live API account was created or reset by this probe.
