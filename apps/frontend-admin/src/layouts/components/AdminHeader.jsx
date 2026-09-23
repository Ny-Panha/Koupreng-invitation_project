import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Bell,
  Globe,
  Check
} from "lucide-react";
import { useAuth } from "../../app/providers/AdminAuthProvider";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import { useNavigate } from "react-router-dom";

export default function AdminHeader({ title, onShowSidebar, isDark, onToggleTheme }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useAdminLanguage();
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const accountRef = useRef(null);
  const langRef = useRef(null);

  const displayName = user?.fullName || user?.email || "Admin";
  const email = user?.email || "admin@koupreng.com";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md transition-colors dark:border-zinc-800 dark:bg-[#0c0c0e]/90 print:hidden">
      {/* Left: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onShowSidebar}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            {lang === "en" ? "KOUPRENG" : "គូព្រេង"}
          </span>
          <span className="hidden sm:inline-block text-slate-300 dark:text-zinc-700">/</span>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle: Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder={lang === "en" ? "Search records (name, email, code)..." : "ស្វែងរកទិន្នន័យ (ឈ្មោះ, អ៊ីមែល, លេខកូដ)..."}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-amber-500 dark:focus:bg-zinc-900"
          />
        </div>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center gap-2">
        {/* Notifications Icon */}
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={t("topMenu.notifications", "ការជូនដំណឹង")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
        </button>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={isDark ? t("topMenu.themeLight", "ប្ដូរទៅ Light Mode") : t("topMenu.themeDark", "ប្ដូរទៅ Dark Mode")}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Interactive Language Selector */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="flex h-9 items-center gap-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-700 hover:bg-slate-200/80 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700/80 transition-colors cursor-pointer"
            title={t("topMenu.language", "ភាសា / Language")}
          >
            <Globe className="h-3.5 w-3.5 text-amber-500" />
            <span>{lang === "en" ? "EN" : "ខ្មែរ"}</span>
          </button>

          {isLangOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-[#121215] z-50 animate-in fade-in slide-in-from-top-1">
              <button
                type="button"
                onClick={() => {
                  setLang("km");
                  setIsLangOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  lang === "km"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🇰🇭</span>
                  <span>ភាសាខ្មែរ (KM)</span>
                </div>
                {lang === "km" && <Check className="h-3.5 w-3.5 text-amber-500" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang("en");
                  setIsLangOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  lang === "en"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🇺🇸</span>
                  <span>English (EN)</span>
                </div>
                {lang === "en" && <Check className="h-3.5 w-3.5 text-amber-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div ref={accountRef} className="relative ml-1">
          <button
            type="button"
            onClick={() => setIsAccountOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-bold text-xs shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </button>

          {isAccountOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-[#121215] z-50 animate-in fade-in slide-in-from-top-1">
              <div className="p-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {displayName}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                  {email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Shield className="h-3 w-3" /> SUPER ADMIN
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/users");
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <User className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                  <span>{t("topMenu.allUsers", "បញ្ជីអ្នកប្រើប្រាស់ទាំងអស់")}</span>
                </button>
              </div>

              <div className="p-1 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={async () => {
                    setIsAccountOpen(false);
                    await logout();
                    navigate("/login");
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("topMenu.signOut", "ចាកចេញពីប្រព័ន្ធ")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
