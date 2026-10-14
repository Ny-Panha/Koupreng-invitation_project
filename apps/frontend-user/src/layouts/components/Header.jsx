import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLanguageStore } from "../../stores/useLanguageStore";
import logo from "../../assets/logo.png";
import "./MarketingChrome.css";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef(null);
  const { isAuthenticated, logout } = useAuth();
  const { lang, setLang } = useLanguageStore();
  const location = useLocation();
  const navigate = useNavigate();
  const copy = (km, en) => lang === "en" ? en : km;
  const items = isAuthenticated
    ? [["/dashboard", copy("ផ្ទាំងគ្រប់គ្រង", "Dashboard")], ["/templates", copy("គំរូសន្លឹកការ", "Designs")]]
    : [["/", copy("ទំព័រដើម", "Home")], ["/templates", copy("គំរូសន្លឹកការ", "Designs")], ["/pricing", copy("តម្លៃ", "Pricing")], ["/contact", copy("ទំនាក់ទំនង", "Contact")]];
  const active = (path) => path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(path + "/");
  const closeMenu = () => dialog.current?.close();
  const containMenuFocus = (event) => {
    if (event.key !== "Tab") return;
    const controls = [...dialog.current.querySelectorAll('a[href], button:not([disabled])')].filter((node) => node.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { dialog.current?.close(); }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1101px)");
    const onResize = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);

  const languageControl = (
    <div className="kp-language" role="group" aria-label={copy("ជ្រើសរើសភាសា", "Choose language")}>
      <button type="button" lang="km" aria-pressed={lang === "km"} onClick={() => setLang("km")}>ខ្មែរ</button>
      <span aria-hidden="true">/</span>
      <button type="button" lang="en" aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
    </div>
  );
  const account = isAuthenticated ? (
    <><button type="button" className="kp-nav-link" onClick={() => { closeMenu(); logout(); navigate("/"); }}>{copy("ចាកចេញ", "Log out")}</button><Link to="/dashboard" className="kp-nav-cta" onClick={closeMenu}>{copy("ផ្ទាំងគ្រប់គ្រង", "Dashboard")}<ArrowUpRight size={16} aria-hidden="true" /></Link></>
  ) : (
    <><Link to="/login" className="kp-nav-link" onClick={closeMenu}>{copy("ចូលគណនី", "Log in")}</Link><Link to="/templates/browse" className="kp-nav-cta" onClick={closeMenu}>{copy("បង្កើតសន្លឹកការ", "Create invitation")}<ArrowUpRight size={16} aria-hidden="true" /></Link></>
  );

  return (
    <>
      <a className="kp-skip" href="#marketing-content">{copy("ទៅកាន់មាតិកា", "Skip to content")}</a>
      <header className={`kp-header${scrolled ? " kp-header--scrolled" : ""}`}>
        <div className="kp-header-inner">
          <Link to="/" className="kp-brand" title={copy("ទំព័រដើម", "Home")}>
            <img src={logo} alt="" width="76" height="54" /><span>Koupreng{" "}<span className="kp-brand-note">{copy("សិល្បៈនៃការអញ្ជើញ", "THE ART OF INVITING")}</span></span>
          </Link>
          <nav className="kp-desktop-nav" aria-label={copy("ម៉ឺនុយចម្បង", "Main navigation")}>
            {items.map(([path, label]) => <Link key={path} to={path} className="kp-nav-link" aria-current={active(path) ? "page" : undefined}>{label}</Link>)}
          </nav>
          <div className="kp-desktop-actions">{languageControl}{account}</div>
          <button className="kp-menu-trigger" type="button" aria-label={copy("បើកម៉ឺនុយ", "Open navigation menu")} aria-expanded={menuOpen} aria-controls="public-mobile-navigation" onClick={() => { dialog.current.showModal(); setMenuOpen(true); }}><Menu size={22} aria-hidden="true" /></button>
        </div>
      </header>
      {/* Native modality, Escape and focus return; explicit Tab wrap stays inside. */}
      <dialog ref={dialog} id="public-mobile-navigation" className="kp-mobile-dialog" aria-labelledby="kp-menu-title" onKeyDown={containMenuFocus} onClose={() => setMenuOpen(false)} onClick={(event) => { if (event.target === dialog.current) closeMenu(); }}>
        <div className="kp-mobile-inner">
          <div className="kp-mobile-head"><h2 id="kp-menu-title">{copy("ម៉ឺនុយ", "Navigation")}</h2><button type="button" className="kp-menu-close" aria-label={copy("បិទម៉ឺនុយ", "Close navigation menu")} onClick={closeMenu} autoFocus><X aria-hidden="true" /></button></div>
          <nav aria-label={copy("ម៉ឺនុយទូរស័ព្ទ", "Mobile navigation")}>{items.map(([path, label]) => <Link key={path} to={path} aria-current={active(path) ? "page" : undefined} onClick={closeMenu}>{label}<ArrowUpRight size={20} aria-hidden="true" /></Link>)}</nav>
          {languageControl}<div className="kp-mobile-account">{account}</div>
        </div>
      </dialog>
    </>
  );
}
