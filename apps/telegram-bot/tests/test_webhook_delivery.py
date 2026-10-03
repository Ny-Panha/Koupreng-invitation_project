"""Retry and shape boundaries without contacting Telegram or the backend."""

import asyncio
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture(autouse=True)
def isolated_bot(monkeypatch):
    main.PROCESSED_UPDATE_IDS.clear()
    monkeypatch.setattr(main, "TELEGRAM_BOT_TOKEN", "")
    monkeypatch.setattr(main, "TELEGRAM_WEBHOOK_SECRET", "test-webhook-secret")
    monkeypatch.setattr(main, "ADMIN_PAYMENT_SECRET", "test-internal-secret")
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_GROUP_IDS", {"-1001"})
    monkeypatch.setattr(main, "TELEGRAM_ALLOWED_ADMIN_IDS", {"999"})
    monkeypatch.setattr(main, "send_message", AsyncMock(return_value=True))


class Request:
    headers = {"X-Telegram-Bot-Api-Secret-Token": "test-webhook-secret"}

    def __init__(self, payload):
        self.payload = payload

    async def json(self):
        return self.payload


def payment_update(update_id=32001):
    return {
        "update_id": update_id,
        "message": {
            "message_id": 22,
            "chat": {"id": -1001},
            "from": {"id": 999, "is_bot": False},
            "text": "/paid EVT260529001 0.01",
        },
    }


@pytest.mark.asyncio
async def test_timeout_then_same_update_retries_and_success_is_deduplicated(monkeypatch):
    attempts = 0

    async def transport(request):
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise httpx.ReadTimeout("private backend URL", request=request)
        return httpx.Response(200, json={"data": {"status": "PAID"}})

    install_transport(monkeypatch, transport)
    request = Request(payment_update())
    with pytest.raises(main.HTTPException) as error:
        await main.telegram_webhook(request)
    assert error.value.status_code == 503
    assert "32001" not in main.PROCESSED_UPDATE_IDS

    assert await main.telegram_webhook(request) == {"ok": True}
    assert await main.telegram_webhook(request) == {"ok": True}
    assert attempts == 2


@pytest.mark.asyncio
@pytest.mark.parametrize("status", [429, 500, 503])
async def test_transient_backend_status_is_retryable(monkeypatch, status):
    install_transport(monkeypatch, lambda request: httpx.Response(status, json={"message": "Unavailable"}))
    with pytest.raises(main.HTTPException) as error:
        await main.telegram_webhook(Request(payment_update()))
    assert error.value.status_code == 503
    assert "32001" not in main.PROCESSED_UPDATE_IDS


@pytest.mark.asyncio
async def test_terminal_payment_validation_is_acknowledged_without_repeating(monkeypatch):
    backend = AsyncMock(return_value={"ok": False, "message": "Wrong payment amount"})
    monkeypatch.setattr(main, "post_to_backend", backend)
    request = Request(payment_update())
    assert await main.telegram_webhook(request) == {"ok": True}
    assert await main.telegram_webhook(request) == {"ok": True}
    backend.assert_awaited_once()


@pytest.mark.asyncio
async def test_duplicate_in_progress_is_retryable_without_second_backend_call(monkeypatch):
    entered = asyncio.Event()
    release = asyncio.Event()

    async def backend(*args):
        entered.set()
        await release.wait()
        return {"ok": True, "data": {"status": "PAID"}}

    backend_call = AsyncMock(side_effect=backend)
    monkeypatch.setattr(main, "post_to_backend", backend_call)
    first = asyncio.create_task(main.telegram_webhook(Request(payment_update())))
    await entered.wait()
    try:
        with pytest.raises(main.HTTPException) as error:
            await main.telegram_webhook(Request(payment_update()))
        assert error.value.status_code == 503
    finally:
        release.set()
        assert await first == {"ok": True}
    backend_call.assert_awaited_once()


@pytest.mark.parametrize(
    "payload",
    [
        {"update_id": [1], "message": {}},
        {"update_id": True, "message": {}},
        {"update_id": {}},
        {"update_id": 33001, "message": [1]},
        {"update_id": 33001, "message": "message"},
        {"update_id": 33001, "message": {"chat": [1], "text": "/paid EVT260529001 0.01"}},
        {"update_id": 33001, "message": {"chat": {"id": {}}, "text": "/paid EVT260529001 0.01"}},
        {"update_id": 33001, "message": {"chat": {"id": -1001}, "from": [999], "text": "/paid EVT260529001 0.01"}},
        {"update_id": 33001, "message": {
            "chat": {"id": -1001}, "from": {"id": 999, "is_bot": "true"}, "text": "/paid EVT260529001 0.01",
        }},
        {"update_id": 33001, "callback_query": {"id": "cb", "data": "koupreng:pricing", "message": {"chat": []}}},
        {"update_id": 33001, "callback_query": {"id": "cb", "data": "koupreng:pricing", "from": [], "message": {}}},
        {"update_id": 33001, "message": {
            "chat": {"id": -1001}, "text": "/paid EVT260529001 0.01", "reply_to_message": {"from": []},
        }},
    ],
)
def test_malformed_nested_payload_is_controlled_and_never_reconciles(monkeypatch, payload):
    backend = AsyncMock(return_value={"ok": True, "data": {}})
    monkeypatch.setattr(main, "post_to_backend", backend)
    with TestClient(main.app) as client:
        response = client.post(
            "/telegram/webhook",
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-webhook-secret"},
            json=payload,
        )
    assert response.status_code == 200
    assert response.json() == {"ok": True}
    backend.assert_not_awaited()
    assert not main.PROCESSED_UPDATE_IDS


def test_invalid_json_has_controlled_response():
    with TestClient(main.app) as client:
        response = client.post(
            "/telegram/webhook",
            headers={"X-Telegram-Bot-Api-Secret-Token": "test-webhook-secret", "Content-Type": "application/json"},
            content="{invalid",
        )
    assert response.status_code == 400


def install_transport(monkeypatch, handler):
    real_client = httpx.AsyncClient
    transport = httpx.MockTransport(handler)
    monkeypatch.setattr(main.httpx, "AsyncClient", lambda **kwargs: real_client(transport=transport, **kwargs))
