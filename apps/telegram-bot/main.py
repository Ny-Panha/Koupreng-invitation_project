import logging
import os
import re
import secrets
from collections import OrderedDict
from contextlib import asynccontextmanager
from decimal import Decimal, InvalidOperation
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request

BOT_DIR = Path(__file__).resolve().parent
load_dotenv(BOT_DIR / ".env")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
SPRING_API_BASE_URL = os.getenv("SPRING_API_BASE_URL", "http://localhost:8080").rstrip("/")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
ADMIN_PAYMENT_SECRET = os.getenv("ADMIN_PAYMENT_SECRET", "")
TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", "")
WELCOME_PHOTO_FILE_ID = os.getenv("WELCOME_PHOTO_FILE_ID", "")
TELEGRAM_ALLOWED_GROUP_IDS = {
    value
    for value in (item.strip() for item in os.getenv("TELEGRAM_ALLOWED_GROUP_IDS", "").split(","))
    if value
}
TELEGRAM_ALLOWED_ADMIN_IDS = {
    value
    for value in (item.strip() for item in os.getenv("TELEGRAM_ALLOWED_ADMIN_IDS", "").split(","))
    if value
}
TELEGRAM_ALLOWED_PAYMENT_BOT_IDS = {
    value
    for value in (item.strip() for item in os.getenv("TELEGRAM_ALLOWED_PAYMENT_BOT_IDS", "").split(","))
    if value
}
TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES = {
    value.lower().lstrip("@")
    for value in (
        item.strip()
        for item in os.getenv("TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES", "PayWayByABA_bot").split(",")
    )
    if value
}

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("koupreng.telegram_bot")

MAX_PROCESSED_UPDATES = 4096
PROCESSED_UPDATE_IDS: OrderedDict[str, None] = OrderedDict()

ORDER_CODE_RE = re.compile(r"\bEVT[0-9]{9,10}\b", re.IGNORECASE)
PAYWAY_TRX_RE = re.compile(
    r"\b(?:Transaction|Txn|Trx)\.?\s*(?:ID|No\.?|Number)?\s*[:#=]?\s*([A-Za-z0-9_-]+)\b",
    re.IGNORECASE,
)
PAYWAY_APV_RE = re.compile(
    r"\b(?:APV|Approval\s*(?:Code|No\.?|Number)?)\s*[:#=]?\s*([A-Za-z0-9_-]+)\b",
    re.IGNORECASE,
)
PAYER_WITH_SUFFIX_RE = re.compile(
    r"\bpaid by\s+(?P<name>.+?)\s*\(\s*\*(?P<last3>[0-9]{3})\s*\)"
    r"(?=\s+on\b|\s+via\b|[.,]|$)",
    re.IGNORECASE,
)
PAYER_RE = re.compile(r"\bpaid by\s+(.+?)(?:\s+via\b|\s+on\b|[.,]|$)", re.IGNORECASE)
REMARK_RE = re.compile(r"\bRemark\s*[:#=]?\s*([^\s,.]+)", re.IGNORECASE)
AMOUNT_PATTERNS = [
    re.compile(
        r"\b(?P<currency>USD|KHR)\s*(?P<amount>[0-9]+(?:\.[0-9]{1,2})?)(?![0-9.])\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?P<amount>[0-9]+(?:\.[0-9]{1,2})?)(?![0-9.])\s*(?P<currency>USD|KHR)\b",
        re.IGNORECASE,
    ),
    re.compile(r"(?P<currency>\$)\s*(?P<amount>[0-9]+(?:\.[0-9]{1,2})?)(?![0-9.])\b"),
    re.compile(
        r"\b(?:Amount|Paid|Total|Received)\s*[:=]?\s*(?P<currency>USD|KHR|US\$|\$)\s*"
        r"(?P<amount>[0-9]+(?:\.[0-9]{1,2})?)(?![0-9.])\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:Amount|Paid|Total|Received)\s*[:=]?\s*"
        r"(?P<amount>[0-9]+(?:\.[0-9]{1,2})?)(?![0-9.])\s*(?P<currency>USD|KHR)\b",
        re.IGNORECASE,
    ),
]

