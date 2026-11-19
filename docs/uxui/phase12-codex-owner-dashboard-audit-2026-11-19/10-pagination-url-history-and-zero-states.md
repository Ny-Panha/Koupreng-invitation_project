# 10 — pagination url history and zero states

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

Pagination remains client-side over the known loaded filtered records, 12 per page. It now exposes bounded numbered pages and ellipses, semantic current-page state and Previous/Next. The visible range is calculated from the clamped current page. A changed filter resets the page; page navigation moves focus to the result summary. Large/negative/noninteger page inputs are safely bounded without deleting unrelated URL state.

The model exercises 0, 1, 11, 12, 13, 25 and 100 records. Browser evidence covers the second page/range, back history, a no-match search and a 100-record collection. The inherited delete-last-item regression verifies the list returns to the remaining page after acknowledged removal and retains data after failure. Zero results offer Clear filters; zero events offer Create.

[Filter/pagination evidence](evidence/filters-url-pagination.json) identifies the commands. Native select popup pixels and physical touch operation are not certified by these emulated browser cases.

[Report index](README.md).
