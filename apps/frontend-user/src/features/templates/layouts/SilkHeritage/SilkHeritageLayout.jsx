import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { normalizeTemplateViewModel } from "../../model/templateModel";
import CoverBackground from "../../shared/Openings/CoverBackground";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { useTemplateMusicController } from "../../experience/hooks/useTemplateMusicController";
import TemplateGift from "../../experience/components/sections/TemplateGift";
import useCountdown from "@/features/wedding-site/hooks/useCountdown";
import { normalizeInvitationLanguage } from "@/shared/i18n/invitationLanguage";
import { postPreviewMessage } from "@/shared/preview/previewMessaging";
import manifest from "./template.json";
import "./silk-heritage.css";

const parentText = (value) => Array.isArray(value) ? value.filter(Boolean).join(" និង ") : value || "";
const themeColor = (value) => typeof value === "string" && /^#[\da-f]{6}$/i.test(value) ? value : undefined;

function Photo({ src, alt, priority = false }) {
  const [failedSource, setFailedSource] = useState(null);
  return src && failedSource !== src
    ? <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" width="960" height="1440" onError={() => setFailedSource(src)} />
    : <div className="sh-photo-fallback" role="img" aria-label={alt}><span className="sh-ornament" aria-hidden="true" /></div>;
}

function Album({ images, title, viewLabel }) {
  const dialog = useRef(null);
  const trigger = useRef(null);
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];
  if (!images.length) return null;
  const move = (step) => setActive((index) => (index + step + images.length) % images.length);
  return <>
    <div className="sh-album">
      {images.map((image, index) => <figure key={`${image.src}-${index}`}>
        <button type="button" onClick={(event) => { trigger.current = event.currentTarget; setActive(index); dialog.current.showModal(); }} aria-label={`${viewLabel}: ${image.alt}`}>
          <Photo src={image.src} alt={image.alt} />
        </button>
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </figure>)}
    </div>
    <dialog className="sh-lightbox" ref={dialog} aria-label={title} onClose={() => trigger.current?.focus()} onKeyDown={(event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    }}>
      <button type="button" className="sh-lightbox-close" onClick={() => dialog.current.close()} aria-label="បិទ / Close">×</button>
      <Photo key={current.src} src={current.src} alt={current.alt} priority />
      {current.caption && <p>{current.caption}</p>}
      <div className="sh-lightbox-controls">
        <button type="button" onClick={() => move(-1)} aria-label="មុន / Previous">←</button>
        <span aria-live="polite">{active + 1} / {images.length}</span>
        <button type="button" onClick={() => move(1)} aria-label="បន្ទាប់ / Next">→</button>
      </div>
    </dialog>
  </>;
}

function Countdown({ date, label }) {
  const count = useCountdown(date && !Number.isNaN(new Date(date).getTime()) ? date : undefined);
  if (!date || Number.isNaN(new Date(date).getTime()) || new Date(date) <= new Date()) return null;
  return <p className="sh-countdown"><strong>{count.d}</strong> {label}</p>;
}

