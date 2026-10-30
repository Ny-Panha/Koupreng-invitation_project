# Admin reporting and document journeys

Current-main CI and local runs exposed several outdated QA contracts:

- Export UI moved from a `<details>` menu to an accessible native dialog. Both scripts now open `Export report` by accessible role/name and scope actions to that dialog. Retained enabled/disabled checks, exact action names, keyboard dismissal, focus restoration and denied/stale states.
- The backend now owns current-page CSV (`/export/csv-page`). The replay harness previously fell through to an empty JSON response. Added a real backend-generated page fixture, matching the default server sort separately from the existing explicit id-sort test. Assert BOM, header, exactly one row, row ordinal, actual record id/title, requested page/size, and download filename. Removed only the obsolete client-generated `CURRENT PAGE 2` decoration expectation, which is not part of the current server CSV contract.
- Replaced the retired loading CSS selector with the current accessible admin skeleton. Wait for completed finite entrance animations before color-contrast audits; assertions and WCAG tags remain unchanged. No unconditional sleep or blind retry was added.
- Local output-directory overrides keep new synthetic fixtures and screenshots in ignored evidence. CI regenerates reporting fixtures from the exact checked-out backend instead of relying on committed historic exports.

`admin-reporting-browser.mjs` passes locally (31.01 s, exit 0): 40 report/viewport visits, XLSX/CSV/full workbook/current-page downloads, sorting/pagination, selection/copy, authenticated print preview, and three actual Chromium PDFs. The 16-combination workspace matrix passed (390/768/1280/1440 × Khmer/English × light/dark); the final combined run and 55 axe scans are reported in 08. Focus, pending-review evidence, retry, stale export denial, 403 removal, empty and loading states remain asserted.

Independent `inspect-admin-reporting-pdfs.py` passes: 5-page small landscape, 21-page large landscape and 18-page large portrait documents; embedded Kantumruy font, selectable Khmer text, repeated table headers and no text outside A4 bounds. Visually inspected a rendered landscape page. XLSX ZIP integrity/native sheet counts and CSV financial contents are independently checked (12 USD rows, verified receipts **47 USD**, no USD/KHR conflation). The OS print dialog and human Khmer typography review remain manual gates.

This browser harness replays synthetic SQL/POI fixtures; it is not a live production financial-data test. MySQL projection/integrity checks and real HTTP authorization tests are reported separately. CI now runs the independent PDF/download parser and uploads the resulting summaries/PDFs.