PRICING_PLANS = [
    {
        "id": "basic",
        "name": "កញ្ចប់មង្គល",
        "price": "ឥតគិតថ្លៃ",
        "desc": "សាកសមសម្រាប់គូស្វាមីភរិយាដែលចង់រៀបចំផែនការដំបូង",
        "features": [
            "បញ្ជីការងារ ៥ ចំណុច",
            "គ្រប់គ្រងភ្ញៀវ ៤០ នាក់",
            "សន្លឹកការឌីជីថល (Basic)",
            "Dashboard ផ្ទាល់ខ្លួន",
        ],
        "button": "ចាប់ផ្ដើមឥឡូវនេះ",
        "path": "/register",
    },
    {
        "id": "pro",
        "name": "កញ្ចប់មាស",
        "price": "$169",
        "desc": "ជម្រើសដ៏ល្អបំផុតសម្រាប់ភាពឥតខ្ចោះ និងស៊ីវិល័យ",
        "features": [
            "គ្រប់គ្រងភ្ញៀវមិនដែនកំណត់",
            "ការទូទាត់ QR បាគង (Bakong)",
            "សន្លឹកការ Premium Design",
            "Gallery រូបភាព និងវីដេអូ",
            "គាំទ្របច្ចេកទេស ២៤/៧",
        ],
        "button": "ជ្រើសរើសកញ្ចប់មាស",
        "path": "/register",
    },
    {
        "id": "enterprise",
        "name": "កញ្ចប់ពេជ្រ",
        "price": "តម្លៃពិគ្រោះ",
        "desc": "សម្រាប់សហគ្រាស និងក្រុមហ៊ុនរៀបចំអាពាហ៍ពិពាហ៍",
        "features": [
            "គ្រប់គ្រងព្រឹត្តិការណ៍ច្រើន",
            "White-label (ដាក់ Logo ខ្លួនឯង)",
            "Custom Domain ផ្ទាល់ខ្លួន",
            "របាយការណ៍លម្អិត",
            "ជំនួយការផ្ទាល់ (Manager)",
        ],
        "button": "មើលលម្អិត",
        "path": "/pricing",
    },
]
PRICING_PLAN_BY_ID = {plan["id"]: plan for plan in PRICING_PLANS}

MAIN_MENU_REPLY_KEYBOARD = {
    "keyboard": [
        [
            {"text": "🎴 មើលគំរូ"},
            {"text": "💰 មើលតម្លៃ"},
        ],
        [
            {"text": "❓ ជំនួយ"},
            {"text": "👤 គណនីខ្ញុំ"},
        ],
    ],
    "resize_keyboard": True,
    "is_persistent": False,
}

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await set_bot_commands()
    yield


app = FastAPI(title="Koupreng payment Telegram webhook", lifespan=lifespan)


