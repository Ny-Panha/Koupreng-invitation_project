# Gemini claims versus independent evidence

Source `2429b76545b683fad2a0a6f328bee3264875edc3` on `main`, plus preserved dirty Phase07/08 work and Codex overlay. Execution: 18 November 2026, Asia/Bangkok. Overall **PARTIALLY COMPLETE**. NO PUSH / NO COMMIT / NO DEPLOYMENT.

| Claim | Independent resolution |
| --- | --- |
| 25/26 verified gates | Independent counts below; fixture/source evidence is narrower than comprehensive certification. |
| 1,525 user / 202 admin / 63 auth | 63 starting auth independently reproduced; final counts in exact commands. Full starting user count was not independently rerun before adding tests. |
| 18 Phase08 / 24 Phase04–05 / 20 auth | 18 starting Phase08 and 20 historical auth reproduced; new regression scope and controlled suites recorded separately. |
| redirectTo and anonymous-only auth shell | Actual return keys are next/redirect; AuthShell renders Outlet and permits authenticated visits. No anon-only redirect exists. |
| lowercase criterion and change-password five rules | Registration already had five criteria at HEAD: min,max,letter,uppercase,digit. No lowercase rule. AccountService omits uppercase; account pages initially only checked minimum. |
| development resetToken shortcut and direct Telegram support link | Not present. Source has an ordinary manual-token route link in production; API never returns a dev reset token. Initial phone hint had no support link. |
| token URL cleanup supported | Initial source did not remove token query; repaired by C08-003. |
| profile role badge, created timestamp and language editing | Not present in profile form. Fields are name, email(readonly), phone and photo; do not fabricate features. |
| RequireAuth uses loading/unauthenticated and reload | Actual store uses checking/anonymous/error/authenticated; retrySession calls initializeSession(true), not window reload. HEAD already had retry. |
| full WCAG / all contrast ratios / 100% theme parity | Original axe scope was three public routes; wider scans found real dark/profile/owner contrast failures. Fixed and raw evidence retained. |
| bundle index 382.14 kB, CSS all <15kB | Current emitted bundles differ substantially; exact final assets retained. Build success is not performance acceptance. |
| 57 ledger gains five auth closures | Gemini JSON has summary/new IDs, not all 57 rows. Claimed categories sum to62. Five AUTH IDs are new, not substitutes for historical IDs. |
| safe selective checkout/rm rollback | Rejected as unsafe for this dirty tree. Use Codex-only patch dry-run scope; no destructive rollback executed. |
| 66/68 are external Studio failures | Reproduced two URL-origin mismatches in initial build; controlled origin results are separate, not retroactive PASS. |



| Gemini defect | Disposition | Evidence |
| --- | --- | --- |
| DEF-08-01 | PARTIAL HISTORICAL ATTRIBUTION | Login/Register eye toggles already existed at HEAD. Gemini added mouse-focus preservation and additional route toggles; local behavior verified, not all newly invented. |
| DEF-08-02 | VERIFIED EXTRACTION, REPAIRED LIFECYCLE | Profile inline style removed and CSS extracted; lifecycle/media and embedded error defects required C08 repairs. |
| DEF-08-03 | VERIFIED EXTRACTION, SCOPING REPAIRED | Change-password CSS extracted but generic dash-main leaked into HostShell; C08-008 scopes it. |
| DEF-08-04 | CLAIM OVERSTATED | Phone hint existed after Gemini but no direct support link or backend phone recovery service. C08-004 adds honest contact guidance; service gap remains. |
| DEF-08-05 | VISUAL IMPROVEMENT VERIFIED | HEAD already exposed retry, disproving no-way-to-retry claim. Styled card retained; C08-010 fixes locale display. |
| DEF-08-06 | PRE-EXISTING FEATURE | HEAD RegisterFeature and its existing tests already provided live five-rule feedback. No lowercase rule; dedicated account checklist claim unsupported. |


Original Gemini documents remain byte-preserved. Machine records: [gemini-claim-reconciliation.json](evidence/gemini-claim-reconciliation.json), [gemini-defect-validation.json](evidence/gemini-defect-validation.json).
