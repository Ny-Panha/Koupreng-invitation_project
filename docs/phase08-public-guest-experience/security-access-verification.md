# Security & Public Access Verification

## 1. Access State Matrix

The public invitation endpoint (`/w/:slug` and `/i/:slug`) enforces strict server-authoritative state checks:

| Access State | Server Condition | Client UI Presentation | Security Safeguards |
| :--- | :--- | :--- | :--- |
| **Published** | `status === 'PUBLISHED'` or `published !== false` | Full interactive wedding invitation with enabled sections and RSVP. | Zero sensitive internal metadata exposed; only public and authorized guest content rendered. |
| **Unpublished** | `status === 'DRAFT'` or host temporarily unpublished | [`PublicUnavailableView`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/wedding-site/PublicInvitationFeature.jsx) with lock badge ("សន្លឹកការមិនទាន់បានផ្សព្វផ្សាយ"). | Completely blocks invitation content, timeline, and couple details. If authenticated owner, provides link to dashboard. |
| **Not Found** | Slug does not exist in backend database | [`PublicUnavailableView`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/wedding-site/PublicInvitationFeature.jsx) with search badge ("រកសន្លឹកការមិនឃើញ"). | Clean bilingual error message without revealing internal stack traces or system architecture. |
| **Password Protected** | Event configured with password, HTTP 403 response | [`ProtectedInvitationGate`](file:///d:/Koupreng-invitation_project/apps/frontend-user/src/features/wedding-site/PublicInvitationFeature.jsx) password prompt form. | Password verification handled via `invitationService.verifyPublicAccess()`. Verified access token cached in session storage. |
| **Personalized Guest** | Valid `?token=...` query parameter provided | Displays guest's personalized name, salutation, table, and seat badges. | Guest token validated against backend; never written to public URLs or external analytics. |

---

## 2. Guest Token Privacy & Leakage Safeguards

1. **Referrer Stripping:**
   Public invitation pages and ticket access components output strict privacy headers:
   ```html
   <meta name="referrer" content="no-referrer" />
   <meta name="robots" content="noindex,nofollow" />
   ```
   This prevents search engine web crawlers from indexing private wedding invitations and blocks referral leaks of `?token=...` when external links are clicked.

2. **External Link Sanitization:**
   All venue directions and map links are filtered through `safeDirections`:
   ```javascript
   export function safeDirections(value) {
     try {
       const url = new URL(value);
       return url.protocol === "https:" &&
         ["google.com", "www.google.com", "maps.google.com", "google.com.kh", "maps.app.goo.gl", "goo.gl"].includes(url.hostname) &&
         !url.username && !url.password ? url.href : "";
     } catch {
       return "";
     }
   }
   ```
   This strictly prevents javascript:, data:, or untrusted third-party phishing redirects.

3. **No Cross-Contamination with Local Drafts:**
   When a public guest visits an invitation from their own device, the application strictly relies on server-authoritative API responses (`invitationService.publicBySlug`), ensuring that uncommitted local browser drafts from another user are never rendered or leaked to the public.
