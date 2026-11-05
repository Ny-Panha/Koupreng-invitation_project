import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  Palette,
  Gem,
  LogOut,
  UserRound,
  Receipt,
  BarChart3,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { useLanguageStore } from "../../stores/useLanguageStore";
import logo from "../../assets/logo.png";
import DisplayPreferences from '@/shared/preferences/DisplayPreferences';
import "./HostNav.css";

const NAV_DICTIONARY = {
  km: {
    events: "កម្មវិធីរបស់ខ្ញុំ",
    createEvent: "បង្កើតកម្មវិធី",
    packages: "កញ្ចប់សេវាកម្ម",
    browseTemplates: "ស្វែងរកគំរូ",
    myInvitation: "គំរូធៀប",
    paidTemplates: "គំរូដែលបានទិញ",
    paymentHistory: "ប្រវត្តិការទូទាត់",
    financialReports: "របាយការណ៍ហិរញ្ញវត្ថុ",
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    guests: "បញ្ជីភ្ញៀវ",
    expenses: "គម្រោងថវិកា",
    gifts: "ចងដៃមង្គល",
  },
  en: {
    events: "My Events",
    createEvent: "Create Event",
    packages: "Packages",
    browseTemplates: "Browse Templates",
    myInvitation: "Invitation Template",
    paidTemplates: "Paid Templates",
    paymentHistory: "Payment History",
    financialReports: "Financial Reports",
    dashboard: "Dashboard",
    guests: "Guests",
    expenses: "Budget",
    gifts: "Gifts",
  },
};

function toAppRelativeUploadUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.pathname.startsWith("/uploads/")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Relative paths can be used as-is.
  }
  return value;
}

