# 09 — Filters, Search & Deterministic Sort

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** Search Normalization, Multi-Level Deterministic Sorting, and Filter Bar Mechanics  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Khmer Unicode NFC Search Normalization

Khmer text can be encoded in multiple Unicode forms (e.g., precomposed characters vs. decomposed base characters with subscript consonants and vowel marks). A simple JavaScript `.includes()` string search frequently fails when the typed input uses one normalization and the stored database record uses another.

### Solution Implemented in `EventsFeature.jsx`:
```javascript
const query = search.trim().toLocaleLowerCase().normalize("NFC");
const matches = [
  draft.title,
  draft.venueName,
  draft.event?.venueName,
  draft.groomName,
  draft.brideName,
  draft.hostNames,
  draft.celebrantName,
  draft.coupleNames,
  draft.event?.title,
]
  .filter(Boolean)
  .join(" ")
  .toLocaleLowerCase()
  .normalize("NFC")
  .includes(query);
```
Both the query and all searchable fields are normalized to Unicode NFC prior to comparison.

---

## 2. Deterministic Multi-Level Sorting

Previously, selecting "Newest" returned `0`, leading to non-deterministic ordering depending on browser JavaScript engine array sorting implementations.

### Solution:
```javascript
.sort((a, b) => {
  if (sort === "title") {
    const cmp = String(a.title || "").localeCompare(String(b.title || ""), en ? "en" : "km");
    if (cmp !== 0) return cmp;
    return String(a.id || "").localeCompare(String(b.id || ""));
  }
  if (sort === "date") {
    const dateA = a.eventDate || a.event?.date || "9999-99-99";
    const dateB = b.eventDate || b.event?.date || "9999-99-99";
    const cmp = dateA.localeCompare(dateB);
    if (cmp !== 0) return cmp;
    return String(a.id || "").localeCompare(String(b.id || ""));
  }
  // Default deterministic "newest" sort:
  const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : null;
  const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : null;
  if (timeA !== null && timeB !== null && timeB !== timeA) return timeB - timeA;
  return 0; // Preserves stable list order
});
```

---

## 3. Period Quick Tabs

The period filter bar provides instantaneous segmented filtering:
- **All:** Displays all events regardless of date.
- **Upcoming:** Evaluates `eventDate >= todayDateString`.
- **Past:** Evaluates `eventDate < todayDateString`.

Selecting any tab resets pagination to page 1 to prevent empty-page traps.
