# Telegram Bot Worker Architecture & Webhook Ingestion

## 1. Bot Delivery Realities & Constraints

The Python Telegram Bot worker (`apps/telegram-bot/main.py`) acts as the ingestion bridge between ABA merchant notifications and the Spring Boot backend.

### Technical Realities of Telegram Bot-to-Bot Delivery:
1. **Bot-to-Bot Communication Mode:**
   Telegram bots cannot receive messages sent by other bots in direct 1-on-1 private chats. In group chats, Telegram's default **Group Privacy Mode** prevents bots from seeing messages unless:
   - The bot is an administrator in the merchant group/channel.
   - Group Privacy Mode is explicitly disabled in `@BotFather` via `/setprivacy -> Disable`.
   - The merchant alert message is forwarded or mentions the bot explicitly.
2. **Supported Deployment Topologies:**
   - **Topology A (Channel Post / Group Admin):** The bot is added as an administrator to the private merchant alert channel where ABA pushes transaction notifications.
   - **Topology B (Webhook Updates):** Updates arrive via official Telegram Webhooks over HTTPS, secured by the `X-Telegram-Bot-Api-Secret-Token` header.

---

## 2. Webhook Boundary Defense & Security Controls

```text
[ Telegram Cloud ]
       │
       │ POST /telegram/webhook
       │ Header: X-Telegram-Bot-Api-Secret-Token == TELEGRAM_WEBHOOK_SECRET
       ▼
┌────────────────────────────────────────────────────────┐
│               FastAPI Telegram Worker                  │
│                                                        │
│  1. Secret Token Verification (secrets.compare_digest) │
│  2. Payload Shape Validation                           │
│  3. Replay Protection (PROCESSED_UPDATE_IDS cache)     │
│  4. Chat ID Allowlist (TELEGRAM_ALLOWED_GROUP_IDS)     │
│  5. Sender Verification (numeric ID, PayWayByABA_bot)  │
│  6. Originality Check (Reject forwards/edits)          │
│  7. Metadata & Amount Extraction (Decimal safe)        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ POST /api/v1/internal/.../telegram-detect
                           │ Header: X-Admin-Payment-Secret == ADMIN_PAYMENT_SECRET
                           ▼
┌────────────────────────────────────────────────────────┐
│               Spring Boot Backend                      │
│                                                        │
│  1. Secret Validation                                  │
│  2. Pessimistic Row Lock (SELECT ... FOR UPDATE)       │
│  3. Multi-Factor Reconciliation                        │
│  4. Safe Review Queue Default (AutoConfirm=false)      │
└────────────────────────────────────────────────────────┘
```

### Security Checkpoints in `main.py`:
- **Webhook Secret Validation:**
  ```python
  supplied_secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
  if not secrets.compare_digest(supplied_secret.encode("utf-8"), TELEGRAM_WEBHOOK_SECRET.encode("utf-8")):
      raise HTTPException(status_code=403, detail="Invalid Telegram webhook secret")
  ```
- **Update Replay & Concurrency Filter:**
  ```python
  if update_id in PROCESSED_UPDATE_IDS:
      return {"ok": True}
  if update_id in PROCESSING_UPDATE_IDS or len(PROCESSING_UPDATE_IDS) >= MAX_PROCESSED_UPDATES:
      raise HTTPException(status_code=503, detail="Telegram update is still processing", headers={"Retry-After": "1"})
  ```
- **Sender Whitelisting (Numeric ID Preferred):**
  Telegram usernames can be renamed or spoofed in forwarded text. The worker enforces allowlisting of verified numeric sender IDs (`TELEGRAM_ALLOWED_PAYMENT_BOT_IDS`).
- **Originality Verification:**
  ```python
  def original_merchant_message(message: dict) -> bool:
      sender = message.get("from") or {}
      return bool(
          TELEGRAM_ALLOWED_PAYMENT_BOT_IDS
          and str(sender.get("id") or "") in TELEGRAM_ALLOWED_PAYMENT_BOT_IDS
          and sender.get("is_bot") is True
          and message.get("message_id")
          and not any(message.get(key) for key in (
              "forward_origin", "forward_from", "forward_from_chat", "forward_date", "is_automatic_forward"
          ))
      )
  ```
  User-copied or forwarded alerts are rejected from being treated as trusted merchant evidence.

---

## 3. Data Sanitization & Log Privacy

- **Redacted Logging:** The worker never logs full bank account numbers. Account details are masked to the last 3 digits (`*123`).
- **Secret Scrubbing:** Webhook secrets and bot tokens are strictly isolated in `.env` and never logged to console or included in error traces.
