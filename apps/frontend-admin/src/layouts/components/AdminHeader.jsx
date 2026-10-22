import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Bell,
  Globe,
  Check,
  Sparkles,
  Search,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AdminAuthProvider";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";

export default function AdminHeader({ title, onShowSidebar, isDark, onToggleTheme }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useAdminLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const accountRef = useRef(null);
  const langRef = useRef(null);

  // Live Clock (matching Tavola 8:13 PM capsule)
  const [timeString, setTimeString] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <header
      style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      className="sticky top-0 z-40 flex h-16 w-full min-w-0 items-center justify-between gap-3 bg-transparent px-4 sm:px-6 print:hidden"
    >
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3 shrink-0 animate-cascade" style={{ animationDelay: "0.02s" }}>
        <button
          type="button"
          onClick={onShowSidebar}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/25 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-moul text-xs font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
              គូព្រេង
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              KOUPRENG
            </span>
          </div>
        </NavLink>
      </div>

      {/* Center: Clean Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6 animate-cascade" style={{ animationDelay: "0.06s" }}>
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="search"
            placeholder={
              lang === "en"
                ? "Search records (name, email, code)..."
                : "ស្វែងរកទិន្នន័យ (ឈ្មោះ, អ៊ីមែល, លេខកូដ)..."
            }
            className="h-9 w-full rounded-full border border-slate-200/80 bg-slate-50/70 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-amber-500 dark:focus:bg-zinc-900"
          />
        </div>
      </div>

      {/* Right Action Icons: Live Clock, Notifications, Theme, Lang, Avatar */}
      <div className="flex items-center gap-2 shrink-0 animate-cascade" style={{ animationDelay: "0.10s" }}>
        {/* Live Clock Capsule (Tavola Pill Style) */}
        {timeString && (
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 text-xs font-bold text-slate-700 dark:text-zinc-200 shadow-xs">
            <span className="live-radar-dot" />
            <span>{timeString}</span>
          </div>
        )}

        {/* Notifications Icon with Badge */}
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={t("topMenu.notifications", "ការជូនដំណឹង")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
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
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                  {email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Shield className="h-3 w-3" />
                  <span>Super Admin</span>
                </div>
              </div>

              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/users");
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800/60 rounded-xl transition cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{lang === "en" ? "Manage Users" : "គ្រប់គ្រងអ្នកប្រើប្រាស់"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t("topMenu.logout", "ចាកចេញ")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