export default function SilkHeritageLayout({ content = {}, liveData, preview = false, previewStartClosed = false, previewChannel, previewGateCommand, showBack = true, backTo = "/templates", backLabel = "ត្រឡប់ក្រោយ", useTemplateLink, primaryCtaLabel = "ប្រើគំរូនេះ", showActions = true, children }) {
  const vm = useMemo(() => normalizeTemplateViewModel({}, {
    ...content,
    ...(liveData?.coverBackgroundImage !== undefined ? { coverBackgroundImage: liveData.coverBackgroundImage } : {}),
    ...(liveData?.musicUrl !== undefined ? { music: liveData.musicUrl } : {}),
    ...(liveData?.schedule !== undefined ? { schedule: liveData.schedule } : {}),
    ...(liveData?.photos !== undefined ? { gallery: liveData.photos } : {}),
    ...(liveData?.galleryImages !== undefined ? { gallery: liveData.galleryImages } : {}),
    ...(liveData?.groomName !== undefined ? { groom: liveData.groomName } : {}),
    ...(liveData?.brideName !== undefined ? { bride: liveData.brideName } : {}),
  }), [content, liveData]);
  const reduced = usePrefersReducedMotion();
  const [gate, setGate] = useState(preview && !previewStartClosed ? "open" : "closed");
  const [folioBounds, setFolioBounds] = useState(null);
  const cover = useRef(null);
  const hero = useRef(null);
  const timer = useRef(null);
  const language = normalizeInvitationLanguage(vm.languageMode);
  const copy = (kh, en) => language === "en" ? en : language === "kh" ? kh : `${kh} / ${en}`;
  const heading = (kh, en) => language === "both"
    ? <><span lang="km">{kh}</span><span className="sh-heading-translation" lang="en">{en}</span></>
    : copy(kh, en);
  const elementFont = (key) => ({ fontFamily: typeof vm.elementFonts?.[key] === "string"
    ? `${JSON.stringify(vm.elementFonts[key])}, var(--sh-display)` : undefined });
  const enabled = (key) => vm.enabledSections?.[key] !== false;
  // Existing demo songs have unresolved rights. Only use a host-selected track.
  const musicSource = enabled("music") && (vm.hasHostContent || liveData?.musicUrl !== undefined) ? vm.music : "";
  const [audioRef, music] = useTemplateMusicController(musicSource);
  const opened = gate === "open";
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!previewGateCommand) return;
    clearTimeout(timer.current);
    setGate(previewGateCommand.open ? "open" : "closed");
  }, [previewGateCommand]);
  useEffect(() => { if (gate === "opening" && reduced) setGate("open"); }, [gate, reduced]);
  useEffect(() => {
    if (opened && hero.current && !(preview && !previewStartClosed)) hero.current.focus({ preventScroll: true });
    if (previewChannel) postPreviewMessage({ type: "PREVIEW_READY" }, previewChannel);
  }, [opened, preview, previewStartClosed, previewChannel]);
  const open = (skip = false) => {
    if (skip) { clearTimeout(timer.current); setGate("open"); return; }
    if (gate !== "closed") return;
    if (reduced) setGate("open");
    else {
      setFolioBounds({ height: cover.current.offsetHeight, top: cover.current.offsetTop });
      setGate("opening"); timer.current = setTimeout(() => setGate("open"), 640);
    }
  };
  const groom = language === "en" ? vm.groomEn || vm.groom : vm.groom;
  const bride = language === "en" ? vm.brideEn || vm.bride : vm.bride;
  const date = language === "en" ? vm.dateTextEn || vm.dateText : vm.dateText;
  const nameStyle = (name) => {
    const khmer = /[\u1780-\u17ff]/.test(name);
    return { fontFamily: elementFont("couple").fontFamily || (khmer ? "var(--sh-display)" : "var(--sh-latin)"), lineHeight: khmer ? 1.9 : 1.3, ...(khmer && language === "en" ? { fontSize: ".75em" } : {}) };
  };
  const names = <><span lang={/[\u1780-\u17ff]/.test(groom) ? "km" : "en"} style={nameStyle(groom)}>{groom}</span><span className="sh-and" aria-hidden="true">&</span><span lang={/[\u1780-\u17ff]/.test(bride) ? "km" : "en"} style={nameStyle(bride)}>{bride}</span></>;
  const familyGroom = parentText(vm.family?.groomParents || vm.groomParents);
  const familyBride = parentText(vm.family?.brideParents || vm.brideParents);
  const style = {
    ...manifest.tokens, ...manifest.assetSlots,
    ...(themeColor(vm.primaryColor || vm.design?.primaryColor) ? { "--tpl-primary": vm.primaryColor || vm.design.primaryColor } : {}),
    ...(themeColor(vm.secondaryColor || vm.design?.secondaryColor) ? { "--tpl-secondary": vm.secondaryColor || vm.design.secondaryColor, "--tpl-border": vm.secondaryColor || vm.design.secondaryColor } : {}),
    ...(themeColor(vm.backgroundColor || vm.design?.backgroundColor) ? { "--tpl-bg": vm.backgroundColor || vm.design.backgroundColor } : {}),
    ...(vm.fontKhmer && vm.fontKhmer !== "Moul" ? { "--sh-display": `"${vm.fontKhmer}", "Silk Moul", serif` } : {}),
    ...(vm.fontLatin && vm.fontLatin !== "Cormorant Garamond" ? { "--sh-latin": `"${vm.fontLatin}", "Silk Cormorant", Georgia, serif` } : {}),
  };
  const sections = {
    countdown: enabled("countdown") && <section className="sh-date-note" key="countdown"><Countdown date={vm.targetDate} label={copy("ថ្ងៃដល់ថ្ងៃមង្គល", "days until our wedding")} /></section>,
    schedule: enabled("schedule") && vm.schedule.length > 0 && <section className="sh-program sh-section" id="sh-program" key="schedule" aria-labelledby="sh-program-title">
      <div className="sh-section-intro"><span className="sh-ornament" aria-hidden="true" /><h2 id="sh-program-title">{heading("កម្មវិធីមង្គលការ", "The wedding program")}</h2><p>{date}</p></div>
      <ol>{vm.schedule.map((item) => <li key={item.id}><time>{item.time}</time><div><h3>{language === "en" ? item.titleEn || item.title : item.title}</h3>{language === "both" && item.titleEn && <p lang="en">{item.titleEn}</p>}{item.description && <p>{item.description}</p>}{item.location && <p>{item.location}</p>}</div></li>)}</ol>
      {vm.scheduleEnding && <p>{vm.scheduleEnding}</p>}
    </section>,
    story: enabled("story") && vm.story?.length > 0 && <section className="sh-story sh-section" key="story" aria-labelledby="sh-story-title"><h2 id="sh-story-title">{heading("រឿងរ៉ាវរបស់យើង", "Our story")}</h2>{vm.story.map((chapter, index) => <article key={chapter.id || index}><h3>{chapter.title}</h3>{chapter.date && <p className="sh-story-date">{chapter.date}</p>}<p>{chapter.text}</p></article>)}</section>,
    gallery: enabled("gallery") && vm.gallery.length > 0 && <section className="sh-gallery sh-section" key="gallery" aria-labelledby="sh-gallery-title"><h2 id="sh-gallery-title">{heading("អនុស្សាវរីយ៍របស់យើង", "Moments to keep")}</h2><Album images={vm.gallery} title={copy("រូបភាព", "Photo album")} viewLabel={copy("មើលរូបភាព", "View photo")} /></section>,
    map: enabled("map") && enabled("venue") && (vm.venueName || vm.venueAddress) && <section className="sh-venue sh-section" id="sh-venue" key="map" aria-labelledby="sh-venue-title"><span className="sh-ornament" aria-hidden="true" /><h2 id="sh-venue-title">{heading("ជួបគ្នានៅថ្ងៃមង្គល", "A place to celebrate")}</h2><h3>{vm.venueName}</h3>{vm.venueHall && <p>{vm.venueHall}</p>}<p>{vm.venueAddress}</p><p>{date}{vm.eventTime && <> · {vm.eventTime}</>}</p>{vm.googleMapsUrl && <a className="sh-button sh-button-light" href={vm.googleMapsUrl} target="_blank" rel="noopener noreferrer">{copy("បើកផែនទី", "Open Google Maps")}</a>}{vm.sketchMapImage && <div className="sh-sketch"><Photo src={vm.sketchMapImage} alt={copy("ផែនទីទីតាំងពិធី", "Venue directions")} /></div>}</section>,
    dressCode: enabled("dressCode") && vm.dressCode?.description && <section className="sh-section sh-dress" key="dressCode"><h2>{heading("សម្លៀកបំពាក់", "Dress code")}</h2><p>{vm.dressCode.description}</p><ul>{vm.dressCode.colors.map((color) => <li key={color.hex}><span style={{ backgroundColor: themeColor(color.hex) }} aria-hidden="true" />{color.name}</li>)}</ul></section>,
    gift: enabled("gift") && vm.gift?.length > 0 && <div key="gift" className="sh-gift"><TemplateGift content={vm} /></div>,
    faq: enabled("faq") && vm.faq?.length > 0 && <section key="faq" className="sh-section"><h2>{heading("ព័ត៌មានបន្ថែម", "Helpful details")}</h2>{vm.faq.map((item, index) => <details key={item.id || index}><summary>{item.q}</summary><p>{item.a}</p></details>)}</section>,
    rsvp: enabled("rsvp") && <section className="sh-rsvp sh-section" id="sh-rsvp" key="rsvp" aria-labelledby="sh-rsvp-title"><span className="sh-ornament" aria-hidden="true" /><h2 id="sh-rsvp-title">{heading("រីករាយនឹងវត្តមានលោកអ្នក", "We would love to see you")}</h2>{children || <p className="sh-demo-note">{copy("នេះជាគំរូបង្ហាញ។ ការឆ្លើយតប RSVP អាចធ្វើបានតាមសន្លឹកការដែលបានផ្សព្វផ្សាយ។", "This is a preview. RSVP is available on the published invitation.")}</p>}</section>,
  };
  const order = [...new Set([...(Array.isArray(vm.sectionOrder) ? vm.sectionOrder.map((key) => key === "venue" ? "map" : key) : []), "countdown", "schedule", "story", "gallery", "map", "dressCode", "gift", "faq", "rsvp"])];
  return <div className={`tpl-silk-heritage${preview ? " sh-preview" : ""}`} style={style} lang={language === "en" ? "en" : "km"} dir="ltr" data-template-version={manifest.version}>
    {showBack && !preview && <nav className="sh-toolbar" aria-label={copy("គំរូសន្លឹកការ", "Template navigation")}><Link to={backTo}>{backLabel}</Link>{useTemplateLink && showActions && <Link to={useTemplateLink}>{primaryCtaLabel}</Link>}</nav>}
    {!opened && <section ref={cover} className={`sh-cover is-${gate}`} style={gate === "opening" && folioBounds ? { top: folioBounds.top, height: folioBounds.height } : undefined} aria-label={copy("សំបុត្រអញ្ជើញ", "Invitation cover")}>
      <CoverBackground content={vm} templateDefault={manifest.cover} />
      <div className="sh-folio-leaf sh-folio-leaf-left" aria-hidden="true" /><div className="sh-folio-leaf sh-folio-leaf-right" aria-hidden="true" />
      <div className="sh-cover-content"><p className="sh-brand" lang="en">Koupreng</p><span className="sh-ornament" aria-hidden="true" /><h1>{language === "en" ? "Wedding invitation" : vm.title || "សិរីមង្គលអាពាហ៍ពិពាហ៍"}</h1>{!vm.hideCoupleNameOnCover && <p className="sh-cover-names" style={elementFont("couple")}>{names}</p>}<div className="sh-dedication"><p>{copy("សូមគោរពអញ្ជើញ", "With our warm invitation")}</p><p className="sh-guest" style={elementFont("guestName")}>{vm.guestName || copy("លោកអ្នក និងក្រុមគ្រួសារ", "You and your family")}</p></div><p>{date}</p><button type="button" className="sh-button sh-button-light" onClick={() => open()} disabled={gate === "opening"}>{copy("បើកសំបុត្រអញ្ជើញ", "Open invitation")}</button><button type="button" className="sh-skip" onClick={() => open(true)}>{copy("មើលព័ត៌មានភ្លាម", "Skip opening")}</button></div>
    </section>}
    <main hidden={gate === "closed"} inert={!opened}>
      <section className="sh-hero" aria-labelledby="sh-hero-title"><div className="sh-hero-copy"><span className="sh-ornament" aria-hidden="true" /><p>{copy("សិរីមង្គលអាពាហ៍ពិពាហ៍", "Together with our families")}</p><h1 id="sh-hero-title" ref={hero} tabIndex={-1} style={elementFont("couple")}>{names}</h1>{language === "both" && (vm.groomEn || vm.brideEn) && <p className="sh-latin-names" lang="en">{[vm.groomEn, vm.brideEn].filter(Boolean).join(" & ")}</p>}<p className="sh-hero-date" style={elementFont("date")}>{date}</p>{vm.eventTime && <p>{vm.eventTime}</p>}<p>{vm.venueName}</p><span className="sh-ornament" aria-hidden="true" /></div><figure className="sh-hero-photo"><Photo src={gate !== "closed" ? vm.coverImage : ""} alt={copy("រូបគូស្វាមីភរិយា", "The couple's portrait")} priority />{!vm.hasHostContent && <figcaption>{copy("រូបភាពសម្រាប់គំរូបង្ហាញ", "Demo photography")}</figcaption>}</figure></section>
      <section className="sh-formal sh-section" aria-labelledby="sh-formal-title"><span className="sh-ornament" aria-hidden="true" /><h2 id="sh-formal-title">{heading("សូមគោរពអញ្ជើញ", "You are warmly invited")}</h2>{(familyGroom || familyBride) && <div className="sh-families">{familyGroom && <p>{familyGroom}</p>}{familyBride && <p>{familyBride}</p>}</div>}<p className="sh-invitation-copy">{vm.messageText}</p><div className="sh-formal-names" style={elementFont("couple")}>{names}</div><p>{date}</p>{vm.invitationImage && <div className="sh-invitation-photo"><Photo src={vm.invitationImage} alt={copy("រូបភាពអញ្ជើញ", "Invitation artwork")} /></div>}{vm.invitationImage2 && <div className="sh-invitation-photo"><Photo src={vm.invitationImage2} alt={copy("រូបភាពអញ្ជើញបន្ថែម", "Additional invitation artwork")} /></div>}</section>
      {order.map((key) => sections[key] || null)}
      <footer className="sh-closing"><span className="sh-ornament" aria-hidden="true" /><h2>{vm.thankYouTitle || copy("សូមអរគុណ", "With love and gratitude")}</h2><p>{vm.thankYouText || copy("វត្តមានរបស់លោកអ្នក ជាកិត្តិយសដ៏ថ្លៃថ្លាសម្រាប់យើងខ្ញុំ។", "Your presence will mean so much to us.")}</p><p className="sh-closing-names">{[groom, bride].filter(Boolean).join(" & ")}</p><nav aria-label={copy("ព័ត៌មានពិធី", "Wedding details")}>{sections.schedule && <a href="#sh-program">{copy("កម្មវិធី", "Program")}</a>}{sections.map && <a href="#sh-venue">{copy("ទីតាំង", "Venue")}</a>}{sections.rsvp && <a href="#sh-rsvp">RSVP</a>}<button type="button" onClick={() => setGate("closed")}>{copy("មើលគម្របវិញ", "View cover")}</button></nav></footer>
    </main>
    {music.hasMusic && <><audio ref={audioRef} src={musicSource} preload="none" loop /><button type="button" className="sh-music" onClick={music.toggle} aria-pressed={music.playing}>{music.playing ? copy("បិទតន្ត្រី", "Pause music") : copy("បើកតន្ត្រី", "Play music")}</button>{music.status === "error" && <p className="sh-music-error" role="status">{copy("តន្ត្រីមិនអាចចាក់បាន។ សូមសាកម្ដងទៀត។", "Music could not play. Please try again.")}</p>}</>}
  </div>;
}
