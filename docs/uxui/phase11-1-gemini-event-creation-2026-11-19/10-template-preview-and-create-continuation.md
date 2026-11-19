# 10 — Template Preview and Create Continuation

**Phase:** `11.1`  
**Component:** `EventCreatePage.jsx`

---

## 1. Deep-Link Continuation Architecture

When a prospective host explores templates at `/templates` and clicks "Use this template", the application deep-links directly into the creation flow:
```
/app/events/new?templateId=phka-sla-gold
```

### Continuation Lifecycle:
1. **Unauthenticated User:**
   - Redirected to `/login?redirect=/app/events/new?templateId=phka-sla-gold`.
   - Post-login: Redirected back to `/app/events/new?templateId=phka-sla-gold`.
2. **Authenticated User:**
   - Wizard mounts; parses `templateId` from `useSearchParams()`.
   - Pre-selects template for Step 3.
   - Evaluates user entitlement immediately in the background.

---

## 2. In-Wizard Template Switching

Users can switch between templates in Step 3 at any time without losing any entered event details (such as Bride/Groom names, dates, or location). The template grid displays live preview thumbnails, design tags, and responsive cards.
