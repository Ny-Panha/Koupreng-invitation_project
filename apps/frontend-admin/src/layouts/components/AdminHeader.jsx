import { useState, useRef, useEffect } from "react";
import { Menu, Sun, Moon, LogOut, User, Shield, Bell, Search } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AdminAuthProvider";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import BrandLogo from "../../shared/branding/BrandLogo";

export default function AdminHeader({ onShowSidebar, isMobileOpen, isDark, onToggleTheme, onSearch }) {
  const { user, logout } = useAuth();
  const { lang, setLang } = useAdminLanguage();
  const en = lang === "en";
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const accountButtonRef = useRef(null);
  const [now, setNow] = useState(() => new Date());
  const displayName = user?.fullName || user?.email || (en ? "Administrator" : "អ្នកគ្រប់គ្រង");
  const email = user?.email || "";
  const timeString = new Intl.DateTimeFormat(en ? "en-GB" : "km-KH", { timeZone: "Asia/Phnom_Penh", hour: "2-digit", minute: "2-digit" }).format(now);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAccountOpen) return;
    const outside = event => { if (!accountRef.current?.contains(event.target)) setIsAccountOpen(false); };
    const escape = event => {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [isAccountOpen]);

  return <header className="admin-header">
    <div className="admin-header-brand">
      <button type="button" className="admin-icon-button admin-mobile-toggle" onClick={onShowSidebar} aria-label={en ? "Open navigation" : "បើកម៉ឺនុយ"} aria-expanded={isMobileOpen} aria-controls={isMobileOpen ? "admin-mobile-navigation" : undefined}><Menu size={22} aria-hidden="true" /></button>
      <NavLink to="/dashboard" className="admin-brand-link" aria-label={en ? "Koupreng dashboard" : "ផ្ទាំងគ្រប់គ្រងគូព្រេង"}><BrandLogo variant="compact" responsiveIcon priority decorative /></NavLink>
    </div>
    <button type="button" className="admin-search-trigger" onClick={onSearch} aria-haspopup="dialog"><Search size={18} aria-hidden="true" /><span>{en ? "Find a page in your workspace" : "ស្វែងរកទំព័រនៅក្នុងកន្លែងធ្វើការ"}</span></button>
    <div className="admin-header-actions">
      <span className="admin-clock" title={en ? "Cambodia time" : "ម៉ោងកម្ពុជា"}>{timeString}<small>{en ? "Phnom Penh" : "ភ្នំពេញ"}</small></span>
      <button type="button" className="admin-icon-button admin-notifications" onClick={() => navigate("/notifications")} aria-label={en ? "Notifications" : "ការជូនដំណឹង"}><Bell size={20} aria-hidden="true" /></button>
      <button type="button" className="admin-icon-button" onClick={onToggleTheme} aria-label={en ? (isDark ? "Use light theme" : "Use dark theme") : (isDark ? "ប្រើផ្ទៃភ្លឺ" : "ប្រើផ្ទៃងងឹត")} aria-pressed={isDark}>{isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}</button>
      <select className="admin-language-select" value={lang} onChange={event => setLang(event.target.value)} aria-label={en ? "Interface language" : "ភាសាកម្មវិធី"}><option value="km">ខ្មែរ</option><option value="en">EN</option></select>
      <div ref={accountRef} className="admin-account" onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setIsAccountOpen(false); }}>
        <button ref={accountButtonRef} type="button" className="admin-icon-button admin-account-trigger" onClick={() => setIsAccountOpen(value => !value)} aria-label={en ? "Account options" : "ជម្រើសគណនី"} aria-expanded={isAccountOpen} aria-controls={isAccountOpen ? "admin-account-options" : undefined}><span aria-hidden="true">{Array.from(displayName)[0]?.toUpperCase()}</span></button>
        {isAccountOpen && <div id="admin-account-options" className="admin-account-options">
          <div className="admin-account-identity"><strong>{displayName}</strong>{email && <span>{email}</span>}<small><Shield size={13} aria-hidden="true" />{en ? "Administrator" : "អ្នកគ្រប់គ្រង"}</small></div>
          <button type="button" onClick={() => { setIsAccountOpen(false); navigate("/users"); }}><User size={17} aria-hidden="true" />{en ? "Manage users" : "គ្រប់គ្រងអ្នកប្រើប្រាស់"}</button>
          <button type="button" className="admin-sign-out" onClick={() => { setIsAccountOpen(false); logout(); }}><LogOut size={17} aria-hidden="true" />{en ? "Sign out" : "ចាកចេញ"}</button>
        </div>}
      </div>
    </div>
  </header>;
}