async def set_bot_commands():
    """Register bot command menu entries."""
    if not TELEGRAM_BOT_TOKEN:
        return
    commands = [
        {"command": "start", "description": "Start the bot / Profile"},
        {"command": "menu", "description": "Show main menu"},
        {"command": "help",  "description": "How to use & Support"},
    ]
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setMyCommands"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json={"commands": commands})
            result = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Failed to set bot commands: %s", type(exc).__name__)
        return

    if result.get("ok"):
        logger.info("Bot commands registered: /start, /menu, /help")
    else:
        logger.warning("Failed to set bot commands: %s", result.get("description") or "rejected")


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/telegram/webhook")
async def telegram_webhook(request: Request):
    if TELEGRAM_WEBHOOK_SECRET:
        supplied_secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token", "")
        if not secrets.compare_digest(supplied_secret, TELEGRAM_WEBHOOK_SECRET):
            logger.warning("Rejected Telegram webhook request with an invalid secret")
            raise HTTPException(status_code=403, detail="Invalid Telegram webhook secret")

    update = await request.json()
    if not isinstance(update, dict):
        logger.info("Ignoring Telegram update with a non-object payload")
        return {"ok": True}

    update_id = str(update.get("update_id") or "")
    if update_id and not claim_update(update_id):
        logger.info("Ignoring duplicate Telegram update")
        return {"ok": True}

    callback_value = update.get("callback_query")
    callback_query = callback_value if isinstance(callback_value, dict) else {}
    if callback_value is not None and (
        not callback_query.get("id")
        or not isinstance(callback_query.get("data"), str)
        or not isinstance(callback_query.get("message"), dict)
    ):
        logger.info("Ignoring invalid Telegram callback query")
        return {"ok": True}

    callback_query_id = str(callback_query.get("id") or "")
    message = (
        update.get("message")
        or update.get("edited_message")
        or update.get("channel_post")
        or update.get("edited_channel_post")
        or callback_query.get("message")
        or {}
    )
    chat = message.get("chat") or {}
    sender = callback_query.get("from") or message.get("from") or {}
    chat_id = str(chat.get("id") or "")
    sender_id = str(sender.get("id") or "")
    username = str(sender.get("username") or "").lstrip("@")
    sender_display = username or str(sender.get("first_name") or "").strip() or sender_id or "telegram"
    message_id = str(message.get("message_id") or "")
    raw_text = callback_query.get("data") or message.get("text") or message.get("caption") or ""
    text = raw_text.strip() if isinstance(raw_text, str) else ""
    trusted_payment_sender = payment_sender_allowed(sender)
    reply_value = message.get("reply_to_message")
    reply_message = reply_value if isinstance(reply_value, dict) else {}
    reply_raw_text = reply_message.get("text") or reply_message.get("caption") or ""
    reply_text = reply_raw_text.strip() if isinstance(reply_raw_text, str) else ""
    reply_sender = reply_message.get("from") if isinstance(reply_message.get("from"), dict) else {}

    if not chat_id or not text:
        logger.info("Ignoring Telegram update without a chat and text payload")
        return {"ok": True}

    if not group_allowed(chat_id):
        logger.info("Ignoring Telegram update from a disallowed group")
        return {"ok": True}

    logger.info(
        "Received Telegram update is_bot=%s trusted_payment_bot=%s callback=%s",
        sender.get("is_bot"),
        trusted_payment_sender,
        bool(callback_query_id),
    )

    if command_name(text) == "/start":
        import datetime as _dt
        first_name = str(sender.get("first_name") or "").strip()
        last_name  = str(sender.get("last_name")  or "").strip()
        full_name  = f"{first_name} {last_name}".strip() or sender_display
        now        = _dt.datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p")

        welcome_text = (
            f"👋 សូមស្វាគមន៍ {full_name}!\n"
            f"🎊 ស្វាគមន៍មកកាន់ Koupreng Invitation\n\n"
            f"🕐 {now}\n\n"
            f"👤 ព័ត៌មានអ្នកប្រើ:\n"
            f"🆔 ID : {sender_id}\n"
            f"📛 Username : @{username or '(none)'}\n\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🌸 សូមជ្រើសរើសជម្រើសខាងក្រោម 👇"
        )

        # Inline URL buttons shown inside the message
        inline_keyboard = {
            "inline_keyboard": [
                [
                    {"text": "🎴 មើលគំរូ",       "url": f"{FRONTEND_BASE_URL}/templates"},
                    {"text": "💰 មើលតម្លៃ",      "callback_data": "koupreng:pricing"},
                ],
                [
                    {"text": "❓ ជំនួយ",          "callback_data": "koupreng:help"},
                    {"text": "👤 គណនីខ្ញុំ",     "callback_data": "koupreng:profile"},
                ],
            ]
        }

        # Use Telegram file_id only to avoid region-blocked external URL previews.
        photo = WELCOME_PHOTO_FILE_ID.strip()
        if photo:
            sent = await send_photo(chat_id, photo, welcome_text, inline_keyboard)
        else:
            sent = False
        if not sent:
            await send_message_with_keyboard(chat_id, welcome_text, inline_keyboard, message_id)

        # Send persistent bottom keyboard
        await send_main_menu(chat_id)
        return {"ok": True}

    if callback_query_id:
        await answer_callback_query(callback_query_id)

    if text in ("/menu", "Menu", "ម៉ឺនុយ", "📋 ម៉ឺនុយ", "koupreng:menu"):
        await send_main_menu(chat_id, message_id)
        return {"ok": True}

    if text in ("🎴 មើលគំរូ", "🎴 View Templates", "View Templates"):
        await send_menu_link(
            chat_id,
            message_id,
            "🎴 គំរូសន្លឹកការ\nមើលគំរូសន្លឹកការទាំងអស់របស់ Koupreng Invitation។",
            "🎴 មើលគំរូ",
            "/templates",
        )
        return {"ok": True}

    if text in ("💰 មើលតម្លៃ", "💰 View Pricing", "View Pricing", "koupreng:pricing"):
        await send_pricing_menu(chat_id, message_id)
        return {"ok": True}

    if text.startswith("koupreng:pricing:"):
        plan_id = text.rsplit(":", 1)[-1]
        await send_pricing_plan_detail(chat_id, message_id, plan_id)
        return {"ok": True}

    if text in ("👤 គណនីខ្ញុំ", "👤 My Profile", "👤 Profile", "Profile", "koupreng:profile"):
        await send_profile_card(chat_id, message_id, sender, sender_id, username)
        return {"ok": True}

    if text in ("❓ ជំនួយ", "❓ Help", "Help", "koupreng:help") or command_name(text) == "/help":
        await send_help_message(chat_id, message_id)
        return {"ok": True}

    if text.startswith("/id") or text.startswith("/debug"):
        await send_message(
            chat_id,
            (
                f"Chat ID: {chat_id}\n"
                f"Sender ID: {sender_id}\n"
                f"Sender username: {username or '(none)'}\n"
                f"Sender is bot: {sender.get('is_bot')}\n"
                f"Allowed group: {group_allowed(chat_id)}\n"
                f"Allowed admin: {sender_id in TELEGRAM_ALLOWED_ADMIN_IDS}\n"
                f"Trusted payment bot: {trusted_payment_sender}"
            ),
            message_id,
        )
        return {"ok": True}

    if text.startswith("/paid"):
        if sender_id not in TELEGRAM_ALLOWED_ADMIN_IDS:
            await send_message(chat_id, "You are not allowed to confirm payments.", message_id)
            return {"ok": True}
        await handle_paid_command(chat_id, message_id, text, sender_display)
        return {"ok": True}

    if command_name(text) in {"/detect", "/confirm"}:
        if sender_id not in TELEGRAM_ALLOWED_ADMIN_IDS:
            await send_message(chat_id, "You are not allowed to detect payments.", message_id)
            return {"ok": True}
        command = command_name(text)
        detect_text = reply_text or command_payload(text, command)
        if not detect_text:
            await send_message(
                chat_id,
                "Reply to an ABA PayWay notification with /detect or /confirm.",
                message_id,
            )
            return {"ok": True}
        if reply_text and payment_sender_identity_available(reply_sender) and not payment_sender_allowed(reply_sender):
            logger.warning("Ignoring admin detection reply to an untrusted payment sender")
            await send_message(chat_id, "The replied message is not from a trusted PayWay sender.", message_id)
            return {"ok": True}
        if not looks_like_payment_alert(detect_text):
            await send_message(chat_id, "Could not find a payment amount in that message.", message_id)
            return {"ok": True}
        payment = parse_payment_alert(detect_text)
        if not payment:
            await send_message(chat_id, "Could not find a payment amount in that message.", message_id)
            return {"ok": True}
        if not payment.get("orderCode") and not subscription_evidence_complete(payment):
            logger.info("Admin subscription detection omitted because evidence was incomplete")
            await send_message(
                chat_id,
                "Subscription alert must include payer *last3, Trx ID, and amount.",
                message_id,
            )
            return {"ok": True}
        await handle_detect_message(
            chat_id,
            message_id,
            detect_text,
            str(reply_sender.get("username") or "").lstrip("@") if reply_text else username,
            str(reply_sender.get("id") or "") if reply_text else sender_id,
            detected_by=f"telegram-admin-detect:{sender_identity(username, sender_id)}",
            payment=payment,
            evidence_message_id=str(reply_message.get("message_id") or message_id),
        )
        return {"ok": True}

    if not looks_like_payment_alert(text):
        logger.info("Telegram update did not match a payment alert")
        return {"ok": True}

    if not trusted_payment_sender:
        logger.warning(
            "Ignoring payment-like Telegram update from an untrusted sender is_bot=%s",
            sender.get("is_bot"),
        )
        return {"ok": True}

    payment = parse_payment_alert(text)
    logger.info(
        "Trusted payment alert parsed=%s currency=%s",
        bool(payment),
        payment.get("currency") if payment else None,
    )
    if not payment:
        await send_message(chat_id, "Could not find a payment amount in that message.", message_id)
        return {"ok": True}
    if not payment.get("orderCode"):
        logger.info("Trusted payment alert omitted because the order code was missing")
        await send_message(chat_id, "Payment detected but no order code found. Please check manually.", message_id)
        return {"ok": True}

    await handle_detect_message(
        chat_id,
        message_id,
        text,
        username,
        sender_id,
        detected_by=f"telegram-payway-bot:{sender_identity(username, sender_id)}",
        payment=payment,
    )
    return {"ok": True}


