import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AdminAuthProvider";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import { ArrowRight, Loader2, ShieldCheck, Eye, EyeOff, AlertCircle, LockKeyhole } from "lucide-react";
import BrandLogo from "../../shared/branding/BrandLogo";
import { USER_APP_URL } from "../../shared/config/runtime";
import "./LoginPage.css";

function safeNext(searchParams) {
  const next = searchParams.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const language = useAdminLanguage();
  const lang = language?.lang || "km";
  const isKm = lang === "km";
  const isExpired = searchParams.get("expired") === "true";
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate(safeNext(searchParams), { replace: true });
    } catch (err) {
      setError(
        err?.message ||
        (isKm
          ? "ការចូលប្រើប្រាស់បានបរាជ័យ សូមពិនិត្យព័ត៌មានម្តងទៀត"
          : "Sign-in failed. Please verify your credentials and try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login" lang={lang}>
      <div className="admin-login-container">
        <div className="admin-login-topbar">
          <div className="admin-login-language" role="group" aria-label={isKm ? "ជ្រើសរើសភាសា" : "Language selection"}>
            <button type="button" onClick={() => language?.setLang("km")} aria-pressed={isKm} lang="km">
              ខ្មែរ
            </button>
            <span aria-hidden="true">/</span>
            <button type="button" onClick={() => language?.setLang("en")} aria-pressed={!isKm} lang="en">
              EN
            </button>
          </div>
        </div>

        <a href={USER_APP_URL} className="admin-login-brand" aria-label={isKm ? "គូព្រេង · ទំព័រដើម" : "Koupreng · Home"}>
          <BrandLogo variant="auth" priority decorative />
        </a>

        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <header className="admin-login-header">
            <p className="admin-login-badge">
              <ShieldCheck size={15} aria-hidden="true" />
              {isKm ? "ផ្ទាំងគ្រប់គ្រង" : "Admin portal"}
            </p>
            <h1 id="admin-login-title">{isKm ? "សូមស្វាគមន៍មកវិញ" : "Welcome Back"}</h1>
            <p className="admin-login-subtitle">
              {isKm ? "ចូលគណនីដើម្បីគ្រប់គ្រងគូព្រេង។" : "Sign in to manage the Koupreng platform."}
            </p>
          </header>

          {isExpired && !error && (
            <div role="status" className="admin-login-notice admin-login-notice--warning">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{isKm
                ? "សម័យការរបស់អ្នកបានផុតកំណត់។ សូមចូលគណនីម្តងទៀត។"
                : "Your session has expired. Please sign in again."}</span>
            </div>
          )}

          {isUnauthorized && !error && (
            <div role="status" className="admin-login-notice admin-login-notice--error">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{isKm
                ? "អ្នកមិនមានសិទ្ធិចូលទំព័រនោះទេ។ សូមប្រើគណនី Admin។"
                : "You do not have permission to view that resource. Please sign in as an Admin."}</span>
            </div>
          )}

          {error && (
            <div id="admin-login-error" role="alert" className="admin-login-notice admin-login-notice--error">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form" aria-busy={loading}>
            <div className="admin-login-field">
              <label htmlFor="identifier">{isKm ? "អ៊ីមែល ឬ លេខទូរស័ព្ទ" : "Email or Phone"}</label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isKm ? "បញ្ចូលអ៊ីមែល ឬ លេខទូរស័ព្ទ" : "Enter your email or phone"}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                disabled={loading}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "admin-login-error" : undefined}
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="password">{isKm ? "លេខសម្ងាត់" : "Password"}</label>
              <div className="admin-login-password">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isKm ? "បញ្ចូលលេខសម្ងាត់" : "Enter your password"}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "admin-login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="admin-login-eye"
                  aria-pressed={showPassword}
                  aria-label={showPassword
                    ? isKm ? "លាក់លេខសម្ងាត់" : "Hide password"
                    : isKm ? "បង្ហាញលេខសម្ងាត់" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="admin-login-submit">
              {loading ? <Loader2 size={18} className="admin-login-spinner" aria-hidden="true" /> : null}
              <span>{loading
                ? isKm ? "កំពុងផ្ទៀងផ្ទាត់..." : "Authenticating..."
                : isKm ? "ចូលគណនី" : "Sign In"}</span>
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>

          <p className="admin-login-access-note">
            <LockKeyhole size={15} aria-hidden="true" />
            <span>{isKm ? "សម្រាប់តែអ្នកគ្រប់គ្រងដែលមានសិទ្ធិ" : "For authorized administrators only"}</span>
          </p>
        </section>

        <footer className="admin-login-footer">
          {isKm ? "© 2026 គូព្រេង។ រក្សាសិទ្ធិគ្រប់យ៉ាង។" : "© 2026 Koupreng. All rights reserved."}
        </footer>
      </div>
    </main>
  );
}
