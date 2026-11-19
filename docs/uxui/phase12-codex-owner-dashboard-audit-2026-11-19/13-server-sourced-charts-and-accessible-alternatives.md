# 13 — server sourced charts and accessible alternatives

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

The new response track is an independently implemented semantic snapshot, not a fabricated trend. It uses the actual invitation dashboard's attending, declined, maybe and pending record counts. Proportions render only when all counts and totalGuests are nonnegative safe integers and the categories sum exactly to that denominator. Zero produces guidance; unavailable/inconsistent snapshots preserve text counts without a misleading full bar.

The definition list provides category/count/percentage text independently of color; the visual bar is supplementary. There is no hover-only data, tooltip needing focus, animation loop or chart dependency. Budget and gifts remain independent USD/KHR totals. An invalid amount makes that labeled currency unavailable instead of silently zero; an unlabeled currency is never assumed USD. No FX conversion or history is manufactured.

[Chart contract](evidence/chart-data-contracts.json) and [KPI register](evidence/kpi-data-provenance.json) map each source and unit. These are owner fixture/browser checks, not provider settlement or live analytics certification.

[Report index](README.md).