def group_allowed(chat_id: str) -> bool:
    return not TELEGRAM_ALLOWED_GROUP_IDS or chat_id in TELEGRAM_ALLOWED_GROUP_IDS


def claim_update(update_id: str) -> bool:
    """Return False for a recently processed Telegram update ID."""
    if update_id in PROCESSED_UPDATE_IDS:
        return False
    PROCESSED_UPDATE_IDS[update_id] = None
    if len(PROCESSED_UPDATE_IDS) > MAX_PROCESSED_UPDATES:
        PROCESSED_UPDATE_IDS.popitem(last=False)
    return True


def looks_like_payment_alert(text: str) -> bool:
    payment_words = re.search(r"\b(ABA|PayWay|payment|paid|received|Trx|APV|approval)\b", text, re.IGNORECASE)
    return payment_words is not None and detect_amount(text) is not None


def detect_amount(text: str) -> str | None:
    payment = parse_payment_alert(text)
    return payment["amount"] if payment else None


def parse_payment_alert(text: str) -> dict | None:
    order_match = ORDER_CODE_RE.search(text)
    amount_match = None
    for pattern in AMOUNT_PATTERNS:
        match = pattern.search(text)
        if match:
            amount_match = match
            break
    if not amount_match:
        return None

    amount_groups = amount_match.groupdict()
    currency = normalize_currency(amount_groups.get("currency") or "USD")
    try:
        parsed_amount = Decimal(amount_groups["amount"])
        amount = str(parsed_amount.quantize(Decimal("0.01"))) if currency == "USD" else str(parsed_amount)
    except InvalidOperation:
        return None

    trx_match = PAYWAY_TRX_RE.search(text)
    apv_match = PAYWAY_APV_RE.search(text)
    payer_with_suffix_match = PAYER_WITH_SUFFIX_RE.search(text)
    payer_match = PAYER_RE.search(text)
    remark_match = REMARK_RE.search(text)
    return {
        "orderCode": order_match.group(0).upper() if order_match else None,
        "amount": amount,
        "currency": currency,
        "paywayTransactionId": trx_match.group(1) if trx_match else None,
        "paywayApprovalCode": apv_match.group(1) if apv_match else None,
        "payerName": (
            payer_with_suffix_match.group("name").strip()
            if payer_with_suffix_match
            else payer_match.group(1).strip() if payer_match else None
        ),
        "payerAccountLast3": payer_with_suffix_match.group("last3") if payer_with_suffix_match else None,
        "remark": remark_match.group(1) if remark_match else None,
    }


