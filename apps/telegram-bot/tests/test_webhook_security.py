"""Authentication boundaries for privileged Telegram payment reconciliation."""

import asyncio
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture(autouse=True)
def isolated_configuration(monkeypatch):
    main.PROCESSED_UPDATE_IDS.clear()
    monkeypatch.setattr(main, "TELEGRAM_BOT_TOKEN", "")
    monkeypatch.setattr(main, "TELEGRAM_WEBHOOK_SECRET", "test-webhook-secret")
    monkeypatch.setattr(main, "ADMIN_PAYMENT_SECRET", "test-internal-secret")
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_GROUP_IDS", {"-1001"})
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_ADMIN_IDS", {"999"})
    monkeypatch.setattr(main, "send_message", AsyncMock())
    monkeypatch.setattr(main, "post_to_backend", AsyncMock(return_value={"ok": True, "data": {}}))


@pytest.mark.parametrize("setting", ["TELEGRAM_WEBHOOK_SECRET", "ADMIN_PAYMENT_SECRET"])
@pytest.mark.parametrize("missing", ["", "   "])
def test_startup_rejects_missing_payment_security_configuration(monkeypatch, setting, missing):
    monkeypatch.setattr(main, setting, missing)
    register_commands = AsyncMock()
    monkeypatch.setattr(main, "set_bot_commands", register_commands)

    with pytest.raises(RuntimeError, match=setting), TestClient(main.app):
        pass

    register_commands.assert_not_awaited()


@pytest.mark.parametrize("setting", ["TELEGRAM_WEBHOOK_SECRET", "ADMIN_PAYMENT_SECRET"])
def test_webhook_fails_closed_if_startup_is_bypassed(monkeypatch, setting):
    with TestClient(main.app) as client:
        # Configuration can also become invalid in a test or an embedded ASGI host.
        monkeypatch.setattr(main, setting, "")
        response = client.post("/telegram/webhook", json=privileged_update())

    assert response.status_code == 503
    main.post_to_backend.assert_not_awaited()
    assert not main.PROCESSED_UPDATE_IDS


@pytest.mark.parametrize("supplied", [None, "wrong-secret", "ខ្មែរ"])
def test_invalid_webhook_secret_cannot_confirm_a_forged_admin_payment(supplied):
    headers = {} if supplied is None else {"X-Telegram-Bot-Api-Secret-Token": supplied}
    # Direct request avoids HTTPX's ASCII-only header transport for the Unicode case.
    class Request:
        async def json(self):
            return privileged_update()

    request = Request()
    request.headers = headers
    with pytest.raises(main.HTTPException) as error:
        asyncio.run(main.telegram_webhook(request))

    assert error.value.status_code == 403
    main.post_to_backend.assert_not_awaited()
    assert not main.PROCESSED_UPDATE_IDS


def test_authenticated_webhook_preserves_authorized_payment_and_health():
    with TestClient(main.app) as client:
        assert client.get("/health").json() == {"ok": True}
        response = client.post(
            "/telegram/webhook",
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-webhook-secret"},
            json=privileged_update(),
        )

    assert response.status_code == 200
    main.post_to_backend.assert_awaited_once()
    assert main.post_to_backend.call_args.args[0] == "/api/v1/internal/template-payments/confirm"


def privileged_update():
    return {
        "update_id": 31001,
        "message": {
            "message_id": 22,
            "chat": {"id": -1001},
            "from": {"id": 999, "is_bot": False},
            "text": "/paid EVT260529001 0.01",
        },
    }
