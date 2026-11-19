# Chapter 06 — Template Cards, Media & Ownership Status Audit

## 1. Card Anatomy & Semantic Integrity

- **Image Container (`.tp-image-box` / `.kp-design-media`):** 3.5:4.5 aspect ratio, rounded corners, subtle hover scale.
- **Accessibility:** Image link includes comprehensive accessible label (`aria-label="Preview design [Name]"`). Alt text is provided on informative template thumbnails.
- **Media Fallback:** Broken image URLs trigger `onError` and gracefully render `ImageOff` placeholder without layout shift.
- **No Interactive Nesting:** The card separates the media preview anchor from secondary action buttons (`kp-action-use` and `kp-action-preview`), preventing invalid nested interactive elements.

## 2. Truthful Status Taxonomy

- **Free Design:** `!template.isPremium && template.live` -> Free badge.
- **Premium Design:** `template.isPremium` -> Premium badge with sparkles icon and formatted price.
- **Demo Design:** `!template.live` -> Demo badge; copy states "Preview only".
- **Owned Design:** `template.isOwned === true` via backend payment verification -> Purchased badge (`បានទិញ`). Never inferred from client storage or ABA redirect.
