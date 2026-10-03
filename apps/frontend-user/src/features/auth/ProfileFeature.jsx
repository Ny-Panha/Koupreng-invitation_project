import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import SocialAuthButtons from "./components/SocialAuthButtons";
import { userService } from "@/features/auth/api/userApi";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";

/**
 * ProfilePage — create or edit user profile + change password.
 * Maps to `users` table: full_name, email, phone, profile_image, status.
 */
export default function ProfilePage() {
  const { text: t } = useBackendMessages("profile");
  const { user, logout, updateUser } = useAuth();

  // ── Profile state ──────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Strip absolute localhost origin so images go through the Vite /uploads proxy
  // (prevents Mixed Content errors when served via ngrok/cloudflare)
  const toRelativeUrl = (url) => (url || "").replace(/^https?:\/\/localhost(:\d+)?/, "");

  // ── Password state ─────────────────────────────────────────────────────────
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const hasProfile = Boolean(user?.fullName?.trim() || user?.full_name?.trim());

  // Load profile from API
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await userService.getProfile();
        setFullName(data.fullName || data.full_name || "");
        setPhone(data.phone || "");
        setProfileImage(toRelativeUrl(data.profileImage || data.profile_image || ""));
      } catch {
        setFullName(user?.fullName || user?.full_name || user?.name || "");
        setPhone(user?.phone || "");
        setProfileImage(toRelativeUrl(user?.profileImage || user?.profile_image || ""));
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      let imageUrl = profileImage;
      if (imageFile) {
        const uploadRes = await userService.uploadProfileImage(imageFile);
        imageUrl = uploadRes.url || uploadRes.profileImage || uploadRes.profile_image || imageUrl;
      }

      const profileData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        profileImage: imageUrl,
      };

      const updatedUser = await userService.updateProfile(profileData);

      updateUser({
          ...user,
          fullName: fullName.trim(),
          full_name: fullName.trim(),
          name: fullName.trim(),
          phone: phone.trim(),
          profileImage: imageUrl,
          profile_image: imageUrl,
          profileComplete: true,
          ...updatedUser,
      });

      setProfileImage(imageUrl);
      setImageFile(null);
      setImagePreview("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSaved(false);

    if (newPassword !== confirmPassword) {
      setPwError(t("passwordMismatch"));
      return;
    }
    if (newPassword.length < 8) {
      setPwError(t("passwordTooShort"));
      return;
    }

    setPwSaving(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      setPwSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Backend invalidated old tokens — log out after short delay
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setPwError(err.message || t("passwordChangeFailed"));
    } finally {
      setPwSaving(false);
    }
  };

  const displayImage = imagePreview || profileImage;
  const displayInitial =
    fullName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "'Kantumruy Pro', sans-serif", color: "#888" }}>
        {t("loading")}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .profile-page {
          max-width: 520px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .profile-page h1 {
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 24px;
          color: #333;
          margin-bottom: 8px;
        }
        .profile-page .subtitle {
          font-family: 'Kantumruy Pro', sans-serif;
          color: #888;
          font-size: 14px;
          margin-bottom: 32px;
        }
        .profile-avatar-section {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
        }
        .profile-avatar {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #B0926A;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          font-weight: bold;
          overflow: hidden;
          border: 3px solid rgba(176, 146, 106, 0.3);
          cursor: pointer;
          flex-shrink: 0;
        }
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-avatar-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.5);
          color: white;
          font-size: 10px;
          text-align: center;
          padding: 4px 0;
          font-family: 'Kantumruy Pro', sans-serif;
        }
        .profile-avatar input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .profile-info-text {
          font-family: 'Kantumruy Pro', sans-serif;
        }
        .profile-info-text strong {
          display: block;
          font-size: 16px;
          color: #333;
        }
        .profile-info-text span {
          color: #888;
          font-size: 13px;
        }
        .profile-form-group {
          margin-bottom: 20px;
        }
        .profile-form-group label {
          display: block;
          font-family: 'Kantumruy Pro', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #555;
          margin-bottom: 8px;
        }
        .profile-form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid rgba(176, 146, 106, 0.3);
          border-radius: 12px;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 15px;
          background: #fff;
          transition: 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .profile-form-group input:focus {
          border-color: #B0926A;
          box-shadow: 0 0 0 3px rgba(176, 146, 106, 0.1);
        }
        .profile-form-group input:disabled {
          background: #f5f5f5;
          color: #999;
        }
        .profile-save-btn {
          width: 100%;
          padding: 16px;
          background: #B0926A;
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Kantumruy Pro', sans-serif;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 12px;
        }
        .profile-save-btn:hover {
          background: #9a7d5a;
        }
        .profile-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .profile-msg {
          text-align: center;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 14px;
          margin-top: 12px;
          animation: profileFadeIn 0.3s;
        }
        .profile-msg.success { color: #2e7d32; }
        .profile-msg.error   { color: #c62828; }

        /* ── Password section ───────────────────────────────────────────────── */
        .profile-section-divider {
          border: none;
          border-top: 1px solid rgba(176, 146, 106, 0.2);
          margin: 36px 0 0;
        }
        .profile-pw-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          padding: 18px 0 0;
          cursor: pointer;
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #333;
          text-align: left;
        }
        .profile-pw-toggle svg {
          transition: transform 0.25s;
          flex-shrink: 0;
        }
        .profile-pw-toggle.open svg {
          transform: rotate(180deg);
        }
        .profile-pw-section {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .profile-pw-section.open {
          max-height: 600px;
          opacity: 1;
        }
        .profile-pw-hint {
          font-family: 'Kantumruy Pro', sans-serif;
          font-size: 13px;
          color: #888;
          margin: 6px 0 20px;
        }
        .profile-pw-btn {
          width: 100%;
          padding: 14px;
          background: transparent;
          color: #B0926A;
          border: 2px solid #B0926A;
          border-radius: 12px;
          font-family: 'Kantumruy Pro', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: 0.2s;
          margin-top: 4px;
        }
        .profile-pw-btn:hover {
          background: #B0926A;
          color: #fff;
        }
        .profile-pw-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes profileFadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="profile-page">
        <h1>{hasProfile ? t("editTitle") : t("createTitle")}</h1>
        <p className="subtitle">
          {hasProfile
            ? t("editSubtitle")
            : t("createSubtitle")}
        </p>

        {/* ── Avatar ── */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {displayImage ? (
              <img src={displayImage} alt="Profile" />
            ) : (
              displayInitial
            )}
            <div className="profile-avatar-overlay">{t("changePhoto")}</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              title={t("selectImage")}
            />
          </div>
          <div className="profile-info-text">
            <strong>{fullName || t("newUser")}</strong>
            <span>{user?.email || ""}</span>
          </div>
        </div>

        {/* ── Profile form ── */}
        <form onSubmit={handleSave}>
          <div className="profile-form-group">
            <label>{t("fullNameLabel")}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              required
            />
          </div>

          <div className="profile-form-group">
            <label>{t("emailLabel")}</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              title={t("emailReadonly")}
            />
          </div>

          <div className="profile-form-group">
            <label>{t("phoneLabel")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePlaceholder")}
            />
          </div>

          <button
            type="submit"
            className="profile-save-btn"
            disabled={saving || !fullName.trim()}
          >
            {saving
              ? t("saving")
              : hasProfile
                ? t("saveEdit")
                : t("createBtn")}
          </button>

          {saved && (
            <p className="profile-msg success">{t("savedSuccess")}</p>
          )}
          {error && (
            <p className="profile-msg error">{error}</p>
          )}
        </form>

        {/* ── Change password ── */}
        <hr className="profile-section-divider" />
        <section aria-labelledby="profile-linked-identities">
          <h2 id="profile-linked-identities">Linked sign-in identities</h2>
          <SocialAuthButtons mode="link" />
        </section>
        <hr className="profile-section-divider" />

        <button
          type="button"
          className={`profile-pw-toggle${showPasswordSection ? " open" : ""}`}
          onClick={() => setShowPasswordSection((v) => !v)}
          aria-expanded={showPasswordSection}
        >
          <span>{t("changePassword")}</span>
          {/* chevron */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0926A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div className={`profile-pw-section${showPasswordSection ? " open" : ""}`}>
          <p className="profile-pw-hint">
            {t("changePasswordHint")}
          </p>

          <form onSubmit={handleChangePassword}>
            <div className="profile-form-group">
              <label>{t("currentPassword")}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="profile-form-group">
              <label>{t("newPasswordLabel")}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="profile-form-group">
              <label>{t("confirmNewPassword")}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="profile-pw-btn"
              disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            >
              {pwSaving ? t("changingPassword") : t("changePasswordBtn")}
            </button>

            {pwSaved && (
              <p className="profile-msg success">
                {t("passwordChanged")}
              </p>
            )}
            {pwError && (
              <p className="profile-msg error">{pwError}</p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
