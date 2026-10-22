import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Maximize2, RotateCcw, X } from "lucide-react";
import PhoneFrame from "../../../shared/ui/PhoneFrame";
import Modal from "../../../shared/ui/Modal";
import { PHONE_PREVIEW } from "../../../shared/preview/previewDevices";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";
import { SILK_HERITAGE_TEMPLATE as silk } from "../../templates/data/templatesData";
import LandingPhoto from "./LandingPhoto";
import "./InvitationDemo.css";

function SamplePoster({ copy }) {
  return <div className="public-demo-poster">
    <LandingPhoto src={silk.mainImage} srcSet="/images/marketing/silk-portrait-480.webp 480w, /images/marketing/silk-portrait-768.webp 768w" sizes="(max-width: 767px) 300px, 360px" priority alt={copy("រូបថតគូស្នេហ៍សម្រាប់គំរូបង្ហាញសូត្រមង្គល", "Sample wedding portrait for Silk Heritage")} />
    <div className="public-demo-letter"><img src="/templates/silk-heritage/woven-ornament.svg" width="360" height="80" alt="" /><p>{copy("សិរីសួស្តីអាពាហ៍ពិពាហ៍", "Together with our families")}</p><strong>{copy(silk.groom, silk.groomEn)}<span>&</span>{copy(silk.bride, silk.brideEn)}</strong><p>{copy(silk.dateText, silk.dateTextEn)}</p></div>
  </div>;
}

function DemoDevice({ copy, interactive = false, onClose, deviceName, large = false }) {
  const viewport = useRef(null), iframe = useRef(null), root = useRef(null);
  const [scale, setScale] = useState(.65), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0), [straight, setStraight] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState("");
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const element = viewport.current;
    const fit = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width > 0 && height > 0) setScale(Math.min(width / PHONE_PREVIEW.width, height / PHONE_PREVIEW.height, 1));
    };
    fit();
    if (typeof ResizeObserver === "undefined") { window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit); }
    const observer = new ResizeObserver(fit); observer.observe(element); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!interactive) { setReady(false); setFailed(false); return; }
    setReady(false); setFailed(false);
    const focusOwner = document.activeElement;
    let frameDocument, stopped = false;
    const escape = event => { if (event.key === "Escape") { event.preventDefault(); onClose?.(); } };
    const timeout = window.setTimeout(() => { stopped = true; setFailed(true); }, 20000);
    const poll = window.setInterval(() => {
      if (stopped) return;
      try {
        const doc = iframe.current?.contentDocument;
        if (doc && doc !== frameDocument) { frameDocument?.removeEventListener("keydown", escape); frameDocument = doc; doc.addEventListener("keydown", escape); }
        if (doc?.querySelector('[data-template-renderer="silk-heritage"]')) {
          stopped = true; window.clearTimeout(timeout); window.clearInterval(poll); setReady(true);
          requestAnimationFrame(() => { if (document.activeElement === focusOwner) iframe.current?.focus({ preventScroll: true }); });
        }
        if (doc?.querySelector(".template-unavailable")) { stopped = true; window.clearTimeout(timeout); setFailed(true); }
      } catch { /* Cross-origin/error navigation uses the bounded fallback. */ }
    }, 150);
    return () => { window.clearTimeout(timeout); window.clearInterval(poll); frameDocument?.removeEventListener("keydown", escape); };
  }, [interactive, attempt, onClose]);
  const fullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await root.current?.requestFullscreen(); }
    catch { setFullscreenNotice(copy("សូមបើកគំរូពេញលេញ ដើម្បីមើលនៅលើផ្ទៃធំ។", "Open the full demo for a larger view.")); }
  };
  return <figure ref={root} className={`public-demo-device${large ? " public-demo-device--large" : ""}`} data-interactive={interactive} data-straight={straight || reduced || interactive} aria-label={deviceName}>
    <div ref={viewport} className="public-demo-viewport">
      <div className="public-demo-stage" style={{ width: PHONE_PREVIEW.width * scale, height: PHONE_PREVIEW.height * scale }}>
        <PhoneFrame logicalViewport style={{ transform: `scale(${scale})` }}>
          {(!interactive || !ready || failed) && <SamplePoster copy={copy} />}
          {interactive && !failed && <iframe key={attempt} ref={iframe} src="/templates/silk-heritage?embed=demo" title={copy("គំរូសូត្រមង្គលដែលអាចសាកប្រើបាន", "Interactive Silk Heritage invitation sample")} width={PHONE_PREVIEW.contentWidth} height={PHONE_PREVIEW.contentHeight} className={`public-demo-iframe${ready ? " is-ready" : ""}`} aria-hidden={!ready} tabIndex={ready ? 0 : -1} inert={!ready} onError={() => setFailed(true)} />}
          {interactive && !ready && !failed && <div className="public-demo-state" role="status">{copy("កំពុងបើកគំរូអញ្ជើញ…", "Opening the invitation…")}</div>}
          {failed && <div className="public-demo-state public-demo-state--error" role="alert"><p>{copy("មិនអាចបើកគំរូនៅទីនេះបានទេ។ សាកម្ដងទៀត ឬបើកគំរូពេញលេញ។", "The sample could not open here. Try again or open the full demo.")}</p><button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}><RotateCcw size={18} aria-hidden="true" />{copy("សាកម្ដងទៀត", "Try again")}</button></div>}
        </PhoneFrame>
      </div>
    </div>
    <figcaption className="public-demo-caption"><span>{copy("សូត្រមង្គល ជាគំរូបង្ហាញ", "A Silk Heritage sample invitation")}</span><div>
      <Link to="/templates/silk-heritage">{copy("មើលគំរូពេញលេញ", "View the full demo")}<ArrowUpRight size={16} aria-hidden="true" /></Link>
      {!interactive && !reduced && <button type="button" aria-pressed={straight} onClick={() => setStraight(value => !value)}>{straight ? copy("មើលបែបផ្អៀង", "Perspective view") : copy("មើលត្រង់", "View straight")}</button>}
      {interactive && !large && document.fullscreenEnabled && <button type="button" onClick={fullscreen}><Maximize2 size={16} aria-hidden="true" />{copy("ពេញអេក្រង់", "Fullscreen")}</button>}
      {interactive && <button type="button" className="public-demo-fullscreen-close" onClick={onClose}><X size={18} aria-hidden="true" />{copy("បិទគំរូ", "Close demo")}</button>}
    </div>{fullscreenNotice && <p role="status">{fullscreenNotice}</p>}</figcaption>
  </figure>;
}