def payment_sender_allowed(sender: dict) -> bool:
    sender_id = str(sender.get("id") or "")
    username = str(sender.get("username") or "").lower().lstrip("@")
    is_bot = bool(sender.get("is_bot"))
    if TELEGRAM_ALLOWED_PAYMENT_BOT_IDS:
        return sender_id in TELEGRAM_ALLOWED_PAYMENT_BOT_IDS
    if TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES and username in TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES:
        return is_bot
    return False


def payment_sender_identity_available(sender: dict) -> bool:
    return bool(sender.get("id") or sender.get("username"))


def subscription_evidence_complete(payment: dict) -> bool:
    return bool(
        payment.get("amount")
        and payment.get("currency")
        and payment.get("payerAccountLast3")
        and payment.get("paywayTransactionId")
    )


def normalize_currency(value: str) -> str:
    marker = (value or "USD").upper()
    return "USD" if marker in {"$", "US$"} else marker


def sender_identity(username: str, sender_id: str) -> str:
    return username or sender_id or "telegram"


def command_payload(text: str, command: str) -> str:
    first, *rest = text.split(maxsplit=1)
    current_command = first.split("@", 1)[0]
    if current_command != command:
        return ""
    return rest[0].strip() if rest else ""


def command_name(text: str) -> str:
    if not text:
        return ""
    return text.split(maxsplit=1)[0].split("@", 1)[0]


async def handle_paid_command(chat_id: str, message_id: str, text: str, username: str):
    parts = text.split()
    if len(parts) < 3:
        await send_message(chat_id, "Usage: /paid EVT260520001 0.01", message_id)
        return

    order_code = parts[1].upper()
    try:
        amount = str(Decimal(parts[2]))
    except InvalidOperation:
        await send_message(chat_id, "Invalid amount.", message_id)
        return

    result = await post_to_backend(
        "/api/v1/internal/template-payments/confirm",
        {
            "orderCode": order_code,
            "amount": amount,
            "confirmedBy": username,
        },
    )
    await reply_from_backend(chat_id, message_id, result, success_prefix=f"Payment confirmed: {order_code}")


