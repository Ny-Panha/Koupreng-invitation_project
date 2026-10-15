import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, MailOpen, X } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import { templateUsePath } from "../../templates/model/templateIdentity";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";
import { SILK_HERITAGE_TEMPLATE as silk } from "../../templates/data/templatesData";
import LandingPhoto from "./LandingPhoto";

export default function LandingHero({ copy }) {
  const [opened, setOpened] = useState(false);
  const previewLink = useRef(null);
  const previewOpener = useRef(null);
  const { isAuthenticated } = useAuth();
  const reduced = usePrefersReducedMotion();
  const tryPreview = (event) => {
    previewOpener.current = event.currentTarget;
    setOpened(true);
    requestAnimationFrame(() => previewLink.current?.focus());
  };
  const closePreview = () => {
    setOpened(false);
    previewOpener.current?.focus();
  };
  return (
    <section className="kp-hero" aria-labelledby="kp-hero-title" data-reduced-motion={reduced} onKeyDown={(event) => {
      if (opened && event.key === "Escape") { event.preventDefault(); closePreview(); }
    }}>
      <div className="kp-hero-copy">
        <p className="kp-eyebrow kp-enter">{copy("សន្លឹកការឌីជីថល", "Digital wedding invitations")}</p>
        <h1 id="kp-hero-title" className="kp-enter kp-enter--2">
          <span>{copy("សន្លឹកការមង្គល", "Your wedding.")}</span>
          <span>{copy("ដែលជារបស់អ្នក។", "Your invitation.")}</span>
        </h1>
        <p className="kp-hero-lead kp-enter kp-enter--3">
          {copy(
            "ជ្រើសគំរូ បញ្ចូលព័ត៌មានពិធី និងចែករំលែកតំណភ្ជាប់ទៅភ្ញៀវ។ តាមដានចម្លើយនៅកន្លែងតែមួយ។",
            "Choose a design, add your details and share one link. Keep your guest replies together."
          )}
        </p>
        <div className="kp-actions kp-enter kp-enter--3">
          <Link to="/templates" className="kp-button">
            {copy("មើលគំរូសន្លឹកការ", "Explore templates")}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <button type="button" className="kp-text-link" onClick={tryPreview} aria-controls="kp-folio-paper" aria-expanded={opened}>
            {copy("សាកមើលសន្លឹកការ", "Try the preview")}
            <MailOpen size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="kp-hero-proof">
          <Check size={16} aria-hidden="true" />
          {copy("មើលគំរូដោយមិនចាំបាច់ចូលគណនី", "No account needed to preview")}
        </p>
      </div>
      <div className="kp-hero-art kp-enter kp-enter--2" data-opened={opened}>
        <div className="kp-art-index">{copy("សាកមើលសូត្រមង្គល", "Explore Silk Heritage")}</div>
        <div className="kp-photo-arch">
          <LandingPhoto src={silk.mainImage} srcSet="/images/marketing/silk-portrait-480.webp 480w, /images/marketing/silk-portrait-768.webp 768w, /templates/silk-heritage/portrait.webp 960w" sizes="(max-width: 767px) calc(82vw - 33px), (max-width: 900px) 430px, 440px" priority alt={copy("រូបថតគូស្នេហ៍សម្រាប់គំរូសូត្រមង្គល", "Sample wedding portrait from the Silk Heritage design")} />
        </div>
        <div className={`kp-hero-folio${opened ? " kp-hero-folio--open" : ""}`}>
          <div id="kp-folio-paper" className="kp-folio-paper" inert={!opened} aria-hidden={!opened}>
            <img className="kp-folio-weave" src="/templates/silk-heritage/woven-ornament.svg" width="360" height="80" alt="" />
            <p className="kp-folio-ceremony">{copy("សិរីសួស្តីអាពាហ៍ពិពាហ៍", "TOGETHER WITH OUR FAMILIES")}</p>
            <p className="kp-sample-names">{copy(silk.groom, silk.groomEn)}<span>&</span>{copy(silk.bride, silk.brideEn)}</p>
            <p className="kp-folio-date">{copy(silk.dateText, silk.dateTextEn)}</p>
            <Link ref={previewLink} to="/templates/silk-heritage" className="kp-folio-demo">
              {copy("មើលគំរូពេញលេញ", "View the full demo")}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <button
            type="button"
            className="kp-folio-cover"
            aria-expanded={opened}
            aria-controls="kp-folio-paper"
            onClick={(event) => {
              if (opened) closePreview();
              else { previewOpener.current = event.currentTarget; setOpened(true); }
            }}
            aria-label={opened ? copy("បិទសន្លឹកការគំរូ", "Close invitation preview") : copy("បើកសន្លឹកការគំរូ", "Open invitation preview")}
          >
            <img src="/templates/silk-heritage/preview.svg" width="720" height="1080" alt="" />
            <span>
              {opened ? <X size={18} aria-hidden="true" /> : <><MailOpen size={16} aria-hidden="true" />{copy("បើកសន្លឹកការគំរូ", "Open invitation preview")}</>}
            </span>
          </button>
        </div>
        <div id="kp-folio-note" className="kp-art-caption">
          <span>{copy("សូត្រមង្គល · គំរូបង្ហាញ", "Silk Heritage · Sample preview")}</span>
          {opened && <Link to={templateUsePath("silk-heritage", isAuthenticated)}>{copy("ប្រើគំរូនេះ", "Use this design")}<ArrowUpRight size={16} aria-hidden="true" /></Link>}
        </div>
      </div>
    </section>
  );
}