export default function InvitationDemo({ copy, deviceName = PHONE_PREVIEW.name }) {
  const [active, setActive] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const opener = useRef(null), regionId = useId();
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const changed = event => setCompact(event.matches);
    media.addEventListener("change", changed); return () => media.removeEventListener("change", changed);
  }, []);
  // Stable callback keeps the iframe lifecycle independent of unrelated renders.
  const close = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setActive(false); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }, []);
  return <div className="public-invitation-demo" onKeyDown={event => { if (event.key === "Escape" && active) close(); }}>
    <div id={regionId}><DemoDevice copy={copy} deviceName={deviceName} interactive={active && !compact} onClose={close} /></div>
    <button ref={opener} className="kp-button public-demo-launch" type="button" aria-controls={!compact ? regionId : undefined} aria-haspopup={compact ? "dialog" : undefined} aria-expanded={active} onClick={() => active ? close() : setActive(true)}>{active ? copy("បិទគំរូ", "Close demo") : copy("សាកប្រើធៀបការគំរូ", "Try the invitation")}</button>
    <p className="public-demo-note">{copy("គំរូបង្ហាញ មិនបង្កើតកម្មវិធី ឬផ្ញើទៅភ្ញៀវទេ។", "Sample event. Exploring it does not create an event or send invitations.")}</p>
    {compact && active && <Modal isOpen onClose={close} size="full" title={copy("សាកប្រើសូត្រមង្គល", "Explore Silk Heritage")} closeLabel={copy("បិទគំរូ", "Close demo")} className="public-demo-modal"><DemoDevice copy={copy} deviceName={deviceName} interactive onClose={close} large /></Modal>}
  </div>;
}
