# Phase 14 Codex Audit — Report 07: Progress Truth, Cancellation, and Confirmation

## 1. Real Upload Progress Truth
Progress percentage is derived from real Axios upload events:
```javascript
const onProgress = (e) => {
  if (e?.total) {
    const pct = Math.round((e.loaded / e.total) * 100);
    setProgress(pct);
    if (pct >= 100) setBatchStatus(t('batchFinalizing'));
  }
};
```
When byte transfer reaches 100%, the status explicitly transitions to "Finalizing batch on server…" rather than prematurely displaying a success toast (verified in `N14-10`).

## 2. Cancellation and Cleanup
- Staged items in the preflight queue can be individually cancelled via their remove button, which revokes their temporary object URL immediately.
- Whole queue can be cleared with "Clear queue".
- Network abort cancels active request and resets busy states without leaving orphaned UI data (verified in `N14-20`).

- [Visual: Preflight Staging Tray](visuals/17-preflight-staging-tray.png)
