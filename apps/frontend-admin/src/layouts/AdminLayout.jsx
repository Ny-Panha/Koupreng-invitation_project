import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { useAdminLanguage } from "../app/providers/AdminLanguageProvider";

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  const routeKey = [
    "/dashboard",
    "/users",
    "/templates",
    "/packages",
    "/payments",
    "/notifications",
    "/system-logs",
    "/reports",
  ].find((key) => location.pathname.startsWith(key));
  const title = routeKey
    ? t(`pageTitles.${routeKey}`)
    : t("pageTitles.fallback", "ផ្ទាំងរដ្ឋបាលគូព្រេង");

  // Tavola-style: with slim left floating dock (w-14, left-4), desktop padding is lg:pl-20
  const sidebarPadding = "lg:pl-20";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="បិទម៉ឺនុយ"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden cursor-pointer"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Modern Tavola-Style Left Floating Dock */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        isExpanded={false}
        onToggle={() => {}}
        onNavigate={() => {
          if (window.innerWidth < 1024) setIsMobileOpen(false);
        }}
      />

      {/* Main Content Area */}
      <div
        className={`${sidebarPadding} min-w-0 max-w-full transition-all duration-300 flex flex-col min-h-screen relative`}
      >
        {/* Tavola Ambient Background Glow Meshes across all screens */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 opacity-30 dark:opacity-20" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        <AdminHeader
          title={title}
          onShowSidebar={() => setIsMobileOpen(!isMobileOpen)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
            key={location.pathname}
            className="w-full max-w-full min-w-0 page-transition"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
