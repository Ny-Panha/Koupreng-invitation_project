# Koupreng Payment Telegram Bot

FastAPI webhook helper for ABA PayWay static template and subscription payments.

Subscription payments use a separate reconciliation path. An authorized admin replies directly to a trusted merchant PayWay alert with `/detect` or `/confirm`; the bot extracts exact amount, payer name, payer `*last3`, transaction ID, APV, and optional remark, then calls `POST /api/v1/internal/subscription-payments/telegram-detect`. The backend requires exactly one non-expired pending amount/currency/suffix match before atomically activating a plan.

The bot listens for ABA PayWay bot alerts in the Telegram payment group. When a trusted ABA PayWay bot message contains an exact amount and an `EVT...` order code, it calls the Spring Boot backend at `POST /api/v1/internal/template-payments/telegram-detect`. The backend verifies the internal payment secret, order, amount, currency, expiry, and status, then defaults the order to `PAID_PENDING_REVIEW`. An administrator must confirm the payment before the backend marks it `PAID` and unlocks the template.

The frontend never marks an order paid and never unlocks a template.

## Environment

Set these values in `.env`:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ALLOWED_GROUP_IDS=
TELEGRAM_ALLOWED_ADMIN_IDS=
TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES=PayWayByABA_bot
TELEGRAM_ALLOWED_PAYMENT_BOT_IDS=
SPRING_API_BASE_URL=http://localhost:8080
ADMIN_PAYMENT_SECRET=
LOG_LEVEL=INFO
```

`ADMIN_PAYMENT_SECRET` must match the Spring Boot `ADMIN_PAYMENT_SECRET`. The bot sends it as `X-ADMIN-PAYMENT-SECRET`.

`TELEGRAM_WEBHOOK_SECRET` authenticates requests sent by Telegram. Generate a random value, configure the same value as Telegram's `secret_token` when registering the webhook, and require it in every non-local deployment.

If `TELEGRAM_ALLOWED_PAYMENT_BOT_IDS` is set, ID matching is used for trusted payment bot checks. If IDs are not set, usernames from `TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES` are matched case-insensitively. Do not trust normal user messages for auto-confirmation.

## Telegram Setup

1. Add your Telegram bot to the payment group.
2. Add the ABA PayWay bot to the same group.
3. Make your bot admin if Telegram does not deliver group messages.
4. In BotFather, run `/mybots`, select your bot, open Bot Settings, open Group Privacy, and turn it off.
5. Run the bot locally:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

6. Expose the bot:

```powershell
ngrok http 8000
```

7. Set the Telegram webhook:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<PUBLIC_URL>/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
```

8. Get the group ID by sending this in the group:

```text
/id
```

9. Put the group ID in env:

```env
TELEGRAM_ALLOWED_GROUP_IDS=-100xxxxxxxxxx
```

10. Confirm the ABA PayWay bot sender. When the ABA bot posts an alert, check logs or `/debug`, then set either:

```env
TELEGRAM_ALLOWED_PAYMENT_BOT_IDS=<aba_bot_id>
```

or:

```env
TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES=PayWayByABA_bot
```

## Detection and Review Behavior

The bot ignores messages from disallowed groups.

The bot automatically processes a message only when:

- the sender is the trusted ABA PayWay bot
- the message contains an `EVT...` order code
- the message contains an amount, for example `USD 0.01`, `USD0.01`, `0.01 USD`, `$0.01`, `Amount: USD 0.01`, `Paid: USD 0.01`, `Total: USD 0.01`, or `Received: USD 0.01`

There is no amount-only detection fallback. Many users can pay the same USD 0.01 amount, so the backend refuses Telegram detection when the raw message does not include the order code.

`AUTO_CONFIRM_TELEGRAM_DETECTED` defaults to `false`. Keep it disabled unless the product and security owners explicitly accept Telegram notification text as sufficient payment evidence. With the default, detection never creates template access.

Payload sent to the backend:

```json
{
  "rawMessage": "ABA payment received USD 0.01 Note: EVT260529001",
  "detectedBy": "telegram-payway-bot:PayWayByABA_bot",
  "telegramChatId": "-100xxxxxxxxxx",
  "telegramMessageId": "123",
  "telegramSenderUsername": "PayWayByABA_bot",
  "telegramSenderId": "123456",
  "detectedOrderCode": "EVT260529001",
  "detectedAmount": "0.01",
  "detectedCurrency": "USD",
  "paywayTransactionId": "178002414241549",
  "paywayApprovalCode": "704787"
}
```

If an explicitly opted-in deployment returns `PAID`, or an administrator confirms the order, the bot replies:

```text
✅ Payment confirmed automatically
Order: EVT260529001
Amount: USD 0.01
Template unlocked.
```

If the backend returns `PAID_PENDING_REVIEW`, the bot replies:

```text
⚠️ Payment detected but pending review
Order: EVT260529001
Amount: USD 0.01
```

If verification fails, the bot replies:

```text
❌ Payment verification failed
Reason: ...
```

If an ABA PayWay message has an amount but no order code, the bot does not call the backend and replies:

```text
Payment detected but no order code found. Please check manually.
```

The backend also rejects no-code Telegram detection requests, even if they come from the admin `/detect` command.

## Manual Admin Fallback

`/paid` and `/detect` are admin-only fallbacks. They are not required for valid ABA PayWay bot alerts.

Test manual detect:

```text
/detect ABA payment received USD 0.01 Note: EVT260529001
```

Manual confirmation:

```text
/paid EVT260529001 0.01
```

Only sender IDs in `TELEGRAM_ALLOWED_ADMIN_IDS` can use these commands.

For a fixed-link subscription alert that has no `EVT...` remark, reply directly to the merchant notification:

```text
/detect
```

or:

```text
/confirm
```

The replied message must come from the configured PayWay sender when Telegram supplies sender identity. Subscription evidence must include an amount, payer `*last3`, and transaction ID. No order code is required for subscription matching.

See `../../docs/testing/subscription-static-payment-reconciliation.md` for the real USD 0.01 and local simulated procedures.

## Real Test

1. Create an order from the static ABA checkout endpoint.
2. Pay through the ABA static KHQR page.
3. Ensure the ABA PayWay bot posts an alert containing the `EVT...` order code.
4. This bot catches the alert automatically.
5. This bot calls the backend with `X-ADMIN-PAYMENT-SECRET`.
6. The backend records the order as `PAID_PENDING_REVIEW`.
7. An authorized administrator reconciles the payment and runs `/paid EVT... 0.01` (or uses the admin confirmation endpoint).
8. The backend atomically marks the order `PAID` and creates `UserTemplateAccess`.
9. The template unlocks.

## Logging

The bot logs:

- received group ID
- sender ID
- sender username
- whether the sender is trusted
- detected order code
- detected amount
- backend response status

The bot must not log bot tokens, admin secrets, passwords, or JWT tokens.

## Troubleshooting

- If `/id` does not reply, check the webhook URL, ngrok tunnel, and bot process.
- If `/id` works but normal group messages are ignored, turn off BotFather Group Privacy.
- If PayWay changed its username, update `TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES`.
- Prefer `TELEGRAM_ALLOWED_PAYMENT_BOT_IDS` after you discover the real ABA PayWay bot sender ID.
- If Telegram does not deliver bot-to-bot messages, make your bot admin and check whether your BotFather settings support bot-to-bot group delivery.




cd telegram-bot
pip install -r requirements.txt
python start.py

ngrok http 8000
