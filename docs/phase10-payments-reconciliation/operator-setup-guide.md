# Operations & Operator Setup Guide

## 1. Environment Configuration

To operate the static PayWay checkout and Telegram reconciliation engine in production, configure the following environment variables. **Never commit actual production values to Git.**

### Backend (`apps/backend`)
```bash
# Server-side Payment Properties
APP_PAYMENT_ADMIN_SECRET=<secure-random-32-char-token>
APP_PAYMENT_PROVIDER_MODE=static
APP_PAYMENT_AUTO_CONFIRM_TELEGRAM_DETECTED=false
APP_PAYMENT_ORDER_EXPIRY_MINUTES=30
APP_PAYMENT_TELEGRAM_GROUP_IDS=<numeric-group-id-1>,<numeric-group-id-2>
APP_PAYMENT_TELEGRAM_PAYMENT_BOT_IDS=<numeric-bot-id-1>
APP_PAYMENT_TELEGRAM_BOT_URL=http://telegram-bot:8000

# ABA PayWay Static Link Configurations
APP_PAYMENT_ABA_STATIC_LINK=https://pay.ababank.com/oRF8/vx2dp884
APP_PAYMENT_ABA_SUBSCRIPTION_BASIC_LINK=https://link.payway.com.kh/ABAPAYMu523385B
APP_PAYMENT_ABA_SUBSCRIPTION_PRO_LINK=https://link.payway.com.kh/ABAPAY9G523386h
APP_PAYMENT_ABA_SUBSCRIPTION_PREMIUM_LINK=https://link.payway.com.kh/ABAPAYBo5233877
```

### Python Telegram Worker (`apps/telegram-bot`)
```bash
TELEGRAM_BOT_TOKEN=<bot-token-from-botfather>
SPRING_API_BASE_URL=http://backend:8080
FRONTEND_BASE_URL=https://koupreng.app
ADMIN_PAYMENT_SECRET=<must-match-backend-admin-secret>
TELEGRAM_WEBHOOK_SECRET=<secure-random-token-matching-telegram-webhook>
TELEGRAM_ALLOWED_GROUP_IDS=<numeric-merchant-alert-channel-or-group-id>
TELEGRAM_ALLOWED_ADMIN_IDS=<numeric-admin-telegram-user-ids>
TELEGRAM_ALLOWED_PAYMENT_BOT_IDS=<numeric-payway-bot-id>
TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES=PayWayByABA_bot
LOG_LEVEL=INFO
```

---

## 2. Discovering Numeric Telegram IDs

Telegram usernames can be easily spoofed or altered. Koupreng enforces numeric ID verification:
1. **Finding Channel / Group ID:**
   - Add `@userinfobot` or `@RawDataBot` to the private merchant group temporarily.
   - The bot will output the group's negative integer ID (e.g. `-1001234567890`).
   - Remove the discovery bot and add the ID to `TELEGRAM_ALLOWED_GROUP_IDS`.
2. **Finding ABA Merchant Bot Numeric ID:**
   - When the ABA PayWay alert bot posts a message into the group, forward an alert to `@RawDataBot` to extract its numeric sender ID (e.g., `123456789`).
   - Add this ID to `TELEGRAM_ALLOWED_PAYMENT_BOT_IDS`.

---

## 3. Webhook Registration Procedure

Register the webhook with Telegram over HTTPS:
```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.koupreng.app/telegram/webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["message", "edited_message", "channel_post", "callback_query"]
  }'
```

---

## 4. Manual Settlement Runbook

When an alert is received and placed into `REVIEW_REQUIRED`:
1. Log in to the Admin Console at `/admin/payments`.
2. Select the **Review Required** or **Pending** filter tab.
3. Locate the customer order by Order Code (e.g. `KPR-TMP-101`).
4. Cross-reference the official bank alert in the Telegram merchant channel:
   - Check the amount (e.g. $15.00 USD).
   - Check the time of transaction.
   - Check the payer name and masked account number (`***123`).
5. Click **Confirm**.
6. Enter the official ABA transaction ID in the verification modal.
7. Click **Confirm & Settle Order**.
8. The order status updates to `PAID`, digital entitlements are unlocked immediately, and an immutable audit entry is recorded with the operator's admin username.

---

## 5. Secret Rotation Procedure

If `ADMIN_PAYMENT_SECRET` or `TELEGRAM_WEBHOOK_SECRET` must be rotated:
1. Generate new 32+ character high-entropy tokens:
   ```bash
   openssl rand -hex 24
   ```
2. Update the backend environment file with the new `APP_PAYMENT_ADMIN_SECRET`.
3. Update the Python worker `.env` with matching `ADMIN_PAYMENT_SECRET`.
4. Deploy backend and telegram-bot containers simultaneously.
5. Invoke Telegram's `setWebhook` API with the new `TELEGRAM_WEBHOOK_SECRET`.
6. Verify `/health` on the worker and simulate a synthetic test alert to confirm pipeline health.
