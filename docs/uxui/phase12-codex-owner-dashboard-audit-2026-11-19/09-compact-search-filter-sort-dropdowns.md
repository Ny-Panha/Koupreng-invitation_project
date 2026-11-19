# 09 — compact search filter sort dropdowns

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

Native controlled selects were retained for status, type and sort, preserving browser keyboard/typeahead behavior. The search control has a visible label, icon, real clear button and focus return. Matching normalizes query and actual text to NFC and trims for comparison while retaining the original typed query. No new search API, autocomplete service or inaccessible faux select was added.

Period choices use ordinary pressed buttons rather than incomplete tabs. Selected criteria remain visible as removable chips; Clear preserves unrelated context such as `module`, and focus returns to search. Search keystrokes replace history, while filter/view/page changes push meaningful history. Back/forward is exercised with 25 records. Invalid enums use safe defaults; malformed/huge page values cannot produce an empty slice.

Newest sorting now has a total order across finite/missing/malformed updated/created times, with numeric-aware ID ties. Title ordering is locale/NFC aware; date ordering uses validated calendar dates with unknown last. [URL/filter contract](evidence/filters-url-pagination.json) and the model/browser tests are the evidence; no unimplemented sort choice is shown.

[Report index](README.md).
