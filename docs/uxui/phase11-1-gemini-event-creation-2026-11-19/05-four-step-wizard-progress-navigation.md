# 05 — Four-Step Wizard Progress and Navigation

**Phase:** `11.1`  
**Component:** `EventCreatePage.jsx`

---

## 1. Step Breakdown

The wizard guides the creator through four cohesive stages:

```
[ Step 1: Type & Details ] ──> [ Step 2: Cover & Media ] ──> [ Step 3: Template Selection ] ──> [ Step 4: Review & Create ]
```

1. **Step 1 — Type & Essential Details:**
   - Event category pills (Wedding, Birthday, etc.).
   - Bilingual title and participant inputs.
   - Date, time, timezone, and venue location.
2. **Step 2 — Cover Photo & Visual Media:**
   - High-resolution cover photo upload (drag & drop or file picker).
   - Live photo preview with focal point selector.
   - Transparent memory-only file storage notice.
3. **Step 3 — Template Selection:**
   - Grid of compatible invitation designs.
   - Filter by event type and free/premium status.
   - Entitlement checks guarding paid templates.
4. **Step 4 — Summary, Verification & Creation:**
   - Comprehensive review card summarizing all inputs.
   - Direct "Edit" shortcuts back to individual steps.
   - Dual actions: "Save Draft" and "Create Event".

---

## 2. Non-Blocking Navigation Architecture

- **Free Stepper Navigation:** Users can click any previously visited step in the header stepper to inspect or update fields without losing entered state.
- **Controlled Forward Navigation:** Advancing to the next step validates required fields on the active step. If validation fails, navigation is halted, errors are announced, and focus moves to the first invalid field.
- **Truthful Progress:** Progress bar computes exact completion percentage (`25%`, `50%`, `75%`, `100%`) with accessible `role="progressbar"` and `aria-valuenow`.
