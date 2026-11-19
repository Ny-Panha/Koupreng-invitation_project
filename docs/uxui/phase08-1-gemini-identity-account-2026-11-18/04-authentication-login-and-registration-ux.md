# 04 — Authentication Login & Registration UX

## Implementation Details for `/login` and `/register`

### 1. Login Surface (`LoginFeature.jsx`)
The login screen serves both phone and email credentials.

#### Accessible Password Visibility Toggle
- Integrated custom password toggle button `.auth-password-toggle` with `Eye` and `EyeOff` icons.
- **Focus & Caret Retention:** Added `onMouseDown={(e) => e.preventDefault()}` on the toggle button. In browser DOM events, clicking a button outside the text input blurs the input and resets caret position. Calling `preventDefault()` on `mousedown` prevents the input from losing focus while allowing `click` handler to toggle visibility seamlessly.
- **Screen Reader Announcements:** Toggle provides `aria-label={showPassword ? copy("Hide password", "លាក់ពាក្យសម្ងាត់") : copy("Show password", "បង្ហាញពាក្យសម្ងាត់")}` and `aria-pressed={showPassword}`.
- **Error State Semantics:** When submission fails, the error message container uses `role="alert"` and `id="login-error-alert"`. The password input dynamically sets `aria-invalid="true"` and `aria-describedby="login-error-alert"`.

#### Safe Return Destination (`redirectTo`)
- Preserves the `?next=...` query parameter across route transitions.
- If an unauthenticated user arrives with `?next=/templates/browse`, the registration link retains this context: `/register?next=%2Ftemplates%2Fbrowse`.
- Default destination `/app/events` is safely omitted from query strings to keep URLs clean.

### 2. Registration Surface (`RegisterFeature.jsx`)

#### Phone-Based Identity Policy Adherence
- KoupReng's backend registration contract requires `fullName`, `phone`, `password`, and `confirmPassword` (no email field in the DTO).
- The form adheres strictly to this contract without inventing an unsupported email registration input.
- Input fields enforce Cambodian phone number normalization patterns (`0xx xxx xxx` or `+855`).

#### Real-Time 5-Criterion Password Rule Checklist
- Evaluates password strength dynamically on input:
  1. Minimum 8 characters (`password.length >= 8`)
  2. Maximum 100 characters (`password.length <= 100`)
  3. At least one uppercase letter (Unicode `\p{Uppercase}` aware)
  4. At least one lowercase letter (Unicode `\p{Lowercase}` aware)
  5. At least one digit (Unicode `\p{Nd}` aware)
- Each item renders a green `Check` icon when satisfied or a muted `Circle` icon when unsatisfied.
- Text contrast exceeds WCAG 2.2 AA (4.5:1 ratio) in both light and dark themes.

#### Live Confirmation Status
- As the user types into the confirmation input, a real-time status badge indicates:
  - Match: "Passwords match" / "ពាក្យសម្ងាត់ត្រូវគ្នា" in semantic success green.
  - Mismatch: "Passwords do not match" / "ពាក្យសម្ងាត់មិនត្រូវគ្នា" in warning red.
- Prevents frustrating roundtrips to the server for basic typographical errors.
