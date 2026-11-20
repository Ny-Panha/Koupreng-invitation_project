# Phase 14.1 — Batch Upload, Chunking, and Real Progress

## 1. Five-File Chunking (`chunkBatch`)
The Spring Boot backend endpoint `POST /api/events/{eventId}/media` enforces a hard limit of 5 files per request. Uploading >5 files in a single request returns 400 Bad Request.
To provide a seamless experience when users select 6 to 20 files, `chunkBatch` transparently splits files into sequential requests of at most 5 items:
```javascript
export function chunkBatch(items, batchSize = 5) {
  const chunks = [];
  for (let i = 0; i < items.length; i += batchSize) {
    chunks.push(items.slice(i, i + batchSize));
  }
  return chunks;
}
```

## 2. Six-Stage Lifecycle Tracking
Every file transitions through truthful lifecycle stages:
`IDLE` -> `QUEUED` -> `PREFLIGHT` -> `UPLOADING` -> `PROCESSING` -> `CONFIRMED` / `FAILED`.

## 3. Partial Failure and Safe Retry
If chunk 1 succeeds and chunk 2 fails:
- Chunk 1 files are marked `CONFIRMED` and appended to the permanent library.
- Chunk 2 files are marked `FAILED` with retry affordances.
- Clicking retry only transmits the unconfirmed files, eliminating duplicate uploads.

- [Machine Evidence: Upload Stages](evidence/upload-stages-and-statuses.json)
- [Machine Evidence: Batch Fixtures](evidence/batch-upload-fixtures.json)
- [Visual: Error Notice & Retry](visuals/20-error-notice-retry.png)
