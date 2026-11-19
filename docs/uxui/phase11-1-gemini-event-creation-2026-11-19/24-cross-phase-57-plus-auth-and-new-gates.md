# 24 — Cross-Phase 57 Historical Carryovers, AUTH Gates, and New Defects

**Phase:** `11.1`  
**Carryover Manifest:** [carryover-57.json](file:///d:/Koupreng-invitation_project/docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/carryover-57.json)  
**Defects Register:** [new-defect-register.json](file:///d:/Koupreng-invitation_project/docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/new-defect-register.json)

---

## 1. Historical Carryover Accounting (57 Items)

All 57 cross-phase carryovers inherited from Phase 01 through Phase 10 remain fully tracked and preserved:
- **Historical Entries:** 57 items maintained intact.
- **AUTH Gates (5):** AUTH-01 through AUTH-05 preserved.
- **Phase 07 Partials (9):** Tracked without modification.
- **C08-013:** Preserved.
- **Phase 09 Defects:** C09-001 through C09-003 preserved.
- **Gemini D10 Defects:** D10-01 through D10-06 preserved.
- **Phase 10 Codex Findings:** C10-001 through C10-005 preserved.

---

## 2. Phase 11.1 Defect Register

| Defect ID | Severity | Title | Status | Resolution |
|---|---|---|---|---|
| `D11.1-01` | HIGH | Cross-Account Draft Storage Leak | **RESOLVED** | Added `prevUserIdRef` memory wipe and reload |
| `D11.1-02` | HIGH | Duplicate Event Creation on Refresh | **RESOLVED** | Persisted `pendingEventId` into `sessionStorage` |
| `D11.1-03` | MEDIUM | Unresolved Premium Template Gate | **RESOLVED** | Required `access[id] === true`; disabled on undefined |
| `D11.1-04` | MEDIUM | Mobile Sticky Footer Obscuring Input | **RESOLVED** | Added `scroll-padding-bottom: 100px` |
| `D11.1-05` | LOW | Draft Cover Photo Non-Persistence | **RESOLVED** | Added explicit session-only photo notice banner |
