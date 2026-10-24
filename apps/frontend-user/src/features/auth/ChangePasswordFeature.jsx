import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useId, useState } from "react";
import authService from "./api/authApi";

export default function ChangePasswordPage() {
  const uiCopy = useUiCopy();
  const oldId = useId();
  const newId = useId();
  const confirmId = useId();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const mismatch = confirm && newPassword !== confirm;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("passwordTooShort");
      return;
    }
    if (mismatch) {
      setError("passwordMismatch");
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      setMessage(true);
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || uiCopy("មិនអាចប្តូរពាក្យសម្ងាត់បានទេ។", "Could not change password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dash-main">
      <section className="dash-panel" style={{ maxWidth: 560 }}>
        <div className="dash-section-head">
          <div>
            <h1>{uiCopy("ប្តូរពាក្យសម្ងាត់", "Change password")}</h1>
            <p>{uiCopy("ប្តូរពាក្យសម្ងាត់គណនីរបស់អ្នក", "Update your account password")}</p>
          </div>
        </div>

        {error && <div className="dash-alert is-error">{error === "passwordTooShort" ? uiCopy("ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ។", "New password must be at least 8 characters.") : error === "passwordMismatch" ? uiCopy("ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។", "Passwords do not match.") : error}</div>}
        {message && <div className="dash-alert">{uiCopy("បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ។", "Password changed successfully.")}</div>}

        <form onSubmit={submit} className="dash-form">
          <label htmlFor={oldId}>
            {uiCopy("ពាក្យសម្ងាត់បច្ចុប្បន្ន", "Current password")}
            <input
              id={oldId}
              type="password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              required
            />
          </label>

          <label htmlFor={newId}>
            {uiCopy("ពាក្យសម្ងាត់ថ្មី", "New password")}
            <input
              id={newId}
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </label>

          <label htmlFor={confirmId}>
            {uiCopy("បញ្ជាក់ពាក្យសម្ងាត់ថ្មី", "Confirm new password")}
            <input
              id={confirmId}
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />
          </label>

          {mismatch && <div className="dash-alert is-error">{uiCopy("ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។", "Passwords do not match.")}</div>}

          <button type="submit" className="dash-btn" disabled={saving || !!mismatch}>
            {saving ? "Saving..." : uiCopy("ប្តូរពាក្យសម្ងាត់", "Change password")}
          </button>
        </form>
      </section>
    </main>
  );
}
