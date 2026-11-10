# Guest Photo & Media Integration

## 1. End-to-End Media Pipeline

Phase 07 established mandatory event photo selection during onboarding and stored the file via `mediaService.uploadCover(eventId, photoFile)`. Phase 08 completes this architecture by projecting the saved media directly into public, guest-facing invitation views:

```
[Phase 07: Host Onboarding]
   │
   ├─► EventPhotoUpload.jsx (Selects JPEG/PNG/WebP, sets focal point: top/center/bottom)
   ├─► invitationService.create()  ──► [DB: invitations table, cover_url]
   └─► mediaService.uploadCover()   ──► [Storage: /uploads/cover/{id}.webp]
                                                     │
                                                     ▼
                                          [Phase 08: Public Guest Access]
                                                     │
                                                     ├─► PublicInvitationFeature.jsx
                                                     ├─► publicInvitationToDraft()
                                                     ├─► draftToTemplate()
                                                     └─► Template Renderers & CoverBackground.jsx
```

---

## 2. Adapter Layer Mapping

In [`invitationDraftAdapter.js`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/wedding-builder/utils/invitationDraftAdapter.js), `publicInvitationToDraft` resolves the authorized media sources:

```javascript
const mediaCover = media?.coverImage?.fileUrl || "";
const resolvedCover = mediaCover || invitation?.coverUrl || invitation?.media?.coverImage?.fileUrl || content.coverImage || invitation?.templateThumbnailUrl || "";
const resolvedCouplePhoto = content.couplePhoto || (resolvedCover !== invitation?.templateThumbnailUrl ? resolvedCover : "") || "";
const resolvedFocalPoint = content.coverFocalPoint || design.coverFocalPoint || "center";

return {
  ...
  coverImage: resolvedCover,
  couplePhoto: resolvedCouplePhoto,
  coverFocalPoint: resolvedFocalPoint,
  ...
};
```

In [`draftToTemplate.js`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/wedding-builder/utils/draftToTemplate.js), these fields are injected into the template view model (`tpl`), design parameters, and host content overrides:

```javascript
tpl = {
  ...
  couplePhoto: draft.couplePhoto || draft.coverImage || "",
  coverFocalPoint: draft.coverFocalPoint || draft.design?.coverFocalPoint || "center",
  design: {
    ...
    coverFocalPoint: draft.coverFocalPoint || draft.design?.coverFocalPoint || "center",
  },
  hostContent: {
    ...
    couplePhoto: draft.couplePhoto || draft.coverImage || "",
    coverFocalPoint: draft.coverFocalPoint || draft.design?.coverFocalPoint || "center",
  }
};
```

---

## 3. Universal Cover & Focal Point Mechanics

The shared [`CoverBackground.jsx`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/templates/shared/Openings/CoverBackground.jsx) component evaluates the template key to differentiate between decorative-only templates and photo-compatible designs:

```javascript
const templateKey = String(content.templateCode || content.templateId || content.code || content.slug || "").toLowerCase();
const isDecorativeArtworkTemplate = [
  "silk-heritage",
  "silk_heritage",
  "cover-khmer-golden-wedding",
  "khmer-golden-canva-inspired-wedding"
].includes(templateKey);

// Photo-compatible templates adopt the owner's photo; decorative templates retain traditional artwork
const customCoverImage = resolveMediaUrl(
  content.coverBackgroundImage ||
  content.design?.coverBackgroundImage ||
  content.coverBgImage ||
  (!isDecorativeArtworkTemplate ? (content.couplePhoto || content.coverImage) : "")
);

// Focal point positioning mapping
const focalPoint = content.coverFocalPoint || content.design?.coverFocalPoint || "center";
const focalPosition = focalPoint === "top" ? "50% 15%" : focalPoint === "bottom" ? "50% 85%" : "50% 50%";
```

### Focal Point Alignment Rules:
- **`top` (`object-position: 50% 15%`):** Centers the crop on faces and upper bodies in standing couple portraits.
- **`center` (`object-position: 50% 50%`):** Balanced default for landscape photography and venue images.
- **`bottom` (`object-position: 50% 85%`):** Low-angle perspectives, seated ceremonies, or decorative foreground floral arrangements.

---

## 4. Layout-Specific Portrait Integration

1. **`DigitalYesLayout`:** Features a dedicated 3:4 aspect-ratio couple portrait card bordered in gold foil and framed beneath the ceremonial blessing message.
2. **`EmeraldLuxeLayout`:** Features an arched portrait frame on the front face of the 3D flip card, bordered with deep emerald and Koupreng gold.
3. **`EventEssentialLayout`:** Displays the uploaded cover photo at the top of the event card in a responsive 16:9 frame with subtle border elevation.
4. **`KhmerCelestialLayout`:** Prioritizes `content.couplePhoto` in the featured couple portrait card.
5. **`SilkHeritageLayout` & `CanvaKhmerWeddingTemplate`:** Strictly preserve traditional Cambodian silk tapestries and golden Kbach frames as the default cover backdrop.
