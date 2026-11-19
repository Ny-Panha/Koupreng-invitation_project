# 21 — confirmed defects negative tests fixes and reproduction

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

| ID | Severity | Symptom | Root cause | Repair | Proof |
| --- | --- | --- | --- | --- | --- |
| C11-001 | P1 | Late create/upload from A continues after B signs in | Captured user values compared against each other; after-upload completion unguarded. | Key independent session lifetime, live authority checks after awaits. | N11-04/N11-25; before red-codex |
| C11-002 | P1 | Stale premium grant remains available after account change | Entitlement effect not tied to account lifetime. | Key session; scope access results to recommendations/retry generation; explicit fail-closed error retry. | N11-10; before red-codex |
| C11-003 | P1 | Stored pending event ID treated as verified recovery authority | No owner GET before upload/continue. Server already rejected foreign writes; no server breach claimed. | Authenticated ID/userId check before both recovery paths; unverified banner truthful. | N11-09; before red-codex |
| C11-004 | P2 | Focal/message overlay discards unknown JSON keys | Overwrite of designJson/contentJson. | Merge object overlays; reject unsafe merge rather than erase authored data. | N11-26; before red-codex |
| C11-005 | P2 | Empty image and filename/MIME mismatch accepted; preview cleanup duplicated | MIME/upper-bound check alone; revoke in handler and effect. | Reject empty/unsupported extension; reset chooser; one lifecycle owner; preserve file-size protocol. | N11-15/N11-20; before red-codex |
| C11-006 | P2 | Mobile validation and file-picker replacement lose usable focus | Focus before newly revealed DOM; smooth scrolling ignores reduced motion; picker removed during selection. | Layout-phase focus after reveal; reduced-motion scroll; summary/field links; selection/removal focus return. | N11-09/23/30; before before-focus-corrected |
| C11-007 | P2 | Retry can silently ignore edited data or change action meaning | Server dedupe returns original request while mutable form appears resubmitted; mode lost across retry. | Persist immutable payload and original mode; freeze submitted controls; explicit recovery guidance; compatible actions only. | N11-08/13/19; before source trace + existing request retry test |
| C11-008 | P2 | Upstream report describes nonexistent contracts and overstates acceptance | Narrative/evidence not reconciled to implementation. | Independent claim register, canonical ten matrix, complete 57 + newer ledgers, no upstream reports overwritten. | N11-29/30; before authoritative source/document reconciliation |
| C11-009 | P2 | Loaded light/dark contrast and accessible names fail Axe | Local token cascade loses specificity; hardcoded white surfaces; Select label with visible Selected state; picker label mismatch. | Scoped semantic surfaces/contrast; selected accessible names; visible picker action name retained. | N11-20/21/22/23; before after-browser-pilot and controlled-all-engines |
| C11-010 | P2 | Map link accepted by client rejected by backend | Client accepts any HTTP(S); server requires HTTPS exact Google hosts and no userinfo. | Mirror existing backend whitelist for new input; preserve legacy content source unchanged. | N11-14; before red-maps-contract |
| C11-011 | P1 | Deferred Axios request sends A private draft using B credentials | Credentials read in asynchronous request interceptor after owner changes. | Session AbortController subscribed synchronously to auth authority; optional API options forward cancellation without changing backend requests. | N11-04 real adapter; before red-deferred-credentials |

The first new negative suite produced six failures against inherited code. Separate map-link cases produced three failures. A real Axios adapter then reproduced the deferred credential race. The old mobile build failed visible first-error focus. Browser-loaded Axe exposed additional desktop/landscape/dark and selected-name failures beyond the initial mobile sample.

All logs are retained. The [defect register](evidence/defect-register.json) supplies user impact, source chain, before/after proof, fallback, residual risk and fixture reproduction. Code repairs use existing contracts. The reporting defect is corrected in this independent package, preserving the upstream author's tree. No live database/provider success is inferred from stubs.

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
