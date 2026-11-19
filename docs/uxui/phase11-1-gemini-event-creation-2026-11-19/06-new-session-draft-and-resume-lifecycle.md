# 06 — New Session Draft and Resume Lifecycle

**Phase:** `11.1`  
**Storage Mechanism:** `sessionStorage` (scoped by authenticated `user.id`)  
**FSM Specification:** [draft-state-transitions.json](file:///d:/Koupreng-invitation_project/docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/draft-state-transitions.json)

---

## 1. Draft Key & Schema Architecture

Drafts are stored under a user-namespaced key:
```
koupreng_event_draft_<userId>
```

### Schema Structure (Version 2):
```json
{
  "version": 2,
  "userId": "usr_998877",
  "updatedAt": 1731988500000,
  "currentStep": 2,
  "selectedTemplateId": "phka-sla-classic",
  "formData": {
    "eventType": "wedding",
    "title": "អាពាហ៍ពិពាហ៍ កុសល & បុប្ផា",
    "eventDate": "2026-12-25",
    "groomNameKh": "កុសល",
    "brideNameKh": "បុប្ផា"
  }
}
```

---

## 2. Auto-Save Debounce & Lifecycle

1. **Debounced Auto-Save:** Form modifications trigger a 500ms debounced auto-save to `sessionStorage`. An accessible badge (`aria-live="polite"`) briefly signals "Draft saved".
2. **Draft Restoration:** Upon mounting, `EventCreatePage` inspects `sessionStorage` for `koupreng_event_draft_<userId>`. If present and valid, fields, active step, and selected template are restored automatically.
3. **Draft Cleanup:** Upon successful creation and cover upload, the draft is explicitly removed from `sessionStorage` to prevent stale form data from haunting future event creations.

---

## 3. Transparency on Non-Persisted Photo Files (D11.1-05)

Browser `File` objects and `Blob` URLs cannot be persisted into `sessionStorage` across browser restarts without a dedicated backend draft staging bucket. To maintain absolute honesty with users, a prominent notice is displayed when a photo is attached:
> *ចំណាំ៖ រូបភាពគម្របត្រូវបានរក្សាទុកក្នុងអង្គចងចាំបណ្តោះអាសន្ន។ ប្រសិនបើលោកអ្នកបិទផ្ទាំងកម្មវិធី រូបភាពនឹងត្រូវជ្រើសរើសឡើងវិញ។*  
> (Notice: Cover photo is held in temporary session memory. If you close this tab, the photo must be reselected.)
