import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Palette,
  Layers,
  CreditCard,
  LineChart,
  Bell,
  Activity,
  Terminal,
  Search,
  Plus,
  Settings,
  X,
  Sparkles,
} from "lucide-react";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";

export default function AdminSidebar({ isMobileOpen, onNavigate }) {
  const { lang } = useAdminLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Left Floating Dock Icons (Tavola-Style Vertical Rail)
  const dockItems = [
    {
      to: "/dashboard",
      icon: LayoutDashboard,
      label: lang === "en" ? "Overview Dashboard" : "ផ្ទាំងគ្រប់គ្រងទូទៅ",
      exact: true,
    },
    {
      to: "/users",
      icon: Users,
      label: lang === "en" ? "Users Management" : "គ្រប់គ្រងអ្នកប្រើប្រាស់",
    },
    {
      to: "/templates",
      icon: Palette,
      label: lang === "en" ? "Templates Catalog" : "គំរូធៀបការ",
    },
    {
      to: "/packages",
      icon: Layers,
      label: lang === "en" ? "Service Packages" : "កញ្ចប់សេវាកម្ម",
    },
    {
      to: "/payments",
      icon: CreditCard,
      label: lang === "en" ? "KHQR Payments" : "ការទូទាត់ KHQR",
    },
    {
      to: "/reports",
      icon: LineChart,
      label: lang === "en" ? "Financial Reports" : "របាយការណ៍ហិរញ្ញវត្ថុ",
    },
    {
      to: "/notifications",
      icon: Bell,
      label: lang === "en" ? "Alerts & Notifications" : "ការជូនដំណឹង",
    },
    {
      to: "/system-logs",
      icon: Activity,
      label: lang === "en" ? "System Logs" : "កំណត់ហេតុប្រព័ន្ធ",
    },
    {
      to: "/dev/api-monitor",
      icon: Terminal,
      label: "API Live Monitor",
    },
  ];

  return (
    <>
      {/* ============================================================
          1. Desktop Tavola Floating Vertical Dock (Slim Pill Rail)
          ============================================================ */}
      <aside
        style={{ animationDelay: "0.04s" }}
        className="hidden lg:flex fixed left-4 top-20 bottom-6 z-40 w-14 flex-col items-center justify-between rounded-[28px] border border-slate-200/90 bg-white/95 py-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-slate-800/80 dark:bg-[#121622]/95 dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] animate-cascade print:hidden"
        aria-label="Sidebar Dock"
      >
        {/* Top Dock Tools (Search & Quick Plus Action) */}
        <div className="flex flex-col items-center gap-2 w-full px-1.5">
          {/* Quick Search Icon Button */}
          <div className="group relative flex justify-center">
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-white transition-all cursor-pointer"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="pointer-events-none fixed left-[72px] hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:block z-50 dark:bg-zinc-100 dark:text-slate-900">
              {lang === "en" ? "Quick Search" : "ស្វែងរកទិន្នន័យ"}
            </div>
          </div>

          {/* Quick Add Button */}
          <div className="group relative flex justify-center">
            <button
              type="button"
              onClick={() => setShowQuickAdd((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-slate-950 transition-all duration-200 shadow-xs cursor-pointer"
              title="Quick Add"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="pointer-events-none fixed left-[72px] hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:block z-50 dark:bg-zinc-100 dark:text-slate-900">
              {lang === "en" ? "Quick Actions" : "សកម្មភាពរហ័ស"}
            </div>
          </div>

          {/* Thin Divider */}
          <div className="w-8 h-[1px] bg-slate-200/80 dark:bg-zinc-800/80 my-1" />
        </div>

        {/* Center: Main Navigation Icons */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-1.5 overflow-y-auto no-scrollbar py-1">
          {dockItems.map(({ to, icon: Icon, label, exact, badge }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);

            return (
              <div key={to} className="group relative flex justify-center w-full">
                <NavLink
                  to={to}
                  end={exact}
                  onClick={onNavigate}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-amber-500/15 text-amber-600 shadow-xs dark:bg-amber-500/20 dark:text-amber-400 scale-105"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  {/* Optional Red / Amber Badge (like Tavola badge '3') */}
                  {badge && (
                    <span className="absolute top-1.5 right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs">
                      {badge}
                    </span>
                  )}

                  {/* Active subtle pill bar indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-amber-500" />
                  )}
                </NavLink>

                {/* Floating Tooltip to the Right */}
                <div className="pointer-events-none fixed left-[72px] hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl group-hover:block z-50 dark:bg-zinc-100 dark:text-slate-900">
                  {label}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Tool: Settings */}
        <div className="flex flex-col items-center gap-2 w-full px-1.5 pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
          <div className="group relative flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/dev/api-monitor")}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-white transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <div className="pointer-events-none fixed left-[72px] hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl group-hover:block z-50 dark:bg-zinc-100 dark:text-slate-900">
              {lang === "en" ? "System Settings" : "ការកំណត់ប្រព័ន្ធ"}
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================
          2. Mobile Responsive Slide-Out Drawer (lg:hidden)
          ============================================================ */}
      <aside
        className={`${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 dark:border-zinc-800 dark:bg-[#0c0c0e] lg:hidden print:hidden flex`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-moul text-xs font-bold text-slate-900 dark:text-white">
              គូព្រេង KOUPRENG
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigate}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
          {dockItems.map(({ to, icon: Icon, label, exact, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-[#121622] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                <Search className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {lang === "en" ? "Search System" : "ស្វែងរកទិន្នន័យ"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3">
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "en" ? "Type keyword (users, templates, payments)..." : "វាយពាក្យស្វែងរក (អ្នកប្រើ, គំរូ, ការទូទាត់)..."}
                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  navigate("/users");
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-amber-500/10 hover:text-amber-600 transition"
              >
                👥 {lang === "en" ? "Users" : "អ្នកប្រើប្រាស់"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  navigate("/templates");
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-amber-500/10 hover:text-amber-600 transition"
              >
                🎨 {lang === "en" ? "Templates" : "គំរូធៀបការ"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  navigate("/payments");
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-amber-500/10 hover:text-amber-600 transition"
              >
                💳 {lang === "en" ? "Payments" : "ការទូទាត់"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Popover Modal */}
      {showQuickAdd && (
        <div
          className="fixed inset-0 z-50 bg-transparent"
          onClick={() => setShowQuickAdd(false)}
        >
          <div
            className="fixed left-20 top-36 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-[#121622] animate-in fade-in slide-in-from-left-2 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {lang === "en" ? "Quick Actions" : "សកម្មភាពរហ័ស"}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowQuickAdd(false);
                navigate("/users");
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              <Users className="h-3.5 w-3.5 text-amber-500" />
              <span>{lang === "en" ? "Add New User" : "បង្កើតអ្នកប្រើប្រាស់"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQuickAdd(false);
                navigate("/templates");
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              <Palette className="h-3.5 w-3.5 text-purple-500" />
              <span>{lang === "en" ? "Create Template" : "បង្កើតគំរូថ្មី"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQuickAdd(false);
                navigate("/packages");
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition"
            >
              <Layers className="h-3.5 w-3.5 text-cyan-500" />
              <span>{lang === "en" ? "New Package" : "បង្កើតកញ្ចប់សេវា"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
