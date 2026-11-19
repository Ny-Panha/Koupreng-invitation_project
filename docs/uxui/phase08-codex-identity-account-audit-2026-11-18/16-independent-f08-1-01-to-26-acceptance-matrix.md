# Independent F08.1 acceptance

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

Exactly26 stable gate IDs. Counts: `{'VERIFIED — LOCAL': 11, 'PARTIALLY COMPLETE': 11, 'BLOCKED — EXTERNAL': 2, 'REVIEW REQUIRED': 2}`. VERIFIED — LOCAL is bounded by its named source/unit/fixture/browser evidence; no live release certificate.


| ID | Gate | Gemini claim | Independent verdict | Evidence/limits |
| --- | --- | --- | --- | --- |
| F08.1-01 | Git preservation | VERIFIED COMPLETE | VERIFIED — LOCAL | git-worktree-baseline.json; preservation-diff.json |
| F08.1-02 | Complete identity inventory | VERIFIED COMPLETE | PARTIALLY COMPLETE | route-state-matrix.json; route-inventory.json |
| F08.1-03 | Silk & Ink visual identity | VERIFIED COMPLETE | VERIFIED — LOCAL | before-visual.json; after-visual.json |
| F08.1-04 | Login | VERIFIED COMPLETE | VERIFIED — LOCAL | phase08-codex-regression login matrix; LoginFeature.test.jsx |
| F08.1-05 | Password toggles/autofill | VERIFIED COMPLETE | PARTIALLY COMPLETE | pointer/keyboard caret test; route controls unit tests; native AT blocked |
| F08.1-06 | Registration/server policy | VERIFIED COMPLETE | PARTIALLY COMPLETE | RegisterFeature.test.jsx; RegisterRequest.java; C08-002; OPEN C08-013 installed BCrypt72-byte boundary conflicts with100-unit DTO/service/UI declaration |
| F08.1-07 | Private recovery | VERIFIED COMPLETE | PARTIALLY COMPLETE | ForgotPasswordFeature.test.jsx; C08 recovery; phone-only service gap |
| F08.1-08 | Reset lifecycle | VERIFIED COMPLETE | PARTIALLY COMPLETE | C08 reset invalid/expired/reused and success fixture tests; OPEN C08-013 installed BCrypt72-byte boundary conflicts with100-unit DTO/service/UI declaration |
| F08.1-09 | Google entry | VERIFIED COMPLETE | BLOCKED — EXTERNAL | SocialAuthButtons.test.jsx simulated script/link failures only; no live provider |
| F08.1-10 | Telegram entry | VERIFIED COMPLETE | BLOCKED — EXTERNAL | telegramOAuth.test.js + simulated callback conflict; no live provider |
| F08.1-11 | Session guards | VERIFIED COMPLETE | PARTIALLY COMPLETE | store cookie/token race/outage tests; no full browser cookie build |
| F08.1-12 | Safe next | VERIFIED COMPLETE | VERIFIED — LOCAL | safeRedirect.test.js; C08-007; template continuation source |
| F08.1-13 | Admin role isolation | VERIFIED COMPLETE | VERIFIED — LOCAL | historical-auth + 202 admin unit tests |
| F08.1-14 | Profile lifecycle | VERIFIED COMPLETE | VERIFIED — LOCAL | ProfileFeature.test.jsx; C08-005/006 and canonical response tests |
| F08.1-15 | Avatar lifecycle | VERIFIED COMPLETE | PARTIALLY COMPLETE | local MIME/size/retry tests; real storage signature/integration not run |
| F08.1-16 | Password change/logout | VERIFIED COMPLETE | PARTIALLY COMPLETE | C08-001; backend-auth-wrapper; reset cross-tab unit test; OPEN C08-013 installed BCrypt72-byte boundary conflicts with100-unit DTO/service/UI declaration |
| F08.1-17 | Khmer/English | PARTIALLY COMPLETE | PARTIALLY COMPLETE | all six routes in both locale captures; English provider diagnostics and native wording review remain |
| F08.1-18 | Light/dark | VERIFIED COMPLETE | VERIFIED — LOCAL | 24 locale/theme primary captures; paired before; ordinary axe scans |
| F08.1-19 | Responsive/native input | VERIFIED COMPLETE | PARTIALLY COMPLETE | 312 geometry observations; short landscape; native zoom/keyboard unverified |
| F08.1-20 | Accessibility | VERIFIED COMPLETE | PARTIALLY COMPLETE | 48 ordinary axe scans; one forced-colors computed finding; physical AT and exhaustive border/focus states open |
| F08.1-21 | Reduced motion | VERIFIED COMPLETE | VERIFIED — LOCAL | CSS reduced-motion rules; legacy motion/Phase06 suites; no physical low-end device |
| F08.1-22 | Performance | VERIFIED COMPLETE | REVIEW REQUIRED | before/after 18 loopback samples each; exact final build assets; matched emitted baseline/throttled/field acceptance remains open |
| F08.1-23 | Cross-phase regression | VERIFIED COMPLETE | REVIEW REQUIRED | test-command-results.json; unchanged Phase02 known red + default runner outcomes |
| F08.1-24 | Protected business/security | VERIFIED COMPLETE | VERIFIED — LOCAL | preservation-diff.json; backend 29 tests; no live sensitive action |
| F08.1-25 | 57 carryovers | VERIFIED COMPLETE | VERIFIED — LOCAL | all 57 IDs retained; five AUTH items separate; Phase07 nine partials preserved |
| F08.1-26 | Handoff/reproducibility | VERIFIED COMPLETE | VERIFIED — LOCAL | 21 reports; evidence-validation.json; Phase09.1 handoff |
