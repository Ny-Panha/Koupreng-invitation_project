# Workstream C — Personalized Invitation Sharing & Delivery Architecture

## 1. Overview & Route Architecture

- **Primary Route:** `/app/events/:eventId/delivery`
- **Key Modules:**
  - `InvitationDeliveryManager.jsx`: Delivery dashboard and bulk recipient manager.
  - `GuestRowActions.jsx`: Individual row action disclosure menu.
  - `deliveryApi.js` & `InvitationDeliveryController.java`: Backend integration endpoints.

---

## 2. Multi-Channel Sharing Protocols

1. **Telegram Share Composer:**
   - Link format: `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareMessage)}`
   - Direct integration opens Telegram app or web client with pre-filled Khmer wedding announcement and personalized guest token link.
2. **WhatsApp Share Composer:**
   - Link format: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + '\n' + inviteUrl)}`
   - Added in Phase 09 to accommodate guests communicating over WhatsApp.
3. **Native Web Share API:**
   - Uses `navigator.share({ title, text, url })` on supported mobile devices (iOS Safari, Android Chrome).
   - Allows users to share directly to Instagram DMs, Facebook Messenger, Viber, SMS, or Telegram without navigating away.
4. **Copy Message & Link:**
   - Fallback copy to clipboard using `navigator.clipboard.writeText` with toast feedback.

---

## 3. Delivery Status Correctness

Per Phase 09 standards, UI statuses strictly align with backend reality:

| Status Code | UI Label (Khmer / English) | Meaning |
| :--- | :--- | :--- |
| `NOT_READY` | មិនទាន់រួចរាល់ / Not ready | Guest missing phone or email contact |
| `LINK_GENERATED` | រួចរាល់ / Link generated | Personalized token URL generated and ready |
| `SENT` | បានផ្ញើ / Sent | Submitted to email provider or manually marked as shared |
| `OPENED` | បានបើក / Opened | Guest opened the invitation link |
| `RESPONDED` | បានឆ្លើយតប / Responded | Guest submitted RSVP |
| `FAILED` | បរាជ័យ / Failed | Delivery attempt failed |

### Manual "Mark as Shared" Distinction
A copied link or opened share composer does not guarantee receipt by the guest. In `GuestRowActions.jsx`, the action is explicitly titled:
- English: `Mark as shared (manual record)`
- Khmer: `សម្គាល់ថាបានចែករំលែក (កត់ត្រាដោយដៃ)`
This ensures hosts understand that this records personal tracking, not provider-verified delivery.
