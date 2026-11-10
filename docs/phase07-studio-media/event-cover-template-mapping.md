# Event Cover Precedence & Template Photo Mapping Matrix

## 1. Event Cover Precedence Hierarchy

The canonical cover resolution logic in `apps/frontend-user/src/features/events/model/eventCover.js` enforces strict precedence to ensure uploaded photos are always displayed prominently across all event surfaces:

```
[Priority 1: HIGHEST]  Owner Uploaded Cover Photo
                       - event.coverUrl (when coverSource === "owner")
                       - event.media.coverImage.fileUrl
                             ↓
[Priority 2]           Studio Saved Custom Cover
                       - event.invitationCoverUrl
                       - contentJson.coverImage / designJson.coverImage
                             ↓
[Priority 3]           Template Default Artwork
                       - event.templateThumbnailUrl
                       - template.thumbnailUrl / template.image / template.phoneCoverImage
                             ↓
[Priority 4: LOWEST]   Universal Fallback
                       - EVENT_COVER_FALLBACK ("/templates/event-essential.svg")
```

When an event is created and its cover is uploaded through `mediaService.uploadCover(eventId, photoFile)`, the Spring Boot backend (`InvitationSummaryResponse.java`) attaches `coverUrl` with `coverSource = "owner"`. Consequently:
- Event cards in `/app/events` immediately display the couple/event photo.
- Event dashboard overview headers in `/app/events/:id` render the photo with high fidelity.
- Shared preview cards reflect the real event photo.

---

## 2. Template Capability & Photo Mapping Matrix

Koupreng features both photo-driven editorial templates and traditional ornamental decorative templates. Phase 07 defines an explicit capability and photo mapping matrix:

| Template Code | Primary Category | Photo Supported | Studio Photo Mapping Target | Preserves Default Decorative Artwork |
|---|---|---|---|---|
| `khmer-floral-gold` | Floral / Cultural | Yes | `coverImage` & `backgroundImage` (inner couple photo) | No (uses couple photo inside floral frame) |
| `khmer-celestial` / `royal-khmer-wedding` | Royal / Celestial | Yes | `coverBackgroundImage` (closed state) | Botanical frame (`backgroundImage`) preserved |
| `royal-garden-cinematic` | 3D Cinematic / Luxury | Yes | `coverImage` & `invitationImage` (couple portrait) | Wax seal & 3D unsealing ceremony preserved |
| `the-digital-yes-wedding` | Modern / Interactive | Yes | `couplePhoto` & `coverImage` | Modern typography & portal preserved |
| `emerald-luxe` / `emerald-canva-luxe-wedding` | Emerald Luxe | Yes | `couplePhoto` & `coverImage` | Emerald borders & typography preserved |
| `bliss-editorial-wedding` | Vogue Editorial | Yes | `coverImage` & `couplePhoto` | Editorial layout & typography preserved |
| `withjoy-modern-portal` | Digital Portal | Yes | `coverImage` (hero banner) & `couplePhoto` | Portal layout preserved |
| `silk-heritage` | Traditional Tapestry | **Decorative Only** | Template default silk tapestry (`coverImage`) | **Yes (Preserves silk artwork!)** |
| `cover-khmer-golden-wedding` | Golden Kbach | **Decorative Only** | Template default golden Kbach frame | **Yes (Preserves golden Kbach!)** |
| `event-essential` | Minimalist Card | Yes | `coverImage` | Minimalist structure preserved |

---

## 3. Implementation in `InvitationForm.jsx`

In `apps/frontend-user/src/features/invitations/InvitationForm.jsx`:

### Initialization:
```javascript
const tplCode = tpl?.code || tpl?.slug || String(activeTplId);
const isDecorativeTemplate = ['silk-heritage', 'cover-khmer-golden-wedding'].includes(tplCode);

// Decorative templates retain their artwork unless explicitly customized by user
const coverImage = isDecorativeTemplate
    ? ((!isDefaultCover && customParsed.coverImage) ? customParsed.coverImage : templateDefaultCover)
    : (uploadedCoverFromDraft || templateDefaultCover);

// Compatible templates map uploaded photo to couple portrait fields
const couplePhotoTemplates = ['the-digital-yes-wedding', 'emerald-luxe', 'emerald-canva-luxe-wedding', 'bliss-editorial-wedding', 'withjoy-modern-portal'];
const couplePhoto = customParsed.couplePhoto || invitation?.couplePhoto || (couplePhotoTemplates.includes(tplCode) && uploadedCover ? uploadedCover : (preset.couplePhoto || ""));

const cinematicTemplates = ['royal-garden-cinematic', 'khmer-floral-gold'];
const invitationImage = customParsed.invitationImage || invitation?.invitationImage || (cinematicTemplates.includes(tplCode) && uploadedCover ? uploadedCover : (preset.invitationImage || ""));
```

### Dynamic Template Switching:
When the user switches templates in the Studio:
```javascript
const isDecorativeSwitch = ['silk-heritage', 'cover-khmer-golden-wedding'].includes(template.code || template.slug);
nextForm.coverImage = isDecorativeSwitch ? nextForm.templateDefaultCover : (uploadedCoverUrl || nextForm.templateDefaultCover);
if (uploadedCoverUrl) {
    if (['the-digital-yes-wedding', 'emerald-luxe', 'emerald-canva-luxe-wedding', 'bliss-editorial-wedding', 'withjoy-modern-portal'].includes(template.code || template.slug)) {
        nextForm.couplePhoto = form.couplePhoto || uploadedCoverUrl;
    }
    if (['royal-garden-cinematic', 'khmer-floral-gold'].includes(template.code || template.slug)) {
        nextForm.invitationImage = form.invitationImage || uploadedCoverUrl;
    }
    if (template.code === 'khmer-floral-gold' && !form.backgroundImage) {
        nextForm.backgroundImage = uploadedCoverUrl;
    }
    if (String(template.code || template.slug || template.id).includes("celestial") && !form.coverBackgroundImage) {
        nextForm.coverBackgroundImage = uploadedCoverUrl;
    }
}
```

---

## 4. Verification Evidence

1. **Unit Test Suite:** `apps/frontend-user/src/features/invitations/TemplatePhotoMapping.test.jsx`
   - Verifies decorative artwork preservation for `silk-heritage`.
   - Verifies photo mapping for `khmer-floral-gold`.
2. **Cover Precedence Tests:** `apps/frontend-user/src/features/events/model/eventCover.test.js`
   - All 8 tests passed verifying owner cover precedence over template defaults and fallbacks.
