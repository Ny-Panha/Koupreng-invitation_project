# Report 18: Pre-Wedding Video & Media Field Handling Audit

> **Target:** `PreWeddingVideoEditor.jsx`, Video Embed Sanitization & Audio Presets  
> **Auditor:** Codex (Senior Media Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Video Embed Parsing & URL Sanitization

`PreWeddingVideoEditor.jsx` allows couples to showcase their cinematic pre-wedding shoot video. 

### Supported URL Schemas
- YouTube standard watch URLs: `https://www.youtube.com/watch?v=VIDEO_ID`
- YouTube short links: `https://youtu.be/VIDEO_ID`
- YouTube embed links: `https://www.youtube.com/embed/VIDEO_ID`
- Vimeo URLs: `https://vimeo.com/VIDEO_ID`

### Security Sanitization
- `sanitizeUrl` checks strip invalid protocols (`javascript:`, `data:`, `file:`) and ensure that only approved video embed hostnames are rendered inside the preview simulator iframe.
- Prevents cross-site scripting (XSS) via maliciously crafted video links.

---

## 2. Background Audio & Instrumental Presets

The audio controls in `InvitationForm.jsx` provide:
- **Royalty-Free Instrumental Library:**
  - `ថ្ងៃដែលរង់ចាំ` (The Day We Awaited - Traditional Wedding Melody)
  - `Instrumental Wedding Music` (VioSounds Romantic Cover)
- **Custom Audio URL:** Couples can paste external MP3/M4A links for custom audio tracks.
- **Autoplay Compliance:** Background audio defaults to muted or user-gesture initiation, complying with iOS Safari and Android autoplay policies.