async def handle_detect_message(
    chat_id: str,
    message_id: str,
    text: str,
    username: str,
    sender_id: str,
    detected_by: str = "telegram-bot",
    payment: dict | None = None,
    evidence_message_id: str | None = None,
):
    payment = payment or parse_payment_alert(text)
    if not payment:
        await send_message(chat_id, "Could not find a payment amount in that message.", message_id)
        return

    payload = {
        "rawMessage": text,
        "detectedBy": detected_by,
        "telegramChatId": chat_id,
        "telegramMessageId": evidence_message_id or message_id,
        "telegramSenderUsername": username,
        "telegramSenderId": sender_id,
        "detectedOrderCode": payment.get("orderCode"),
        "detectedAmount": payment["amount"],
        "detectedCurrency": payment["currency"],
        "payerName": payment.get("payerName"),
        "payerAccountLast3": payment.get("payerAccountLast3"),
        "paywayTransactionId": payment["paywayTransactionId"],
        "paywayApprovalCode": payment["paywayApprovalCode"],
        "remark": payment.get("remark"),
    }
    subscription_payment = not payment.get("orderCode")
    endpoint = (
        "/api/v1/internal/subscription-payments/telegram-detect"
        if subscription_payment
        else "/api/v1/internal/template-payments/telegram-detect"
    )
    result = await post_to_backend(endpoint, payload)
    data = result.get("data") or {}
    order_code = data.get("orderCode") or payment.get("orderCode")
    logger.info(
        "Backend telegram-detect response ok=%s status=%s currency=%s",
        result.get("ok"),
        data.get("status"),
        payment.get("currency"),
    )

    if subscription_payment:
        await reply_for_subscription_detection(chat_id, message_id, result, payment)
        return
    if result.get("ok") and data.get("status") == "PAID":
        await send_message(chat_id, payment_confirmed_reply(order_code, payment), message_id)
        return
    if result.get("ok") and data.get("status") == "PAID_PENDING_REVIEW":
        await send_message(chat_id, payment_pending_review_reply(order_code, payment), message_id)
        return
    reason = result.get("message") or data.get("message") or "Unknown backend response"
    await send_message(
        chat_id,
        f"❌ Payment verification failed\nReason: {reason}",
        message_id,
    )


async def reply_for_subscription_detection(chat_id: str, message_id: str, result: dict, payment: dict):
    data = result.get("data") or {}
    status = data.get("status")
    if result.get("ok") and status == "PAID":
        lines = [
            "✅ Subscription payment confirmed",
            f"Order: {data.get('orderCode') or '—'}",
            f"Plan: {data.get('packageCode') or '—'}",
            f"Amount: {payment['currency']} {payment['amount']}",
            f"Payer: *{payment.get('payerAccountLast3') or '—'}",
        ]
        append_payment_metadata(lines, payment)
        lines.extend(["", "Subscription activated successfully."])
        await send_message(chat_id, "\n".join(lines), message_id)
        return
    if result.get("ok") and status == "ALREADY_PROCESSED":
        await send_message(
            chat_id,
            f"ℹ️ Payment already processed\nTrx ID: {payment.get('paywayTransactionId') or '—'}",
            message_id,
        )
        return
    if result.get("ok") and status == "UNMATCHED":
        await send_message(
            chat_id,
            "❌ No matching pending subscription\n"
            f"Amount: {payment['currency']} {payment['amount']}\n"
            f"Payer: *{payment.get('payerAccountLast3') or '—'}\n"
            f"Trx ID: {payment.get('paywayTransactionId') or '—'}",
            message_id,
        )
        return
    if result.get("ok") and status == "REVIEW_REQUIRED":
        await send_message(
            chat_id,
            "⚠️ Multiple pending subscriptions matched\nManual review required.\n"
            f"Amount: {payment['currency']} {payment['amount']}\n"
            f"Payer: *{payment.get('payerAccountLast3') or '—'}\n"
            f"Trx ID: {payment.get('paywayTransactionId') or '—'}",
            message_id,
        )
        return
    reason = result.get("message") or data.get("message") or "Unknown backend response"
    await send_message(chat_id, f"❌ Payment verification failed\nReason: {reason}", message_id)


def payment_confirmed_reply(order_code: str, payment: dict) -> str:
    lines = [
        "✅ Payment confirmed automatically",
        f"Order: {order_code}",
        f"Amount: {payment['currency']} {payment['amount']}",
        "Template unlocked.",
    ]
    append_payment_metadata(lines, payment)
    return "\n".join(lines)


def payment_pending_review_reply(order_code: str, payment: dict) -> str:
    lines = [
        "⚠️ Payment detected but pending review",
        f"Order: {order_code}",
        f"Amount: {payment['currency']} {payment['amount']}",
    ]
    append_payment_metadata(lines, payment)
    return "\n".join(lines)


def append_payment_metadata(lines: list[str], payment: dict):
    if payment.get("paywayTransactionId"):
        lines.append(f"Trx ID: {payment['paywayTransactionId']}")
    if payment.get("paywayApprovalCode"):
        lines.append(f"APV: {payment['paywayApprovalCode']}")


