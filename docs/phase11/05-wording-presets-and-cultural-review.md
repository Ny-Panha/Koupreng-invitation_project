# Editable wording and editorial review

The library supplies paired Khmer/English starting points for traditional formal wedding, warm modern invitation, formal family invitation, welcome/introduction, RSVP guidance and neutral events. Closing bundles include editable thank-you and optional polite apology. The original formal style is retained as a compatible starting point. Each language stores its own selected preset and authored text; switching languages never applies a preset. Unknown stored preset IDs safely select the formal preview.

The picker previews the selected wording. Applying requires an explicit replacement confirmation and uses the existing undo history. Optional closing/apology text can remain empty across save/reload. These strings are editorial candidates, not a claim of professional Khmer approval. Modern/family/welcome/RSVP additions require native Khmer review before customer-facing marketing approval.

`interpolateWording` supports only guest honorific/name, partner names, event date/time, venue name/address. Values are plain React text, never injected HTML. Missing values stop application and identify the fields. Honorifics remain host-controlled; no gender, status or religious title is guessed. Guest salutation tokens are supported by the utility, but this release does not add per-guest wording dispatch or a recipient database. Shared public wording should not contain private guest information.

Ceremony names continue to use the existing Phase 8 program presets and independently editable row text. System labels are localized through the invitation-label context; authored text never passes through a fixed-label translator. The integration wraps 116 static labels across 15 renderer files. Event Essential retains neutral roles and event copy.

Review required: native-language grammar and honorific usage, neutral-event suitability, visual balance of long Khmer names, and approval of any ceremony-specific illustration. Reference screenshots supplied hierarchy and density direction only; their names, contact numbers, venue geography and artwork were not copied.

Legacy English-only records retain their original single-language save contract when applying a preset. Per-locale preset metadata begins when the author deliberately starts a separate version; applied text remains saved in the existing format.
