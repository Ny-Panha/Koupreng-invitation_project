import { useEffect, useId, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { KeyRound, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";
import authService from "./api/authApi";
import AuthLayout from "./components/AuthLayout";
import { useLanguageStore } from "../../stores/useLanguageStore";
import "./AuthPage.css";
import { safeAuthRedirect } from './safeRedirect';
import { isAccountPasswordValid } from './accountPasswordPolicy';
import AccountPasswordGuidance from './components/AccountPasswordGuidance';
import { useAuthStore } from '../../stores/useAuthStore';
import { useT } from '../../shared/i18n/useT';

export default function ResetPasswordPage() {
  const tokenId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const errorId = useId();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tokenFromLink, setTokenFromLink] = useState(() => Boolean(searchParams.get('token')));
  const [token, setToken] = useState(searchParams.get("token") || "");
  useEffect(() => {
    if (!searchParams.has('token')) return;
    const clean = new URLSearchParams(searchParams);
    clean.delete('token');
    setSearchParams(clean, { replace: true });
  }, [searchParams, setSearchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const active = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);

  const lang = useLanguageStore((state) => state.lang);
  const { auth } = useT();
  const isKm = lang === "km";
  const copy = (km, en) => (lang === "en" ? en : km);
  const nextTarget = safeAuthRedirect(searchParams.get("next"));

  const mismatch = Boolean(confirm) && password !== confirm;
  const passwordValid = isAccountPasswordValid(password);

  const submit = async (event) => {
    event.preventDefault();
    if (loading || success) return;
    setError("");
    setServerMessage("");

    if (!token.trim() || token.length > 255) {
      setError(copy("សូមបញ្ចូល Reset Token ពីអ៊ីមែលរបស់អ្នក", "Reset token is required"));
      return;
    }
    if (!passwordValid || !confirm) {
      setError(auth('passwordRequirementsError'));
      return;
    }
    if (mismatch) {
      setError(copy("លេខសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ", "Passwords do not match"));
      return;
    }

    setLoading(true);
    const sessionUserId = useAuthStore.getState().user?.id;
    try {
      const response = await authService.resetPassword(token.trim(), password);
      if (!active.current) return;
      setServerMessage(
        response?.message ||
          copy("បានកំណត់លេខសម្ងាត់ថ្មីដោយជោគជ័យ។", "Password reset successfully.")
      );
      setSuccess(true);
      setPassword("");
      setConfirm("");
      setToken('');
      if (useAuthStore.getState().user?.id === sessionUserId) useAuthStore.getState().invalidateSession(true);
    } catch (err) {
      if (!active.current) return;
      setError(
        err.message ||
          copy(
            "មិនអាចកំណត់លេខសម្ងាត់បានទេ។ សូមពិនិត្យលេខកូដ Token ម្តងទៀត។",
            "Could not reset password. Please verify the reset token."
          )
      );
    } finally {
      if (active.current) setLoading(false);
    }
  };

  const loginUrl = nextTarget ? `/login?next=${encodeURIComponent(nextTarget)}` : "/login";

  return (
    <AuthLayout>
      <div className="auth-card">
        {!success ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">
                {copy("កំណត់លេខសម្ងាត់ថ្មី", "Set new password")}
              </h1>
              <p className="auth-subtitle">
                {copy(
                  "សូមបញ្ចូល Reset Token ដែលបានទទួលក្នុងអ៊ីមែលរបស់អ្នក និងបង្កើតលេខសម្ងាត់ថ្មី។",
                  "Enter the reset token from your email and choose a new password."
                )}
              </p>
            </div>

            {error && (
              <p id={errorId} className="auth-error" role="alert">
                {error}
              </p>
            )}
            {tokenFromLink && <button type="button" className="auth-home-link" onClick={() => { setToken(''); setTokenFromLink(false); setError(''); }} disabled={loading}>
              {copy('លេខកូដសម្ងាត់ (Reset Token)', 'Enter another reset token')}
            </button>}

            <form onSubmit={submit} className="auth-form" aria-busy={loading}>
              {!tokenFromLink && <div className="auth-field">
                <label htmlFor={tokenId} className="auth-label">
                  {copy("លេខកូដសម្ងាត់ (Reset Token)", "Reset token")}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id={tokenId}
                    type="password"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder={copy("បិទភ្ជាប់លេខកូដពីអ៊ីមែល", "Paste reset token from email")}
                    required
                    className="auth-input"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={255}
                    aria-describedby={error ? errorId : undefined}
                  />
                </div>
              </div>}

              <div className="auth-field">
                <label htmlFor={passwordId} className="auth-label">
                  {copy("លេខសម្ងាត់ថ្មី", "New password")}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id={passwordId}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={copy("យ៉ាងតិច ៨ តួអក្សរ", "At least 8 characters")}
                    required
                    minLength={8}
                    maxLength={100}
                    autoComplete="new-password"
                    aria-describedby="reset-password-hint"
                    aria-invalid={Boolean(password) && !passwordValid}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="auth-eye-btn"
                    aria-label={
                      showPassword
                        ? isKm
                          ? "លាក់ពាក្យសម្ងាត់"
                          : "Hide password"
                        : isKm
                        ? "បង្ហាញពាក្យសម្ងាត់"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                <AccountPasswordGuidance id="reset-password-hint" value={password} />
              </div>

              <div className="auth-field">
                <label htmlFor={confirmId} className="auth-label">
                  {copy("បញ្ជាក់លេខសម្ងាត់ថ្មី", "Confirm new password")}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id={confirmId}
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder={copy("បញ្ចូលលេខសម្ងាត់ម្តងទៀត", "Repeat new password")}
                    required
                    autoComplete="new-password"
                    className={`auth-input${mismatch ? " error" : ""}`}
                    aria-invalid={mismatch}
                    aria-describedby={mismatch ? `${confirmId}-mismatch` : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="auth-eye-btn"
                    aria-label={
                      showConfirm
                        ? isKm
                          ? "លាក់ពាក្យសម្ងាត់"
                          : "Hide password"
                        : isKm
                        ? "បង្ហាញពាក្យសម្ងាត់"
                        : "Show password"
                    }
                    aria-pressed={showConfirm}
                  >
                    {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                {mismatch && (
                  <p id={`${confirmId}-mismatch`} className="auth-error-msg" role="status">
                    {copy("លេខសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ", "Passwords do not match")}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading || Boolean(mismatch) || !token.trim() || token.length > 255 || !passwordValid || !confirm}
              >
                <KeyRound size={16} aria-hidden="true" />
                <span>
                  {loading
                    ? copy("កំពុងកំណត់...", "Updating password...")
                    : copy("កំណត់លេខសម្ងាត់ឡើងវិញ", "Update password")}
                </span>
              </button>
            </form>

            <div className="auth-back">
              <Link to={loginUrl} className="auth-home-link">
                <span>{copy("← ត្រឡប់ទៅចូលគណនី", "← Back to sign in")}</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="auth-success" role="status">
            <div className="auth-success-icon">
              <CheckCircle2 size={36} aria-hidden="true" />
            </div>

            <div className="auth-success-content">
              <h2 className="auth-success-title">
                {copy("បានប្តូរលេខសម្ងាត់ដោយជោគជ័យ", "Password updated successfully")}
              </h2>
              <p className="auth-success-desc">
                {serverMessage}
              </p>
            </div>

            <Link
              to={loginUrl}
              className="auth-submit"
              style={{ textDecoration: "none" }}
            >
              <span>{copy("ចូលគណនីឥឡូវនេះ", "Sign in now")}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
