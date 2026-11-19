# 06 — Profile & Account Security Experience

## Implementation Details for `/app/profile`, `/app/change-password`, and Guard UX

### 1. Account Profile (`ProfileFeature.jsx`)

#### Scoped Stylesheet & Theme Parity
- Replaced inline `<style>` injection with `ProfileFeature.css`.
- Fully integrated with `--ui-theme-*` semantic tokens for 100% light/dark mode parity.
- Replaced raw non-semantic containers with accessible `<section className="profile-page" aria-labelledby="profile-heading">`.

#### Enhanced Interactions:
- Displays user identity details: full name, phone number, role badge, account creation timestamp.
- Allows editing profile details with immediate visual feedback (success toast / error alert).
- **Password Accordion with Eye Toggles:** The collapsible "Change Password" section in the profile now features accessible show/hide password buttons for current password, new password, and confirmation password.

### 2. Change Password Surface (`ChangePasswordFeature.jsx`)

#### Scoped Stylesheet & Modern Form Controls
- Replaced inline `<style>` injection with `ChangePasswordFeature.css`.
- Added accessible show/hide eye toggle buttons (`.dash-eye-btn`) across all three password inputs:
  1. Current Password
  2. New Password
  3. Confirm New Password
- Features full keyboard navigation, `aria-pressed`, and `onMouseDown={(e) => e.preventDefault()}` for caret retention.
- Replaced hardcoded inline styles with CSS classes tied to theme tokens.

### 3. Session Guard & Access Control (`RequireAuth.jsx`)

#### The Problem:
Previously, if a session verification request failed (`authStatus === "error"`), `RequireAuth` rendered an unstyled, raw text div that left the user stranded with no styling, no navigation back to safety, and no way to retry without manually reloading the browser.

#### The Solution:
Implemented an accessible, Silk & Ink session error card:
- **Visuals:** Contained within `.auth-session-error-container`, rendering an elevated card with a subtle warning border and amber/red `ShieldAlert` badge.
- **Actions:**
  - **Retry Action:** Primary button featuring a `RefreshCw` icon to re-trigger the session check (`window.location.reload()`).
  - **Back to Login Link:** Secondary button navigating safely back to `/login`.
- **Accessibility:** Wrapped in a container with `role="alert"` and clear bilingual Khmer/English messaging.
