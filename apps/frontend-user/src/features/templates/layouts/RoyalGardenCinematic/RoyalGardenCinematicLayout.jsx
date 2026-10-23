import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download, ExternalLink, Gift, Heart, MapPin, Menu, Music2, Pause, X } from "lucide-react";
import CoverBackground from "../../shared/Openings/CoverBackground";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import { isTrustedPreviewMessage, postPreviewMessage, readEmbeddedPreviewChannel } from "@/shared/preview/previewMessaging";
import manifest from "./template.json";
import "./royal-garden-cinematic.css";

const DEFAULT_SCHEDULE = [
  { time: "០៧:០០", title: "ពិធីហែជំនូន" },
  { time: "០៩:០០", title: "ពិធីកាត់សក់បង្កក់សិរី" },
  { time: "១១:០០", title: "ពិធីបំពាក់ចិញ្ចៀន" },
  { time: "១៧:០០", title: "ពិធីទទួលភ្ញៀវកិត្តិយស" },
];
const SECTION_ORDER = ["family", "invitation", "calendar", "schedule", "venue", "gift", "gallery", "rsvp", "closing"];
const SAMPLE_GALLERY = [
  "/images/wedding/couple-hero-meadow.webp",
  "/images/wedding/couple-studio-bow.webp",
  "/images/wedding/couple-celebration-confetti.webp",
  "/images/wedding/couple-garden-rings.webp",
];
const first = (...values) => values.find((value) => typeof value === "string" && value.trim()) || "";
const validColor = (s) => typeof s === "string" && /^#[a-f\d]{6}$/i.test(s) ? s : undefined;
const dateOf = (value) => { const d = value ? new Date(value) : null; return d && Number.isFinite(d.getTime()) ? d : null; };
const khNum = (number) => new Intl.NumberFormat("km-KH").format(number);
function safeLink(raw) {
  if (typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try { const u = new URL(raw); return ["https:", "http:"].includes(u.protocol) ? u.href : ""; }
  catch { return ""; }
}
function galleryOf(source) {
  return (Array.isArray(source) ? source : []).map((img, i) => {
    const url = typeof img === "string" ? img : (img?.src || img?.url || img?.preview || "");
    return url ? { src: url, alt: img?.alt || `Wedding memory ${i + 1}` } : null;
  }).filter(Boolean);
}
function parentsOf(base, side) {
  const father = first(base[`${side}Father`], base.couple?.[`${side}Father`]);
  const mother = first(base[`${side}Mother`], base.couple?.[`${side}Mother`]);
  if (father || mother) return [father, mother].filter(Boolean).join(" និង ");
  const val = base.family?.[`${side}Parents`] || base[`${side}Parents`] || base.couple?.[`${side}Parents`];
  return Array.isArray(val) ? val.filter(Boolean).join(" និង ") : (val || "");
}
function normalize(base, isHosted) {
  const eventDate = first(base.targetDate, base.machineEventDate, base.eventDate, base.weddingDate, base.dateText);
  const eventDateObj = dateOf(eventDate);
  const qrSources = [
    ...(Array.isArray(base.gift) ? base.gift : (base.gift ? [base.gift] : [])),
    base.khqrDollar, base.khqrRiel, base.bankAccount,
  ].filter(Boolean);
  const giftCards = qrSources.map((g, i) => ({
    id: g.id || String(i),
    title: first(g.bank, g.bankName, g.currency, "KHQR"),
    name: first(g.account, g.accountName),
    qr: first(g.qrImage, g.qrUrl, g.url),
  })).filter((g) => safeLink(g.qr));
  const imageCandidates = base.photos?.length ? base.photos : base.galleryImages?.length ? base.galleryImages : base.gallery;
  return {
    raw: base,
    groom: first(base.groomName, base.groom, base.couple?.groom, isHosted ? "កូនកំលោះ" : "ប៊ុន សាយ"),
    bride: first(base.brideName, base.bride, base.couple?.bride, isHosted ? "កូនក្រមុំ" : "ជា គឹមអិច"),
    groomEn: first(base.groomEn, base.groomNameEn, "Bun Say"),
    brideEn: first(base.brideEn, base.brideNameEn, "Chea Kimech"),
    groomParents: parentsOf(base, "groom"),
    brideParents: parentsOf(base, "bride"),
    guestName: first(base.guestName, "លោកអ្នក និងក្រុមគ្រួសារ"),
    title: first(base.invitationTitle, base.title, "សិរីសួស្តីអាពាហ៍ពិពាហ៍"),
    message: first(base.messageText, base.blessingMessage, base.message, "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញលោកអ្នក និងក្រុមគ្រួសារ ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងថ្ងៃសិរីមង្គលរបស់កូនប្រុសកូនស្រីយើងខ្ញុំ។"),
    date: eventDateObj,
    dateText: first(base.weddingDateText, base.dateText, base.weddingDate, eventDateObj ? new Intl.DateTimeFormat("km-KH", { day: "numeric", month: "long", year: "numeric" }).format(eventDateObj) : ""),
    timeText: first(base.weddingTime, base.receptionTime, base.eventTime, "៥:០០ ល្ងាច"),
    venueName: first(base.venueName, base.venue?.name, "សូមបំពេញទីតាំងពិធីមង្គល"),
    venueAddress: first(base.venueAddress, base.venue?.address),
    mapUrl: first(base.googleMapsUrl, base.googleMapUrl, base.venue?.mapLink),
    mapImage: first(base.sketchMapImage, base.mapImage),
    gallery: galleryOf(imageCandidates?.length ? imageCandidates : (isHosted ? [] : SAMPLE_GALLERY)),
    schedule: Array.isArray(base.schedule) && base.schedule.length ? base.schedule : DEFAULT_SCHEDULE,
    giftCards,
    music: first(base.musicUrl, base.bgMusicUrl, typeof base.music === "string" ? base.music : base.music?.url),
    coverImage: first(base.coverBackgroundImage, base.coverBgImage),
    enabled: base.enabledSections || {},
    order: Array.isArray(base.sectionOrder) && base.sectionOrder.length ? base.sectionOrder : SECTION_ORDER,
  };
}
function TimeUntil({ date }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!date) return; const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id); }, [date]);
  if (!date) return null;
  const diff = Math.max(0, date.getTime() - now);
  const values = [Math.floor(diff / 86400000), Math.floor(diff / 3600000) % 24, Math.floor(diff / 60000) % 60, Math.floor(diff / 1000) % 60];
  return <div className="rg-countdown" role="timer" aria-label="Wedding countdown">
    {values.map((n, i) => <div key={i}><strong>{khNum(n)}</strong><span>{["ថ្ងៃ", "ម៉ោង", "នាទី", "វិនាទី"][i]}</span></div>)}
  </div>;
}
function EventCalendar({ date }) {
  if (!date) return <p className="rg-muted">សូមបញ្ចូលកាលបរិច្ឆេទក្នុងកម្មវិធីកែសម្រួល</p>;
  const year = date.getFullYear(), month = date.getMonth();
  const start = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return <div className="rg-calendar" aria-label="Wedding calendar">
    <div className="rg-calendar-month">{new Intl.DateTimeFormat("km-KH", { month: "long", year: "numeric" }).format(date)}</div>
    <div className="rg-calendar-grid">
      {["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"].map((x, i) => <span className="rg-weekday" key={i}>{x}</span>)}
      {Array.from({ length: start + days }, (_, i) => {
        const day = i - start + 1;
        return day > 0 ? <span key={i} className={day === date.getDate() ? "rg-selected-day" : ""}>{khNum(day)}</span> : <span key={i}/>;
      })}
    </div>
  </div>;
}
function Heading({ kh, en }) {
  return <div className="rg-heading"><span className="rg-flourish" aria-hidden="true">❧</span><h2>{kh}</h2>{en && <p>{en}</p>}<i aria-hidden="true" /></div>;
}
export default function RoyalGardenCinematicLayout({
  tpl = {}, content = {}, liveData, preview = false, previewStartClosed = false,
  previewChannel, previewGateCommand, useTemplateLink, primaryCtaLabel = "ប្រើគំរូនេះ",
  showActions = true, isHostedInvitation = false, children,
}) {
  const reduced = usePrefersReducedMotion();
  const [localSync, setLocalSync] = useState(null);
  const channel = previewChannel || readEmbeddedPreviewChannel();
  useEffect(() => {
    if (!channel) return;
    const onMessage = (event) => {
      if (!isTrustedPreviewMessage(event, channel)) return;
      if (event.data?.type === "LIVE_PREVIEW_SYNC" && event.data?.data) setLocalSync(event.data.data);
      if (event.data?.type === "TOGGLE_GATE") setStage((event.data.open ?? event.data.isOpen) ? "body" : "cover");
      if (event.data?.type === "SCROLL_TO_SECTION") {
        const section = event.data.sectionKey;
        if (SECTION_ORDER.includes(section)) {
          setStage("body");
          window.requestAnimationFrame(() => document.getElementById(`rg-${section}`)?.scrollIntoView({ behavior: "smooth" }));
        }
      }
    };
    window.addEventListener("message", onMessage);
    postPreviewMessage({ type: "PREVIEW_READY" }, channel);
    return () => window.removeEventListener("message", onMessage);
  }, [channel]);
  const [stage, setStage] = useState(preview && !previewStartClosed ? "body" : "cover");
  const timers = useRef([]);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [lightbox, setLightbox] = useState(-1);
  const merged = useMemo(() => ({ ...tpl, ...content, ...liveData, ...localSync }), [tpl, content, liveData, localSync]);
  const data = useMemo(() => normalize(merged, isHostedInvitation), [merged, isHostedInvitation]);
  const palette = {
    ...(validColor(merged.primaryColor || merged.design?.primaryColor) ? { "--tpl-primary": validColor(merged.primaryColor || merged.design?.primaryColor) } : {}),
    ...(validColor(merged.secondaryColor || merged.design?.secondaryColor) ? { "--tpl-secondary": validColor(merged.secondaryColor || merged.design?.secondaryColor) } : {}),
    ...(validColor(merged.backgroundColor || merged.design?.backgroundColor) ? { "--tpl-bg": validColor(merged.backgroundColor || merged.design?.backgroundColor) } : {}),
    ...(first(merged.fontKhmer) ? { "--rg-khmer-font": `"${merged.fontKhmer}", "Kantumruy Pro", sans-serif` } : {}),
  };
  useEffect(() => { if (previewGateCommand && typeof previewGateCommand.open === "boolean") setStage(previewGateCommand.open ? "body" : "cover"); }, [previewGateCommand]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useEffect(() => {
    if (stage === "body" && audioRef.current && playing) audioRef.current.play().catch(() => setPlaying(false));
  }, [data.music, stage, playing]);
  useEffect(() => {
    if (lightbox < 0) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setLightbox(-1);
      if (event.key === "ArrowLeft") setLightbox((x) => (x + data.gallery.length - 1) % data.gallery.length);
      if (event.key === "ArrowRight") setLightbox((x) => (x + 1) % data.gallery.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, data.gallery.length]);
  const play = () => {
    if (!audioRef.current || !data.music) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const open = () => {
    timers.current.forEach(window.clearTimeout); timers.current = [];
    if (data.music) audioRef.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    if (reduced || preview) { setStage("body"); return; }
    setStage("save");
    timers.current.push(window.setTimeout(() => setStage("monogram"), 2300));
    timers.current.push(window.setTimeout(() => setStage("body"), 4400));
  };
  const navigate = (name) => {
    setNavOpen(false);
    document.getElementById(`rg-${name}`)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };
  const visible = (key) => data.enabled[key] !== false;
  const order = [...new Set([...data.order.filter((key) => SECTION_ORDER.includes(key)), ...SECTION_ORDER])];
  const mapHref = safeLink(data.mapUrl) || (data.venueName && data.venueName !== "សូមបំពេញទីតាំងពិធីមង្គល" ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([data.venueName, data.venueAddress].filter(Boolean).join(" "))}` : "");
  const mapQuery = [data.venueName, data.venueAddress].filter(Boolean).join(" ");
  const formattedDate = data.date ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(data.date) : data.dateText;
  const renderSection = (key) => {
    if (!visible(key)) return null;
    switch (key) {
      case "family": return <section id="rg-family" data-section-key="family" className="rg-section" key={key}>
        <Heading kh="សិរីមង្គលអាពាហ៍ពិពាហ៍" en="Together with our families" />
        <div className="rg-family"><div><span>ខាងកូនប្រុស</span><p>{data.groomParents || "មាតាបិតាកូនប្រុស"}</p><strong>{data.groom}</strong></div><div className="rg-amp">&</div><div><span>ខាងកូនស្រី</span><p>{data.brideParents || "មាតាបិតាកូនស្រី"}</p><strong>{data.bride}</strong></div></div>
      </section>;
      case "invitation": return <section id="rg-invitation" data-section-key="invitation" className="rg-section" key={key}>
        <Heading kh={data.title} en="Wedding Invitation" />
        <p className="rg-guest">សូមគោរពជូនចំពោះ <strong>{data.guestName}</strong></p>
        <div className="rg-ribbon">យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ</div>
        <p className="rg-copy">{data.message}</p>
        <div className="rg-names"><span>{data.groom}</span><em>&</em><span>{data.bride}</span></div>
        <p className="rg-script">Together with our families</p>
        <p className="rg-date-label">{data.dateText}</p><p className="rg-date-label">{data.timeText}</p>
        <p className="rg-muted">{data.venueName}</p>
      </section>;
      case "calendar": return <section id="rg-calendar" data-section-key="calendar" className="rg-section" key={key}>
        <Heading kh="ប្រតិទិនថ្ងៃសិរីមង្គល" en="Save the date" />
        <TimeUntil date={data.date} /><EventCalendar date={data.date} />
        {data.date && <a className="rg-button" href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.title)}&dates=${new Date(data.date.getTime()).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${new Date(data.date.getTime() + 7200000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}&details=${encodeURIComponent(data.message)}&location=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer"><CalendarDays size={16} /> បន្ថែមទៅប្រតិទិន</a>}
      </section>;
      case "schedule": return <section id="rg-schedule" data-section-key="schedule" className="rg-section" key={key}>
        <Heading kh="កម្មវិធីមង្គលការ" en="Wedding programme" />
        <div className="rg-schedule">{data.schedule.map((item, i) => <div key={item.id || i}><time>{item.time}</time><div><strong>{item.title}</strong>{(item.description || item.desc) && <p>{item.description || item.desc}</p>}</div></div>)}</div>
      </section>;
      case "venue": return <section id="rg-venue" data-section-key="venue" className="rg-section" key={key}>
        <Heading kh="ទីតាំងកម្មវិធី" en="Venue & directions" />
        {data.mapImage ? <img className="rg-map-image" src={data.mapImage} alt="Wedding venue location map" loading="lazy" /> : mapHref ? <iframe className="rg-map-image" title="ទីតាំងមង្គលការ" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} /> : <div className="rg-map-placeholder"><MapPin size={36} /><span>បន្ថែមទីតាំងនៅក្នុងកម្មវិធីកែសម្រួល</span></div>}
        <h3>{data.venueName}</h3>{data.venueAddress && <p className="rg-muted">{data.venueAddress}</p>}
        {mapHref && <a className="rg-button" href={mapHref} target="_blank" rel="noopener noreferrer"><MapPin size={16} /> បើកផែនទី <ExternalLink size={14} /></a>}
      </section>;
      case "gift": return <section id="rg-gift" data-section-key="gift" className="rg-section" key={key}>
        <Heading kh="ចំណងដៃសិរីមង្គល" en="Wedding gifts" />
        <p className="rg-copy">សូមថ្លែងអំណរគុណចំពោះក្តីស្រឡាញ់ និងពរជ័យរបស់លោកអ្នក។</p>
        {data.giftCards.length ? <div className="rg-qr-list">{data.giftCards.map((g) => <article key={g.id}><Gift size={19}/><strong>{g.title}</strong><img src={g.qr} alt={`Gift QR for ${g.name || g.title}`} loading="lazy"/>{g.name && <span>{g.name}</span>}<a className="rg-button" href={g.qr} download target="_blank" rel="noopener noreferrer"><Download size={15}/> ទាញយក QR</a></article>)}</div> : <p className="rg-muted">QR សម្រាប់ចំណងដៃនឹងបង្ហាញពេលម្ចាស់កម្មវិធីបញ្ចូល QR ផ្ទាល់ខ្លួន។</p>}
      </section>;
      case "gallery": return <section id="rg-gallery" data-section-key="gallery" className="rg-section" key={key}>
        <Heading kh="អនុស្សាវរីយ៍របស់យើង" en="Our memories" />
        {data.gallery.length ? <div className="rg-gallery">{data.gallery.map((photo, i) => <button key={`${photo.src}-${i}`} type="button" onClick={() => setLightbox(i)} aria-label={`បើករូបភាព ${i + 1}`}><img src={photo.src} alt={photo.alt} loading="lazy" /></button>)}</div> : <p className="rg-muted">រូបភាពអនុស្សាវរីយ៍របស់អ្នកនឹងបង្ហាញនៅទីនេះ។</p>}
      </section>;
      case "rsvp": return <section id="rg-rsvp" data-section-key="rsvp" className="rg-section" key={key}>
        <Heading kh="សូមបញ្ជាក់វត្តមាន" en="RSVP" />
        {children || <p className="rg-muted">ភ្ញៀវអាចបញ្ជាក់វត្តមានតាមប្រព័ន្ធ RSVP នៅពេលធៀបការត្រូវបានផ្សព្វផ្សាយ។</p>}
      </section>;
      case "closing": return <section id="rg-closing" data-section-key="closing" className="rg-section rg-closing" key={key}>
        <Heart size={24}/><Heading kh="សូមថ្លែងអំណរគុណ" en="Thank you for celebrating with us" />
        <p className="rg-copy">វត្តមានរបស់លោកអ្នកគឺជាកិត្តិយសដ៏ឧត្តុង្គឧត្តមសម្រាប់គ្រួសារយើងខ្ញុំ។</p>
        <p className="rg-script">{data.groomEn} & {data.brideEn}</p>
      </section>;
      default: return null;
    }
  };
  return <div className="tpl-royal-garden" style={palette} data-stage={stage}>
    {data.music && <audio ref={audioRef} src={data.music} loop preload="none" />}
    {stage === "cover" ? <div className="rg-cover">
      <CoverBackground content={merged} templateDefault={manifest.cover}/>
      <div className="rg-cover-veil" />
      <div className="rg-cover-frame"><span className="rg-spark rg-spark-a">✦</span><span className="rg-spark rg-spark-b">✧</span>
        <span className="rg-flower">❀</span><h1>{data.title}</h1><p>{data.groom} <em>&</em> {data.bride}</p>
        <span className="rg-date-script">{formattedDate}</span>
        <button type="button" onClick={open} className="rg-button rg-open"><span>✉</span> សូមបើកធៀបការ</button>
        <span className="rg-opening-hint">Tap to open your invitation</span>
      </div>
    </div> : stage === "save" ? <div className="rg-scene"><div className="rg-scene-copy"><p className="rg-script">Save The Date</p><span>{formattedDate}</span></div><button type="button" onClick={() => setStage("body")}>រំលង / Skip <ChevronRight size={13}/></button></div>
    : stage === "monogram" ? <div className="rg-monogram"><span className="rg-monogram-frame"><i>❧</i><strong>{data.groom.slice(0, 1)} · {data.bride.slice(0, 1)}</strong><i>❧</i></span><h1>{data.title}</h1><button type="button" onClick={() => setStage("body")}>រំលង / Skip <ChevronRight size={13}/></button></div>
    : <div className="rg-paper">
      <div className="rg-lanterns" aria-hidden="true"><span>✧</span><span>✧</span><span>✧</span></div>
      <header id="rg-hero" className="rg-hero"><div className="rg-gold-oval"><span>❧</span><strong>{data.groom.slice(0, 1)} · {data.bride.slice(0, 1)}</strong><span>❧</span></div><span className="rg-script">Wedding Invitation</span><ChevronDown className="rg-down" size={20}/></header>
      <main>{order.map(renderSection)}</main>
      <footer className="rg-footer">ROYAL GARDEN · KOUPRENG</footer>
      {showActions && useTemplateLink && !isHostedInvitation && !preview && <Link to={useTemplateLink} className="rg-use-template">{primaryCtaLabel}</Link>}
      <div className="rg-floating" aria-label="Invitation controls">
        {navOpen && <nav className="rg-float-nav" aria-label="Sections">{SECTION_ORDER.filter(visible).map((x) => <button key={x} type="button" onClick={() => navigate(x)}>{({ family: "គ្រួសារ", invitation: "សំបុត្រអញ្ជើញ", calendar: "ប្រតិទិន", schedule: "កម្មវិធី", venue: "ទីតាំង", gift: "ចំណងដៃ", gallery: "រូបភាព", rsvp: "RSVP", closing: "អរគុណ" })[x]}</button>)}</nav>}
        <button type="button" aria-label={navOpen ? "Close navigation" : "Open navigation"} aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X/> : <Menu/>}</button>
        {data.music && <button type="button" aria-label={playing ? "Pause music" : "Play music"} onClick={play}>{playing ? <Pause/> : <Music2/>}</button>}
      </div>
      {lightbox >= 0 && data.gallery[lightbox] && <div className="rg-lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery" onClick={() => setLightbox(-1)}>
        <button type="button" className="rg-lightbox-close" onClick={() => setLightbox(-1)} aria-label="Close photo"><X /></button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + data.gallery.length - 1) % data.gallery.length); }} aria-label="Previous photo"><ChevronLeft /></button>
        <img src={data.gallery[lightbox].src} alt={data.gallery[lightbox].alt} onClick={(e) => e.stopPropagation()}/>
        <button type="button" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % data.gallery.length); }} aria-label="Next photo"><ChevronRight /></button>
      </div>}
    </div>}
  </div>;
}
