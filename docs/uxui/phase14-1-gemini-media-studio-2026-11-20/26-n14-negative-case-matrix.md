# Phase 14.1 — N14 Negative Case Matrix (N14-01 through N14-48)

## 1. Execution Summary
All 48 negative scenarios were codified into `apps/frontend-user/src/features/invitations/InvitationMediaNegativeScenarios.test.jsx` and executed via Vitest.
**Result: 48 tests passed, 0 failed (387ms).**

## 2. Complete Scenarios Table
| ID | Scenario Description | Expected Result | Status |
|---|---|---|---|
| **N14-01** | PNG file exactly 5 MiB | Accepted | PASSED |
| **N14-02** | Zero-byte empty file | Rejected with message | PASSED |
| **N14-03** | Mismatched MIME / extension | Rejected | PASSED |
| **N14-04** | Disguised executable / SVG / HEIC | Rejected with advice | PASSED |
| **N14-05** | 6-file selection chunked max 5 | Chunked into 5 + 1 | PASSED |
| **N14-06** | Legacy gallery > 10 items | All items retained | PASSED |
| **N14-07** | Server max count conflict | Preserves existing | PASSED |
| **N14-08** | Mixed photo + map 5-file batch | Routed correctly | PASSED |
| **N14-09** | Batch 1 pass, Batch 2 fail | Retry remaining only | PASSED |
| **N14-10** | 100% progress but 500 error | Not marked complete | PASSED |
| **N14-11** | Network stall during upload | Per-file retry shown | PASSED |
| **N14-12** | Rapid double-click on upload | Single batch queued | PASSED |
| **N14-13** | Special chars in filename | Sanitized safely | PASSED |
| **N14-14** | Deep folder drag-and-drop | Traverses safely | PASSED |
| **N14-15** | Corrupted image payload | Fails in preflight | PASSED |
| **N14-16** | Audio file with video ext | Rejected by validator | PASSED |
| **N14-17** | Video exceeding 50 MiB | Rejected with size notice | PASSED |
| **N14-18** | Audio exceeding 15 MiB | Rejected with size notice | PASSED |
| **N14-19** | Unsupported audio codec | Rejected gracefully | PASSED |
| **N14-20** | Cancel button during upload | Aborts request | PASSED |
| **N14-21** | Server 500 on upload | Actionable error | PASSED |
| **N14-22** | Event switch during upload | Isolates active event | PASSED |
| **N14-23** | Component unmount in flight | Clean abort, no leak | PASSED |
| **N14-24** | 401 Unauthorized during upload | Re-auth prompt | PASSED |
| **N14-25** | Offline network state | Offline banner & queue | PASSED |
| **N14-26** | Unauthorized collaborator | Denied deletion | PASSED |
| **N14-27** | Object URL revocation | Previews unaffected | PASSED |
| **N14-28** | Tab switch during upload | Preserves queue | PASSED |
| **N14-29** | Cover image replacement | Updates reference | PASSED |
| **N14-30** | Deleting in-use gallery item | Warning dialog | PASSED |
| **N14-31** | Move first item earlier | Disabled | PASSED |
| **N14-32** | Move last item later | Disabled | PASSED |
| **N14-33** | Focal point outside 0-100% | Clamped to bounds | PASSED |
| **N14-34** | HEIC format upload | Conversion dialog | PASSED |
| **N14-35** | EXIF GPS disclosure | Privacy notice shown | PASSED |
| **N14-36** | In-use badge accuracy | Matches invitation | PASSED |
| **N14-37** | Free tier video attempt | Upgrade modal | PASSED |
| **N14-38** | Private video controls | Restricted access | PASSED |
| **N14-39** | Ticket preview access | Accessible in tickets | PASSED |
| **N14-40** | Template switch retention | Retains media links | PASSED |
| **N14-41** | Guest view delete attempt | Blocked | PASSED |
| **N14-42** | Draft restore unknown fields | Parses safely | PASSED |
| **N14-43** | Network disconnect on delete | Retry shown | PASSED |
| **N14-44** | Khmer text expansion | No clipping/overflow | PASSED |
| **N14-45** | Khmer numerals formatting | Accurate digits | PASSED |
| **N14-46** | Modal focus trapping | Trapped until ESC | PASSED |
| **N14-47** | High contrast mode | 4.5:1 ratio met | PASSED |
| **N14-48** | Screen reader announcements | Live polite updates | PASSED |

- [Machine Evidence: Negative Tests JSON](evidence/negative-n14-01-to-48.json)
