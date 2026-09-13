import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/navigation/AdminSidebar";
import TopMenu from "../components/navigation/TopMenu";
import { useAdminLanguage } from "../app/providers/AdminLanguageProvider";

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const location = useLocation();
  const { t } = useAdminLanguage();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const routeKey = ["/dashboard", "/users", "/events", "/invitations", "/templates", "/packages", "/payments", "/notifications", "/system-logs", "/reports"].find((key) => location.pathname.startsWith(key));
  const title = routeKey ? t(`pageTitles.${routeKey}`) : t("pageTitles.fallback", "ផ្ទាំងរដ្ឋបាលគូព្រេង");

  const isExpanded = isMobileOpen || isPinned;
  const sidebarPadding = isExpanded ? "lg:pl-[260px]" : "lg:pl-[72px]";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-zinc-100 transition-colors duration-300">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="បិទម៉ឺនុយ"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden cursor-pointer"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Modern Collapsible Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        isExpanded={isExpanded}
        onToggle={() => setIsPinned(!isPinned)}
        onNavigate={() => {
          if (window.innerWidth < 1024) setIsMobileOpen(false);
        }}
      />

      {/* Main Content Area */}
      <div className={`${sidebarPadding} min-w-0 max-w-full transition-all duration-300 flex flex-col min-h-screen`}>
        <TopMenu
          title={title}
          onShowSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsMobileOpen(!isMobileOpen);
            } else {
              setIsPinned(!isPinned);
            }
          }}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
