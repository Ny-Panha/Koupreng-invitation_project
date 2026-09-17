import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { useT } from "../../shared/i18n/useT";
import { FiGlobe, FiChevronDown } from "react-icons/fi";
import logo from "../../assets/logo.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { lang, setLang } = useLanguageStore();
  const t = useT();

  const PUBLIC_NAV_ITEMS = [
    { label: t.nav.home, path: "/" },
    { label: t.nav.templates, path: "/templates" },
    { label: t.nav.pricing, path: "/pricing" },
    { label: t.nav.venues, path: "/venues" },
  ];

  const DASHBOARD_NAV_ITEMS = [
    { label: t.nav.dashboard, path: "/dashboard" },
    { label: t.nav.templates, path: "/templates" },
  ];

  const navItems = isAuthenticated ? DASHBOARD_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <style>{`
        :root {
          --site-header-offset: clamp(104px, 8vw, 132px);
          --host-nav-offset: clamp(104px, 8vw, 132px);
        }
        .header-wrapper { position: fixed; top: 0; left: 0; width: 100%; z-index: 3000; padding: ${scrolled ? "10px 0" : "20px 0"}; transition: 0.4s; pointer-events: none; }
        .header-container { pointer-events: auto; max-width: 1440px; margin: 0 auto; width: 92%; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; height: 75px; background: ${scrolled ? "rgba(252, 248, 242, 0.95)" : "rgba(252, 248, 242, 0.4)"}; backdrop-filter: blur(5px); border-radius: 50px; border: 1px solid rgba(176, 146, 106, 0.3); box-shadow: ${scrolled ? "0 10px 40px rgba(0,0,0,0.1)" : "none"}; }
        .logo-box { display: flex; align-items: center; gap: 12px; text-decoration: none; position: relative; transition: transform 0.25s ease; }
        .logo-box:hover { transform: scale(1.05); }
        .logo-box img { transition: filter 0.25s ease; }
        .logo-box:hover img { filter: drop-shadow(0 4px 12px rgba(176, 146, 106, 0.45)); }
        .logo-tip { position: absolute; left: 50%; top: 100%; transform: translate(-50%, 6px); white-space: nowrap; background: #7D6443; color: #fff; font-family: 'Kantumruy Pro', sans-serif; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 8px; opacity: 0; visibility: hidden; transition: opacity 0.2s ease, transform 0.2s ease; pointer-events: none; box-shadow: 0 6px 18px rgba(0,0,0,0.18); z-index: 10; }
        .logo-tip::before { content: ""; position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); border: 5px solid transparent; border-bottom-color: #7D6443; }
        .logo-box:hover .logo-tip, .logo-box:focus-visible .logo-tip { opacity: 1; visibility: visible; transform: translate(-50%, 10px); }
        .logo-text { font-family: 'Moul', serif; color: #7D6443; font-size: 22px; }
        .nav-links { display: flex; gap: 20px; align-items: center; }
        .nav-link { font-family: 'Kantumruy Pro', sans-serif; text-decoration: none; color: #333; font-weight: 700; font-size: 14px; transition: 0.3s; background: none; border: 0; cursor: pointer; padding: 0; }
        .nav-link:hover, .nav-link.active { color: #B0926A; }
        .desktop-actions { display: flex; align-items: center; gap: 12px; }
        .user-actions { display: flex; align-items: center; gap: 12px; }
        .user-profile-circle { width: 40px; height: 40px; border-radius: 50%; background: #B0926A; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; cursor: pointer; text-decoration: none; }
        .logout-nav-btn { color: #8a3434; }
        .logout-nav-btn:hover { color: #c24141; }
        .cta-gold { background: linear-gradient(135deg, #B0926A 0%, #7D6443 100%); color: white; padding: 10px 24px; border-radius: 30px; text-decoration: none; font-family: 'Kantumruy Pro', sans-serif; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(176, 146, 106, 0.3); }
        .lang-dropdown-wrapper { position: relative; display: inline-block; }
        .lang-toggle { display: flex; align-items: center; gap: 6px; background: none; border: none; color: #1f2937; padding: 6px 10px; cursor: pointer; font-family: 'Kantumruy Pro', sans-serif; font-weight: 600; font-size: 14px; transition: 0.2s; }
        .lang-toggle:hover { color: #d6336c; }
        .lang-icon { font-size: 18px; color: #d6336c; }
        .lang-menu { position: absolute; top: 100%; right: -10px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; width: 120px; opacity: 0; visibility: hidden; transform: translateY(10px); transition: 0.2s; z-index: 3005; padding: 4px; display: flex; flex-direction: column; gap: 2px; }
        .lang-dropdown-wrapper:hover .lang-menu, .lang-dropdown-wrapper:focus-within .lang-menu { opacity: 1; visibility: visible; transform: translateY(0); }
        .lang-option { display: block; width: 100%; text-align: left; background: none; border: none; padding: 10px 16px; font-family: 'Kantumruy Pro', sans-serif; font-size: 14px; cursor: pointer; border-radius: 8px; transition: 0.2s; color: #4b5563; }
        .lang-option:hover { background: #fdf2f4; color: #d6336c; }
        .lang-option.active { color: #d6336c; background: #fdf2f4; }
        .burger-menu { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; z-index: 3001; }
        .burger-menu span { width: 25px; height: 3px; background-color: #7D6443; border-radius: 2px; transition: 0.3s; }
        .mobile-nav { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: #FCF8F2; padding: 100px 30px; flex-direction: column; gap: 20px; z-index: 2999; pointer-events: auto; }
        .mobile-quick-actions { display: none; align-items: center; }
        @media (max-width: 1024px) { 
          .nav-links, .desktop-actions { display: none; } 
          .burger-menu, .mobile-quick-actions { display: flex; }
          .mobile-nav { display: ${isMobileMenuOpen ? "flex" : "none"}; }
        }
        @media (max-width: 768px) {
          :root {
            --site-header-offset: 96px;
            --host-nav-offset: 96px;
          }
        }
        @media (max-width: 560px) {
          .header-wrapper { padding: ${scrolled ? "8px 0" : "16px 0"}; }
          .header-container { width: calc(100% - 32px); max-width: none; height: 62px; padding: 0 18px; }
          .logo-box img { height: 72px !important; }
        }
      `}</style>

      <div className="header-wrapper">
        <header className="header-container">
          <Link to="/" className="logo-box" aria-label={`Koupreng — ${t.nav.backToHome || "Back to home"}`}>
            <img
              src={logo}
              alt="Koupreng"
              style={{
                height: "90px",
                width: "auto",
                objectFit: "contain",
              }}
            />
            <span className="logo-text">Koupreng</span>
            <span className="logo-tip" role="tooltip">{t.nav.backToHome || "Back to home"}</span>
          </Link>

          <nav className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                className={`nav-link ${isActivePath(item.path) ? "active" : ""}`}
                to={item.path}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="desktop-actions">
            <div className="lang-dropdown-wrapper">
              <button
                type="button"
                className="lang-toggle"
                aria-label={t.nav.language || "Language selector"}
              >
                <FiGlobe className="lang-icon" />
                {lang === "km" ? (t.nav.khmer || "ខ្មែរ") : (t.nav.langEn || "EN")}
                <FiChevronDown />
              </button>
              <div className="lang-menu">
                <button
                  className={`lang-option ${lang === "km" ? "active" : ""}`}
                  onClick={() => setLang("km")}
                >
                  {t.nav.khmer || "ខ្មែរ"}
                </button>
                <button
                  className={`lang-option ${lang === "en" ? "active" : ""}`}
                  onClick={() => setLang("en")}
                >
                  {t.nav.english || "English"}
                </button>
              </div>
            </div>
            {isAuthenticated ? (
              <div className="user-actions">
                <button
                  type="button"
                  className="nav-link logout-nav-btn"
                  onClick={handleLogout}
                >
                  {t.nav.logout}
                </button>
                <Link to="/dashboard" className="user-profile-circle">
                  V
                </Link>
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <Link to="/login" className="nav-link">
                  {t.nav.login}
                </Link>
                <Link to="/register" className="cta-gold">
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>

          <div className="mobile-quick-actions">
            {!isAuthenticated ? (
              <Link to="/login" className="nav-link" style={{ marginRight: "15px", fontWeight: "700", color: "#B0926A" }}>
                {t.nav.login}
              </Link>
            ) : (
              <Link to="/dashboard" className="user-profile-circle" style={{ marginRight: "15px", width: "32px", height: "32px", fontSize: "14px" }}>
                V
              </Link>
            )}
            <button
              className="burger-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span
                style={{
                  transform: isMobileMenuOpen
                    ? "rotate(45deg) translate(6px, 5px)"
                    : "none",
                }}
              ></span>
              <span style={{ opacity: isMobileMenuOpen ? 0 : 1 }}></span>
              <span
                style={{
                  transform: isMobileMenuOpen
                    ? "rotate(-45deg) translate(6px, -6px)"
                    : "none",
                }}
              ></span>
            </button>
          </div>
        </header>
      </div>

      <nav className="mobile-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            className={`nav-link ${isActivePath(item.path) ? "active" : ""}`}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <button
            type="button"
            className="nav-link logout-nav-btn"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
          >
            {t.nav.logout}
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t.nav.login}
            </Link>
            <Link
              to="/register"
              className="cta-gold"
              style={{ textAlign: "center" }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t.nav.register}
            </Link>
          </>
        )}
          <div className="lang-dropdown-wrapper" style={{ marginTop: "10px", alignSelf: "flex-start" }}>
            <button
              type="button"
              className="lang-toggle"
              aria-label={t.nav.language || "Language selector"}
            >
              <FiGlobe className="lang-icon" />
              {lang === "km" ? (t.nav.khmer || "ខ្មែរ") : (t.nav.langEn || "EN")}
              <FiChevronDown />
            </button>
            <div className="lang-menu" style={{ position: "relative", top: 0, width: "100%", right: 0, boxShadow: "none", background: "transparent" }}>
              <button
                className={`lang-option ${lang === "km" ? "active" : ""}`}
                onClick={() => setLang("km")}
              >
                {t.nav.khmer || "ខ្មែរ"}
              </button>
              <button
                className={`lang-option ${lang === "en" ? "active" : ""}`}
                onClick={() => setLang("en")}
              >
                {t.nav.english || "English"}
              </button>
            </div>
          </div>
      </nav>
    </>
  );
}
