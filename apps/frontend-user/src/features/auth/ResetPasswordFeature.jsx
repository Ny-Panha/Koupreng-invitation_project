import { useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { KeyRound, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";
import authService from "./api/authApi";
import AuthLayout from "./components/AuthLayout";
import { useLanguageStore } from "../../stores/useLanguageStore";
import "./AuthPage.css";

export default function ResetPasswordPage() {
  const tokenId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const lang = useLanguageStore((state) => state.lang);
  const copy = (km, en) => (lang === "en" ? en : km);

  const mismatch = Boolean(confirm) && password !== confirm;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setServerMessage("");

    if (!token.trim()) {
      setError(copy("សូមបញ្ចូល Reset Token ពីអ៊ីមែលរបស់អ្នក", "Reset token is required"));
      return;
    }
    if (password.length < 8) {
      setError(copy("លេខសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ", "Password must be at least 8 characters"));
      return;
    }
    if (mismatch) {
      setError(copy("លេខសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ", "Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(token.trim(), password);
      setServerMessage(
        response?.message ||
          copy("បានកំណត់លេខសម្ងាត់ថ្មីដោយជោគជ័យ។", "Password reset successfully.")
      );
      setSuccess(true);
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || copy("មិនអាចកំណត់លេខសម្ងាត់បានទេ។ សូមពិនិត្យលេខកូដ Token ម្តងទៀត។", "Could not reset password. Please verify the reset token."));
    } finally {
      setLoading(false);
    }
  };

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
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={submit} className="auth-form">
              <div className="auth-field">
                <label htmlFor={tokenId} className="auth-label">
                  {copy("លេខកូដសម្ងាត់ (Reset Token)", "Reset token")}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id={tokenId}
                    type="text"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder={copy("បិទភ្ជាប់លេខកូដពីអ៊ីមែល", "Paste reset token from email")}
                    required
                    className="auth-input"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="auth-eye-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="auth-eye-btn"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mismatch && (
                  <p className="auth-error-msg" role="status">
                    {copy("លេខសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ", "Passwords do not match")}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading || Boolean(mismatch) || !token.trim() || password.length < 8}
              >
                <KeyRound size={16} aria-hidden="true" />
                <span>
                  {loading
                    ? copy("កំពុងកំណត់...", "Updating password...")
                    : copy("កំណត់លេខសម្ងាត់ឡើងវិញ", "Update password")}
                </span>
              </button>
            </form>

            <div className="auth-back" style={{ marginTop: "20px" }}>
              <Link to="/login" className="auth-home-link">
                <span>{copy("← ត្រឡប់ទៅចូលគណនី", "← Back to sign in")}</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="auth-success" role="status">
            <div className="auth-success-icon" style={{ width: "64px", height: "64px", background: "rgba(46, 67, 58, 0.1)" }}>
              <CheckCircle2 size={36} color="#2E433A" aria-hidden="true" />
            </div>

            <div style={{ margin: "16px 0 20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#2E433A", marginBottom: "8px" }}>
                {copy("បានប្តូរលេខសម្ងាត់ដោយជោគជ័យ", "Password updated successfully")}
              </h2>
              <p style={{ fontSize: "14px", color: "#695D50", lineHeight: "1.7", maxWidth: "360px", margin: "0 auto" }}>
                {serverMessage}
              </p>
            </div>

            <Link
              to="/login"
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
