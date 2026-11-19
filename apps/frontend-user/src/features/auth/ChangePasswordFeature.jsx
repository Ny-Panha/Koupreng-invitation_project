import { useUiCopy } from "../../shared/i18n/useUiCopy";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import authService from "./api/authApi";
import { useAuth } from './hooks/useAuth';
import { isAccountPasswordValid } from './accountPasswordPolicy';
import AccountPasswordGuidance from './components/AccountPasswordGuidance';
import "./ChangePasswordFeature.css";

export default function ChangePasswordPage() {
  const uiCopy = useUiCopy();
  const { user, logout } = useAuth();
  const accountId = useRef(user?.id);
  const lang = useLanguageStore((state) => state.lang);
  const isKm = lang === "km";
  const oldId = useId();
  const newId = useId();
  const confirmId = useId();
  const errorId = useId();
  const guidanceId = useId();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(false);
  useLayoutEffect(() => {
    accountId.current = user?.id;
    setOldPassword(''); setNewPassword(''); setConfirm('');
    setShowOld(false); setShowNew(false); setShowConfirm(false);
    setSaving(false); setError(''); setMessage(false);
    return () => { accountId.current = null; };
  }, [user?.id]);

  const mismatch = Boolean(confirm) && newPassword !== confirm;
  const passwordValid = isAccountPasswordValid(newPassword);

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setError("");
    setMessage(false);

    if (!oldPassword.trim() || !confirm || !passwordValid) {
      setError("passwordTooShort");
      return;
    }
    if (mismatch) {
      setError("passwordMismatch");
      return;
    }

    setSaving(true);
    const requestAccountId = accountId.current;
    try {
      await authService.changePassword(oldPassword, newPassword);
      if (accountId.current !== requestAccountId) return;
      setMessage(true);
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
      void logout();
    } catch (err) {
      if (accountId.current === requestAccountId) setError(err.message || uiCopy("មិនអាចប្តូរពាក្យសម្ងាត់បានទេ។", "Could not change password."));
    } finally {
      if (accountId.current === requestAccountId) setSaving(false);
    }
  };

  const eyeLabel = (shown) =>
    shown
      ? isKm
        ? "លាក់ពាក្យសម្ងាត់"
        : "Hide password"
      : isKm
      ? "បង្ហាញពាក្យសម្ងាត់"
      : "Show password";

  return (
    <div className="account-password-page">
      <section className="dash-panel" aria-labelledby="change-password-heading">
        <div className="dash-section-head">
          <div>
            <h1 id="change-password-heading">{uiCopy("ប្តូរពាក្យសម្ងាត់", "Change password")}</h1>
            <p>{uiCopy("ប្តូរពាក្យសម្ងាត់គណនីរបស់អ្នក", "Update your account password")}</p>
          </div>
        </div>

        {error && (
          <div id={errorId} className="dash-alert is-error" role="alert">
            {error === "passwordTooShort"
              ? <AccountPasswordGuidance value={newPassword} />
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

        <form onSubmit={submit} className="dash-form" noValidate aria-busy={saving}>
          <div className="dash-field-group">
            <label htmlFor={oldId} className="dash-label">
              {uiCopy("ពាក្យសម្ងាត់បច្ចុប្បន្ន", "Current password")}
            </label>
            <div className="dash-input-wrap">
              <input
                id={oldId}
                className="dash-input"
                type={showOld ? "text" : "password"}
                autoComplete="current-password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="dash-eye-btn"
                onClick={() => setShowOld((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={eyeLabel(showOld)}
                aria-pressed={showOld}
              >
                {showOld ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="dash-field-group">
            <label htmlFor={newId} className="dash-label">
              {uiCopy("ពាក្យសម្ងាត់ថ្មី", "New password")}
            </label>
            <div className="dash-input-wrap">
              <input
                id={newId}
                className="dash-input"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                aria-invalid={Boolean(newPassword) && !passwordValid}
                aria-describedby={guidanceId}
                minLength={8}
                maxLength={100}
                required
              />
              <button
                type="button"
                className="dash-eye-btn"
                onClick={() => setShowNew((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={eyeLabel(showNew)}
                aria-pressed={showNew}
              >
                {showNew ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            <AccountPasswordGuidance id={guidanceId} value={newPassword} />
          </div>

          <div className="dash-field-group">
            <label htmlFor={confirmId} className="dash-label">
              {uiCopy("បញ្ជាក់ពាក្យសម្ងាត់ថ្មី", "Confirm new password")}
            </label>
            <div className="dash-input-wrap">
              <input
                id={confirmId}
                className={`dash-input${mismatch ? " error" : ""}`}
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                aria-invalid={mismatch ? "true" : "false"}
                aria-describedby={mismatch ? `${confirmId}-error` : undefined}
                required
              />
              <button
                type="button"
                className="dash-eye-btn"
                onClick={() => setShowConfirm((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={eyeLabel(showConfirm)}
                aria-pressed={showConfirm}
              >
                {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {mismatch && (
            <div id={`${confirmId}-error`} className="dash-alert is-error" role="alert">
              {uiCopy("ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។", "Passwords do not match.")}
            </div>
          )}

          <button
            type="submit"
            className="dash-btn"
            disabled={saving || message || Boolean(mismatch) || !oldPassword.trim() || !passwordValid || !confirm}
          >
            {saving
              ? uiCopy("កំពុងរក្សាទុក...", "Saving...")
              : uiCopy("ប្តូរពាក្យសម្ងាត់", "Change password")}
          </button>
        </form>
      </section>
    </div>
  );
}
