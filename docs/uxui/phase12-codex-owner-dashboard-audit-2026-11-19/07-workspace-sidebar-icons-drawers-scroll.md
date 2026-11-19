# 07 — workspace sidebar icons drawers scroll

Audit date: 19 November 2026, Asia/Bangkok. Scope: local engineering and named fixtures.

The event sidebar is 240px expanded and 72px collapsed. It keeps event switcher, actual status, logical groups, active state, Lucide icon/text labels and owner-keyed stored preferences. All 19 destinations remain represented in the source model; group disclosure controls visibility rather than deleting routes. Collapsed tooltips preserve the keyboard-focused label even if pointer movement caused by layout collapse enters a different item.

Desktop sidebar/main content now use document scrolling. There is no viewport-bounded sidebar scroll host in the selected desktop render. The mobile drawer retains its necessary modal scroll body and focus isolation. A discovered selector conflict hid its trigger after resizing a collapsed rail to mobile; that rule is now desktop-only. Escape, focus return, background lock and resize closure pass the dedicated engine matrix.

Permission filtering still calls `moduleAllowed`. Owner-only paths are absent for viewers; package locks reflect actual source features. Studio retains its established focused workspace/recovery exclusions. [Role mapping](evidence/role-module-matrix.json), [geometry](evidence/geometry-matrix.json) and [defects](evidence/defect-register.json) describe the boundaries.

[Report index](README.md).
