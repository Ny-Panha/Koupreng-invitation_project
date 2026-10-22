import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquare, X, ArrowUpRight } from "lucide-react";
import { useLanguageStore } from "../../stores/useLanguageStore";

const LegacyChat = lazy(() => import("./ChatBot"));
const publicRoutes = new Set(["/", "/pricing", "/contact", "/templates"]);

function PublicSupport() {
  const lang = useLanguageStore(state => state.lang);
  const copy = (km, en) => lang === "en" ? en : km;
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const close = useRef(null);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("open-support-chat", show);
    return () => window.removeEventListener("open-support-chat", show);
  }, []);
  useEffect(() => { if (open) close.current?.focus(); }, [open]);
  const dismiss = () => { setOpen(false); toggle.current?.focus(); };
  return <aside className="kp-public-support" lang={lang}>
    {open && <div id="public-support-chat" className="kp-support-panel" role="region" aria-label={copy("ជំនួយ និងការគាំទ្រ", "Help & Support")} onKeyDown={event => { if (event.key === "Escape") dismiss(); }}>
      <div><h2>{copy("តើអាចជួយអ្វីបានខ្លះ?", "How can we help?")}</h2><button type="button" ref={close} onClick={dismiss} aria-label={copy("បិទការជជែក", "Close support chat")}><X size={20} aria-hidden="true" /></button></div>
      <p>{copy("ស្វែងយល់ពីគំរូ កញ្ចប់ និងការប្រើប្រាស់ Koupreng។", "Find a design, understand packages or ask about using Koupreng.")}</p>
      {[["/templates", copy("មើលគំរូសន្លឹកការ", "Explore templates")], ["/pricing", copy("មើលកញ្ចប់ និងតម្លៃ", "View packages & pricing")], ["/contact", copy("ទាក់ទងក្រុមការងារ", "Contact the team")]].map(([path, label]) => <Link to={path} key={path} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={17} aria-hidden="true" /></Link>)}
    </div>}
    <button type="button" ref={toggle} className="chat-toggle-btn kp-support-toggle" aria-controls="public-support-chat" aria-expanded={open} aria-label={open ? copy("បិទការជជែក", "Close support chat") : copy("បើកការជជែកជំនួយ", "Open support chat")} onClick={() => open ? dismiss() : setOpen(true)}>{open ? <X size={22} aria-hidden="true" /> : <MessageSquare size={22} aria-hidden="true" />}</button>
  </aside>;
}

export default function SupportWidget() {
  const { pathname, search } = useLocation();
  if (new URLSearchParams(search).get("embed") === "demo" && /^\/templates\/[^/]+$/.test(pathname)) return null;
  if (pathname.replace(/\/$/, "") === "/contact") return null;
  return publicRoutes.has(pathname.replace(/\/$/, "") || "/")
    ? <PublicSupport /> : <Suspense fallback={null}><LegacyChat /></Suspense>;
}