async def post_to_backend(path: str, payload: dict):
    headers = {"X-ADMIN-PAYMENT-SECRET": ADMIN_PAYMENT_SECRET}
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            response = await client.post(f"{SPRING_API_BASE_URL}{path}", json=payload, headers=headers)
            body = response.json()
        except httpx.HTTPError as exc:
            return {"ok": False, "message": f"Backend request failed ({type(exc).__name__})"}
        except ValueError:
            return {"ok": False, "message": "Backend returned a non-JSON response"}

    if response.status_code >= 400:
        return {"ok": False, "message": body.get("message") or response.reason_phrase}
    return {"ok": True, "data": body.get("data") or body}


async def reply_from_backend(chat_id: str, message_id: str, result: dict, success_prefix: str):
    if result.get("ok"):
        data = result.get("data") or {}
        message = data.get("message") or success_prefix
        await send_message(chat_id, f"{success_prefix}\n{message}", message_id)
    else:
        await send_message(chat_id, f"Failed: {result.get('message')}", message_id)


async def send_message(chat_id: str, text: str, reply_to_message_id: str | None = None):
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("sendMessage skipped: TELEGRAM_BOT_TOKEN is empty")
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    if reply_to_message_id:
        payload["reply_to_message_id"] = reply_to_message_id
        payload["allow_sending_without_reply"] = True
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            result = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("sendMessage failed: %s", type(exc).__name__)
        return False
    if not result.get("ok"):
        logger.warning("sendMessage rejected for chat_id=%s: %s", chat_id, result.get("description"))
        return False
    logger.info("sendMessage delivered")
    return True


async def send_menu_link(chat_id: str, message_id: str, text: str, button_text: str, path: str):
    reply_markup = {
        "inline_keyboard": [
            [{"text": button_text, "url": f"{FRONTEND_BASE_URL}{path}"}],
        ]
    }
    await send_message_with_keyboard(chat_id, text, reply_markup, message_id)


async def send_main_menu(chat_id: str, message_id: str | None = None):
    await send_message_with_keyboard(chat_id, "📋 ម៉ឺនុយ:", MAIN_MENU_REPLY_KEYBOARD, message_id)


async def send_profile_card(
    chat_id: str,
    message_id: str | None,
    sender: dict,
    sender_id: str,
    username: str,
):
    first_name = str(sender.get("first_name") or "").strip()
    last_name = str(sender.get("last_name") or "").strip()
    full_name = " ".join(f"{first_name} {last_name}".split()) or "Telegram User"
    username_text = f"@{username}" if username else "មិនទាន់មាន"
    user_type = "Bot" if sender.get("is_bot") else "Telegram User"
    language = str(sender.get("language_code") or "").strip() or "មិនទាន់មាន"

    profile_text = (
        "👤 KOUPRENG PROFILE\n\n"
        "┌────────────────────\n"
        f"│ Name: {full_name}\n"
        f"│ Telegram ID: {sender_id or 'មិនទាន់មាន'}\n"
        f"│ Username: {username_text}\n"
        f"│ Type: {user_type}\n"
        f"│ Language: {language}\n"
        "└────────────────────\n\n"
        "Manage your Koupreng account below."
    )
    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "👤 បើក Profile", "url": f"{FRONTEND_BASE_URL}/profile"},
                {"text": "📊 Dashboard", "url": f"{FRONTEND_BASE_URL}/dashboard"},
            ],
            [
                {"text": "💰 មើលតម្លៃ", "callback_data": "koupreng:pricing"},
                {"text": "📋 ម៉ឺនុយ", "callback_data": "koupreng:menu"},
            ],
        ]
    }
    await send_message_with_keyboard(chat_id, profile_text, reply_markup, message_id)


async def send_pricing_menu(chat_id: str, message_id: str | None = None):
    pricing_text = (
        "💰 មើលតម្លៃ Koupreng Invitation\n\n"
        "🛒 PRICE FORM\n"
        "┌────────────────────\n"
        "│ Product: សន្លឹកការឌីជីថល\n"
        "│ Packages: 3 កញ្ចប់\n"
        "│ Recommended: កញ្ចប់មាស ($169)\n"
        "└────────────────────\n\n"
        "Select package:\n"
        "• កញ្ចប់មង្គល - ឥតគិតថ្លៃ\n"
        "• កញ្ចប់មាស - $169\n"
        "• កញ្ចប់ពេជ្រ - តម្លៃពិគ្រោះ"
    )
    reply_markup = {
        "inline_keyboard": [
            [{"text": "កញ្ចប់មង្គល - ឥតគិតថ្លៃ", "callback_data": "koupreng:pricing:basic"}],
            [{"text": "⭐ កញ្ចប់មាស - $169", "callback_data": "koupreng:pricing:pro"}],
            [{"text": "កញ្ចប់ពេជ្រ - តម្លៃពិគ្រោះ", "callback_data": "koupreng:pricing:enterprise"}],
            [{"text": "🌐 មើលទំព័រតម្លៃ", "url": f"{FRONTEND_BASE_URL}/pricing"}],
        ]
    }
    await send_message_with_keyboard(chat_id, pricing_text, reply_markup, message_id)


