# 13 — Error, Empty, Loading, Denied, and Recovery States

**Phase:** `11.1`  
**Component:** `EventCreatePage.jsx`

---

## 1. Comprehensive State Matrix

| State Type | Trigger | UI Manifestation | Recovery Action |
|---|---|---|---|
| **Loading** | Template fetch in progress | Skeleton card placeholders | None (automatic) |
| **Submitting** | Creation API in flight | Disabled inputs, spinner on CTA | In-flight wait |
| **Empty** | No templates match filter | Illustrated empty state card | "Clear filters" button |
| **Field Error** | Invalid title / date / url | Red field border, inline error text | Correct input |
| **Banner Error** | 500 API failure on create | Sticky red alert banner at top | "Try again" button |
| **Denied** | Unowned premium template | "Requires Premium" badge | Direct to marketplace |
| **Recovery** | Cover upload interrupted | "Event created! Retry photo upload" banner | Retry cover or skip |
