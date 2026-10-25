# Known limitations

- Native device, hardware Safari, manual screen-reader and family/editorial Khmer review are unverified. WebKit automation is not an iPhone test.
- Pixel captures cover the representative botanical wedding design and Studio widths. The complete catalog has automated render/contract coverage, not a human pixel review of every skin at every width.
- Event Essential uses the full multi-day editor for weddings and keeps its existing neutral activity editor for other event categories. The developer boilerplate remains intentionally unsupported.
- Only Silk Heritage's existing section ordering is editable here. Other dedicated layouts retain fixed placement.
- Repeated DST times select the earlier occurrence; there is no separate ambiguity picker. Invalid/gap times are rejected. Timezone behavior depends on the runtime's IANA database.
- The explicit product fallback for a timed calendar export is two hours; owners should enter an end time when the actual duration is known. Missing time means all-day and has no second-by-second countdown.
- The four backend skips are three intentionally guarded Phase 6 native demo tests and the opt-in RSVP performance benchmark. No performance SLA is claimed. Redis was unavailable in the owned live environment; its documented database fallback was exercised.
- Initial live-test retries consumed the older Phase 7 fixture's ten-event quota. A separate fictional Phase 8 account and nonrevenue `DEMO_ADMIN_GRANT` were provisioned in the explicitly disposable loopback database. No existing account capacity or production policy was changed.
- No production deploy, container restart, DNS change, pull or merge was performed. Commit/push to GitHub `main` was separately authorized after verification. Existing compiled artifacts in the worktree remain preserved.
