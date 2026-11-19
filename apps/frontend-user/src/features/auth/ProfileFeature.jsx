import { PageSkeleton } from '@/shared/ui/LoadingState';
import { useId, useLayoutEffect, useRef, useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "../../stores/useLanguageStore";
import SocialAuthButtons from "./components/SocialAuthButtons";
import { userService } from "@/features/auth/api/userApi";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import "./ProfileFeature.css";
import { useUiCopy } from '../../shared/i18n/useUiCopy';
import { useT } from '../../shared/i18n/useT';
import { isAccountPasswordValid } from './accountPasswordPolicy';
import AccountPasswordGuidance from './components/AccountPasswordGuidance';

/**
 * ProfilePage — create or edit user profile + change password.
 * Maps to `users` table: full_name, email, phone, profile_image, status.
 */
export default function ProfilePage() {
  const fieldId = useId();
  const { text: t } = useBackendMessages("profile");
  const copy = useUiCopy();
  const { auth } = useT();
  const lang = useLanguageStore((state) => state.lang);
  const isKm = lang === "km";
  const { user, logout, updateUser } = useAuth();

  // ── Profile state ──────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [brokenImage, setBrokenImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const readerRef = useRef(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; readerRef.current?.abort(); };
  }, []);

  // Strip absolute localhost origin so images go through the Vite /uploads proxy
  const toRelativeUrl = (url) => (url || "").replace(/^https?:\/\/localhost(:\d+)?/, "");

  // ── Password state ─────────────────────────────────────────────────────────
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const accountId = useRef(user?.id);
  useLayoutEffect(() => {
    accountId.current = user?.id;
    readerRef.current?.abort(); readerRef.current = null;
    setFullName(''); setPhone(''); setProfileImage('');
    setImageFile(null); setImagePreview(''); setBrokenImage('');
    setSaving(false); setSaved(false); setError('');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setShowCurrentPw(false); setShowNewPw(false); setShowConfirmPw(false);
    setPwSaving(false); setPwSaved(false); setPwError('');
    return () => { accountId.current = null; };
  }, [user?.id]);

  const hasProfile = Boolean(user?.fullName?.trim() || user?.full_name?.trim());

  // Load profile from API
  useEffect(() => {
    let active = true;
    async function fetchProfile() {
      setLoading(true);
      setLoadFailed(false);
      try {
        const data = await userService.getProfile();
        if (!active) return;
        setFullName(data.fullName || data.full_name || "");
        setPhone(data.phone || "");
        setProfileImage(toRelativeUrl(data.profileImage || data.profile_image || ""));
      } catch {
        if (active) setLoadFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchProfile();
    return () => { active = false; };
  }, [user?.id, loadAttempt]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type) || !/\.(?:jpe?g|png|webp)$/i.test(file.name) || !file.size || file.size > 5 * 1024 * 1024) {
        setError(`${t('selectImage')}: JPEG / PNG / WebP · 0 < MB ≤ 5`);
        e.target.value = '';
        return;
      }
      setError('');
      readerRef.current?.abort();
      setImageFile(file);
      const reader = new FileReader();
      readerRef.current = reader;
      reader.onload = () => { if (mounted.current && readerRef.current === reader) setImagePreview(reader.result); };
      reader.onerror = () => { if (mounted.current && readerRef.current === reader) { setImageFile(null); setImagePreview(''); setError(t('saveFailed')); } };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving || loadFailed || !fullName.trim()) return;
    setSaving(true);
    setError("");
    setSaved(false);
    const requestAccountId = accountId.current;
    const isCurrentAccount = () => mounted.current && accountId.current === requestAccountId;

    try {
      let imageUrl = profileImage;
      if (imageFile) {
        const uploadRes = await userService.uploadProfileImage(imageFile);
        if (!isCurrentAccount()) return;
        imageUrl = uploadRes.url || uploadRes.profileImage || uploadRes.profile_image;
        if (!imageUrl) throw new Error(t('saveFailed'));
        // Keep a successful upload for a failed profile PATCH retry.
        setProfileImage(imageUrl);
        setImageFile(null);
      }

      const profileData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        profileImage: imageUrl,
      };

      const updatedUser = await userService.updateProfile(profileData);
      if (!isCurrentAccount()) return;
      if (!updatedUser || typeof updatedUser.fullName !== 'string') throw new Error(t('saveFailed'));

      updateUser({
        ...user,
        ...updatedUser,
      });

      setProfileImage(imageUrl);
      setImageFile(null);
      setImagePreview("");
      setSaved(true);
    } catch (err) {
      if (isCurrentAccount()) setError(err.message || t("saveFailed"));
    } finally {
      if (isCurrentAccount()) setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwSaving) return;
    setPwError("");
    setPwSaved(false);

    if (newPassword !== confirmPassword) {
      setPwError(t("passwordMismatch"));
      return;
    }
    if (!currentPassword || !confirmPassword || !isAccountPasswordValid(newPassword)) {
      setPwError(auth('passwordRequirementsError'));
      return;
    }

    setPwSaving(true);
    const requestAccountId = accountId.current;
    const isCurrentAccount = () => mounted.current && accountId.current === requestAccountId;
    try {
      await userService.changePassword(currentPassword, newPassword);
      if (!isCurrentAccount()) return;
      setPwSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      void logout();
    } catch (err) {
      if (isCurrentAccount()) setPwError(err.message || t("passwordChangeFailed"));
    } finally {
      if (isCurrentAccount()) setPwSaving(false);
    }
  };

  const candidateImage = imagePreview || profileImage;
  const displayImage = candidateImage === brokenImage ? '' : candidateImage;
  const displayInitial =
    fullName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  const eyeLabel = (shown) =>
    shown
      ? isKm
        ? "លាក់ពាក្យសម្ងាត់"
        : "Hide password"
      : isKm
      ? "បង្ហាញពាក្យសម្ងាត់"
      : "Show password";

  if (loading) return <PageSkeleton label={t("loading")} />;

  return (
    <section className="profile-page" aria-labelledby="profile-heading">
      <div className="profile-card">
        <h1 id="profile-heading">{hasProfile ? t("editTitle") : t("createTitle")}</h1>
        <p className="profile-subtitle">
          {hasProfile ? t("editSubtitle") : t("createSubtitle")}
        </p>

        {/* ── Avatar ── */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {displayImage ? (
              <img src={displayImage} alt={t("profilePhoto")} onError={() => setBrokenImage(displayImage)} />
            ) : (
              displayInitial
            )}
            <div className="profile-avatar-overlay">{t("changePhoto")}</div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={saving || loadFailed}
              onChange={handleImageChange}
              title={t("selectImage")}
              aria-label={t("selectImage")}
            />
          </div>
          <div className="profile-info-text">
            <strong>{fullName || t("newUser")}</strong>
            <span>{user?.email || ""}</span>
          </div>
        </div>

        {loadFailed && <div className="profile-msg error" role="alert">
          <p>{t('saveFailed')}</p>
          <button type="button" onClick={() => setLoadAttempt(v => v + 1)}>{copy('ព្យាយាមម្ដងទៀត', 'Try again')}</button>
        </div>}

        {/* ── Profile form ── */}
        <form onSubmit={handleSave} aria-busy={saving}>
          <div className="profile-form-group">
            <label htmlFor={`${fieldId}-name`}>{t("fullNameLabel")}</label>
            <input
              id={`${fieldId}-name`}
              autoComplete="name"
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
              disabled={saving || loadFailed}
              placeholder={t("fullNamePlaceholder")}
              required
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor={`${fieldId}-email`}>{t("emailLabel")}</label>
            <input
              id={`${fieldId}-email`}
              autoComplete="email"
              type="email"
              value={user?.email || ""}
              disabled
              title={t("emailReadonly")}
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor={`${fieldId}-phone`}>{t("phoneLabel")}</label>
            <input
              id={`${fieldId}-phone`}
              autoComplete="tel"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
              disabled={saving || loadFailed}
              placeholder={t("phonePlaceholder")}
            />
          </div>

          <button
            type="submit"
            className="profile-save-btn"
            disabled={saving || loadFailed || !fullName.trim()}
          >
            {saving
              ? t("saving")
              : hasProfile
                ? t("saveEdit")
                : t("createBtn")}
          </button>

          {saved && (
            <p className="profile-msg success" role="status">{t("savedSuccess")}</p>
          )}
          {error && (
            <p className="profile-msg error" role="alert">{error}</p>
          )}
        </form>

        {/* ── Linked identities ── */}
        <hr className="profile-section-divider" />
        <section className="profile-linked-identities" aria-labelledby="profile-linked-heading">
          <h2 id="profile-linked-heading">{t("linkedIdentities")}</h2>
          <SocialAuthButtons mode="link" />
        </section>
        <hr className="profile-section-divider" />

        {/* ── Change password accordion ── */}
        <button
          type="button"
          className={`profile-pw-toggle${showPasswordSection ? " open" : ""}`}
          onClick={() => setShowPasswordSection((v) => !v)}
          aria-expanded={showPasswordSection}
          aria-controls={`${fieldId}-password-fields`}
        >
          <span>{t("changePassword")}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div
          id={`${fieldId}-password-fields`}
          hidden={!showPasswordSection}
          className={`profile-pw-section${showPasswordSection ? " open" : ""}`}
        >
          <p className="profile-pw-hint">
            {t("changePasswordHint")}
          </p>

          <form onSubmit={handleChangePassword} aria-busy={pwSaving}>
            <div className="profile-form-group">
              <label htmlFor={`${fieldId}-current-password`}>{t("currentPassword")}</label>
              <div className="profile-input-wrap">
                <input
                  id={`${fieldId}-current-password`}
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="profile-eye-btn"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={eyeLabel(showCurrentPw)}
                  aria-pressed={showCurrentPw}
                >
                  {showCurrentPw ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor={`${fieldId}-new-password`}>{t("newPasswordLabel")}</label>
              <div className="profile-input-wrap">
                <input
                  id={`${fieldId}-new-password`}
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  maxLength={100}
                  aria-invalid={Boolean(newPassword) && !isAccountPasswordValid(newPassword)}
                  aria-describedby={`${fieldId}-password-policy`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="profile-eye-btn"
                  onClick={() => setShowNewPw((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={eyeLabel(showNewPw)}
                  aria-pressed={showNewPw}
                >
                  {showNewPw ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <AccountPasswordGuidance id={`${fieldId}-password-policy`} value={newPassword} />
            <div className="profile-form-group">
              <label htmlFor={`${fieldId}-confirm-password`}>{t("confirmNewPassword")}</label>
              <div className="profile-input-wrap">
                <input
                  id={`${fieldId}-confirm-password`}
                  aria-invalid={Boolean(confirmPassword) && newPassword !== confirmPassword}
                  aria-describedby={pwError ? `${fieldId}-password-error` : undefined}
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="profile-eye-btn"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={eyeLabel(showConfirmPw)}
                  aria-pressed={showConfirmPw}
                >
                  {showConfirmPw ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="profile-pw-btn"
              disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            >
              {pwSaving ? t("changingPassword") : t("changePasswordBtn")}
            </button>

            {pwSaved && (
              <p className="profile-msg success" role="status">
                {t("passwordChanged")}
              </p>
            )}
            {pwError && (
              <p id={`${fieldId}-password-error`} className="profile-msg error" role="alert">{pwError}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
