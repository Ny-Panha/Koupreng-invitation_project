# 08 — Validation, Khmer Dates, Times, and Timezone

**Phase:** `11.1`  
**Rules Matrix:** [event-type-validation-matrix.json](file:///d:/Koupreng-invitation_project/docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/event-type-validation-matrix.json)

---

## 1. Validation Rules Engine

Validation runs on step advancement and submission:

1. **Title Validation:**
   - Length: 3 to 100 characters.
   - Regex: Supports Khmer Unicode block (`[ក-៿]`), Latin alphanumeric, spaces, and punctuation.
2. **Participant Validation:**
   - Wedding: `groomNameKh` and `brideNameKh` are strictly required (min 2 chars).
   - Birthday: `celebrantNameKh` required.
   - Housewarming / Monk Blessing: `hostNamesKh` required.
3. **Date & Time Validation:**
   - `eventDate`: Valid ISO calendar format (`YYYY-MM-DD`). Displays warning if selected date is in the past.
   - `eventTime`: 24-hour time format (`HH:mm`).
4. **Timezone:**
   - Hardcoded default `Asia/Phnom_Penh` (UTC+7). Truthfully displayed as "ICT (UTC+7) - ម៉ោងនៅកម្ពុជា".
5. **Google Maps Link:**
   - Optional. Validated against regex pattern `https?://(www\.)?(google\.com/maps|maps\.app\.goo\.gl|goo\.gl/maps)`.

---

## 2. Accessible Focus Management

When validation fails:
1. First invalid field key is identified.
2. The corresponding DOM input element is found via `document.getElementById` or `querySelector`.
3. The element is scrolled into view (`scrollIntoView({ behavior: 'smooth', block: 'center' })`).
4. DOM focus is immediately applied (`element.focus()`).
5. Error message is connected via `aria-describedby` and announced to assistive technologies.
