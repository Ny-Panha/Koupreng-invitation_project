import { useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import authService from "./api/authApi";
import AuthLayout from "./components/AuthLayout";
import { useLanguageStore } from "../../stores/useLanguageStore";
import "./AuthPage.css";
import { safeAuthRedirect } from './safeRedirect';

export default function ForgotPassword() {
  const emailId = useId();
  const errorId = useId();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const lang = useLanguageStore((state) => state.lang);
  const copy = (km, en) => (lang === "en" ? en : km);
  const nextTarget = safeAuthRedirect(searchParams.get("next"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || submitted) return;
    setError("");
    setServerMessage("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError(copy("សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក", "Please enter your email address"));
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(trimmed);
      setServerMessage(
          copy(
            "ប្រសិនបើអ៊ីមែលនេះមានក្នុងប្រព័ន្ធ សូមពិនិត្យប្រអប់សំបុត្រ ឬ Spam ក្នុងអ៊ីមែលរបស់អ្នក។",
            "If this email belongs to an eligible account, reset instructions will be sent when email delivery is available."
          )
      );
      setSubmitted(true);
    } catch {
      setError(
          copy(
            "មិនអាចផ្ញើសំណើកំណត់លេខសម្ងាត់បានទេ។ សូមព្យាយាមម្តងទៀត។",
            "Could not request password reset. Please try again."
          )
      );
    } finally {
      setLoading(false);
    }
  };

  const loginUrl = nextTarget ? `/login?next=${encodeURIComponent(nextTarget)}` : "/login";
  const resetUrl = nextTarget ? `/reset-password?next=${encodeURIComponent(nextTarget)}` : "/reset-password";

  return (
    <AuthLayout>
      <div className="auth-card">
        {!submitted ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">
                {copy("ភ្លេចលេខសម្ងាត់?", "Forgot your password?")}
              </h1>
              <p className="auth-subtitle">
                {copy(
                  "បញ្ចូលអ៊ីមែលគណនីរបស់អ្នក ដើម្បីទទួលលេខកូដ Reset Token សម្រាប់កំណត់លេខសម្ងាត់ថ្មី។",
                  "Enter your registered email address to receive a reset token."
                )}
              </p>
            </div>

            {error && (
              <p id={errorId} className="auth-error" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="auth-form" aria-busy={loading}>
              <div className="auth-field">
                <label htmlFor={emailId} className="auth-label">
                  {copy("អាសយដ្ឋានអ៊ីមែល", "Email address")}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={copy("ឧ. name@example.com", "e.g. name@example.com")}
                    required
                    autoComplete="email"
                    className={`auth-input${error ? " error" : ""}`}
                    aria-describedby={error ? errorId : undefined}
                  />
                </div>
                <p className="auth-hint">
                  {copy(
                    "យើងនឹងផ្ញើតំណ ឬលេខកូដសម្ងាត់ទៅកាន់អ៊ីមែលនេះ។",
                    "Email reset requires an email already linked to your account."
                  )}
                </p>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                <Mail size={16} aria-hidden="true" />
                <span>
                  {loading
                    ? copy("កំពុងផ្ញើ...", "Sending instructions...")
                    : copy("ផ្ញើសំណើកំណត់លេខសម្ងាត់", "Send reset instructions")}
                </span>
              </button>
            </form>

            <div className="auth-recovery-hint">
              <strong>{copy("ចុះឈ្មោះតាមលេខទូរស័ព្ទ?", "Signed up with phone?")}</strong>{" "}
              {copy(
                "សូមទាក់ទងមកកាន់ក្រុមការងារគាំទ្រ។",
                "Contact support for available options. Telegram sign-in works only for an identity already linked to your account."
              )}
              {' '}<Link to="/contact">{copy("ទាក់ទងមកយើង", "Contact support")}</Link>
            </div>

            <div className="auth-back">
              <Link to={loginUrl} className="auth-home-link">
                <ArrowLeft size={15} aria-hidden="true" />
                <span>{copy("ត្រឡប់ទៅការចូលគណនី", "Back to sign in")}</span>
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
                {copy("ផ្ញើសំណើកំណត់លេខសម្ងាត់", "Request received")}
              </h2>
              <p className="auth-success-desc">
                {serverMessage}
              </p>
              <p className="auth-success-note">
                {copy(
                  "សូមពិនិត្យប្រអប់សំបុត្រ ឬ Spam ក្នុងអ៊ីមែលរបស់អ្នក។",
                  "Please check your inbox or spam folder."
                )}
              </p>
            </div>

            <Link to={resetUrl} className="auth-submit" style={{ textDecoration: "none" }}>
              <span>{copy("បញ្ចូល Reset Token ដើម្បីប្តូរលេខសម្ងាត់", "Enter reset token to set new password")}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <div className="auth-back">
              <Link to={loginUrl} className="auth-home-link">
                <ArrowLeft size={15} aria-hidden="true" />
                <span>{copy("ត្រឡប់ទៅចូលគណនី", "Back to sign in")}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
