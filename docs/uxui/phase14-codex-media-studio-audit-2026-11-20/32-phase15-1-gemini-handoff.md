# Phase 14 Codex Audit — Report 32: Phase 15.1 Gemini Handoff

## 1. Scope Boundary for Phase 15.1
Phase 15.1 owns the **Public Preview, Review, and Publishing Experience**:
- Canonical event URL, public slug, and QR code generation.
- Access mode controls: Public, Password-protected, and Private Guest-token access.
- Publish validation rules (verifying couple names, date, venue, and required media).
- Public guest view and authenticated owner preview fidelity.
- Mobile share sheets, Telegram / WhatsApp invite dispatch handoffs.
- Unpublish and expired invitation states.

## 2. Invariants Provided by Phase 14
- Confirmed media records are referenced via `MediaFile` IDs and canonical URLs.
- Local drafts (`wed-*`) must be saved to the server before publication is permitted.
- In-use media assets are tracked in `invitationMediaReferences`.
- Free tier video restrictions and pre-wedding video access tokens must be honored.
- Published baseline SHA will serve as the starting reference for Phase 15.1.
- **Standing rule:** Phase 15.1 must implement locally and leave changes uncommitted for Codex 15 independent audit.
