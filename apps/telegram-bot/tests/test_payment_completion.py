"""Original merchant alerts and post-commit notification boundary; no network calls."""
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture(autouse=True)
def isolated(monkeypatch):
    main.PROCESSED_UPDATE_IDS.clear()
    main.DELIVERED_NOTIFICATION_IDS.clear()
    monkeypatch.setattr(main, "TELEGRAM_BOT_TOKEN", "")
    monkeypatch.setattr(main, "TELEGRAM_WEBHOOK_SECRET", "test-webhook-secret")
    monkeypatch.setattr(main, "ADMIN_PAYMENT_SECRET", "test-internal-secret")
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_GROUP_IDS", {"-1001"})
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_PAYMENT_BOT_IDS", {"42"})
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_ADMIN_IDS", {"999"})
    monkeypatch.setattr(main, "send_message", AsyncMock(return_value=True))
    monkeypatch.setattr(main, "post_to_backend", AsyncMock(return_value={
        "ok": True, "data": {"status": "REVIEW_REQUIRED"},
    }))


def merchant_message():
    return {
        "message_id": 77, "date": 1791878400, "chat": {"id": -1001},
        "from": {"id": 42, "is_bot": True},
        "text": "$0.01 paid by KOEURNG VIREAK (*247). Trx. ID: SIM-0001, APV: 123.",
    }


def webhook(message):
    with TestClient(main.app) as client:
        return client.post("/telegram/webhook", json={"update_id": 901, "message": message},
                           headers={"X-Telegram-Bot-Api-Secret-Token": "test-webhook-secret"})


def test_original_no_reference_alert_reaches_subscription_matching():
    assert webhook(merchant_message()).status_code == 200
    path, payload = main.post_to_backend.call_args.args
    assert path == "/api/v1/internal/subscription-payments/telegram-detect"
    assert payload["trustedMerchantAlert"] is True
    assert payload["telegramSenderId"] == "42"
    assert payload["telegramMessageId"] == "77"
    assert payload["paywayTransactionId"] == "SIM-0001"
    assert payload["merchantMessageAt"] is not None


@pytest.mark.parametrize("defect", ["forward", "sender", "human", "empty_group", "empty_sender", "missing_trx"])
def test_untrusted_or_incomplete_subscription_evidence_never_reconciles(monkeypatch, defect):
    message = merchant_message()
    if defect == "forward":
        message["forward_origin"] = {"type": "user"}
    elif defect == "sender":
        message["from"]["id"] = 43
    elif defect == "human":
        message["from"]["is_bot"] = False
    elif defect == "empty_group":
        monkeypatch.setattr(main, "TELEGRAM_ALLOWED_GROUP_IDS", set())
    elif defect == "empty_sender":
        monkeypatch.setattr(main, "TELEGRAM_ALLOWED_PAYMENT_BOT_IDS", set())
    else:
        message["text"] = "$0.01 paid by KOEURNG VIREAK (*247). Trx. ID:"
    assert webhook(message).status_code == 200
    main.post_to_backend.assert_not_awaited()


def test_admin_copied_text_is_not_original_evidence():
    message = merchant_message()
    message["from"] = {"id": 999, "is_bot": False}
    message["text"] = "/detect " + message["text"]
    webhook(message)
    main.post_to_backend.assert_not_awaited()


@pytest.mark.parametrize("secret", ["", "wrong-secret"])
def test_notification_endpoint_requires_internal_secret(secret):
    with TestClient(main.app) as client:
        response = client.post("/internal/payment-notifications", headers={"X-ADMIN-PAYMENT-SECRET": secret},
                               json={"notificationId": "1", "chatId": "-1001", "text": "Pending"})
    assert response.status_code == 403
    main.send_message.assert_not_awaited()


def test_notification_delivery_is_deduplicated_and_failed_delivery_is_retryable():
    main.send_message.side_effect = [False, True]
    with TestClient(main.app) as client:
        payload = {"notificationId": "1", "chatId": "-1001", "text": "Pending"}
        headers = {"X-ADMIN-PAYMENT-SECRET": "test-internal-secret"}
        assert client.post("/internal/payment-notifications", json=payload, headers=headers).status_code == 503
        assert client.post("/internal/payment-notifications", json=payload, headers=headers).status_code == 200
        assert client.post("/internal/payment-notifications", json=payload, headers=headers).status_code == 200
    assert main.send_message.await_count == 2
