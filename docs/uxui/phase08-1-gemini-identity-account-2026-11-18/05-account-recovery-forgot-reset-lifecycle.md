# 05 — Account Recovery: Forgot & Reset Lifecycle

## Implementation Details for Recovery Flows and Lifecycle Discrepancies

### 1. The Phone Registration vs. Email Recovery Discrepancy
In KoupReng's current backend architecture:
- **Registration** (`/api/auth/register`) registers accounts using **phone numbers**.
- **Password Recovery** (`/api/auth/forgot-password`) takes an **email address** and triggers an email reset token.

If a user registered solely with their Cambodian phone number, submitting `/forgot-password` could lead to confusion if their email is not linked.

#### Resolution Delivered:
1. **Phone User Guidance Card (`.auth-recovery-hint`):**
   - Directly underneath the email input, a dedicated Silk & Ink recovery hint card is displayed:
     > "Registered with a phone number? If you didn't add an email to your account, please contact our Telegram support team to verify your identity and reset your access." / "បានចុះឈ្មោះជាមួយលេខទូរស័ព្ទ? ប្រសិនបើអ្នកមិនបានភ្ជាប់អ៊ីមែលទេ សូមទាក់ទងមកកាន់ក្រុមការងារ Telegram ដើម្បីផ្ទៀងផ្ទាត់ និងកំណត់ពាក្យសម្ងាត់ឡើងវិញ។"
   - Includes a direct link to Telegram merchant support.
2. **Privacy-Neutral Success Notification:**
   - Once submitted, the screen presents a privacy-preserving success card (`.auth-success-card`):
     > "If an account exists for that email, we have sent password reset instructions. Please check your inbox and spam folder."
   - This prevents malicious actors from enumerating valid registered email addresses.
3. **Local Dev & Testing Continuation Link:**
   - In non-production environments, if the backend returns a `resetToken` in the response payload, an inline developer shortcut is displayed:
     > "Enter reset code directly" (`/reset-password?token=...`).

### 2. Password Reset Surface (`ResetPasswordFeature.jsx`)

#### Features Delivered:
- **URL Token Auto-Prefill:** Automatically reads `?token=...` from `location.search` and prefills the token input, allowing direct continuation from email links.
- **Accessible Toggles:** Both "New Password" and "Confirm New Password" inputs include accessible show/hide eye toggle buttons with caret retention.
- **Client-Side Mismatch Gate:** Blocks form submission if the new password does not match the confirmation, displaying a clear alert.
- **Successful Reset Card:** Displays a prominent success card with an immediate call to action to sign in with the new credentials.
