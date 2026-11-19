# 04 — Event Type and Field Semantics

**Phase:** `11.1`  
**Event Types Supported:** 6  
**Evidence Matrix:** [event-type-validation-matrix.json](file:///d:/Koupreng-invitation_project/docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/event-type-validation-matrix.json)

---

## 1. Supported Event Types

| Type Identifier | Khmer Label | English Label | Specialized Cultural Fields |
|---|---|---|---|
| `wedding` | មង្គលការ | Wedding | Groom/Bride Khmer & English, Groom/Bride Parents |
| `birthday` | ខួបកំណើត | Birthday | Celebrant Name Khmer & English, Age turning |
| `anniversary` | ខួបអាពាហ៍ពិពាហ៍ | Anniversary | Couple Names Khmer & English, Years married |
| `housewarming` | ឡើងគេហដ្ឋានថ្មី | Housewarming | Host Names Khmer & English, House/Location details |
| `monk_blessing` | ពិធីសូត្រមន្ត / បុណ្យចម្រើនព្រះបរិត្ត | Monk Blessing | Host Names Khmer & English, Monastery/Pagoda details |
| `general` | កម្មវិធីទូទៅ / ជួបជុំ | General Event | Host Names Khmer & English, Event description |

---

## 2. Common Fields Across All Types

1. **Title (`title`):** String, 3–100 characters. Auto-generated from participants (e.g. "អាពាហ៍ពិពាហ៍ កុសល & បុប្ផា") or customized by host.
2. **Event Date (`eventDate`):** ISO-8601 date (`YYYY-MM-DD`). Valid calendar date.
3. **Event Time (`eventTime`):** Optional 24-hour time (`HH:mm`).
4. **Timezone (`timezone`):** Hardcoded default `Asia/Phnom_Penh` (UTC+7).
5. **Location Name (`locationName`):** Optional venue name (e.g., "The Premier Centre Sen Sok").
6. **Address (`address`):** Optional street / sangkat address.
7. **Google Maps Link (`googleMapsUrl`):** Optional URL, validated against Google Maps URL regex.

---

## 3. Type Switch Sanitization

When a user switches between event types (e.g., from `wedding` to `birthday`), fields exclusive to weddings (such as `groomNameKh`, `brideNameKh`, parent names) are safely nullified in the form data state. This ensures:
- Dirty participant data is not persisted to drafts.
- Orphaned fields are not submitted in the backend payload.
- Common details (Date, Time, Location, Template choice) remain intact.
- Verified in [Phase11_1WizardRegression.test.jsx](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/events/onboarding/Phase11_1WizardRegression.test.jsx).
