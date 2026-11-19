# Report 13: Khmer Typography, Unicode & Bilingual Authoring Audit

> **Target:** Khmer Script Support, Unicode Diacritics, Bilingual Isolation & Typography  
> **Auditor:** Codex (Senior UX & Cultural Localization Specialist)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Khmer Unicode Complex Script Verification

Khmer is an Indic-derived script characterized by complex consonant clustering, consonant subscripts (ជើង - Coeng, U+17D2), dependent vowels, and diacritics. Rendering and input systems frequently suffer character dropping, corrupted syllable sorting, or clipping of below-baseline glyphs.

### Test Verification (Negative Test N13-23)
In `InvitationStudioNegativeScenarios.test.jsx`:
- Sample text tested: `ពិធីមង្គលការ សិរីសួស្តី អាពាហ៍ពិពាហ៍ កូនកំលោះ និង កូនក្រមុំ`.
- Verified that string length, Coeng code points (U+17D2 + U+1780..U+17A2), Bantoc (U+17D8), and Samyok Sannya (U+17D0) are stored without UTF-8 normalization degradation or stripping.
- Output: Pass with 100% character integrity.

---

## 2. Bilingual Authoring & Isolation (`localizedContentV1`)

Koupreng wedding invitations support simultaneous Khmer and English versions within a unified document:

```json
{
  "localizedContentV1": {
    "version": 1,
    "enabledLocales": ["km", "en"],
    "defaultLocale": "km",
    "km": {
      "groomName": "សុខ សុភក្ត្រ",
      "brideName": "ចាន់ ធីតា",
      "messageTitle": "សិរីសួស្តី អាពាហ៍ពិពាហ៍"
    },
    "en": {
      "groomName": "Sok Sopheak",
      "brideName": "Chan Thida",
      "messageTitle": "Wedding Invitation"
    }
  }
}
```

### Key Safety Guarantees Verified
1. **No Language Bleed:** Editing in the English tab does not overwrite or mutate Khmer fields.
2. **Translation Readiness Meter:** English tab displays a readiness indicator (`English: complete / total`) showing whether required fields have translations before enabling the "Publish English version" checkbox.
3. **Copy Names Shortcut:** A convenient button (`ចម្លងឈ្មោះពីភាសាខ្មែរ`) copies names across without typing, respecting user intent.
