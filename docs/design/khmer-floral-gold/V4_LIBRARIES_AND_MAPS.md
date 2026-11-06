# V4 library and location decisions

Reviewed 2026-11-06 against current source, [V2 decisions](../TEN_LIBRARY_APPLICATION_PLAN_V2.md),
the [research matrix](../TEN_LIBRARY_INTEGRATION_MATRIX.md), and the existing
[pinned adoption/license ledger](../THIRD_PARTY_UI_LICENSES.md).
V4 copies no vendor component source and adds no runtime dependency. Existing
marketing-only vendor adaptations and their notices remain in place.

| Library evaluated | Actual deficit / useful pattern | V4 decision |
| --- | --- | --- |
| Animate UI | Opening release and modal transitions | Retain original staged CSS/installed motion stack; no Commons Clause source introduced into invitation output. |
| Badtz UI | Empty style previews for a new invitation | Original preview-only sample data with explicit bilingual explanation; existing radio galleries. No free/Pro source copied. |
| Lightswind | Scene atmosphere and photographic transition | Preserve original watercolor/paper assets; original photo dissolve. No shaders or source redistribution. |
| Kokonut UI | Music selection and media feedback | Existing music picker now uses native selection buttons; existing native player remains. No Pro audio card. |
| Untitled UI | Accurate upload completion and poster choices | Existing Studio persistence and fields; bounded uploads and refreshed poster library. No second React Aria system. |
| shadcn/ui | Dialog focus and fullscreen interaction | Reuse the existing shared Modal; fix swipe focus and opener focus in the Floral caller. No additional primitive foundation. |
| React Bits | Photo entrance and botanical movement | Original bounded CSS view-timeline enhancement, static fallback, hidden-tab pause and data-saving mode. No copied motion source. |
| Aceternity UI | Photo depth and curved chronology | Preserve original torn portraits and full saved curved agenda. No restricted timeline/card source. |
| Magic UI | Calendar/countdown readability | Retain canonical date/countdown utilities and the eight existing date presentations; no ticker dependency. |
| Skiper UI | Gallery, thumbnails and floating controls | Original pointer swipe and keyboard gallery; existing registered-section navigation. No component-specific attribution/redistribution uncertainty introduced. |

These are implementation decisions, not a fresh legal clearance of every upstream
product. Exact revisions, terms and notices in the existing ledger govern existing
copied components. Future source adoption still needs revision-specific license,
dependency and commercial-template review. General interaction patterns are distinct
from copied source or artwork.

## Location audit

Floral intentionally renders an uploaded venue diagram, an enlargement dialog and
the saved validated directions URL. Its diagram is **not an interactive map**.
The real-server journey uploads and retains an owner's fictional diagram; the
browser suites check plain, framed and compact presentations, directions and dock
clearance. No demonstration map replaces an owner's upload.

Royal Garden already has auto/sketch/embed presentation and paid illustrated-map
controls. Shared experience renderers also have legacy iframe support. These remain
separate from Floral's diagram; this delivery does not claim their third-party map
service or correct real-world coordinates were verified.

Google's current [Embed quickstart](https://developers.google.com/maps/documentation/embed/quickstart)
requires an enabled Cloud project and API key. Its [key setup guidance](https://developers.google.com/maps/documentation/embed/get-api-key)
describes website/API restrictions. A browser embed key is visible in iframe markup;
server credentials must never be placed there. No specifically authorized development
Maps project/key was supplied or verified for this task, so no new API-backed embed
is enabled and no production credential is used.

A future opt-in embed should use an exact saved place/coordinate, a restricted
browser key, click-to-load third-party disclosure/consent, a responsive titled
container, loading/timeout recovery and the existing directions link. Cross-origin
iframe `load` does not prove that Google rendered the intended location or accepted
the key. Legacy embeds need the same privacy/configuration review before being
advertised as verified interactive maps. Paid Map Studio authorization stays intact.
