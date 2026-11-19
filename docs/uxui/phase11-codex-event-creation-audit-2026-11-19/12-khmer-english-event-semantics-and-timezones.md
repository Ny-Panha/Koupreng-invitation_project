# 12 — khmer english event semantics and timezones

Audit date: 19 November 2026 (Asia/Bangkok). Scope: local source and explicitly identified fixtures.

Both interface locales retain the actual six domain labels. Long Khmer text is exercised in populated light/dark form and review renders. No extra groom/bride-language fields, family/age fields, housewarming or monk-blessing category was added to satisfy upstream prose.

The DTO uses date-only LocalDate and wall-clock LocalTime. This wizard does not persist an explicit timezone selector or implement conversion. A report's “Asia/Phnom_Penh default saved” is not source proof; content-policy defaults elsewhere do not create a new wizard field. Past/future dates are not arbitrarily forbidden beyond source-backed rules.

Native Cambodian review remains blocked under the native language/cultural reviewer. The exact category labels to review are `អាពាហ៍ពិពាហ៍`, `ភ្ជាប់ពាក្យ`, `ខួបកំណើត`, `ខួបអនុស្សាវរីយ៍`, `កម្មវិធីក្រុមហ៊ុន`, `ផ្សេងៗ`. Also review the changed recovery/storage wording and map error `សូមបញ្ចូលតំណ Google Maps ដែលមាន HTTPS ត្រឹមត្រូវ។`. Physical glyph clipping, pronunciation, ceremony terminology and local time interpretation are not certified by screenshots or zero-match searches. [40-gate matrix](evidence/f11-independent-40-gates.json).

Frozen runtime source SHA256: `f09e658658e39ae681c772eac678d6267d94593852a8b0ee871fd9103ea0a0e8`. [Report index](README.md).
