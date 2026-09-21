import logging

import httpx
import pytest

import main


class FakeRequest:
    def __init__(self, payload, headers=None):
        self.payload = payload
        self.headers = headers or {}

    async def json(self):
        return self.payload


def message_update(
    update_id,
    text,
    *,
    update_type="message",
    chat_id="-1001",
    sender_id="200",
    username="PayWayByABA_bot",
    is_bot=True,
    message_id=10,
    reply_to_message=None,
):
    return {
        "update_id": update_id,
        update_type: {
            "message_id": message_id,
            "chat": {"id": chat_id},
            "from": {"id": sender_id, "username": username, "is_bot": is_bot},
            "text": text,
            **({"reply_to_message": reply_to_message} if reply_to_message else {}),
        },
    }


@pytest.fixture(autouse=True)
def reset_bot_state(monkeypatch):
    main.PROCESSED_UPDATE_IDS.clear()
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_GROUP_IDS", {"-1001"})
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_ADMIN_IDS", {"999"})
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_PAYMENT_BOT_IDS", set())
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_PAYMENT_BOT_USERNAMES", {"paywaybyaba_bot"})
    monkeypatch.setattr(main, "TELEGRAM_WEBHOOK_SECRET", "")


@pytest.mark.asyncio
async def test_configured_webhook_secret_is_required(monkeypatch):
    monkeypatch.setattr(main, "TELEGRAM_WEBHOOK_SECRET", "expected-secret")
    request = FakeRequest(message_update(99, "/start", is_bot=False))

    with pytest.raises(main.HTTPException) as error:
        await main.telegram_webhook(request)

    assert error.value.status_code == 403


@pytest.mark.asyncio
async def test_configured_webhook_secret_accepts_matching_header(monkeypatch):
    monkeypatch.setattr(main, "TELEGRAM_WEBHOOK_SECRET", "expected-secret")
    request = FakeRequest(
        {"update_id": 98},
        headers={"X-Telegram-Bot-Api-Secret-Token": "expected-secret"},
    )

    assert await main.telegram_webhook(request) == {"ok": True}
    assert "98" in main.PROCESSED_UPDATE_IDS


@pytest.mark.parametrize(
    ("text", "order_code", "amount", "currency"),
    [
        ("ABA received USD 0.01 Note EVT260529001", "EVT260529001", "0.01", "USD"),
        ("PayWay paid 150000 KHR EVT2605290001", "EVT2605290001", "150000", "KHR"),
        ("Payment $12.50 EVT260529002", "EVT260529002", "12.50", "USD"),
        ("Amount: US$ 7.25 EVT260529003", "EVT260529003", "7.25", "USD"),
    ],
)
def test_parse_payment_alert_extracts_order_amount_and_currency(text, order_code, amount, currency):
    assert main.parse_payment_alert(text) == {
        "orderCode": order_code,
        "amount": amount,
        "currency": currency,
        "paywayTransactionId": None,
        "paywayApprovalCode": None,
        "payerName": None,
        "payerAccountLast3": None,
        "remark": None,
    }


@pytest.mark.parametrize(
    ("text", "amount", "payer_name", "last3"),
    [
        (
            "$0.01 paid by RAN NARATH (*288) on May 29, 10:23 AM via ABA PAY. "
            "Trx. ID: 178002499089682, APV: 383331.",
            "0.01",
            "RAN NARATH",
            "288",
        ),
        (
            "$199.00 paid by KOEURNG VIREAK (*247) on May 29. "
            "Trx. ID: 178002499089683, APV: 383332.",
            "199.00",
            "KOEURNG VIREAK",
            "247",
        ),
        (
            "$499 paid by SOME USER (*999) on May 29. "
            "Trx. ID: 178002499089684, APV: 383333.",
            "499.00",
            "SOME USER",
            "999",
        ),
    ],
)
def test_parse_subscription_payment_alert(text, amount, payer_name, last3):
    payment = main.parse_payment_alert(text)
    assert payment["amount"] == amount
    assert payment["currency"] == "USD"
    assert payment["payerName"] == payer_name
    assert payment["payerAccountLast3"] == last3
    assert payment["paywayTransactionId"].startswith("178002")
    assert payment["paywayApprovalCode"].startswith("383")


def test_parse_full_payway_alert_preserves_remark_and_separates_suffix():
    text = (
        "$0.01 paid by RAN NARATH (*288) on May 29, 10:23 AM "
        "via ABA PAY at KOEURNG VIREAK. Remark: EVT260529932. "
        "Trx. ID: 178002499089682, APV: 383331."
    )
    assert main.parse_payment_alert(text) == {
        "orderCode": "EVT260529932",
        "amount": "0.01",
        "currency": "USD",
        "paywayTransactionId": "178002499089682",
        "paywayApprovalCode": "383331",
        "payerName": "RAN NARATH",
        "payerAccountLast3": "288",
        "remark": "EVT260529932",
    }


@pytest.mark.parametrize("text", ["ABA paid USD nope", "ABA paid USD 1.234", "payment received", ""])
def test_invalid_amount_is_rejected(text):
    assert main.parse_payment_alert(text) is None


