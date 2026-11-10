# Template Renderer Compatibility & Capabilities Matrix

## Active Production Template Catalog

Koupreng features ten active, production-grade template renderers, each offering a distinct aesthetic, cultural tone, and interactive choreography:

| Template Code & Slug | Cultural Aesthetic | Opening Choreography | Photo Integration Behavior | Decorative Artwork Handling | Audio / Media Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`khmer-floral-gold`** | Contemporary Khmer Wedding with golden flora & Kbach borders | Dual-phase floral unsealing with petal & butterfly particle ambience | Photo mapped to `couplePhoto` & hero cover with focal point alignment | Golden ornate floral borders frame the couple portrait | Background music with floating toggle, optional cinematic video intro |
| **`royal-garden-cinematic`** | Royal Palace Garden luxury with palace archways & velvet textures | Cinematic entrance video with smooth dissolve into royal invitation | Photo mapped to `--rg-environment-photo` & couple portrait scene | Royal architectural archways preserved as structural framing | Synchronized soundtrack with auto-fade, replayable entrance film |
| **`khmer-celestial`** | Constellation & Starlight celestial editorial | Starlight constellation reveal with glowing celestial markers | Photo mapped to `couplePhoto` & featured couple portrait card | Celestial night-sky canvas and traditional Khmer zodiac motifs | Floating starlight audio player, interactive love story chapters |
| **`silk-heritage`** | Traditional Cambodian Silk Tapestry (*Phamuong* & *Hol*) | Traditional folding folio card with silk texture borders | **Preserved:** Traditional silk tapestry remains default cover | Traditional silk artwork strictly preserved; user photos rendered in gallery | Traditional instrumental Pinpeat audio support |
| **`the-digital-yes-wedding`** | Minimalist Modern Luxury with deep crimson & gold foil | 3D interactive wax seal break with letter emergence animation | Photo mapped to dedicated couple portrait card with gold foil border | Minimalist geometric accents and foil typography preserved | Floating audio player, falling rose petals effect, interactive RSVP drawer |
| **`emerald-luxe`** | High-end evening gala in deep royal emerald & bronze gold | Theatrical velvet curtain parting with golden spotlight reveal | Photo mapped to 3D flip card front in arched gold portrait frame | Rich emerald textures and Kbach corner flourishes preserved | Integrated audio player, 3D card flip interaction |
| **`bliss-editorial-wedding`** | High-Fashion Editorial (*Vogue* / *Harper's Bazaar* spread) | Asymmetrical magazine split-screen with editorial typography | Photo mapped to split-screen hero via `CoverBackground` | Clean editorial typography and minimalist borders preserved | Floating music player, asymmetrical photo gallery spread |
| **`withjoy-modern-portal`** | Contemporary interactive event portal with glassmorphism | Sticky glassmorphic navbar with smooth scroll section anchors | Photo mapped to full-width portal hero via `CoverBackground` | Frosted glass cards and modern card shadows preserved | Ambient background track, interactive countdown clock |
| **`cover-khmer-golden-wedding`** | Traditional Golden Kbach Luxury ceremonial invitation | Traditional golden gate open with ornate Kbach patterns | **Preserved:** Traditional golden Kbach frame remains default cover | Golden ornate border frame strictly preserved | Traditional ceremonial music, digital envelope QR |
| **`event-essential`** | Clean, accessible universal baseline for social & corporate events | Direct clean card presentation with immediate content focus | Photo rendered at top of event card in responsive 16:9 aspect ratio | Clean minimal cards with Koupreng gold accent badges | Lightweight audio player, multi-day schedule timeline |

---

## Architectural Verification Rules

1. **Strict Renderer Isolation:** Each template layout operates as an independent, encapsulated React component mapped through `templateRegistry.js`.
2. **Unified Data Adapter:** All templates consume standardized data models produced by `publicInvitationToDraft` and `draftToTemplate`.
3. **Graceful Fallbacks:** Missing optional sections (e.g. absent story chapters, omitted dress code colors, disabled RSVP) collapse cleanly without leaving empty white boxes or layout gaps.
4. **Accessible Alternative Views:** All animated openings provide a prominent, accessible "Skip" button and instantaneously render without motion when `prefers-reduced-motion: reduce` is detected.
