import { useTemplateContinuation } from "./useTemplateContinuation";
import { useId, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToggle } from "../../shared/hooks/useToggle";
import { useT } from "../../shared/i18n/useT";
import authService from "@/features/auth/api/authApi";
import SocialAuthButtons from "./components/SocialAuthButtons";
import AuthLayout from "./components/AuthLayout";
import "./AuthPage.css";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

function RequirementIcon({ met }) {
  return (
    <svg className="auth-password-rule-icon" aria-hidden="true" focusable="false" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d={met ? "m6 10 2.5 2.5L14 7" : "m7 7 6 6m0-6-6 6"} />
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function Register() {
  const nameId = useId();
  const phoneId = useId();
  const passwordId = useId();
  const passwordRequirementsId = useId();
  const confirmPasswordId = useId();
  const confirmPasswordStatusId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, togglePassword] = useToggle();
  const [showConfirm, toggleConfirm] = useToggle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { auth } = useT();
  const redirectTo = useTemplateContinuation(searchParams);

  // Match the backend's character checks on UTF-16 code units,
  // including Khmer letters and digits.
  const passwordCharacters = password.split("");
  const passwordRequirements = [
    { key: "passwordMinLength", met: password.length >= MIN_PASSWORD_LENGTH },
    { key: "passwordMaxLength", met: password.length > 0 && password.length <= MAX_PASSWORD_LENGTH },
    { key: "passwordLetter", met: passwordCharacters.some((character) => /\p{L}/u.test(character)) },
    { key: "passwordUppercase", met: passwordCharacters.some((character) => /\p{Uppercase}/u.test(character)) },
    { key: "passwordNumber", met: passwordCharacters.some((character) => /\p{Nd}/u.test(character)) },
  ];
  const passwordValid = passwordRequirements.every((requirement) => requirement.met);
  const passwordMatch = Boolean(confirmPassword) && password !== confirmPassword;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim() || !password || !confirmPassword) {
      setError(auth("registerRequired"));
      return;
    }
    if (!passwordValid) {
      setError(auth("passwordRequirementsError"));
      return;
    }
    if (passwordMatch) {
      setError(auth("passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const authData = await authService.register({
        fullName: name.trim(),
        phone: phone.trim(),
        password,
      });
      login(authData);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || auth("registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Card */}
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">{auth("registerTitle")}</h1>
          <p className="auth-subtitle">{auth("registerSubtitle")}</p>
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" aria-busy={loading}>
          {/* Name */}
          <div className="auth-field">
            <label htmlFor={nameId} className="auth-label">{auth("fullName")}</label>
            <input
              id={nameId} type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={auth("fullNamePlaceholder")}
              className="auth-input"
              required
            />
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label htmlFor={phoneId} className="auth-label">{auth("phone")}</label>
            <input
              id={phoneId} type="tel" value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={auth("phonePlaceholder")}
              className="auth-input"
              required
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor={passwordId} className="auth-label">{auth("password")}</label>
            <div className="auth-input-wrap">
              <input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={auth("passwordPlaceholder")}
                className="auth-input"
                autoComplete="new-password"
                aria-describedby={password ? passwordRequirementsId : undefined}
                aria-invalid={Boolean(password) && !passwordValid}
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={MAX_PASSWORD_LENGTH}
                required
              />
              <button type="button" onClick={togglePassword} className="auth-eye-btn" aria-label="Toggle password">
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {password ? (
              <div id={passwordRequirementsId} className="auth-password-guidance">
                <p className="auth-password-guidance-title">{auth("passwordRequirements")}</p>
                <ul className="auth-password-requirements" aria-live="polite" aria-atomic="true">
                  {passwordRequirements.map(({ key, met }) => (
                    <li key={key} className={`auth-password-rule ${met ? "is-met" : "is-unmet"}`}>
                      <RequirementIcon met={met} />
                      <span>
                        {auth(key)}
                        <span className="sr-only"> — {auth(met ? "passwordRuleMet" : "passwordRuleUnmet")}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor={confirmPasswordId} className="auth-label">{auth("confirmPassword")}</label>
            <div className="auth-input-wrap">
              <input
                id={confirmPasswordId}
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={auth("confirmPasswordPlaceholder")}
                className={`auth-input${passwordMatch ? " error" : ""}`}
                autoComplete="new-password"
                aria-describedby={confirmPassword ? confirmPasswordStatusId : undefined}
                aria-invalid={passwordMatch}
                required
              />
              <button type="button" onClick={toggleConfirm} className="auth-eye-btn" aria-label="Toggle confirm">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {confirmPassword && (
              <p id={confirmPasswordStatusId} className={`auth-password-rule ${passwordMatch ? "is-unmet" : "is-met"}`} role="status">
                <RequirementIcon met={!passwordMatch} />
                <span>{auth(passwordMatch ? "passwordMismatch" : "passwordsMatch")}</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit" disabled={loading || !passwordValid || !confirmPassword || passwordMatch}>
            {loading ? auth("registering") : auth("registerBtn")}
          </button>
        </form>

        {/* Divider */}
        <p className="auth-divider">{auth("orContinueWith")}</p>

        {/* Social buttons */}
        <SocialAuthButtons redirectTo={redirectTo} />

        {/* Login link */}
        <p className="auth-footer-text" style={{ marginTop: "14px" }}>
          {auth("haveAccount")}{" "}
          <Link to={redirectTo && redirectTo !== "/app/events" ? `/login?next=${encodeURIComponent(redirectTo)}` : "/login"}>
            {auth("signIn")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
