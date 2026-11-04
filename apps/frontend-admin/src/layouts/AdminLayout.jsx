import { AdminSkeleton } from '../shared/ui/AdminSkeleton';
import { Suspense, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminNavigationSearch from "./components/AdminNavigationSearch";
import { useAdminLanguage } from "../app/providers/AdminLanguageProvider";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { lang } = useAdminLanguage();

  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

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

  // Tavola-style: with slim left floating dock (w-14, left-4), desktop padding is lg:pl-20
  const sidebarPadding = "lg:pl-20";

  return (
    <div className="admin-shell min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <a className="admin-skip-link" href="#admin-main">{lang === "en" ? "Skip to content" : "រំលងទៅមាតិកា"}</a>

      {/* Modern Tavola-Style Left Floating Dock */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        onSearch={() => setIsSearchOpen(true)}
        onNavigate={() => {
          if (window.innerWidth < 1024) setIsMobileOpen(false);
        }}
      />

      {/* Main Content Area */}
      <div
        className={`${sidebarPadding} min-w-0 max-w-full transition-all duration-300 flex flex-col min-h-screen relative`}
      >
        <AdminHeader
          onShowSidebar={() => setIsMobileOpen(!isMobileOpen)}
          isMobileOpen={isMobileOpen}
          onSearch={() => setIsSearchOpen(true)}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        <main id="admin-main" tabIndex={-1} className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
            key={location.pathname}
            className="w-full max-w-full min-w-0 page-transition"
          >
            <Suspense fallback={<AdminSkeleton />}><Outlet /></Suspense>
          </div>
        </main>
      </div>
      {isSearchOpen && <AdminNavigationSearch onClose={() => setIsSearchOpen(false)} />}
    </div>
  );
}
