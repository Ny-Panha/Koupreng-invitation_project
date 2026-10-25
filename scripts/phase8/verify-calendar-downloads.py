"""Independently parse exported calendars; requires the verification-only icalendar package."""
import argparse
import json
import sys
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("directories", nargs="+", type=Path)
parser.add_argument("--json-output", type=Path)
args = parser.parse_args()
local_packages = Path(__file__).resolve().parents[2] / ".cache/phase8/calendar-parser"
if local_packages.is_dir():
    sys.path.insert(0, str(local_packages))
from icalendar import Calendar  # noqa: E402; auxiliary verification dependency

results = []
for directory in args.directories:
    for path in sorted(directory.rglob("*.ics")):
        raw = path.read_bytes()
        raw.decode("utf-8", errors="strict")
        assert b"\n" not in raw.replace(b"\r\n", b""), f"Non-CRLF newline: {path}"
        assert all(len(line) <= 75 for line in raw.split(b"\r\n")), f"Overlong content line: {path}"
        event_list = Calendar.from_ical(raw).walk("VEVENT")
        assert len(event_list) == 1, f"Expected exactly one event: {path}"
        event = event_list[0]
        assert not event.errors, (path, event.errors)
        assert event.decoded("DTEND") > event.decoded("DTSTART"), f"Invalid duration: {path}"
        assert all(key in event for key in ("UID", "DTSTAMP", "SUMMARY", "DTSTART", "DTEND")), path
        results.append({"file": path.as_posix(), "start": event.decoded("DTSTART").isoformat(), "end": event.decoded("DTEND").isoformat(), "valid": True})
assert results, "No ICS exports found"
report = {"filesParsed": len(results), "allValid": True, "files": results}
if args.json_output:
    args.json_output.parent.mkdir(parents=True, exist_ok=True)
    args.json_output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