async def send_pricing_plan_detail(chat_id: str, message_id: str | None, plan_id: str):
    plan = PRICING_PLAN_BY_ID.get(plan_id)
    if not plan:
        await send_pricing_menu(chat_id, message_id)
        return

    features = "\n".join(f"• {feature}" for feature in plan["features"])
    detail_text = (
        "🧾 PACKAGE DETAIL\n"
        "┌────────────────────\n"
        f"│ Plan: {plan['name']}\n"
        f"│ Price: {plan['price']}\n"
        "└────────────────────\n\n"
        f"{plan['desc']}\n\n"
        f"{features}"
    )
    reply_markup = {
        "inline_keyboard": [
            [{"text": plan["button"], "url": f"{FRONTEND_BASE_URL}{plan['path']}"}],
            [{"text": "« ត្រឡប់ទៅតម្លៃ", "callback_data": "koupreng:pricing"}],
        ]
    }
    await send_message_with_keyboard(chat_id, detail_text, reply_markup, message_id)


async def send_help_message(chat_id: str, message_id: str | None = None):
    reply_markup = {
        "inline_keyboard": [
            [
                {"text": "🎴 មើលគំរូ", "url": f"{FRONTEND_BASE_URL}/templates"},
                {"text": "💰 មើលតម្លៃ", "callback_data": "koupreng:pricing"},
            ],
            [
                {"text": "👤 គណនីខ្ញុំ", "callback_data": "koupreng:profile"},
                {"text": "📋 ម៉ឺនុយ", "callback_data": "koupreng:menu"},
            ],
            [
                {"text": "📩 Contact @ny_panha", "url": "https://t.me/ny_panha"},
            ],
        ]
    }
    await send_message_with_keyboard(
        chat_id,
        (
            "❓ KOUPRENG HELP & SUPPORT\n\n"
            "For assistance, contact admin: @ny_panha\n\n"
            "Steps:\n"
            "1. Click 🎴 មើលគំរូ to browse invitation templates\n"
            "2. Click 💰 មើលតម្លៃ to view packages\n"
            "3. Click 👤 គណនីខ្ញុំ to open your profile\n"
            "4. Login or register on the website\n"
            "5. Customize and share your invitation\n\n"
            f"🌐 Website: {FRONTEND_BASE_URL}"
        ),
        reply_markup,
        message_id,
    )


async def answer_callback_query(callback_query_id: str):
    if not TELEGRAM_BOT_TOKEN or not callback_query_id:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery"
    payload = {"callback_query_id": callback_query_id}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json=payload)
    except httpx.HTTPError as exc:
        logger.warning("answerCallbackQuery failed: %s", type(exc).__name__)


async def send_photo(chat_id: str, photo: str, caption: str, reply_markup: dict | None = None) -> bool:
    """Send a photo with optional caption and inline keyboard. Returns True on success."""
    if not TELEGRAM_BOT_TOKEN:
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
    payload: dict = {"chat_id": chat_id, "photo": photo, "caption": caption}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            result = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("sendPhoto failed (%s); falling back to text", type(exc).__name__)
        return False
    if not result.get("ok"):
        logger.warning("sendPhoto failed: %s; falling back to text", result.get("description"))
        return False
    return True


async def send_message_with_keyboard(
    chat_id: str,
    text: str,
    reply_markup: dict | None = None,
    reply_to_message_id: str | None = None,
):
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("sendMessage skipped: TELEGRAM_BOT_TOKEN is empty")
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload: dict = {"chat_id": chat_id, "text": text}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    if reply_to_message_id:
        payload["reply_to_message_id"] = reply_to_message_id
        payload["allow_sending_without_reply"] = True
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json=payload)
            result = resp.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("sendMessage with keyboard failed (%s)", type(exc).__name__)
        return await send_message(chat_id, text, reply_to_message_id)
    if not result.get("ok"):
        logger.warning("sendMessage with keyboard rejected for chat_id=%s: %s", chat_id, result.get("description"))
        return await send_message(chat_id, text, reply_to_message_id)
    logger.info("sendMessage with keyboard delivered")
    return True
