"""Register the reviewed Premium design through the existing audited Admin API.

Never updates an existing record or reactivates an intentionally unpublished one.
Supply ADMIN_ACCESS_TOKEN in the environment; do not put tokens on the command line.
"""
import argparse
import json
import os
from urllib.request import Request, urlopen

CODE = "royal-garden-cinematic"
PAYLOAD = {
    "code": CODE, "name": "Royal Garden Cinematic", "category": "TRADITIONAL",
    "description": json.dumps({"presetId": "ROYAL_GARDEN_CINEMATIC",
        "descriptionEn": "Blue and gold Khmer ornaments with a cinematic opening and wedding program.",
        "description": "ក្បាច់ខ្មែរពណ៌មាសលើផ្ទៃពណ៌ខៀវ ជាមួយកម្មវិធីមង្គលការ។"}, ensure_ascii=False),
    "thumbnailUrl": "/images/marketing/catalog/royal-garden-cinematic-640.webp",
    "previewUrl": "/templates/royal-garden-cinematic",
    "premium": True, "price": 0, "currency": "USD", "status": "INACTIVE", "sortOrder": 1,
    "primaryColor": "#98703a", "secondaryColor": "#c7984d", "backgroundColor": "#f1ede6",
    "supportedEventTypes": ["WEDDING"], "supportedLanguages": ["KH", "EN", "BOTH"],
}


def register(base_url, token, activate=False):
    def api(path, method="GET", body=None):
        request = Request(base_url.rstrip("/") + "/api/v1" + path, method=method,
            headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
            data=None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8"))
        with urlopen(request, timeout=30) as response:
            value = json.load(response)
        return value.get("data", value)

    matches = [item for item in api("/admin/templates") if item["code"].lower() == CODE]
    if matches:
        if len(matches) != 1:
            raise RuntimeError("Duplicate stable code; resolve in Admin before continuing")
        return {"action": "preserved-existing", **matches[0]}
    # Publication is a separate, audited action after metadata round-trip checks.
    created = api("/admin/templates", "POST", PAYLOAD)
    saved = api("/admin/templates/" + str(created["id"]))
    for key in ("code", "premium", "price", "currency", "thumbnailUrl", "previewUrl"):
        if saved.get(key) != PAYLOAD[key]:
            raise RuntimeError(f"Admin did not persist {key}; new record remains INACTIVE")
    for key in ("supportedEventTypes", "supportedLanguages"):
        if set(saved.get(key, [])) != set(PAYLOAD[key]):
            raise RuntimeError(f"Admin did not persist {key}; new record remains INACTIVE")
    if activate:
        saved = api("/admin/templates/" + str(saved["id"]) + "/activate", "PATCH")
    return {"action": "created", **saved}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--activate", action="store_true", help="Publish only a newly created, verified record")
    args = parser.parse_args()
    result = register(args.base_url, os.environ["ADMIN_ACCESS_TOKEN"], args.activate)
    print(json.dumps(result, ensure_ascii=True, indent=2))