def test_group_allowlist(monkeypatch):
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_GROUP_IDS", {"allowed"})
    assert main.group_allowed("allowed") is True
    assert main.group_allowed("blocked") is False
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_GROUP_IDS", set())
    assert main.group_allowed("any") is True


def test_payment_sender_allowlist_prefers_ids_and_requires_bot(monkeypatch):
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_PAYMENT_BOT_IDS", {"42"})
    assert main.payment_sender_allowed({"id": 42, "username": "other", "is_bot": False}) is True
    assert main.payment_sender_allowed({"id": 41, "username": "PayWayByABA_bot", "is_bot": True}) is False

    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_PAYMENT_BOT_IDS", set())
    assert main.payment_sender_allowed({"id": 41, "username": "@PAYWAYBYABA_BOT", "is_bot": True}) is True
    assert main.payment_sender_allowed({"id": 41, "username": "PayWayByABA_bot", "is_bot": False}) is False


@pytest.mark.asyncio
async def test_duplicate_telegram_update_is_processed_once(monkeypatch):
    backend_calls = []
    replies = []

    async def fake_backend(path, payload):
        backend_calls.append((path, payload))
        return {"ok": True, "data": {"status": "PAID", "orderCode": payload["detectedOrderCode"]}}

    async def fake_send(chat_id, text, reply_to_message_id=None):
        replies.append((chat_id, text, reply_to_message_id))
        return True

    monkeypatch.setattr(main, "post_to_backend", fake_backend)
    monkeypatch.setattr(main, "send_message", fake_send)
    payload = message_update(100, "ABA received USD 0.01 EVT260529001")

    assert await main.telegram_webhook(FakeRequest(payload)) == {"ok": True}
    assert await main.telegram_webhook(FakeRequest(payload)) == {"ok": True}
    assert len(backend_calls) == 1
    assert len(replies) == 1


@pytest.mark.asyncio
async def test_missing_message_text_is_ignored(monkeypatch):
    called = False

    async def fake_send(*args, **kwargs):
        nonlocal called
        called = True

    monkeypatch.setattr(main, "send_message", fake_send)
    payload = message_update(101, None)
    assert await main.telegram_webhook(FakeRequest(payload)) == {"ok": True}
    assert called is False


@pytest.mark.asyncio
@pytest.mark.parametrize("update_type", ["edited_message", "channel_post", "edited_channel_post"])
async def test_supported_telegram_message_variants_are_processed(monkeypatch, update_type):
    calls = []

    async def fake_backend(path, payload):
        calls.append((path, payload))
        return {"ok": True, "data": {"status": "PAID", "orderCode": payload["detectedOrderCode"]}}

    async def fake_send(*args, **kwargs):
        return True

    monkeypatch.setattr(main, "post_to_backend", fake_backend)
    monkeypatch.setattr(main, "send_message", fake_send)
    payload = message_update(102, "ABA received USD 0.01 EVT260529001", update_type=update_type)

    assert await main.telegram_webhook(FakeRequest(payload)) == {"ok": True}
    assert len(calls) == 1


@pytest.mark.asyncio
async def test_invalid_callback_query_is_ignored(monkeypatch):
    answered = False

    async def fake_answer(*args, **kwargs):
        nonlocal answered
        answered = True

    monkeypatch.setattr(main, "answer_callback_query", fake_answer)
    payload = {"update_id": 103, "callback_query": {"id": "callback-without-data"}}
    assert await main.telegram_webhook(FakeRequest(payload)) == {"ok": True}
    assert answered is False


class TimeoutClient:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False

    async def post(self, url, json, headers=None):
        request = httpx.Request("POST", url)
        raise httpx.ReadTimeout("secret-bearing-url-must-not-be-returned", request=request)


class Non2xxResponse:
    status_code = 409
    reason_phrase = "Conflict"

    @staticmethod
    def json():
        return {"message": "Wrong payment amount"}


class Non2xxClient:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False

    async def post(self, url, json, headers=None):
        return Non2xxResponse()


@pytest.mark.asyncio
async def test_backend_timeout_returns_sanitized_error(monkeypatch):
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda **kwargs: TimeoutClient())
    result = await main.post_to_backend("/internal", {"value": "secret"})
    assert result == {"ok": False, "message": "Backend request failed (ReadTimeout)"}
    assert "secret-bearing" not in result["message"]


@pytest.mark.asyncio
async def test_backend_non_2xx_response_is_rejected(monkeypatch):
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda **kwargs: Non2xxClient())
    result = await main.post_to_backend("/internal", {})
    assert result == {"ok": False, "message": "Wrong payment amount"}


