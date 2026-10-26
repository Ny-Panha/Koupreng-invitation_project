# Ceremony program and icon refinement

The existing six icon keys retain their meanings. `none` is the only additive value; backend validation accepts it and still rejects unknown new keys. Existing unknown legacy render keys fall back to the calendar. The Studio picker now uses descriptive Khmer/English labels and a visible preview with equivalent text.

`CeremonyIcon.jsx` contains original lightweight secular line geometry for calendar, gathering, family blessings, offerings, meal and reception. There are no sacred figures, asserted universal ritual sequences or new external artwork dependencies. The existing optional schedule presets still explain that families should review names and order. Native Khmer editorial and cultural approval remains a customer-release gate.

The shared timeline no longer paints a dot over its icon. It reserves a wider marker column and maintains the connecting line beneath the motif. Khmer Celestial retains its own gold/Moul treatment; modern templates retain restrained line icons. Royal Garden's previous CSS explicitly hid SVG markers; its curved thread now displays the selected icon. `none` retains the template's understated marker.

Stable row/day IDs, array ordering, date offsets, explicit dates, optional times, descriptions, locations and legacy extensions are preserved. No second event date or timezone was introduced. Calendar and ICS regressions remain authoritative. Khmer headings retain generous line height; multiline copy wraps without hard character breaking. No unsupported density setting was added.

Evidence: component policy tests, current catalogue DOM contracts, Phase 8 date/program/ICS regressions, the Phase 12 real HTTP/MySQL journey and mobile/desktop program screenshots. Decorative SVGs remain `aria-hidden`; screen readers receive the actual ceremony heading.
