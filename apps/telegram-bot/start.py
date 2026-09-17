"""
Quick-start helper for the Koupreng Telegram bot.

Usage:
    python start.py

This script:
1. Loads .env
2. Validates that TELEGRAM_BOT_TOKEN is set
3. Verifies the bot token with Telegram
4. Starts uvicorn on port 8000
"""

import json
import os
import socket
import sys
from pathlib import Path

import httpx
import uvicorn
from dotenv import load_dotenv

BOT_DIR = Path(__file__).resolve().parent
load_dotenv(BOT_DIR / ".env")

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
BOT_HOST = os.getenv("TELEGRAM_BOT_HOST", "127.0.0.1")
BOT_PORT = int(os.getenv("TELEGRAM_BOT_PORT", "8000"))
REDACTED_VALUE = "<TELEGRAM_BOT_TOKEN>"


def telegram_api_url(method: str) -> str:
    """Build a Telegram API URL for a request; callers must never log it."""
    return f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"


def check_token() -> None:
    if not BOT_TOKEN:
        print("❌  TELEGRAM_BOT_TOKEN is not set in .env")
        sys.exit(1)

    try:
        response = httpx.get(telegram_api_url("getMe"), timeout=10)
        response.raise_for_status()
        data = json.loads(response.content)
    except httpx.HTTPStatusError as exc:
        print(f"❌  Token check failed (HTTP {exc.response.status_code}).")
        sys.exit(1)
    except (httpx.RequestError, ValueError) as exc:
        print(f"⚠️   Could not verify the Telegram token ({type(exc).__name__}).")
        return

    if data.get("ok"):
        bot = data["result"]
        print(f"✅  Bot token valid: @{bot.get('username')} (id={bot.get('id')})")
        return

    print("❌  Telegram rejected the configured bot token.")
    sys.exit(1)


def print_webhook_instructions() -> None:
    print("\n─────────────────────────────────────────────────────────")
    print("NEXT STEPS — run each in a separate terminal:")
    print()
    print("1. Expose this server with ngrok:")
    print("      ngrok http 8000")
    print()
    print("2. Copy the HTTPS URL (e.g. https://abc123.ngrok-free.app)")
    print()
    print("3. Register the webhook with Telegram:")
    print(
        "      curl \"https://api.telegram.org/bot"
        f"{REDACTED_VALUE}/setWebhook?url=<NGROK_URL>/telegram/webhook"
        "&secret_token=<TELEGRAM_WEBHOOK_SECRET>\""
    )
    print()
    print("   Or open this URL in your browser after replacing placeholders:")
    print(
        "      https://api.telegram.org/bot"
        f"{REDACTED_VALUE}/setWebhook?url=<NGROK_URL>/telegram/webhook"
        "&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
    )
    print()
    print("4. Check webhook status:")
    print(f"      https://api.telegram.org/bot{REDACTED_VALUE}/getWebhookInfo")
    print()
    print("5. Send /start to your bot in Telegram — it should reply.")
    print("─────────────────────────────────────────────────────────\n")

def start_server() -> None:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("localhost", BOT_PORT)) == 0:
            print(f"⚠️   Port {BOT_PORT} is already in use.")
            print("     Kill the existing process first:")
            print("     pkill -f 'uvicorn main:app'")
            sys.exit(1)
    print(f"🚀  Starting uvicorn on http://{BOT_HOST}:{BOT_PORT} ...")
    os.chdir(BOT_DIR)
    uvicorn.run("main:app", host=BOT_HOST, port=BOT_PORT, reload=True)


if __name__ == "__main__":
    check_token()
    print_webhook_instructions()
    start_server()
