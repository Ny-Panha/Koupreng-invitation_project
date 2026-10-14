import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, ArrowRight, Check, MailOpen, X } from "lucide-react";
import { usePrefersReducedMotion } from "../../../shared/hooks/usePrefersReducedMotion";
import { SILK_HERITAGE_TEMPLATE as silk } from "../../templates/data/templatesData";
import LandingPhoto from "./LandingPhoto";

export default function LandingHero({ copy }) {
  const [opened, setOpened] = useState(false);
  const reduced = usePrefersReducedMotion();
  return (
    <section className="kp-hero" aria-labelledby="kp-hero-title" data-reduced-motion={reduced}>
      <div className="kp-hero-copy">
        <p className="kp-eyebrow kp-enter">{copy("គូព្រេង — សិល្បៈនៃការអញ្ជើញ", "KOUPRENG — THE ART OF A DIGITAL INVITATION")}</p>
        <h1 id="kp-hero-title" className="kp-enter kp-enter--2"><span>{copy("សន្លឹកការដ៏ប្រណីត", "Beautiful invitations.")}</span><span className="kp-heading-accent">{copy("សម្រាប់ថ្ងៃពិសេស។", "Unforgettable moments.")}</span></h1>
        <p className="kp-hero-lead kp-enter kp-enter--3">{copy("ជ្រើសរើសគំរូដែលអ្នកពេញចិត្ត បញ្ចូលព័ត៌មានពិធី និងចែករំលែកថ្ងៃដ៏ពិសេសរបស់អ្នក ជាមួយសន្លឹកការឌីជីថលដ៏ស្រស់ស្អាត។", "Choose a design, personalize your celebration, and share one elegant digital invitation link with every guest.")}</p>
        <div className="kp-actions kp-enter kp-enter--3"><Link to="/templates" className="kp-button">{copy("មើលគំរូសន្លឹកការ", "Explore invitation designs")}<ArrowUpRight size={18} aria-hidden="true" /></Link><Link to="/templates/browse" className="kp-text-link">{copy("ចាប់ផ្តើមបង្កើត", "Create your invitation")}<ArrowRight size={18} aria-hidden="true" /></Link></div>
        <p className="kp-hero-proof"><Check size={16} aria-hidden="true" />{copy("មើលគំរូមុនសម្រេចចិត្ត · មិនចាំបាច់ចូលគណនី", "Preview before you choose · No account needed")}</p>
      </div>
      <div className="kp-hero-art kp-enter kp-enter--2">
        <div className="kp-art-index" aria-hidden="true">01 / {copy("សូត្រមង្គល", "SILK HERITAGE")}</div>
        <div className="kp-photo-arch"><LandingPhoto src={silk.mainImage} priority alt={copy("រូបថតគូស្នេហ៍សម្រាប់គំរូសូត្រមង្គល", "Sample wedding portrait from the Silk Heritage design")} /></div>
        <div className={`kp-hero-folio${opened ? " kp-hero-folio--open" : ""}`}>
          <div id="kp-folio-paper" className="kp-folio-paper" inert={!opened} aria-hidden={!opened}>
            <img className="kp-folio-weave" src="/templates/silk-heritage/woven-ornament.svg" width="360" height="80" alt="" />
            <p>{copy("សិរីសួស្តីអាពាហ៍ពិពាហ៍", "TOGETHER WITH OUR FAMILIES")}</p>
            <p className="kp-sample-names">{copy(silk.groom, silk.groomEn)}<span>&</span>{copy(silk.bride, silk.brideEn)}</p>
            <p>{copy(silk.dateText, silk.dateTextEn)}</p>
            <Link to="/templates/silk-heritage" className="kp-folio-demo">{copy("មើលគំរូពេញលេញ", "View the full demo")}<ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <button type="button" className="kp-folio-cover" aria-expanded={opened} aria-controls="kp-folio-paper" onClick={() => setOpened((value) => !value)} aria-label={opened ? copy("បិទសន្លឹកការគំរូ", "Close invitation preview") : copy("បើកសន្លឹកការគំរូ", "Open invitation preview")}>
            <img src="/templates/silk-heritage/preview.svg" width="720" height="1080" alt="" />
            <span>{opened ? <X size={18} aria-hidden="true" /> : <><MailOpen size={16} aria-hidden="true" />{copy("បើកសន្លឹកការគំរូ", "Open invitation preview")}</>}</span>
          </button>
        </div>
        <p id="kp-folio-note" className="kp-art-caption">{copy("សូត្រមង្គល · គំរូបង្ហាញ", "Silk Heritage · Sample preview")}</p>
        <svg className="kp-hero-ornament" viewBox="0 0 150 180" fill="none" aria-hidden="true"><path d="M75 170V50M75 100C15 85 15 35 35 20C68 25 75 72 75 100ZM75 130C130 105 146 55 120 25C85 45 75 100 75 130ZM75 60C53 27 66 6 75 3C97 20 90 45 75 60Z" /></svg>
      </div>
      <a href="#invitation-story" className="kp-scroll-link"><ArrowDown size={16} aria-hidden="true" />{copy("ស្វែងយល់ពីសន្លឹកការ", "Discover the invitation")}</a>
    </section>
  );
}
