import { useUiCopy } from "../../shared/i18n/useUiCopy";
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
  const [message, setMessage] = useState(false);

  const mismatch = confirm && newPassword !== confirm;
  const isTooShort = newPassword.length > 0 && newPassword.length < 8;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage(false);

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

        {error && (
          <div className="dash-alert is-error" role="alert">
            {error === "passwordTooShort"
              ? uiCopy("ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ។", "New password must be at least 8 characters.")
              : error === "passwordMismatch"
              ? uiCopy("ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។", "Passwords do not match.")
              : error}
          </div>
        )}
        {message && (
          <div className="dash-alert" role="status" aria-live="polite">
            {uiCopy("បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ។", "Password changed successfully.")}
          </div>
        )}

        <form onSubmit={submit} className="dash-form" noValidate>
          <div className="dash-field-group">
            <label htmlFor={oldId} className="dash-label">
              {uiCopy("ពាក្យសម្ងាត់បច្ចុប្បន្ន", "Current password")}
            </label>
            <input
              id={oldId}
              className="dash-input"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              required
            />
          </div>

          <div className="dash-field-group">
            <label htmlFor={newId} className="dash-label">
              {uiCopy("ពាក្យសម្ងាត់ថ្មី", "New password")}
            </label>
            <input
              id={newId}
              className="dash-input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              aria-invalid={isTooShort ? "true" : "false"}
              required
            />
            <span className="dash-requirement">
              {uiCopy("យ៉ាងតិច ៨ តួអក្សរ", "Must be at least 8 characters")}
            </span>
          </div>

          <div className="dash-field-group">
            <label htmlFor={confirmId} className="dash-label">
              {uiCopy("បញ្ជាក់ពាក្យសម្ងាត់ថ្មី", "Confirm new password")}
            </label>
            <input
              id={confirmId}
              className="dash-input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              aria-invalid={mismatch ? "true" : "false"}
              required
            />
          </div>

          {mismatch && (
            <div className="dash-alert is-error" role="alert">
              {uiCopy("ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។", "Passwords do not match.")}
            </div>
          )}

          <button
            type="submit"
            className="dash-btn"
            disabled={saving || !!mismatch || !oldPassword || !newPassword || !confirm}
          >
            {saving
              ? uiCopy("កំពុងរក្សាទុក...", "Saving...")
              : uiCopy("ប្តូរពាក្យសម្ងាត់", "Change password")}
          </button>
        </form>
      </section>

      <style>{`
        .dash-main {
          min-height: 80vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 16px 80px;
          background: var(--ui-canvas, #faf7f2);
          color: var(--ui-ink, #1f2937);
          box-sizing: border-box;
          font-family: 'Kantumruy Pro', sans-serif;
        }
        .dash-panel {
          width: 100%;
          max-width: 560px;
          background: var(--ui-card, #ffffff);
          border: 1px solid var(--ui-card-border, rgba(176, 146, 106, 0.25));
          border-radius: 16px;
          padding: 32px 28px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
        }
        .dash-section-head h1 {
          font-size: 24px;
          font-weight: 700;
          color: var(--ui-ink, #1f2937);
          margin: 0 0 8px 0;
          line-height: 1.3;
        }
        .dash-section-head p {
          font-size: 14px;
          color: var(--ui-muted, #6b7280);
          margin: 0 0 24px 0;
        }
        .dash-alert {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .dash-alert.is-error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .dash-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .dash-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .dash-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--ui-ink, #374151);
        }
        .dash-input {
          width: 100%;
          height: 48px;
          min-height: 48px;
          padding: 12px 16px;
          border: 1.5px solid var(--ui-control-border, #d1d5db);
          border-radius: 10px;
          font-size: 15px;
          background: var(--ui-surface, #ffffff);
          color: var(--ui-ink, #111827);
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dash-input:focus {
          border-color: var(--ui-action, #B0926A);
          box-shadow: 0 0 0 3px rgba(176, 146, 106, 0.2);
          outline: none;
        }
        .dash-requirement {
          font-size: 12px;
          color: var(--ui-muted, #6b7280);
          margin-top: 2px;
        }
        .dash-btn {
          width: 100%;
          height: 48px;
          min-height: 48px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          background: var(--ui-action, #B0926A);
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
          margin-top: 8px;
        }
        .dash-btn:hover:not(:disabled) {
          background: var(--ui-action-hover, #9c7f56);
        }
        .dash-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        [data-theme="dark"] .dash-main,
        .dark .dash-main {
          background: var(--ui-canvas, #121212);
          color: var(--ui-ink, #f3f4f6);
        }
        [data-theme="dark"] .dash-panel,
        .dark .dash-panel {
          background: var(--ui-card, #1e1e1e);
          border-color: var(--ui-card-border, #333333);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }
        [data-theme="dark"] .dash-section-head h1,
        .dark .dash-section-head h1 {
          color: var(--ui-ink, #f9fafb);
        }
        [data-theme="dark"] .dash-section-head p,
        .dark .dash-section-head p {
          color: var(--ui-muted, #9ca3af);
        }
        [data-theme="dark"] .dash-label,
        .dark .dash-label {
          color: var(--ui-ink, #e5e7eb);
        }
        [data-theme="dark"] .dash-input,
        .dark .dash-input {
          background: var(--ui-surface, #2a2a2a);
          border-color: var(--ui-control-border, #444444);
          color: var(--ui-ink, #f9fafb);
        }
        [data-theme="dark"] .dash-alert,
        .dark .dash-alert {
          background: rgba(6, 95, 70, 0.2);
          color: #6ee7b7;
          border-color: rgba(167, 243, 208, 0.3);
        }
        [data-theme="dark"] .dash-alert.is-error,
        .dark .dash-alert.is-error {
          background: rgba(153, 27, 27, 0.2);
          color: #fca5a5;
          border-color: rgba(254, 202, 202, 0.3);
        }
      `}</style>
    </main>
  );
}
