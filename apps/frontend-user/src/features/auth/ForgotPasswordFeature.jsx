import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import authService from "./api/authApi";
import AuthLayout from "./components/AuthLayout";
import { useLanguageStore } from "../../stores/useLanguageStore";
import "./AuthPage.css";

export default function ForgotPassword() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const lang = useLanguageStore((state) => state.lang);
  const copy = (km, en) => (lang === "en" ? en : km);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setServerMessage("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError(copy("សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលរបស់អ្នក", "Please enter your email address"));
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword(trimmed);
      setServerMessage(
        response?.message ||
          copy(
            "ប្រសិនបើអ៊ីមែលនេះមានក្នុងប្រព័ន្ធ យើងបានផ្ញើសេចក្តីណែនាំសម្រាប់កំណត់លេខសម្ងាត់ឡើងវិញរួចហើយ។",
            "If this email is registered, password reset instructions have been sent."
          )
      );
      setSubmitted(true);
    } catch (err) {
      setError(err.message || copy("មិនអាចផ្ញើសំណើកំណត់លេខសម្ងាត់បានទេ។ សូមព្យាយាមម្តងទៀត។", "Could not request password reset. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {!submitted ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">
                {copy("ភ្លេចលេខសម្ងាត់", "Forgot your password?")}
              </h1>
              <p className="auth-subtitle">
                {copy(
                  "បញ្ចូលអ៊ីមែលគណនីរបស់អ្នក ដើម្បីទទួលលេខកូដ Reset Token សម្រាប់កំណត់លេខសម្ងាត់ថ្មី។",
                  "Enter your registered email address to receive a reset token."
                )}
              </p>
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
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
                    className="auth-input"
                  />
                </div>
                <p className="auth-hint">
                  {copy(
                    "យើងនឹងផ្ញើតំណ ឬលេខកូដសម្ងាត់ទៅកាន់អ៊ីមែលនេះ។",
                    "We will send reset instructions to this email."
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

            <div className="auth-back" style={{ marginTop: "20px" }}>
              <Link to="/login" className="auth-home-link">
                <ArrowLeft size={15} aria-hidden="true" />
                <span>{copy("ត្រឡប់ទៅការចូលគណនី", "Back to sign in")}</span>
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
                {copy("បានផ្ញើសេចក្តីណែនាំរួចរាល់", "Instructions sent")}
              </h2>
              <p style={{ fontSize: "14px", color: "#695D50", lineHeight: "1.7", maxWidth: "360px", margin: "0 auto" }}>
                {serverMessage}
              </p>
              <p style={{ fontSize: "13px", color: "#77572C", marginTop: "10px" }}>
                {copy("សូមពិនិត្យប្រអប់សំបុត្រ ឬ Spam ក្នុងអ៊ីមែលរបស់អ្នក។", "Please check your inbox or spam folder.")}
              </p>
            </div>

            <Link
              to="/reset-password"
              className="auth-submit"
              style={{ textDecoration: "none" }}
            >
              <span>{copy("បញ្ចូល Reset Token ដើម្បីប្តូរលេខសម្ងាត់", "Enter reset token to set new password")}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <div className="auth-back" style={{ marginTop: "16px" }}>
              <Link to="/login" className="auth-home-link">
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