@pytest.mark.asyncio
async def test_wrong_payment_amount_does_not_confirm(monkeypatch):
    replies = []

    async def fake_backend(path, payload):
        return {"ok": False, "message": "Wrong payment amount"}

    async def fake_send(chat_id, text, reply_to_message_id=None):
        replies.append(text)
        return True

    monkeypatch.setattr(main, "post_to_backend", fake_backend)
    monkeypatch.setattr(main, "send_message", fake_send)
    payload = message_update(104, "ABA received USD 99.00 EVT260529001")
    await main.telegram_webhook(FakeRequest(payload))

    assert len(replies) == 1
    assert "failed" in replies[0].lower()
    assert "Wrong payment amount" in replies[0]


@pytest.mark.asyncio
async def test_missing_order_code_never_calls_backend(monkeypatch):
    backend_called = False
    replies = []

    async def fake_backend(*args, **kwargs):
        nonlocal backend_called
        backend_called = True

    async def fake_send(chat_id, text, reply_to_message_id=None):
        replies.append(text)
        return True

    monkeypatch.setattr(main, "post_to_backend", fake_backend)
    monkeypatch.setattr(main, "send_message", fake_send)
    await main.telegram_webhook(FakeRequest(message_update(105, "ABA received USD 0.01")))

    assert backend_called is False
    assert replies == ["Payment detected but no order code found. Please check manually."]


@pytest.mark.asyncio
async def test_admin_detect_reply_sends_subscription_evidence(monkeypatch):
    backend_calls = []
    replies = []

    async def fake_backend(path, payload):
        backend_calls.append((path, payload))
        return {
            "ok": True,
            "data": {"status": "PAID", "orderCode": "SUB2609151234", "packageCode": "BASIC"},
        }

    async def fake_send(chat_id, text, reply_to_message_id=None):
        replies.append(text)
        return True

    payway_text = (
        "$0.01 paid by RAN NARATH (*288) on May 29, 10:23 AM via ABA PAY. "
        "Trx. ID: 178002499089682, APV: 383331."
    )
    reply_message = {
        "message_id": 77,
        "from": {"id": 42, "username": "PayWayByABA_bot", "is_bot": True},
        "text": payway_text,
    }
    payload = message_update(
        107,
        "/detect",
        sender_id="999",
        username="admin",
        is_bot=False,
        reply_to_message=reply_message,
    )
    monkeypatch.setattr(main, "post_to_backend", fake_backend)
    monkeypatch.setattr(main, "send_message", fake_send)

    await main.telegram_webhook(FakeRequest(payload))

    assert len(backend_calls) == 1
    path, evidence = backend_calls[0]
    assert path == "/api/v1/internal/subscription-payments/telegram-detect"
    assert evidence["telegramMessageId"] == "77"
    assert evidence["telegramSenderId"] == "42"
    assert evidence["payerName"] == "RAN NARATH"
    assert evidence["payerAccountLast3"] == "288"
    assert evidence["paywayTransactionId"] == "178002499089682"
    assert "Subscription payment confirmed" in replies[0]


@pytest.mark.asyncio
async def test_admin_detect_reply_rejects_untrusted_original_sender(monkeypatch):
    backend_called = False
    replies = []

    async def fake_backend(*args, **kwargs):
        nonlocal backend_called
        backend_called = True

    async def fake_send(chat_id, text, reply_to_message_id=None):
        replies.append(text)
        return True

    reply_message = {
        "message_id": 78,
        "from": {"id": 13, "username": "not_payway", "is_bot": False},
        "text": "$0.01 paid by RAN NARATH (*288) on May 29. Trx. ID: 123, APV: 456.",
    }
    payload = message_update(
        108,
        "/confirm",
        sender_id="999",
        username="admin",
        is_bot=False,
        reply_to_message=reply_message,
    )
    monkeypatch.setattr(main, "post_to_backend", fake_backend)
    monkeypatch.setattr(main, "send_message", fake_send)

    await main.telegram_webhook(FakeRequest(payload))

    assert backend_called is False
    assert replies == ["The replied message is not from a trusted PayWay sender."]


@pytest.mark.asyncio
async def test_unauthorized_manual_confirmation_never_calls_backend(monkeypatch):
    backend_called = False
    replies = []

    async def fake_backend(*args, **kwargs):
        nonlocal backend_called
        backend_called = True

    async def fake_send(chat_id, text, reply_to_message_id=None):
        replies.append(text)
        return True

    monkeypatch.setattr(main, "post_to_backend", fake_backend)
    monkeypatch.setattr(main, "send_message", fake_send)
    payload = message_update(106, "/paid EVT260529001 0.01", sender_id="200", is_bot=False)
    await main.telegram_webhook(FakeRequest(payload))

    assert backend_called is False
    assert replies == ["You are not allowed to confirm payments."]


@pytest.mark.asyncio
async def test_telegram_api_exception_log_does_not_contain_token(monkeypatch, caplog):
    token = "test-token-value-that-must-stay-secret"
    monkeypatch.setattr(main, "TELEGRAM_BOT_TOKEN", token)
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda **kwargs: TimeoutClient())
    caplog.set_level(logging.WARNING, logger="koupreng.telegram_bot")

    assert await main.send_message("private-chat", "message") is False
    assert token not in caplog.text
    assert "private-chat" not in caplog.text
    assert "secret-bearing-url" not in caplog.text
