# Mobile versus desktop compatibility

## Environment and breadth

Windows, installed Playwright Chromium/Firefox/WebKit, synthetic API contracts, production builds served on loopback. No physical devices. Core matrix: **390×844 and 1440×844**. Supplemental widths: **320, 360, 375, 414, 430, 600, 768, 820, 1024, 1280**, generally 844px high. Selected short landscape checks: **844×390**. Mobile contexts use touch capability and DPR 2. These settings do not simulate an operating-system keyboard or browser chrome.

| Check | Result | Evidence / interpretation |
|---|---|---|
| Every 135 route pattern, Chromium, 390 and 1440 | 261 PASS / 9 raw assertion FAIL out of 270 | `evidence/browser-routes-results.json`; nine failures are event/ticket/seating desktop-first assertions; responsive follow-up below |
| Fourteen selected route/app combinations at ten extra widths + Khmer + landscape | 143 PASS / 15 raw assertion FAIL out of 158 | `browser-widths-results.json`; nine hidden desktop Create Event selectors, six English-name expectations on Khmer pages |
| Selected routes, Firefox and WebKit, 390 and 1440 | 54 PASS / 2 raw assertion FAIL out of 56 | `browser-engines-results.json`; both select hidden desktop Create Event link |
| Physical-coordinate/touch follow-up, events/ticket/seating | PASS in Chromium, Firefox, WebKit at 390 | `responsive-followup.json`; visible creation CTA, Preview & export switch, Assign guests switch actually work |
| Admin template editor, 390, all three engines | **FAIL AU-001–003** | Preview extends to x=680 in a 390px viewport; divider is a non-focusable div; see screenshots |
| Whole document horizontal overflow | No measured overflow in 484 initial probes | Insufficient by itself: clipped admin preview still has root scrollWidth=390 |
| 400% equivalent reflow / text spacing | Scoped calendar/program tests passed in Chromium regression | Whole application zoom/text enlargement not verified |
| EN/KM auth forms | Scoped axe/keyboard tests pass on mobile and desktop Chromium | Administrative login footer is a separate failing surface AU-006 |

Default route smoke measures relevant content, API errors, visible control geometry and selected axe rules. It does **not** exercise every button or inspect every nested scrolling region. Initial broad probes use reduced motion. Normal-motion public invitation was investigated separately because a test's locator click never considered the floating CTA stable.

## Critical journeys

| Journey | Mobile result | Desktop result | Unverified boundary / required next check |
|---|---|---|---|
| 1 New owner: browse → login → create → customize → preview/save | **PASS tested subset** for Khmer Celestial and Silk Heritage; fixture login, creation, refresh, editor save | Same subset PASS | Real registration/email, server persistence, live publish and external share remain BLOCKED without isolated backend/data |
| 2 Returning owner: existing event → edit → preview → save | **PASS synthetic** including edits, focus/scroll return, one active frame | PASS synthetic | Concurrent real-server saves and entitlement expiry across app switches |
| 3 Guest: shared link → read → map → RSVP → confirmation | **PARTIAL**: real renderer opens with synthetic data; calendar/ICS checks pass | PARTIAL | Full RSVP submission/confirmation, native map handoff and messaging-app context are NOT TESTED end-to-end |
| 4 Premium purchase: select → pending order → review → paid entitlement | **PASS mocked state journey**; one pending create, review cannot grant access | PASS mocked state journey | Provider sandbox, real callback reconciliation, cancellation/expiry/app-switch are UNVERIFIED; no transaction performed |
| 5 Guest contribution: instructions → external pay → return | **NOT TESTED externally**; gift records/rendering inspected | Same | Confirm contribution policy, owner-vs-provider evidence labels, duplicate/return behavior; no real payment |
| 6 Administrator: login/users/reports/CMS | Read-only routes mostly PASS; **template Studio FAIL**; contrast/link defects | Read/render PASS; preview test initially BLOCKED by origin configuration | General CMS page publisher absent; real account/payment changes not executed |
| 7 Mobile editor: upload → content/theme → sections → preview/save/publish | **PARTIAL**: content/sections, preview/save, error recovery PASS in fixtures | Same plus desktop live-preview arrangement | Real photo uploads/cropping/HEIC/memory/publish not verified; preserve current guided editor |

Admin route render PASS must never override AU-001. Likewise, tests that use synthetic PAID responses do not verify provider settlement.

## Browser/device truth table

| Browser/client | Mobile evidence | Desktop evidence | Status |
|---|---|---|---|
| Chromium | Touch emulation and synthetic journeys | Build-backed route and journey tests | PASS scoped checks, FAIL named defects |
| Firefox | Desktop Firefox engine with mobile viewport/touch-capable context | Selected render checks | PASS scoped; not Android Firefox certification |
| WebKit | Windows WebKit, phone viewport | Selected read checks | PASS scoped; not Safari/iPhone certification |
| Google Chrome Android / Android WebView | No physical/OS runtime | N/A | NOT TESTED |
| Safari iPhone / macOS Safari | No Apple device | No macOS Safari | NOT TESTED |
| Microsoft Edge | No Edge binary project run | No separate Edge run | NOT TESTED |
| Telegram / Facebook / Messenger / WhatsApp | No actual in-app session | No external share dispatch | NOT TESTED |

## Mandatory manual/device continuation

Use a staging-only disposable owner/event, a free template and fictional guests. On a real narrow Android phone and iPhone, complete creation, upload an EXIF-rotated JPEG and HEIC, type long Khmer names, open/close keyboard in every sticky action layout, preview/save, publish and open the share link. Check visual viewport resize, safe areas, tap targets, browser Back, drafts across refresh/background/return, denied/cancelled OAuth, audio gesture rules, map/app links, RSVP deadline/token/duplicate/error states, and slow-network recovery. Repeat the guest path inside Telegram and Facebook/Messenger; record app/OS versions. Test payment return using development/sandbox states only. Do not mark these PASS from engine emulation.
