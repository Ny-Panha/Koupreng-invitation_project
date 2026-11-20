# Phase 14 Codex Audit — Report 06: Batch Scheduling and Ambiguous Retries

## 1. Deterministic Batch Chunking
The Spring Boot backend enforces `app.security.upload.max-files=5`. To guarantee compliance, the frontend implements:
```javascript
export function chunkBatch(items, batchSize = 5) {
  if (!Array.isArray(items)) return [];
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}
```
When a user selects 6, 10, or 20 files, `chunkBatch` partitions the selection into chunks of at most 5 files. Each chunk is dispatched sequentially.

## 2. Retry Policy Without Duplication
- Confirmed files are revoked and removed from `preflightFiles` immediately upon successful chunk completion.
- If chunk 2 fails after chunk 1 succeeds, only the files in chunk 2 and subsequent chunks remain in `preflightFiles`.
- The user can click "Retry failed uploads", which uploads only the remaining failed items without re-sending confirmed files (verified in `N14-09`).

- [Machine Evidence: Upload Batches and Retries](evidence/upload-batches-and-retries.json)
