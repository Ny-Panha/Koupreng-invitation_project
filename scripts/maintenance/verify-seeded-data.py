#!/usr/bin/env python3
import json
import sys
import urllib.request

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

slugs = [
    "vibul-chariya-wedding-2026",
    "rattana-kunthea-engagement-2026",
    "vireak-28th-birthday-bash"
]

print("=== Testing Public Invitation APIs ===")
for slug in slugs:
    url = f"http://localhost:8080/api/v1/public/invitations/{slug}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            data = body.get("data", {})
            title = data.get("title")
            event_type = data.get("eventType")
            status = data.get("status")
            venue = data.get("venueName")
            print(f"[OK] {slug}")
            print(f"     Title: {title}")
            print(f"     Type:  {event_type} | Status: {status}")
            print(f"     Venue: {venue}")
    except Exception as e:
        print(f"[FAIL] {slug}: {e}")

print("\n=== Testing Public Wishes Endpoint ===")
url_wishes = "http://localhost:8080/api/v1/public/invitations/vibul-chariya-wedding-2026/wishes"
try:
    req = urllib.request.Request(url_wishes, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        wishes = body.get("data", [])
        print(f"[OK] Fetched {len(wishes)} public wishes for Wedding event:")
        for w in wishes:
            print(f"     - {w.get('guestName')}: \"{w.get('message')}\"")
except Exception as e:
    print(f"[FAIL] Wishes endpoint: {e}")