export default function HostNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const language = useLanguageStore((state) => state.lang);
  const profileRef = useRef(null);
  const profileTriggerRef = useRef(null);
  const profileMenuRef = useRef(null);
  const mobileNavRef = useRef(null);
  const hamburgerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { text: navText } = useBackendMessages("hostNav");

  const displayName = user?.fullName?.trim()
    || user?.full_name?.trim()
    || user?.name?.trim()
    || user?.email?.split("@")[0]
    || navText("accountFallback")
    || (language === "en" ? "Account" : "គណនី");
  const rawProfileImage = user?.profileImage || user?.profile_image || user?.avatarUrl || user?.avatar_url || "";
  const profileImage = toAppRelativeUploadUrl(rawProfileImage);
  const profileInitial = displayName.charAt(0)?.toUpperCase() || "K";

  // Scroll detection for sticky navigation elevation
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Synchronize document language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Click outside and escape handling for profile menu
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (profileOpen) {
          setProfileOpen(false);
          profileTriggerRef.current?.focus();
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          hamburgerRef.current?.focus();
        }
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen, mobileMenuOpen]);

  // Focus trap and scroll prevention when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const focusables = mobileNavRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables && focusables.length > 0) {
        focusables[0].focus();
      }

      const handleTrapTab = (e) => {
        if (e.key !== "Tab" || !focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", handleTrapTab);
      return () => {
        document.removeEventListener("keydown", handleTrapTab);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const dynamicNavItems = [
    { labelKey: "events", path: "/app/events", Icon: CalendarDays },
    { labelKey: "createEvent", path: "/app/events/new", Icon: CalendarPlus },
    { labelKey: "packages", path: "/app/packages", Icon: Gem },
    { labelKey: "browseTemplates", path: "/templates/browse", Icon: Palette },
  ];

  const isActive = useCallback((path) => {
    if (path === "/app/events") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }, [location.pathname]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const getNavLabel = useCallback((key) => {
    const serverText = navText(key);
    if (serverText && serverText !== key && serverText !== `hostNav.${key}`) {
      return serverText;
    }
    return NAV_DICTIONARY[language]?.[key] || NAV_DICTIONARY.km[key] || key;
  }, [language, navText]);

  const handleLogout = useCallback(() => {
    closeMobileMenu();
    setProfileOpen(false);
    logout();
    navigate("/", { replace: true });
  }, [closeMobileMenu, logout, navigate]);

  // Profile menu keyboard navigation
  const handleProfileKeyDown = (e) => {
    if (!profileOpen) return;
    const items = profileMenuRef.current?.querySelectorAll('[role="menuitem"]');
    if (!items || items.length === 0) return;
    const itemsArray = Array.from(items);
    const currentIndex = itemsArray.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = currentIndex < itemsArray.length - 1 ? currentIndex + 1 : 0;
      itemsArray[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemsArray.length - 1;
      itemsArray[prevIndex]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      itemsArray[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      itemsArray[itemsArray.length - 1]?.focus();
    }
  };

  return (
    <>
      <div className={`host-header-wrapper${scrolled ? " is-scrolled" : ""}`}>
        <header className="host-header-container">
          <Link
            to="/"
            className="host-logo-box"
            aria-label={`Koupreng — ${navText("backToDashboard") || (language === "en" ? "Back to dashboard" : "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង")}`}
          >
            <img src={logo} alt="Koupreng" />
            <span className="host-logo-tip" role="tooltip">
              {navText("backToDashboard") || (language === "en" ? "Back to dashboard" : "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង")}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="host-nav-links"
            aria-label={language === "en" ? "Main navigation" : "ម៉ឺនុយចម្បង"}
          >
            {dynamicNavItems.map((item, index) => {
              const active = isActive(item.activePath || item.path);
              return (
                <span key={item.labelKey} className="host-nav-item-wrap">
                  {index > 0 && <span className="host-nav-divider" aria-hidden="true">|</span>}
                  <Link
                    to={item.path}
                    className={`host-nav-link${active ? " active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {getNavLabel(item.labelKey)}
                  </Link>
                </span>
              );
            })}
          </nav>

          <div className="host-user-actions">
            <DisplayPreferences compact />

            {/* Profile Menu Trigger */}
            <div className="host-profile-selector" ref={profileRef} onKeyDown={handleProfileKeyDown}>
              <button
                type="button"
                ref={profileTriggerRef}
                className={`host-profile-pill${profileOpen ? " open" : ""}`}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label={displayName}
                onClick={() => setProfileOpen((value) => !value)}
              >
                <span className="host-profile-avatar">
                  {profileImage ? <img src={profileImage} alt="" /> : profileInitial}
                </span>
                <span className="host-profile-name">{displayName}</span>
                <ChevronDown className="host-profile-chevron" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="host-profile-menu" role="menu" ref={profileMenuRef}>
                  <Link
                    to="/app/profile"
                    className="host-profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                    role="menuitem"
                  >
                    <UserRound aria-hidden="true" />
                    <span>
                      {user?.fullName?.trim() || user?.full_name?.trim()
                        ? navText("editProfile") || (language === "en" ? "Edit Profile" : "កែប្រែគណនី")
                        : navText("createProfile") || (language === "en" ? "Create Profile" : "បង្កើតគណនី")}
                    </span>
                  </Link>

                  <Link
                    to="/app/packages"
                    className="host-profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                    role="menuitem"
                  >
                    <Gem aria-hidden="true" className="host-nav-icon--gold" />
                    <span>{getNavLabel("packages")}</span>
                  </Link>

                  <Link
                    to="/app/templates/paid"
                    className="host-profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                    role="menuitem"
                  >
                    <Gem aria-hidden="true" className="host-nav-icon--gold" />
                    <span>{getNavLabel("paidTemplates")}</span>
                  </Link>

                  <Link
                    to="/app/payments"
                    className="host-profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                    role="menuitem"
                  >
                    <Receipt aria-hidden="true" />
                    <span>{getNavLabel("paymentHistory")}</span>
                  </Link>

                  <Link
                    to="/dashboard/reports"
                    className="host-profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                    role="menuitem"
                  >
                    <BarChart3 aria-hidden="true" className="host-nav-icon--gold" />
                    <span>{getNavLabel("financialReports")}</span>
                  </Link>

                  <div className="host-profile-menu-divider" role="separator" />

                  <button
                    type="button"
                    className="host-profile-menu-item logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut aria-hidden="true" />
                    <span>{navText("logout") || (language === "en" ? "Sign Out" : "ចាកចេញ")}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger Button (Mobile) */}
            <button
              type="button"
              className={`host-hamburger-btn${mobileMenuOpen ? " open" : ""}`}
              ref={hamburgerRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={language === "en" ? "Main menu" : "ម៉ឺនុយចម្បង"}
              aria-expanded={mobileMenuOpen}
              aria-controls="host-mobile-navigation"
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`host-mobile-overlay${mobileMenuOpen ? " visible" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Slide-Out Drawer Navigation */}
      <nav
        ref={mobileNavRef}
        id="host-mobile-navigation"
        className={`host-mobile-menu${mobileMenuOpen ? " open" : ""}`}
        inert={!mobileMenuOpen}
        aria-hidden={!mobileMenuOpen}
        aria-label={language === "en" ? "Main navigation" : "ម៉ឺនុយចម្បង"}
      >
        <div className="host-mobile-header">
          <Link
            to="/app/profile"
            className="host-profile-pill"
            onClick={closeMobileMenu}
          >
            <span className="host-profile-avatar">
              {profileImage ? <img src={profileImage} alt="" /> : profileInitial}
            </span>
            <span className="host-profile-name">{displayName}</span>
          </Link>
          <button
            type="button"
            className="host-mobile-close-btn"
            onClick={closeMobileMenu}
            aria-label={language === "en" ? "Close menu" : "បិទម៉ឺនុយ"}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {dynamicNavItems.map((item) => {
          const ItemIcon = item.Icon;
          const active = isActive(item.activePath || item.path);
          return (
            <Link
              key={item.labelKey}
              to={item.path}
              className={`host-mobile-menu-item${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={closeMobileMenu}
            >
              <span className="menu-icon"><ItemIcon aria-hidden="true" /></span>
              <span>{getNavLabel(item.labelKey)}</span>
            </Link>
          );
        })}

        <div className="host-mobile-menu-divider" />

        <Link
          to="/app/templates/paid"
          className={`host-mobile-menu-item${isActive("/app/templates/paid") ? " active" : ""}`}
          aria-current={isActive("/app/templates/paid") ? "page" : undefined}
          onClick={closeMobileMenu}
        >
          <span className="menu-icon"><Gem aria-hidden="true" /></span>
          <span>{getNavLabel("paidTemplates")}</span>
        </Link>

        <Link
          to="/app/payments"
          className={`host-mobile-menu-item${isActive("/app/payments") ? " active" : ""}`}
          aria-current={isActive("/app/payments") ? "page" : undefined}
          onClick={closeMobileMenu}
        >
          <span className="menu-icon"><Receipt aria-hidden="true" /></span>
          <span>{getNavLabel("paymentHistory")}</span>
        </Link>

        <Link
          to="/dashboard/reports"
          className={`host-mobile-menu-item${isActive("/dashboard/reports") ? " active" : ""}`}
          aria-current={isActive("/dashboard/reports") ? "page" : undefined}
          onClick={closeMobileMenu}
        >
          <span className="menu-icon"><BarChart3 aria-hidden="true" /></span>
          <span>{getNavLabel("financialReports")}</span>
        </Link>

        <div className="host-mobile-menu-divider" />

        <button
          type="button"
          className="host-mobile-logout-btn"
          onClick={handleLogout}
        >
          <span className="menu-icon"><LogOut aria-hidden="true" /></span>
          <span>{navText("logout") || (language === "en" ? "Sign Out" : "ចាកចេញ")}</span>
        </button>
      </nav>
    </>
  );
}
