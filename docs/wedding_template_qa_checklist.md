# Koupreng Wedding Template QA Checklists

This document contains manual QA checklists for validating the **Royal Khmer Wedding** template.

---

# Royal Khmer Wedding Template QA Checklist

Manual checklist for validating the **Royal Khmer Wedding** template (`royal-khmer-wedding`).

## 1. Builder & Customization Flow
- [ ] **Open Template Detail**:
  - [ ] Navigate to the template selection grid.
  - [ ] Locate the "Royal Khmer Wedding" template card (labeled "រាជហង្សខ្មែរ").
  - [ ] Click "Use this template" or preview option.
- [ ] **Fill Form**:
  - [ ] Modify couple details (Groom: សុវណ្ណ, Bride: បុប្ផា).
  - [ ] Set Event Date & times.
  - [ ] Set Venue name & address.
  - [ ] Add Google Maps URL.
  - [ ] Upload at least one cover image & gallery image.
  - [ ] Toggle sections (Story, Gallery, Timeline).
  - [ ] Choose primary color `#FFF8F0` and accent `#C8A24A`.
- [ ] **Preview**:
  - [ ] Click the "Preview" button.
  - [ ] Verify that the preview loads a mobile device frame rendering the exact template design.
  - [ ] Verify that typography (Playfair Display for English, Noto Sans Khmer or Hanuman for Khmer) is correctly applied.
- [ ] **Save Draft**:
  - [ ] Click "Save Draft".
  - [ ] Verify success notification.
- [ ] **Reload Draft**:
  - [ ] Refresh the page or navigate away and back to the draft builder.
  - [ ] Verify all customized inputs are preserved.
- [ ] **Publish**:
  - [ ] Click "Publish".
  - [ ] Verify database state changes from `DRAFT` to `PUBLISHED` (via visual check or public page access).
- [ ] **Copy Link**:
  - [ ] Click "Copy Invitation Link".
  - [ ] Verify clipboard receives the slug-based URL (e.g. `http://.../invitation/wedding-of-sovann-bopha`).

## 2. Public Invitation Page
- [ ] **Open Public Link**:
  - [ ] Open the copied URL in an incognito window or separate browser session.
  - [ ] Verify it loads the **Royal Khmer Wedding** layout instead of the default layout.
- [ ] **Mobile 360px Test**:
  - [ ] Open developer tools, select responsive mode, and resize to 360px width.
  - [ ] Verify there is no horizontal scroll or layout break.
- [ ] **Khmer Text Test**:
  - [ ] Verify Khmer fonts render beautifully without glyph truncation.
  - [ ] Verify localized text content (កូនក្រមុំ, កូនកំលោះ, ទីតាំង, ឆ្លើយតប) aligns correctly.
- [ ] **English Text Test**:
  - [ ] Toggle language to English (EN).
  - [ ] Verify Playfair Display / Cormorant Garamond is applied to English couple names.
- [ ] **Map Link Test**:
  - [ ] Locate the venue details card and bottom sticky bar.
  - [ ] Click the "Direction" button.
  - [ ] Verify it opens Google Maps with the correct coordinates/search query.
- [ ] **Gallery Empty State**:
  - [ ] Create an invitation without uploading any gallery images.
  - [ ] Verify that the gallery section handles this case gracefully (empty state placeholder in Khmer/English).
- [ ] **Music Button Test**:
  - [ ] Verify background music does NOT autoplay on page load.
  - [ ] Click the music play button.
  - [ ] Verify music starts playing, and clicking it again pauses it.

## 3. RSVP & Interactions
- [ ] **RSVP Submission**:
  - [ ] Fill the public RSVP form (Name, Attending status, count, and blessing message).
  - [ ] Click "Submit RSVP".
  - [ ] Verify the success panel is displayed.
- [ ] **Wishes Wall / Blessings**:
  - [ ] Verify that the blessing message submitted in the RSVP form is immediately displayed on the Wishes Wall section.
  - [ ] Verify duplicate RSVP attempts are handled or prevented gracefully.
- [ ] **Private Invitation Access**:
  - [ ] Set invitation visibility to PRIVATE and set an access password.
  - [ ] Open the public URL.
  - [ ] Verify the "Protected Gate" login card is shown.
  - [ ] Input wrong password and verify error is shown.
  - [ ] Input correct password and verify the invitation renders successfully.
