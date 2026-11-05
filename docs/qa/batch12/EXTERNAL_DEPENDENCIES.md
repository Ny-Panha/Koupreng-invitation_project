# Remaining operational obligations

These are deployment/provider acceptance obligations, not another modernization batch. Never substitute fixture success for external evidence.

| Integration | Tested locally | Prerequisite and safe remaining verification | Release implication |
|---|---|---|---|
| ABA PayWay | Server price/currency, pending/review, confirmation, replay/idempotency, entitlements and return denial | Approved sandbox merchant; exercise actual signed callback and worker reconciliation for one isolated sandbox order; verify DB/receipt exactly once | Real settlement unverified; financial activation blocked |
| Google OAuth | Local redirects/session/state boundaries | Staging client with exact origins/redirects and test account; consent, cancel, callback error/replay and logout; never log tokens | Keep unavailable until live sign-off |
| Telegram authentication | Local source/signature/session contracts | Rotated staging bot, allowed domain, dedicated account; payload expiry/replay/error behavior | Live authentication unverified |
| Telegram alerts/notifications | 74 worker tests; origin/HMAC/duplicates/amount/review behavior | Dedicated sandbox channel/bot and authorized merchant sample; reject unauthorized source and replay; test timeout/retry; no broadcast | Live delivery/merchant format unverified |
| Email | Form/service/error contracts | Staging SMTP/test mailbox, sender/domain setup; reset expiry/single use, bounce, timeout and deliverability | Delivery unverified; recovery reliance needs acceptance |
| Physical QR | Image/token/ownership/duplicate check-in and persistent browser journey | Actual camera/scanner with fictional guests; permission denial/recovery, blur/poor light, duplicate and revoked token | Optical/hardware behavior unverified |
| iPhone/Android | Engine tests, reduced motion and seven widths | Physical safe areas/toolbars, Khmer fonts, touch/zoom/keyboard, audio/video policy and camera permission | Engines do not certify device shells |
| Target infrastructure/storage | Compose config, source review, synthetic DB restore | Real topology/TLS/DNS/WAF, proxy/CORS/CSP/cookies, Redis outage/rate limits, DB TLS/least privilege, private uploads, observability and offsite restore | Not deployed or certified by this work |
| Historical secrets | Current source clean; historical incident candidates retained | Owner triage, revoke/rotate actual compromised credentials, prove old ones invalid and rebuild dependent services; inspect retained logs/backups | Explicit release blocker |
| Java vulnerability data | Failed scanner commands and vendor provenance | Owner-managed valid NVD key through existing CI secret path, or a published verified fixed scanner; obtain fresh report with unchanged policy | Explicit release blocker |

No service purchase, production payment, mass message, provider activation or production data change was performed. Acceptance evidence must identify environment, commit, owner, time, expected failure cases and sanitized result. No credential activation check or rotation is claimed.
