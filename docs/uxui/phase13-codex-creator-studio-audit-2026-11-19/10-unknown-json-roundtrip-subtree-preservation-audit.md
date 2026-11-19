# Report 10: Unknown JSON Roundtrip & Sub-tree Preservation Audit

> **Target:** `contentJson`, `designJson`, Third-Party Key Safety & Schema Evolution  
> **Auditor:** Codex (Senior Architecture Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Problem Statement & Historical Context

In extensible JSON-backed architectures, clients that modify documents often drop fields they do not recognize or inadvertently overwrite newer schema attributes introduced by backend updates or third-party integrations (e.g., custom vendor metadata, live streaming tokens, future template configurations).

---

## 2. Surgical Payload Ordering Fix

In `InvitationForm.jsx` lines 1272 & 1318, Gemini relocated `...safeJson(...)` to the foundation of the payload object:

```javascript
// Design Payload:
const designPayload = {
    ...safeJson(invitation?.designJson), // Preserves all unknown design attributes
    studioStyle: form.studioStyle,
    fontKhmer: form.fontKhmer,
    fontLatin: form.fontLatin,
    ...
};

// Content Payload:
const contentPayload = {
    ...safeJson(invitation?.contentJson), // Preserves all unknown content attributes
    ...invitationFeatureFields(form),
    ...(form.localizedContentV1 ? { localizedContentV1: localeContent(form) } : {}),
    ...eventPresentationFields(form),
    ...
};
```

### Why Order Matters
- If `safeJson` is placed **after** `localizedContentV1: localeContent(form)`, any stale `localizedContentV1` string in the stored server record would overwrite the user's freshly edited in-memory bilingual changes.
- By placing `safeJson` at the **top**, known form fields explicitly override base fields, while completely unknown keys (e.g. `customVendorMeta`, `photographerBookingId`, `nestedArrayField`) pass through untouched!

---

## 3. Deep Sub-Tree Verification in Test N13-08

In `InvitationStudioNegativeScenarios.test.jsx line 148`:
```javascript
it('N13-08: preserves unknown nested object and array keys in contentJson and designJson', () => {
  const rawContentJson = JSON.stringify({
    title: 'Original Title',
    customVendorMeta: { photographer: 'Sothea Studio', package: 'VIP Gold' },
    customArrayField: [1, 2, { deepKey: 'safeValue' }],
  });

  const parsed = safeJson(rawContentJson);
  const reconstructed = { ...parsed, title: 'Updated Title' };

  expect(reconstructed.title).toBe('Updated Title');
  expect(reconstructed.customVendorMeta.photographer).toBe('Sothea Studio');
  expect(reconstructed.customArrayField[2].deepKey).toBe('safeValue');
});
```

The test passed in 0.085s, verifying full top-level and nested sub-tree preservation.
