import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Mail,
  Palette,
  Layers,
  CreditCard,
  LineChart,
  Bell,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../app/providers/AdminAuthProvider";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";

export default function AdminSidebar({ isMobileOpen, isExpanded, onToggle, onNavigate }) {
  const { user } = useAuth();
  const { lang, t } = useAdminLanguage();
  const displayName = user?.fullName || user?.email || "Admin";

  const navSections = [
    {
      key: "overview",
      label: t("nav.overview", "ទិដ្ឋភាពទូទៅ"),
      items: [
        { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard", "ផ្ទាំងគ្រប់គ្រង"), exact: true },
      ],
    },
    {
      key: "management",
      label: t("nav.management", "ការគ្រប់គ្រងទូទៅ"),
      items: [
        { to: "/users", icon: Users, label: t("nav.users", "អ្នកប្រើប្រាស់") },
        { to: "/events", icon: CalendarDays, label: t("nav.events", "ព្រឹត្តិការណ៍") },
        { to: "/invitations", icon: Mail, label: t("nav.invitations", "ធៀបការ & RSVP") },
      ],
    },
    {
      key: "catalog",
      label: t("nav.catalog", "គំរូ & កញ្ចប់សេវា"),
      items: [
        { to: "/templates", icon: Palette, label: t("nav.templates", "គំរូធៀបការ") },
        { to: "/packages", icon: Layers, label: t("nav.packages", "កញ្ចប់សេវាកម្ម") },
      ],
    },
    {
      key: "finance",
      label: t("nav.finance", "ហិរញ្ញវត្ថុ & របាយការណ៍"),
      items: [
        { to: "/payments", icon: CreditCard, label: t("nav.payments", "ការទូទាត់ (KHQR)") },
        { to: "/reports", icon: LineChart, label: t("nav.reports", "របាយការណ៍") },
      ],
    },
    {
      key: "system",
      label: t("nav.system", "ប្រព័ន្ធ & សុវត្ថិភាព"),
      items: [
        { to: "/notifications", icon: Bell, label: t("nav.notifications", "ការជូនដំណឹង") },
        { to: "/system-logs", icon: Activity, label: t("nav.systemLogs", "កំណត់ហេតុប្រព័ន្ធ") },
      ],
    },
  ];

  const navLinkClass = ({ isActive }) =>
    `${
      isActive
        ? "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-semibold"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200 font-medium"
    } group relative flex h-10 w-full items-center rounded-xl transition-all duration-200 px-3 outline-none focus:outline-none ${
      !isExpanded ? "justify-center" : ""
    }`;

  return (
    <aside
      className={`${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${
        isExpanded ? "w-[260px]" : "w-[72px]"
      } fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-[#0c0c0e] print:hidden`}
    >
      {/* Brand Header */}
      <div className="shrink-0 flex items-center h-16 border-b border-slate-200 dark:border-zinc-800 px-4">
        <div className={`flex items-center gap-3 w-full ${!isExpanded ? "justify-center" : ""}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div
            className={`flex flex-col min-w-0 transition-opacity duration-300 ${
              isExpanded ? "opacity-100" : "opacity-0 pointer-events-none hidden"
            }`}
          >
            <h1 className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-moul">
              {t("brandName", "គូព្រេង KOUPRENG")}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t("brandSub", "ប្រព័ន្ធគ្រប់គ្រងគូព្រេង")}
            </p>
          </div>
        </div>
      </div>

      {/* Collapse Toggle button (Desktop) */}
      <div className="hidden lg:block px-3 py-2 border-b border-slate-100 dark:border-zinc-800/80 mb-1">
        <button
          type="button"
          onClick={onToggle}
          className={`group relative flex h-9 w-full items-center rounded-lg transition-colors px-2.5 outline-none focus:outline-none text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200 font-medium cursor-pointer ${
            !isExpanded ? "justify-center" : ""
          }`}
          title={isExpanded ? (lang === "en" ? "Collapse Menu" : "បង្រួម Menu") : (lang === "en" ? "Expand Menu" : "ពង្រីក Menu")}
        >
          {isExpanded ? (
            <PanelLeftClose className="h-4 w-4 shrink-0" />
          ) : (
            <PanelLeftOpen className="h-4 w-4 shrink-0" />
          )}
          <span
            className={`ml-3 text-xs whitespace-nowrap transition-opacity duration-200 ${
              isExpanded ? "opacity-100" : "opacity-0 hidden"
            }`}
          >
            {isExpanded ? (lang === "en" ? "Collapse Menu" : "បង្រួម Menu") : ""}
          </span>
          {!isExpanded && (
            <div className="fixed left-[72px] hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100 z-[100] dark:bg-white dark:text-slate-900">
              {lang === "en" ? "Expand Menu" : "ពង្រីក Menu"}
            </div>
          )}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-scroll flex-1 space-y-1.5 overflow-y-auto px-3 py-3 flex flex-col">
        {navSections.map((section) => (
          <div key={section.key} className="mb-2">
            {isExpanded && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {section.label}
              </p>
            )}
            {!isExpanded && (
              <div className="border-t border-slate-100 dark:border-zinc-800/80 my-2 mx-2" />
            )}

            {section.items.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={navLinkClass}
                onClick={onNavigate}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span
                  className={`ml-3 flex-1 text-sm whitespace-nowrap transition-opacity duration-200 ${
                    isExpanded ? "opacity-100" : "opacity-0 hidden"
                  }`}
                >
                  {label}
                </span>
                {!isExpanded && (
                  <div className="fixed left-[72px] hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100 z-[100] dark:bg-white dark:text-slate-900">
                    {label}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      {isExpanded && (
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Super Admin
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
