# Phase 14.1 — Local Drafts, Storage, and Object URL Lifecycle

## 1. Object URL Lifecycle Management
Creating temporary previews with `URL.createObjectURL(file)` without revoking them creates severe memory leaks on mobile devices.
`InvitationMediaManager` tracks every allocated object URL in a ref map:
- Revoked immediately when an item is removed from the preflight queue.
- Revoked when the upload completes and the CDN URL is returned.
- Revoked automatically upon component unmount in the `useEffect` cleanup hook.

## 2. Storage Pressure & Private Mode
If browser storage quotas (IndexedDB / LocalStorage) are exceeded or blocked in incognito mode:
- The preflight queue operates gracefully in in-memory state.
- Clear user notices advise of memory-only operation.

- [Machine Evidence: Object URL Lifetime](evidence/object-url-lifetime.json)
- [Machine Evidence: Storage and Drafts](evidence/storage-and-ownerless-drafts.json)
