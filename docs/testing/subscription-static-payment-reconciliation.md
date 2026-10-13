# Static ABA payment reconciliation

This workflow uses the existing fixed ABA PayWay links and prices. Telegram merchant evidence is **not official ABA API verification**. No merchant API access is assumed.

## Actual flow

Subscription Buy → payer name + last three digits → backend-priced PENDING_PAYMENT order → committed Telegram notification queue → fixed PayWay link → original merchant alert → authenticated bot detection → backend evidence/matching → ACTIVE or REVIEW_REQUIRED → browser polling.

A template buyer's **ផ្ទៀងផ្ទាត់ការទូទាត់** button creates/reuses a review notification. It never grants access. The QR contains exactly the backend's fixed HTTPS link, not a handcrafted bank KHQR. Application order expiry cannot invalidate the bank link or guarantee that a remark is retained.

## Settlement policy

- `AUTO_CONFIRM_TELEGRAM_DETECTED=false` by default, for both product types.
- Financial ingestion requires configured numeric group and merchant-bot IDs; usernames alone are insufficient. Forwarded/copied alerts are rejected. An admin `/detect` must reply to the original allowlisted merchant message.
- Subscription matching requires precise amount, exact currency/suffix, normalized exact payer name, and one eligible unexpired pending order. Missing names, conflicting remarks/detected references, multiple candidates, or competing template checkouts without a reference require review.
- Original Telegram message time must fall within the order window (60-second creation/clock tolerance). This is delivery metadata, not a fabricated bank transaction time. Provider date text is preserved as received; missing years/timezones are not inferred.
- Real ABA IDs and original chat/message/sender metadata are recorded in `payment_evidence`. The shared transaction claim and unique message constraint cover both payment types, concurrent claims and replays.
- Unmatched/late evidence remains durable; expired orders do not activate. Operators investigate late payments rather than silently discarding them.
- Authorized manual confirmation requires a recorded trusted transaction, matching amount/currency, a payable order and an unused transaction. Admin API identity comes from authentication. The order, evidence claim, entitlement and audit record commit together.

## Configuration

Backend and bot share `ADMIN_PAYMENT_SECRET`. Keep it server-side.

Backend:
```env
AUTO_CONFIRM_TELEGRAM_DETECTED=false
TELEGRAM_BOT_INTERNAL_URL=http://127.0.0.1:8000
TELEGRAM_ALLOWED_GROUP_IDS=<numeric-payment-group-id>
TELEGRAM_ALLOWED_PAYMENT_BOT_IDS=<verified-merchant-bot-id>
PAYMENT_ORDER_EXPIRY_MINUTES=30
```

Bot:
```env
TELEGRAM_BOT_TOKEN=<private-token>
TELEGRAM_WEBHOOK_SECRET=<private-webhook-secret>
SPRING_API_BASE_URL=http://127.0.0.1:8080
TELEGRAM_ALLOWED_GROUP_IDS=<same-payment-group-id>
TELEGRAM_ALLOWED_PAYMENT_BOT_IDS=<same-verified-merchant-bot-id>
TELEGRAM_ALLOWED_ADMIN_IDS=<authorized-operator-ids>
```

Keep the existing `ABA_SUBSCRIPTION_BASIC_LINK`, `ABA_SUBSCRIPTION_PRO_LINK`, `ABA_SUBSCRIPTION_PREMIUM_LINK` and template static link. Docker Compose routes the backend notification worker to the existing `telegram-bot:8000` service. Local environment files are not changed automatically.

## Delivery and review operations

Pending/success/review notifications are stored in the existing notifications table in the originating database transaction. A scheduled worker reads committed rows, takes a short delivery lease and calls the bot outside the database transaction. It retries at most three times. Failure never changes payment status. Order-specific unique keys suppress repeat buyer requests.

After fixing delivery configuration, an authorized operator can set a failed notification back to PENDING using the existing admin notification status endpoint; this resets its retry counter. Telegram delivery is at least once: timeout/restart at the external send boundary can duplicate a message. Notification IDs are deduplicated while the bot process runs; financial settlement remains durably idempotent across restarts.

Default-off review:
1. An allowlisted operator replies to the original alert with `/detect`.
2. Inspect the original message, payer, amount, currency, bank ID and correct order. Ambiguous candidates require a human choice.
3. Use the authenticated admin Confirm action with the real recorded bank ID, or `/paid ORDER AMOUNT REAL_ABA_TRANSACTION_ID` from an allowlisted admin in the payment group.
4. Repeated confirmation must not extend duration. A transaction claimed by another order is rejected.

## External setup still required

1. Enable **Bot-to-Bot Communication Mode** for the receiving Koupreng bot in BotFather.
2. Put it in the same merchant group. For ordinary bot messages without mentions/replies, grant group admin rights **or** disable Group Privacy Mode; re-add the bot if Telegram requires it after a privacy change.
3. Confirm actual original PayWay sender numeric ID and group ID, then configure both services. Do not guess the merchant ID from a username.
4. Register the HTTPS Telegram webhook with `secret_token=TELEGRAM_WEBHOOK_SECRET`; verify bot/group permissions and that original merchant alerts actually arrive.
5. Capture a redacted genuine alert and validate the parser's amount, suffix, transaction ID, approval code and date/reference handling.
6. Only with explicit authorization, run a controlled bank transaction using the existing approved link; check default-off review, activation, refresh and duplicate replay.
7. Enable unattended settlement only after delivery/matching are proven safe for this merchant setup.

Telegram documents these group requirements and distinguishes them from private bot chats, which require Communication Mode on both bots. See [Bot-to-bot documentation](https://core.telegram.org/api/bots/bot-to-bot) and the [Bot API feature explanation](https://core.telegram.org/bots/features#bot-to-bot-communication). No real bank transaction or live webhook configuration was performed in this implementation task.

## Focused threat review

| Threat | Control |
|---|---|
| Spoofing | Webhook secret, internal secret, numeric chat/sender allowlists, original-message checks |
| Tampering | Backend prices, decimal amounts, currency/name/suffix/reference checks |
| Repudiation | Original Telegram IDs, durable evidence, authenticated operator, audit timestamps |
| Disclosure | Payer display name and last three digits only; secrets remain server-side |
| Denial of service | Bounded in-flight caches, HTTP timeouts, three delivery attempts, review-request deduplication |
| Privilege escalation | Buyer claims remain pending; backend entitlement checks; atomic single transaction claim |

Unauthorized access paths—forge an alert, replay a transaction, submit a buyer claim, or call manual confirmation without authority—are covered by the controls above and regression tests. Live Telegram trust and actual bank link/alert behavior remain operational validation, not an API verification guarantee.
