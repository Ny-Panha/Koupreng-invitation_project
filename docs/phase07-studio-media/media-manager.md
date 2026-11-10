# Media Manager Modernization

## Overview

The Media Manager (`/app/events/:eventId/media` and `/dashboard/invitations/:invitationId/media`) allows hosts to manage all digital assets associated with their event—including event cover images, couple portraits, photo galleries, background music, and event attachment files (schedules, parking maps, guides).

In Phase 07, the Media Manager was modernized with an accessible drag-and-drop dropzone, real-time upload progress tracking, enhanced asset metadata badges, and secure file replacement workflows.

---

## 1. Architectural Highlights

### Drag-and-Drop Dropzone
The upload region now supports standard drag-and-drop alongside the traditional OS file picker:
- Drag state management (`isDragOver`) applies high-contrast visual focus styling (`border-color: var(--kp-gold)` and subtle elevation).
- Unified file handler (`handleFiles`) powers both the drop event and input file selection, eliminating duplicated validation logic.

```jsx
// InvitationMediaManager.jsx dropzone implementation
<div
  className={`media-upload-dropzone ${isDragOver ? "is-dragover" : ""}`}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  role="region"
  aria-label={t("uploadDropzone") || "Media file dropzone"}
>
  <input
    ref={fileInputRef}
    type="file"
    multiple
    accept="image/jpeg,image/png,image/webp,audio/mpeg"
    className="visually-hidden"
    onChange={handleFileInputChange}
  />
  <div className="dropzone-content">
    <CloudArrowUpIcon className="dropzone-icon" aria-hidden="true" />
    <p className="dropzone-title">{t("dragAndDropFiles") || "Drag and drop media files here"}</p>
    <p className="dropzone-subtitle">{t("orBrowseFiles") || "or click to browse from your device"}</p>
    <span className="dropzone-hint">Supports JPEG, PNG, WebP (max 5 MB) and MP3</span>
  </div>
</div>
```

---

## 2. Validation & Security Pipeline

All uploaded assets pass through multi-layer client-side and backend validation:
1. **MIME Type Allowlist:**
   - Images: `image/jpeg`, `image/png`, `image/webp`
   - Audio: `audio/mpeg` (for background ceremonial music)
   - Documents: `application/pdf` (for downloadable itinerary sheets)
2. **File Size Enforcement:**
   - 5 MB ceiling per image to prevent memory exhaustion and slow mobile loads over 3G/4G Cambodian cellular connections.
   - Immediate non-blocking toast warning if a file exceeds 5 MB.
3. **HEIC / HEIF Device Handling:**
   - Apple iOS devices taking photos in High Efficiency format trigger a user-friendly modal warning advising users to select standard JPEG/PNG or use native device conversion.

---

## 3. Asset Cards & Management Actions

Uploaded items render within a responsive CSS grid of interactive asset cards:
- **Thumbnail / Waveform Preview:** High-performance responsive thumbnail with lazy loading and focal point positioning.
- **Metadata Badges:** Visual tags indicating asset category (`cover`, `gallery`, `music`), file format, and formatted file size (KB/MB).
- **Primary Cover Badge:** The active cover asset displays a distinct gold badge (`Cover Image`), indicating its use across event cards and public landing pages.
- **Replace Workflow:** Dedicated "Replace" button allows updating an existing asset in-place without breaking existing template references or invitations.
- **Safe Deletion Modal:** Deletion triggers an accessible confirmation dialog explaining whether the asset is currently referenced in an active public invitation.

---

## 4. Mobile & Touch Ergonomics

- **Target Sizing:** All action buttons (`Replace`, `Delete`, `Copy URL`) maintain a minimum touch target of 44x44px.
- **Scroll & Stack:** On screens under 640px, the grid gracefully stacks into a single-column card list with horizontal action bars.
- **Screen Reader Announcements:** Dynamic upload progress and completion status are broadcast via an `aria-live="polite"` status region.
