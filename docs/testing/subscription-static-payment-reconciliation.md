# Static ABA subscription payment reconciliation

## Trust model

Subscription static-link payments use merchant Telegram notification reconciliation. The merchant notification, an authorized administrator reply, the Telegram allowlists, and the shared backend secret form the evidence boundary. This is not official or cryptographic ABA PayWay API verification. Official PayWay transaction verification should replace this evidence layer when merchant API access becomes available.

The browser can create and poll a pending order, but it cannot mark the order paid or activate a subscription.

## Required configuration

Backend:

```env
ABA_SUBSCRIPTION_BASIC_LINK=https://link.payway.com.kh/ABAPAYMu523385B
ABA_SUBSCRIPTION_PRO_LINK=https://link.payway.com.kh/ABAPAY9G523386h
ABA_SUBSCRIPTION_PREMIUM_LINK=https://link.payway.com.kh/ABAPAYBo5233877
PAYMENT_ORDER_EXPIRY_MINUTES=30
ADMIN_PAYMENT_SECRET=<random-secret-shared-only-with-the-bot>
```

Telegram bot:

```env
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_WEBHOOK_SECRET=<random-webhook-secret>
SPRING_API_BASE_URL=https://api.example.com
ADMIN_PAYMENT_SECRET=<same-random-secret-as-backend>
TELEGRAM_ALLOWED_GROUP_IDS=-100xxxxxxxxxx
TELEGRAM_ALLOWED_ADMIN_IDS=123456789
TELEGRAM_ALLOWED_PAYMENT_BOT_IDS=<trusted-payway-bot-id>
TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES=PayWayByABA_bot
```

Prefer the numeric payment bot allowlist after confirming the real sender ID. Never put the bot token or payment secret in a frontend variable.

## Telegram setup

1. Add the existing Koupreng bot and the merchant PayWay notification bot to the payment group.
2. Add the numeric group ID to `TELEGRAM_ALLOWED_GROUP_IDS`.
3. Add each authorized operator's numeric ID to `TELEGRAM_ALLOWED_ADMIN_IDS`.
4. Configure the PayWay sender numeric ID in `TELEGRAM_ALLOWED_PAYMENT_BOT_IDS`; use the username allowlist only when the ID is unavailable.
5. Register `/telegram/webhook` with Telegram and pass the configured `TELEGRAM_WEBHOOK_SECRET` as `secret_token`.
6. Ensure `ADMIN_PAYMENT_SECRET` is identical in the bot and backend, then restart both services.
7. For subscriptions, an authorized admin replies directly to the genuine merchant alert with `/detect` or `/confirm`. Direct no-remark alerts are not auto-activated.

## Real USD 0.01 Basic test

1. Sign in as a normal user and open the subscription packages page.
2. Select **Basic — USD 0.01**.
3. Enter the real ABA account holder name and exactly the last three account digits.
4. Continue. Verify that the UI displays a `SUB...` order, `PENDING_PAYMENT`, and an expiry before PayWay is opened.
5. Open the backend-returned Basic URL and pay the real USD 0.01 with that same ABA account.
6. Wait for the genuine merchant PayWay notification in the allowlisted group.
7. Confirm that it contains USD 0.01, the payer suffix, a transaction ID, and ideally an APV.
8. As an allowlisted admin, reply directly to the merchant message with `/detect`.
9. Confirm that the bot reports the order and Basic plan as activated.
10. Confirm that the browser polling changes to success and the current plan becomes Basic without any browser-side “I paid” action.
11. Refresh the page and confirm the subscription remains active.
12. Reply `/detect` to the same merchant message again. Confirm the bot reports `Payment already processed` and that the subscription end date did not change.

## Local simulated alert test

This exercises parsing and reconciliation but is not proof of a real bank payment.

1. Use a local/test database and create one pending Basic checkout with payer suffix `288`.
2. In the allowlisted test group, send the following message from a sender configured as the test trusted payment bot:

```text
$0.01 paid by RAN NARATH (*288) on May 29, 10:23 AM via ABA PAY at KOEURNG VIREAK. Trx. ID: SIMULATED-0001, APV: 383331.
```

3. Reply to that message from an allowlisted admin account with `/detect`.
4. Verify the bot calls `/api/v1/internal/subscription-payments/telegram-detect` and the test subscription activates.
5. Repeat with the same transaction ID and verify idempotency.
6. Delete or reset only the disposable local test database afterward. Do not present this simulated result as merchant verification.

## Expected safety cases

- Wrong amount, suffix, currency, or expired order: `UNMATCHED`, no activation.
- More than one exact pending match: `REVIEW_REQUIRED`, no activation.
- Reused PayWay transaction ID: `ALREADY_PROCESSED`, no duration extension.
- Missing/wrong internal secret: HTTP 401/403 before the controller runs.
- Polling another user's order: HTTP 404.
